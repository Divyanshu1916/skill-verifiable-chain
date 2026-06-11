# SkillChain — v0 Visual Redesign + Full Functional Wiring

This is a large scope. I'll deliver it in 3 focused phases so you can review progress and the preview stays functional between phases.

## Phase 1 — Visual system + landing + shared shell
- Refresh design tokens in `src/styles.css`: deeper midnight base, animated conic gradient mesh, refined glass tiers, neon cyan/violet/emerald accents, premium type ramp (Space Grotesk + Inter + JetBrains Mono).
- New shared primitives: `GradientOrb`, `AnimatedGrid`, `GlassCard`, `StatTile`, `SectionHeader`, `NFTCard`, `ScoreRing`.
- Landing page (`/`) rebuilt to match v0 reference: animated hero with floating credential NFT, live stats strip, feature bento, NFT gallery preview, recruiter band, FAQ, footer. Every CTA/stat/card links somewhere real:
  - Get Started → `/signup`
  - View Demo → `/dashboard` (auto-redirects to login if signed out)
  - Stats cards → `/analytics`
  - Featured NFTs → `/nft/:id`
- Sticky glass nav with wallet button + sign-in.

## Phase 2 — Authenticated app surfaces
- `AppShell` upgrade: glass sidebar w/ reputation ring, wallet status, quick mint.
- `/dashboard`: hero score ring (click → `/reputation`), KPI tiles (→ `/analytics`), recent credentials, recent activity, mint CTA.
- `/skills`: list + Add/Edit/Delete dialogs + detail drawer (level slider, endorsements, category).
- `/certificates`: upload (file → SHA-256 hash → storage), preview modal, verify action, Mint NFT action (writes `tx_hash`, `nft_id`, `minted=true`).
- `/nft` gallery + `/nft/$id` detail (metadata, owner, issue date, tx hash w/ Polygonscan link, Verify button).
- `/reputation`: breakdown (skills, certificates, NFTs) with contribution bars + formula.
- `/analytics`: Recharts — skills by category, credentials over time, activity timeline.
- `/wallet`: Connect/Disconnect MetaMask, address, recent simulated tx list.

## Phase 3 — Public + recruiter + QR + reports
- `/passport/$username`: public profile, share button (Web Share + copy link), Download PDF (jsPDF), credential list, NFT grid, QR code to the passport URL.
- `/verify/$credentialId`: result page w/ on-chain proof card, tx hash, file hash match.
- `/qr`: generate QR for any of the user's credentials + "scan" simulation (paste/typed credentialId) → routes to verify page.
- `/recruiter`: candidate search (by username/skill), candidate profile drawer, verify credential, verification history (localStorage), Download Report PDF.

## Tech notes
- Libraries to add: `qrcode.react`, `jspdf`, `recharts`, `framer-motion` (only if not already present — will check).
- Keep all existing routes, auth gate (`_authenticated`), Supabase schema, storage buckets, and RLS untouched.
- NFT mint and tx hashes remain simulated client-side via existing `src/lib/web3.ts` (already in code) — production would swap in Thirdweb.
- All new pages registered through file-based routing; route tree regenerates automatically.

## Out of scope (will flag if you want them later)
- Real Polygon contract deploy / Thirdweb SDK wiring.
- Real OCR of uploaded certificates.
- Multi-tenant recruiter accounts w/ separate role-gated routes (current `user_roles` table supports it; I'll keep recruiter dashboard accessible to any signed-in user for the demo unless you say otherwise).

Reply "go" to start Phase 1, or tell me which phase/feature to prioritize first if you want a different order.