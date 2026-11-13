# 26th January 2027 — Digital Invitation

A premium, cinematic, animation-heavy digital invitation website built with Next.js 15 (App Router).

> **Phase 1 — Architecture Foundation.** The visual design, animation sequences, and invitation experience will be implemented in Phase 2. This repository establishes the technical architecture only.

---

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15 (App Router) | Framework |
| React | 19 | UI library |
| TypeScript | 5 (strict) | Type safety |
| Tailwind CSS | 4 | Styling |
| Framer Motion / Motion | Latest | Component-level animations |
| GSAP | Latest | Complex timeline animations |
| Lucide React | Latest | Icons |
| Vitest | Latest | Unit testing |

---

## Project Structure

```
src/
├── app/
│   ├── [guest]/           # Dynamic personalised invitation routes
│   │   └── page.tsx       # Guest invitation page (Server Component)
│   ├── globals.css        # Global styles + CSS tokens
│   ├── layout.tsx         # Root layout with MotionProvider
│   └── page.tsx           # Landing / preview page
│
├── components/
│   ├── animations/
│   │   ├── AnimateIn.tsx      # Scroll-triggered entrance animations
│   │   └── StaggerGroup.tsx   # Staggered child animations
│   ├── invitation/
│   │   └── InvitationView.tsx # Personalised invitation display
│   ├── providers/
│   │   └── MotionProvider.tsx # LazyMotion + reduced-motion context
│   ├── shared/            # Shared UI components
│   └── transitions/
│       └── PageTransition.tsx # Page-level transition wrapper
│
├── config/
│   ├── animation.ts       # Centralised animation config + presets
│   └── invitation.ts      # Event details, couple names, contact info
│
├── hooks/
│   ├── use-gsap-timeline.ts   # GSAP timeline lifecycle hook
│   ├── use-reduced-motion.ts  # prefers-reduced-motion hook
│   └── use-scroll-progress.ts # IntersectionObserver scroll hook
│
├── lib/
│   ├── animation.ts       # Animation utilities
│   ├── guest.ts           # URL parsing, guest info, category logic
│   └── invitation.ts      # Event filtering, config access
│
├── styles/
│   └── animations.css     # CSS animation utilities
│
└── types/
    ├── animation.ts       # Animation type definitions
    └── invitation.ts      # Invitation type definitions

public/
├── audio/     # Background audio (Phase 2)
├── fonts/     # Custom fonts (Phase 2)
├── images/    # Invitation imagery (Phase 2)
└── videos/    # Video assets (Phase 2)
```

---

## Invitation Personalisation

Invitations are accessed via dynamic URLs:

```
/<guest-name>?type=family    # Family invitation
/<guest-name>?type=general   # General invitation
```

### Examples
- `/rahul?type=family` → Rahul sees Ashirbad + Engagement & Registry
- `/priya?type=general` → Priya sees Engagement & Registry only

### Categories

| Category | Visible Events |
|---|---|
| `family` | Ashirbad (morning ceremony) + Engagement & Registry |
| `general` | Engagement & Registry only |

> **Privacy rule:** General guests **never** see any Ashirbad information. The filtering happens server-side before the page renders.

If the `type` parameter is missing or invalid, the category defaults to `general`.

---

## Event Configuration

All event details are centralised in `src/config/invitation.ts`. Update placeholder values there before the design phase.

Fields to fill in:
- Couple names
- Event timings
- Venue and address
- Event descriptions
- Contact information
- RSVP deadline

---

## Animation Architecture

### Library responsibility split

| Library | Use case |
|---|---|
| CSS animations | Simple effects that do not require JS (fade, scale) |
| Framer Motion | Component-level animations, page transitions, scroll-triggered entrance |
| GSAP | Complex coordinated timelines, cinematic sequences (Phase 2) |

### Key components

- **`MotionProvider`** — wraps the app with `LazyMotion` (loads animation features lazily) and exposes `reducedMotion` context
- **`AnimateIn`** — scroll-triggered entrance animation for any element
- **`StaggerGroup`** — staggers multiple child animations
- **`PageTransition`** — smooth page-to-page transitions
- **`useGsapTimeline`** — creates a GSAP timeline bound to a component's lifecycle (auto-killed on unmount)
- **`useScrollProgress`** — `IntersectionObserver`-based scroll tracking hook
- **`useReducedMotion`** — reactive hook for `prefers-reduced-motion`

### Reduced-motion support

All animation components respect `prefers-reduced-motion`. When reduced motion is preferred:
- Framer Motion transitions collapse to `0.01s`
- CSS animations collapse via `@media (prefers-reduced-motion: reduce)`
- GSAP timelines receive a minimal duration

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint
npm run lint
```

---

## Preview URLs (Development)

| URL | What you see |
|---|---|
| `http://localhost:3000` | Landing page with preview links |
| `http://localhost:3000/rahul?type=family` | Family invitation for Rahul |
| `http://localhost:3000/priya?type=general` | General invitation for Priya |
| `http://localhost:3000/demo?type=family` | Family invitation placeholder |
| `http://localhost:3000/demo?type=general` | General invitation placeholder |

---

## Phase 2 Roadmap

The following will be implemented in the visual design phase:

- [ ] Final colour palette and typography
- [ ] Custom fonts (via `public/fonts/`)
- [ ] Cinematic page transition sequences
- [ ] Invitation-opening animation
- [ ] Scroll-triggered section reveals
- [ ] Animated typography
- [ ] Background imagery and video
- [ ] Background audio (optional)
- [ ] RSVP interaction
- [ ] Mobile-optimised experience

---

## Notes

- This is a **private, frontend-only** invitation. There is no backend, database, or authentication.
- The site is configured with `robots: noindex` to prevent search engine indexing.
- All guest personalisation happens via URL parameters — no data is stored.
