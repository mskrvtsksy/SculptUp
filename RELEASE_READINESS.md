# SCULPT — Telegram Mini App release checklist

## What is now production-safe

- The client never invents a Telegram identity. It sends `WebApp.initData` to `/api/telegram/session`; the Vercel handler validates the Telegram HMAC with `TELEGRAM_BOT_TOKEN` and rejects expired or malformed payloads.
- Demo profiles, likes, chat replies and appearance scores are disabled unless `VITE_DEMO_MODE=true` is set explicitly.
- Local state is partitioned by the verified Telegram user ID. It is a device cache only and must not be treated as the server source of truth.
- Telegram viewport, safe-area insets, theme changes, haptics and the native BackButton are handled. Motion respects the device's reduced-motion preference.
- Vercel headers apply a restrictive CSP, no-sniff, referrer and permissions policies.
- `/api/audit/photo` validates Telegram authorization and explicit consent before sending a small JPEG/PNG/WebP to a server-side Gemini model. It returns presentation feedback only; it never claims identity, liveness or an objective attractiveness score.
- `/api/safety/report` and `/api/safety/block` validate Telegram authorization and persist user safety actions server-side. Expose them in discovery/chat UI only once profiles receive real Telegram-backed IDs from the discovery API.
- `/api/discovery/feed` calls a server-only database function and returns opaque profile IDs, never Telegram IDs. It is ready for profile-photo signing and swipe mutations in the next phase.

## Required before enabling real users

1. In Vercel, set `TELEGRAM_BOT_TOKEN` (server-only; never prefix it with `VITE_`). Deploy the site using `pnpm build`.
2. In @BotFather, configure the deployed HTTPS URL as the bot's Main Mini App URL and test it from iOS, Android and Telegram Desktop.
3. Create a Supabase project, run [the SCULPT migration](supabase/migrations/202609040001_initial_sculpt.sql) in its SQL Editor, then add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Vercel. Tables use RLS and deny direct browser access; only server routes may use the service-role key.
4. Implement authenticated API routes for swipe decisions, matches, messages, blocks/reports and subscription entitlements. Each route must validate `initData` on the server and authorize by the resulting Telegram user ID.
5. Store photos in private object storage, issue short-lived access URLs, and process/delete uploads according to the privacy policy. Do not send biometric or appearance analysis to the client as a fabricated score.
6. Create Telegram Stars invoices on the server and credit features only after a verified successful payment update.
7. Add rate limits, moderation/report handling, account deletion/export, observability and backup/restore procedures before public launch.
8. For AI photo feedback, set `GEMINI_API_KEY` (and optionally `GEMINI_AUDIT_MODEL`) in Vercel. Enable the UI only after adding a consent screen, a deletion policy and durable rate limiting.

## Release gates

- [ ] No `VITE_DEMO_MODE` in Production or Preview.
- [ ] Session route returns 200 only from a real Mini App with a valid bot token.
- [ ] Two different Telegram accounts cannot read each other's profiles, conversations or purchases.
- [ ] Empty feed, empty likes and unavailable audit each show honest states rather than template content.
- [ ] Camera, location, BackButton, keyboard and safe-area behaviour are tested on mobile Telegram clients.
