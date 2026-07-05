# HPC Claude Handoff Prompt

You are taking over the High Performance Club (HPC) PWA project.

## Project Context

HPC is a local-first PWA built with plain HTML, CSS, and JavaScript.

- Main app file: `index.html`
- PWA files: `manifest.json`, `service-worker.js`
- Assets: `assets/`
- Current localStorage key: `hpc_v3`
- Supabase is prepared for Auth/client setup, but automatic sync must not be implemented without explicit approval.
- Public app: https://leokakawa497.github.io/HPC/
- Repository: https://github.com/leokakawa497/HPC

The app must keep working without login. Do not erase, reset, or migrate localStorage automatically.

## Current Branch State

Recent commits:

- `4dca409` - `Redesign Home and add mock health sync`
- `134f093` - `Redesign daily log screen`

Known uncommitted files may exist and should not be reverted unless the user explicitly asks:

- `.claude/launch.json`
- `.claude/settings.local.json`
- `hpc-home-preview.png`

## Design References

Use the mockup images in:

`docs/design-references/`

Files:

1. `screen-01-home.png`
2. `screen-02-registro-diario.png`
3. `screen-03-recovery-sleep.png`
4. `screen-04-programas-treino.png`
5. `screen-05-treino-ao-vivo.png`
6. `screen-06-stats.png`
7. `screen-07-tabela-mensal.png`
8. `screen-08-habitos.png`
9. `screen-09-profile-sync.png`

The approved direction is a premium, realistic, minimalist light UI:

- Background almost white: `#F8F9FB` / `#FAFAFA`
- White cards
- Soft borders: `#E5E7EB`
- Light shadows
- Primary text black: `#111111`
- Secondary text gray: `#6B7280`
- Primary buttons black
- Green only for success/sync/completed states
- Amber for warning
- Rose/red for error
- Teal/blue/purple only as small functional accents
- No heavy gradients
- No Canva/AI-neon style
- Keep typography modern and restrained
- Keep icons consistent and monochrome where possible

## Product Structure

Main bottom nav should have exactly 4 tabs:

1. `Home`
2. `Train`
3. `Stats`
4. `Profile`

The old `Group` / community code can remain in the file, but it must stay hidden from the main UI unless the user explicitly asks to bring it back.

Internal screens can be in Portuguese:

- `Registro diário`
- `Recovery & Sleep`
- `Programas de treino`
- `Treino ao vivo`
- `Tabela mensal`
- `Hábitos`
- `Profile & Sync` can remain mixed if the nav is still English.

## Already Implemented

### Home

The Home screen has been redesigned toward `screen-01-home.png`:

- 4-tab nav
- Score card with circular ring
- Sleep card
- Habits card
- Quick stats: calories, resting HR, steps
- HPC Sync card
- Group removed from nav

### Mock Health Sync

A mock sync layer exists in `index.html`:

- `DEFAULT_CONNECTED_DEVICES`
- `mockHealthSyncProvider`
- `healthSyncService`
- `displaySleepForDate`
- `syncNowFromHome`

It stores imported health data separately from manual data:

- `connectedDevices`
- `lastSyncAt`
- `importedHealthMetrics`
- `syncEvents`

Important comments are already present and must remain:

- `HealthKit real requires native iOS app or wrapper.`
- `Browser/PWA cannot directly read Apple Health.`
- `This provider is currently mocked and ready to be replaced by a native iOS sync provider.`

Do not connect real Apple Health, Huawei, or Renpho yet.

### Registro Diario

The daily log screen has been redesigned toward `screen-02-registro-diario.png`:

- Sleep card
- Weight card using Renpho mock/imported data
- Activities list
- Notes section
- Save button
- Old visible habit chips hidden from UI

## Next Recommended Work

Proceed in parts. After each part:

1. Make a small scoped change.
2. Validate in the browser.
3. Check console errors.
4. Increment cache version if `index.html`, `service-worker.js`, `manifest.json`, or `assets/` changed.
5. Commit with a clear message.

Recommended order:

1. `Train` tab - match `screen-04-programas-treino.png`
2. `Treino ao vivo` state - match `screen-05-treino-ao-vivo.png`
3. `Stats` overview - match `screen-06-stats.png`
4. `Tabela mensal` inside Stats - match `screen-07-tabela-mensal.png`
5. `Hábitos` inside Stats - match `screen-08-habitos.png`
6. `Profile` - match `screen-09-profile-sync.png`
7. Optional: `Recovery & Sleep` internal screen - match `screen-03-recovery-sleep.png`

## Hard Rules

Do not break:

- localStorage existing data
- export/import backup
- login/logout Supabase Auth
- PWA offline behavior
- service worker cache update strategy
- workout session logic
- PR detection
- rest timer
- sleep calculation
- streaks
- score

Do not implement without explicit approval:

- automatic Supabase sync
- localStorage to Supabase migration
- schema changes
- real feed/social sync
- real Apple Health / Huawei / Renpho integrations

## Security Rules

Never commit:

- Supabase `service_role` key
- Postgres password
- real `DATABASE_URL`
- GitHub access token
- Supabase access token
- private secrets

Before any push, search for:

- `service_role`
- `postgresql://`
- `DATABASE_URL`
- `sb_secret`
- `password`
- `access_token`
- `SUPABASE_SERVICE_ROLE_KEY`

The Supabase publishable key is allowed in the frontend.

## PWA Rules

Every time you change `index.html`, `manifest.json`, `service-worker.js`, or files under `assets/`, increment the cache version.

Current cache after daily log work:

`hpc-cache-v63`

When changing UI next, move to:

`hpc-cache-v64`

The service worker must keep deleting old caches on `activate`.

## Validation Checklist

For every UI step, validate:

- App loads locally
- Target screen opens
- Bottom nav still has only `Home`, `Train`, `Stats`, `Profile`
- No app console errors
- Existing localStorage data still appears
- Export backup still works if touched
- Cache version is incremented
- No secrets were introduced

## User Preference

The user wants this done in parts, tab by tab.

They approved:

- Group disappears from UI only, code can stay.
- Mock Health Sync can update displayed data.
- Imported/mock health data works without login.
- Profile can show mock body metrics.
- Main nav tab names stay in English.
- Internal screens can be Portuguese.

Keep responses concise and show progress clearly.
