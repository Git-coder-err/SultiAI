# SultiAI Backend Plan

> Status: **Planned / mocked first.** The `web/` and `admin/` frontends are built and running against
> an in-app mock layer (`NEXT_PUBLIC_USE_MOCK=true`). This document defines the real backend that
> will replace the mocks. It is the **contract** the mocks already implement — no frontend changes
> should be required to switch over.

---

## 1. Target architecture

```
                    ┌─────────────────────────────┐
                    │   SultiAI monorepo           │
                    ├──────────────┬──────────────┤
                    │  web/ (Next) │ admin/ (Next)│
                    └──────┬───────┴──────┬───────┘
                           │              │
              public API   │              │  admin API
                           ▼              ▼
                    ┌─────────────────────────────┐
                    │  Express API (Render)       │  ← single client-facing API layer
                    └──────────────┬──────────────┘
                                   │
                     ┌─────────────┼─────────────┐
                     ▼             ▼             ▼
               Supabase Auth  Supabase PG   Supabase Storage
                                   │
                                   ▼
                     ┌─────────────────────────────┐
                     │  Groq / OpenAI · Whisper    │  ← AI (server-side only)
                     └─────────────────────────────┘
```

- **Mobile app** keeps talking to the Express API (unchanged client contract).
- **`web/`** and **`admin/`** talk to the Express API over HTTP.
- **Supabase** provides Auth, PostgreSQL, and Storage. Express is the only component that talks to
  it with the service-role key. Admin reads happen server-side through Express routes that check
  `role === 'admin'` (never via a client-side service key).

---

## 2. Environment variables

| Variable | Used by | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | mobile | Base URL of the Express API |
| `NEXT_PUBLIC_API_URL` | web, admin | Base URL of the Express API |
| `NEXT_PUBLIC_USE_MOCK` | web, admin | `true` (default) uses in-app mocks; `false` calls the API |
| `NEXT_PUBLIC_ADMIN_TOKEN` | admin | (dev only) demo token until real auth lands |
| `DATABASE_URL` | server | Supabase Postgres connection string |
| `DB_DIALECT` | server | `postgresql` (default `sqlite` today) |
| `SUPABASE_URL` | server | Supabase project URL |
| `SUPABASE_ANON_KEY` | server | public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server | server-only key (never client) |
| `SUPABASE_JWT_SECRET` | server | used to verify Supabase access tokens |
| `GROQ_API_KEY` | server | primary AI provider |

---

## 3. Endpoint contracts

### 3.1 Public website (`web/`)

| Method | Path | Auth | Request | Response | Notes |
|---|---|---|---|---|---|
| GET | `/api/health` | — | — | `HealthReport` | uptime, `db`, `groq`, `whisper` |
| GET | `/api/public/app-info` | — | — | `AppInfo` | version, download URL, status, languages |
| POST | `/api/public/contact` | — | `ContactSubmission` | `{ received, ticketId }` | validates email + message length |
| POST | `/api/public/newsletter` | — | `{ email }` | `{ subscribed }` | |

Type shapes are defined in `web/src/types/index.ts` (the mock is the reference implementation).

### 3.2 Admin dashboard (`admin/`)

