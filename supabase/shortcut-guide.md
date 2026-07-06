# HPC Sync — iOS Shortcut Guide

Syncs Apple Health data (from Renpho + Huawei) to Supabase once a day.
Run manually or set as an automated morning Shortcut.

---

## Before you start

1. **Renpho** → open Renpho app → Settings → Connect to Apple Health → enable all metrics
2. **Huawei Health** → open Huawei Health → Me → Health Records → Connect to Apple Health → enable Sleep, Heart Rate, Steps
3. **HPC account** → log in on the web app (hpc app) so your user_id exists in Supabase
4. Run the SQL migration: `supabase/health_metrics.sql` in Supabase Dashboard → SQL Editor

---

## Shortcut — step by step

Create a new Shortcut in the iOS Shortcuts app with these actions in order:

---

### Block 1 — Sign in to get a token

**Action 1: Get Contents of URL**
- URL: `https://xlctlkayvthgdwsnkwej.supabase.co/auth/v1/token?grant_type=password`
- Method: `POST`
- Headers:
  - `apikey` = `sb_publishable_zUofVZmDUtLnB2xDEbmxQQ_hetjmBT5`
  - `Content-Type` = `application/json`
- Request Body: `JSON`
  - `email` = *(your HPC login email)*
  - `password` = *(your HPC password)*

**Action 2: Get Dictionary Value**
- Dictionary: `Contents of URL` (result from action 1)
- Key: `access_token`
- Save result as variable: `HPC_TOKEN`

**Action 3: Get Dictionary Value**
- Dictionary: `Contents of URL`
- Key: `user` → then key: `id`
- Save result as variable: `HPC_USER_ID`

---

### Block 2 — Get today's date

**Action 4: Format Date**
- Date: `Current Date`
- Format: `ISO 8601` — or Custom: `yyyy-MM-dd`
- Save as variable: `TODAY`

---

### Block 3 — Read Apple Health data

**Action 5: Find Health Samples**
- Type: `Sleeping Analysis`
- Sort by: `Start Date`, Descending
- Limit: `1`
- Filter: Start Date is today
- Save as: `SleepSamples`

**Action 6: Get Detail of Health Sample**
- Health Sample: `SleepSamples`
- Detail: `Duration` (in minutes)
- Save as: `SLEEP_MIN`

**Action 7: Get Detail of Health Sample**
- Health Sample: `SleepSamples`
- Detail: `Start Date` → Format as: `HH:mm`
- Save as: `SLEEP_BED`

**Action 8: Get Detail of Health Sample**
- Health Sample: `SleepSamples`
- Detail: `End Date` → Format as: `HH:mm`
- Save as: `SLEEP_WAKE`

**Action 9: Find Health Samples**
- Type: `Body Mass`
- Sort by: `Start Date`, Descending
- Limit: `1`
- Save as: `WeightSample`

**Action 10: Get Detail**
- Detail: `Value` (in kg)
- Save as: `WEIGHT_KG`

**Action 11: Find Health Samples**
- Type: `Resting Heart Rate`
- Sort by: `Start Date`, Descending
- Limit: `1`
- Save as: `HRSample`

**Action 12: Get Detail**
- Detail: `Value` (bpm)
- Save as: `RESTING_HR`

**Action 13: Find Health Samples**
- Type: `Heart Rate Variability (SDNN)`
- Sort by: `Start Date`, Descending
- Limit: `1`
- Save as: `HRVSample`

**Action 14: Get Detail**
- Detail: `Value` (ms)
- Save as: `HRV`

**Action 15: Find Health Samples**
- Type: `Steps`
- Filter: Start Date is today
- Aggregate: `Sum`
- Save as: `STEPS`

**Action 16: Find Health Samples**
- Type: `Active Energy Burned`
- Filter: Start Date is today
- Aggregate: `Sum`
- Save as: `ACTIVE_CAL`

---

### Block 4 — POST to Supabase

**Action 17: Get Contents of URL**
- URL: `https://xlctlkayvthgdwsnkwej.supabase.co/rest/v1/health_metrics`
- Method: `POST`
- Headers:
  - `apikey` = `sb_publishable_zUofVZmDUtLnB2xDEbmxQQ_hetjmBT5`
  - `Authorization` = `Bearer [HPC_TOKEN variable]`
  - `Content-Type` = `application/json`
  - `Prefer` = `resolution=merge-duplicates`  ← this makes it upsert (insert or update)
- Request Body: `JSON`
  - `user_id` = `[HPC_USER_ID variable]`
  - `date` = `[TODAY variable]`
  - `sleep_min` = `[SLEEP_MIN variable]`
  - `sleep_bed` = `[SLEEP_BED variable]`
  - `sleep_wake` = `[SLEEP_WAKE variable]`
  - `weight_kg` = `[WEIGHT_KG variable]`
  - `resting_hr` = `[RESTING_HR variable]`
  - `hrv` = `[HRV variable]`
  - `steps` = `[STEPS variable]`
  - `active_cal` = `[ACTIVE_CAL variable]`
  - `source` = `shortcut`

**Action 18: Show Notification**
- Title: `HPC Sync`
- Body: `Dados sincronizados para [TODAY]`

---

## Automate it

Shortcuts → Automation → New Automation → Time of Day
- Set to **08:00** every day
- Action: Run Shortcut → HPC Sync
- Run immediately (no confirmation)

---

## After first sync

Open the HPC web app → login → the sleep card and weight in Daily Log
will show real Renpho/Huawei data. The "Em breve" badge on Home
becomes "Sync 08:00" with a green dot.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Action 2 returns empty | Check email/password in Action 1 |
| Sleep = 0 | Huawei Health not connected to Apple Health |
| Weight not updating | Renpho not connected to Apple Health |
| POST returns 401 | Token expired — re-run Shortcut |
| POST returns 409 | Normal — `Prefer: resolution=merge-duplicates` handles it |
