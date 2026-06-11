# Rakesh Saraswat — Portfolio

An interactive "digital console" portfolio for Rakesh Saraswat, Software Engineer Intern (Long Beach, CA). A persistent procedural WebGL scene sits behind layered 2D UI panels, with cinematic typography, a physics-feeling custom cursor, and scroll-driven spatial transitions.

## Tech Stack

- **Next.js (App Router)** + **React** + **TypeScript**
- **Tailwind CSS v4**
- **Three.js** via **@react-three/fiber** + **@react-three/drei**
- **GSAP** + **@gsap/react** + **ScrollTrigger**
- **Lenis** smooth scrolling
- **lucide-react** icons
- Custom **GLSL shaders** (background plane + particle field)

## Key Features

- **Procedural 3D only** — no `.glb`/`.gltf` imports. Everything in the scene (aurora shader plane, GPU particle starfield, wireframe torus knot, rings, icosahedron) is generated in code.
- **Two custom GLSL shaders** reacting to time and mouse coordinates passed as uniforms (`uTime`, `uMouse`).
- **Custom cursor** — center dot + lerped trailing glow ring, hover states for links/buttons/project cards, magnetic buttons, hidden on touch devices.
- **Live GitHub projects** — fetched server-side from the GitHub API with ranking and a real-data fallback.
- **Scroll choreography** — Lenis + ScrollTrigger, Z-depth card entrances, parallax drifts, timeline spine drawing, closing zoom.
- **Boot sequence preloader**, HUD details (live cursor coordinates, availability status).
- **Accessible & responsive** — semantic HTML, keyboard focus states, `prefers-reduced-motion` support, lighter WebGL scene on mobile, capped device pixel ratio.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — the Next.js defaults are all that's needed.
3. No environment variables are required.

## Where to Edit Personal Data

All identity, copy, skills, and journey content lives in one file:

- `src/data/personal.ts` — name, role, location, email, links, about copy, skills groups, journey timeline, nav links.

## How GitHub Projects Are Fetched

`src/lib/github.ts` calls `https://api.github.com/users/rakexhs/repos` server-side (revalidated hourly via `next: { revalidate: 3600 }`). Repositories are filtered (no forks/archived), then scored — AI/LLM keywords, descriptions, demo links, stars, and recency all boost rank. The top repo becomes the featured card.

### Fallback Projects

If the API is unreachable or rate-limited, `src/lib/github.ts` falls back to `src/data/fallbackProjects.ts` — a snapshot of the real public repos, so nothing on the page is ever fabricated.

## Procedural 3D Notes

The fixed background canvas (`src/components/canvas/`) renders:

- `ShaderPlane.tsx` — fullscreen GLSL plane: fbm aurora fog, console grid, cursor-reactive glow, vignette.
- `ParticleField.tsx` — ~1,200 GPU points (450 on mobile) with a custom point shader: twinkle, depth parallax against the cursor, additive blending. Positions come from a seeded PRNG for hydration-stable output.
- `FloatingObjects.tsx` — wireframe torus knot, orbital rings, icosahedron, octahedron (Three.js primitives only).
- `CursorLight.tsx` — teal point light trailing the smoothed cursor.

Mouse input flows through a module-level store (`src/lib/mouse.ts`) written by one global listener and read inside `useFrame`/rAF loops — zero React re-renders on pointer movement.

## Project Structure

```
src/
  app/            layout, page, global styles
  components/
    canvas/       WebGL scene (R3F + GLSL)
    sections/     Hero, Projects, About, Skills, Journey, Contact
    ui/           cursor, magnetic buttons, animated text, nav, preloader
  hooks/          media-query, reduced-motion, touch, mouse listener
  lib/            GitHub fetching, mouse store, utils
  data/           personal data, fallback projects
```
