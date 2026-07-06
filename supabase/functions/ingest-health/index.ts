import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function sha256hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  if (req.method !== 'POST')    return new Response('Method Not Allowed', { status: 405, headers: CORS })

  // ── Auth ─────────────────────────────────────────────────────────────────
  const auth  = req.headers.get('authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!token) return new Response('Unauthorized', { status: 401, headers: CORS })

  const tokenHash = await sha256hex(token)
  const supabase  = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: conn, error: connErr } = await supabase
    .from('health_connections')
    .select('id, user_id')
    .eq('ingest_token_hash', tokenHash)
    .eq('is_active', true)
    .single()

  if (connErr || !conn) return new Response('Unauthorized', { status: 401, headers: CORS })

  // ── Parse payload ─────────────────────────────────────────────────────────
  let body: any
  try { body = await req.json() } catch { return new Response('Bad Request', { status: 400, headers: CORS }) }

  const metrics: any[] = body?.data?.metrics ?? []
  const byDate: Record<string, any> = {}

  const ASLEEP = [
    'HKCategoryValueSleepAnalysisAsleep',
    'HKCategoryValueSleepAnalysisAsleepCore',
    'HKCategoryValueSleepAnalysisAsleepDeep',
    'HKCategoryValueSleepAnalysisAsleepREM',
  ]

  for (const metric of metrics) {
    const { name, units, data = [] } = metric
    for (const sample of data) {
      const date = (sample.date ?? '').slice(0, 10)
      if (!date) continue
      if (!byDate[date]) byDate[date] = { summary_date: date }
      const s = byDate[date]

      switch (name) {
        case 'step_count':
          s.steps = Math.round(sample.qty ?? 0)
          break
        case 'body_mass':
          s.body_weight_kg = sample.qty
          break
        case 'resting_heart_rate':
          s.resting_heart_rate = Math.round(sample.qty ?? 0)
          break
        case 'active_energy':
          s.active_energy_kcal = Math.round(sample.qty ?? 0)
          break
        case 'sleep_analysis': {
          if (!sample.value || ASLEEP.includes(sample.value)) {
            const mins = units === 'hr'
              ? Math.round((sample.qty ?? 0) * 60)
              : Math.round(sample.qty ?? 0)
            s.sleep_minutes = (s.sleep_minutes ?? 0) + mins
            if (sample.startDate) {
              const t = sample.startDate.slice(11, 16)
              if (!s.sleep_start || t < s.sleep_start) s.sleep_start = t
            }
            if (sample.endDate) {
              const t = sample.endDate.slice(11, 16)
              if (!s.sleep_end || t > s.sleep_end) s.sleep_end = t
            }
          }
          break
        }
      }
    }
  }

  // ── Upsert ────────────────────────────────────────────────────────────────
  const now  = new Date().toISOString()
  const rows = Object.values(byDate).map(s => ({
    ...s,
    user_id:       conn.user_id,
    source:        'health_auto_export',
    last_synced_at: now,
    updated_at:    now,
  }))

  if (rows.length > 0) {
    const { error: upsertErr } = await supabase
      .from('health_daily_summaries')
      .upsert(rows, { onConflict: 'user_id,summary_date,source' })
    if (upsertErr) {
      console.error('upsert error', upsertErr)
      return new Response(JSON.stringify({ error: upsertErr.message }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } })
    }
  }

  await supabase
    .from('health_connections')
    .update({ last_sync_at: now, updated_at: now })
    .eq('id', conn.id)

  return new Response(
    JSON.stringify({ ok: true, days: rows.length }),
    { headers: { ...CORS, 'Content-Type': 'application/json' } }
  )
})