All admin endpoints require a valid Supabase session **and** `users.role IN ('admin','moderator')`.
Type shapes are defined in `admin/src/types/index.ts`; the mock in `admin/src/lib/mock/` is the
reference implementation.

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/api/admin/analytics/overview` | admin | — | `OverviewResponse` (stats + health + 3 weekly series) |
| GET | `/api/admin/users` | admin | query: `search, role, status, sort, page, perPage` | `UserListResponse` |
| GET | `/api/admin/users/:id` | admin | — | `UserDetail` |
| PATCH | `/api/admin/users/:id/role` | admin | `{ role }` | `AdminUser` |
| PATCH | `/api/admin/users/:id/status` | admin | `{ status }` | `AdminUser` |
| POST | `/api/admin/users/:id/verify` | admin | `{ verified }` | `AdminUser` |
| GET | `/api/admin/lessons` | admin | — | `LessonModule[]` |
| POST | `/api/admin/lessons` | admin | `LessonModule` (partial) | `LessonModule` |
| PUT | `/api/admin/lessons/:id` | admin | partial `LessonModule` | `LessonModule` |
| DELETE | `/api/admin/lessons/:id` | admin | — | `204` |
| GET | `/api/admin/community/posts` | admin | — | `CommunityPost[]` |
| PATCH | `/api/admin/community/posts/:id` | admin | `{ featured? \| hidden? }` | `CommunityPost` |
| DELETE | `/api/admin/community/posts/:id` | admin | — | `204` |
| GET | `/api/admin/community/reports` | admin | — | `CommunityReport[]` |
| PATCH | `/api/admin/community/reports/:id` | admin | `{ status }` | `CommunityReport` |
| GET | `/api/admin/ai/usage` | admin | — | `AiUsageStats` |
| GET | `/api/admin/xp/overview` | admin | — | `XpOverview` |
| GET | `/api/admin/feedback` | admin | — | `FeedbackItem[]` |
| PATCH | `/api/admin/feedback/:id` | admin | — | `FeedbackItem` (toggles resolved) |
| GET | `/api/admin/preservation` | admin | — | `PreservedWord[]` |
| POST | `/api/admin/preservation/:id` | admin | `{ status }` | `PreservedWord` |
| GET | `/api/admin/settings` | admin | — | `AdminSettings` |
| PUT | `/api/admin/settings` | admin | partial `AdminSettings` | `AdminSettings` |

**Error convention:** all errors return `{ error: { message } }` (or `{ error: string }` for
legacy routes) with a 4xx/5xx status. The frontend `lib/api.ts` throws on `!res.ok`.

---

## 4. Existing server routes reused as-is

These already exist in `server/src/routes/*` and power the mobile app; the admin endpoints above
are aggregates over the same tables.

```
/api/auth         /api/user         /api/tutor         /api/learning
/api/community    /api/notifications /api/speech       /api/saved-phrases
/api/feedback     /api/game         /api/achievements  /api/vocabulary
/api/challenges   /api/analytics    /api/preservation  /api/ar
/api/whisper      /api/agent        /api/v2/vocabulary /api/v2/pronunciation
/api/v2/recommendations
```

---

## 5. Migration phases

### Phase 1 — Point Express data layer at Supabase Postgres (low risk)
- `server/src/db/connection.ts` already supports the `postgresql` dialect via `DATABASE_URL`
  (using `drizzle-orm/node-postgres` and `server/src/db/schema-pg.ts`, 19 tables).
- Run `DB_DIALECT=postgresql npm run db:push` against Supabase to create the schema.
- Verify with the existing test suite (`npm test --prefix server`).

### Phase 2 — Move Mongo-backed pieces into Postgres
- `server/src/db/mongodb/` currently backs learner profiles + tutor sessions via `learner.repo.ts`,
  `tutor.repo.ts`, `learningEngine.ts`, `recommendationEngine.ts`.
- `schema-pg.ts` already declares `learner_profiles` and `tutor_sessions`, so port the repos and
  drop the `mongoose` dependency.

### Phase 3 — Migrate auth to Supabase Auth
- Mobile (`src/services/api.js`): replace `signIn`/`signUp` with `@supabase/supabase-js`
  `signInWithPassword` and `signInWithOAuth({ provider: 'google' })`; store the access token where
  `auth_token` is stored today.
- Server (`server/src/middleware/auth.ts`): verify Supabase JWTs (via `SUPABASE_JWT_SECRET` with
  `jsonwebtoken`, or `supabase.auth.getUser(token)`). Keep `req.user.id` so all ~25 route modules
  are untouched.
- Identity mapping: add `users.supabase_uid TEXT UNIQUE`; populate on signup. RLS policies use
  `auth.uid() = users.supabase_uid`.
- Legacy passwords: migrate existing bcrypt hashes with the Supabase Admin API
  (`updateUserById(..., { password_hash })`) so existing users don't re-register.

### Phase 4 — Admin routes (the contract above)
- Add `server/src/routes/admin/*` implementing the §3.2 contracts, guarded by an
  `adminMiddleware` (Supabase session + `users.role` check).
- Wire in `server/src/index.ts`.

### Phase 5 — Public website routes
- Add `server/src/routes/public.routes.ts` implementing the §3.1 contracts (contact, newsletter,
  app-info).

---

## 6. Security

- **Never** ship `SUPABASE_SERVICE_ROLE_KEY` to a client (web/admin/mobile).
- Admin writes are performed server-side with the service role; RLS stays enabled as a second
  layer of defense.
- Rate limiting: reuse `server/src/middleware/rateLimit.ts` (a stricter limit for auth endpoints).
- All admin mutations validate input through `server/src/middleware/validate.ts`.

---

## 7. Deployment

| Piece | Host | Notes |
|---|---|---|
| Express API | Render | `DB_DIALECT=postgresql` + `DATABASE_URL` → Supabase |
| web (sultiai.com) | Vercel | static; `NEXT_PUBLIC_USE_MOCK=false`, `NEXT_PUBLIC_API_URL` set |
| admin (admin.sultiai.com) | Vercel | same env handling |
| Mobile | EAS Build → Google Play (.aab) | `EXPO_PUBLIC_API_URL` set to the Render domain |
| Supabase | Supabase Cloud | Auth + Postgres + Storage |

> Production note: local TinyLlama / whisper-tiny models (`server/src/services/localLLM*`,
> `sttService`) are too heavy for Render free/standard instances — production uses Groq/OpenAI and
> cloud Whisper only. Local models remain available for offline/dev fallback.

---

## 8. Testing strategy

1. **Contract tests:** run the frontend against the mocks (default) to validate UI against the
   §3 shapes.
2. **API contract tests (post-migration):** new `server/src/routes/admin/__tests__` using
   `supertest` asserting the same shapes the mocks produce, so the swap is verified end-to-end.
3. **Integration:** `NEXT_PUBLIC_USE_MOCK=false` on a preview Vercel deployment pointed at a
   staging Render API.
---

## 9. Community module (learning-first) — contract

The Community module is designed **learning-first**: XP is only earned from *meaningful learning
activity* (asking/answering questions, having an answer marked helpful, completing challenges,
submitting corrections), **never** from likes, comments, follows, or views. This keeps leaderboards
honest and avoids gamifying empty social engagement.

> The current mobile Community screen (`src/screens/CommunityScreen.js` + `src/services/communityMock.js`)
> is mock-first: it tries the real endpoints below and falls back to rich sample data. Post types and
> the learning-first card layout are the contract for the real backend.

### 9.1 Post types

Posts carry a `type` (not just free text). The UI renders different card layouts + action sets per type:

| `type` | Label | Icon | Learning affordance |
|---|---|---|---|
| `question` | Question | help-circle | native speakers answer; author can mark "Helpful" → +XP |
| `discussion` | Discussion | chatbubbles | open conversation, no XP |
| `tip` | Learning Tip | bulb | advice; can be saved |
| `vocabulary` | Vocabulary | book | native phrase + meaning pair |
| `translation` | Translation Help | swap-horizontal | how-do-you-say requests |
| `pronunciation` | Pronunciation | mic | stress/pronunciation help |
| `culture` | Culture | color-palette | cultural context, no XP |

### 9.2 Entities (Supabase tables)

- **posts**: `id`, `user_id`, `type` (§9.1), `native` (Bisaya text), `english`, `content`,
  `tags text[]`, `language`, `likes_count`, `comments_count`, `created_at`, `updated_at`.
- **post_comments**: `id`, `post_id`, `user_id`, `comment`, `is_helpful bool`, `helpful_count`,
  `created_at`.
- **comment_helpful_votes**: `id`, `comment_id`, `user_id` (unique per comment+user).
- **post_likes**: `id`, `post_id`, `user_id` (unique).
- **post_saves**: `id`, `post_id`, `user_id` (unique) — bookmarks for later study.
- **follows**: `id`, `follower_id`, `followee_id`, `created_at`.
- **reports**: `id`, `post_id`/`comment_id`, `reporter_id`, `reason`, `status`
  (`pending`/`resolved`/`dismissed`), `resolved_by`, `created_at`, `resolved_at`.
- **notifications**: `id`, `user_id`, `type`
  (`answer`/`challenge`/`helpful`/`follow`/`system`), `title`, `body`, `read bool`, `created_at`.
- **community_challenges**: `id`, `title`, `description`, `type`
  (`ask_question`/`answer_question`/`get_helpful`/`complete_lesson`/`pronunciation`), `target`,
  `xp_reward`, `kind` (`daily`/`weekly`), `starts_at`, `ends_at`.
- **challenge_progress**: `id`, `user_id`, `challenge_id`, `progress int`, `completed bool`,
  `completed_at` (unique per user+challenge).
- **community_activity**: `id`, `user_id`, `type` (`post`/`answer`/`helpful`/`saved`), `ref_id`,
  `created_at`.
- **xp_transactions**: `id`, `user_id`, `amount`, `reason` (enum — see §9.4), `created_at`.
  Authoritative, append-only; leaderboard XP is the SUM of this table.

### 9.3 REST endpoints (mobile client contract)

```
GET    /api/community/posts?feed=for_you|following|latest|popular&type=question|...&tag=grammar
       → { data: [ Post ], live: true }   // Post = §9.2 shape + author_name, author_verified, is_native
POST   /api/community/posts                { type, native, english, content, tags[] }  → Post
GET    /api/community/posts/:id            → Post (+ is_liked, is_saved for viewer)
GET    /api/community/posts/:id/comments   → Comment[] (+ is_helpful, helpful_count)
POST   /api/community/posts/:id/comments   { comment } → Comment
POST   /api/community/posts/:id/like       → { liked: bool }         (toggles; no XP)
POST   /api/community/posts/:id/save       → { saved: bool }         (bookmark; no XP)
POST   /api/community/comments/:id/helpful → { marked: bool }        (author earns XP if marked)
POST   /api/community/posts/:id/report     { reason }                (queue for moderation)
GET    /api/community/search?q=            → Post[] (native, english, tags, author)
GET    /api/community/experts              → verified native speakers
GET    /api/community/resources            → shared phrases
GET    /api/community/notifications        → Notification[]
GET    /api/community/challenges?kind=daily|weekly → Challenge[] (+ progress)
POST   /api/community/challenges/:id/complete     → { xp_earned }    (server-issued XP)
GET    /api/community/activity             → my CommunityActivity[]
```

Feed filtering (`following`, `latest`, `popular`) and the type filter are **server-side** so the
feed stays fast and the "For You" mix can learn over time.

### 9.4 XP transaction rules (server-authoritative)

| Reason | XP | Trigger |
|---|---|---|
| `question_posted` | +10 | author posts a `question`-type post |
| `answer_posted` | +10 | answerer comments on a `question`/`translation`/`pronunciation` post |
| `answer_helpful` | +15 | author marks a comment "Helpful" (one-time per comment) |
| `challenge_completed` | `challenge.xp_reward` | server validates progress target |
| `correction_used` | +5 | learner marks a correction as used |

All grants go through `xp_transactions` server-side. Client-side `addXp` in the mock is **temporary**
and must be removed when the real backend lands — the client never self-reports XP.

### 9.5 Moderation

- Reports land in `reports` with `status='pending'`; the admin Community tab
  (`admin/src/lib/mock/` community handlers) lists them with Approve/Dismiss.
- Threshold rule (future): ≥3 unique pending reports on one post auto-flags it for review.
- Native-speaker "verified" flag comes from the existing `/api/community/verify` flow.

### 9.6 Mock ↔ backend parity checklist

- [ ] Post shape (type, native/english, tags, author_name/verified/is_native) matches mock `MOCK_POSTS`.
- [ ] `POST /posts` accepts the CreatePostSheet payload `{ type, native, english, tags }`.
- [ ] `POST /posts/:id/like` and `/save` toggle server-side; `GET` feed returns `is_liked/is_saved`.
- [ ] Leaderboard XP = SUM(xp_transactions) for the period, matching `MOCK_LEADERBOARD` ranking.
- [ ] Notifications match `MOCK_NOTIFICATIONS` types (`answer`/`challenge`/`helpful`/`follow`).
- [ ] `GET /community/challenges` returns kind + progress + xp_reward as `renderChallenges` expects.
