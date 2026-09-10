# 🪐 ASTRO // SPATIAL-X
### AI-Native Spatial Astronomy & XR Laboratory Platform
> **ASK • CALCULATE • INVESTIGATE • EXPLORE**

![ASTRO SPATIAL-X Banner](https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop)

---

## 🌌 Overview

**ASTRO // SPATIAL-X** is an enterprise-grade, AI-native 3D spatial astronomy laboratory platform combining conversational AI, real astronomical datasets, canonical Keplerian and relativistic calculation engines, multi-frame coordinate transformations, and authentic **WebXR/VR** immersive session handling.

The platform unites a full 3D astrophysics viewport with conversational reasoning, the NASA APOD archive, an interactive object catalog, a structured scientific research laboratory, and an interactive 3D numerical orbit simulator.

---

## 🚀 Key Features

### 1. 🪐 Interactive 3D Spatial Observatory
- **Full Solar System & Deep Space Simulation**: Real-time rendering of the Sun, all 8 major planets, moons (Earth's Moon, Galilean moons, Titan, Enceladus, Triton, Phobos, Deimos), Saturn's rings, and 3,000+ catalog stars.
- **6 Camera Modes**:
  - `Orbit`: Smooth orbital arc camera orbiting selected celestial bodies.
  - `Fly`: Free-flight 6-DoF exploration.
  - `Follow`: Dynamic tracking synchronized to orbital motion.
  - `Focus`: Precision lock on target planetary bodies.
  - `Observer`: Ground-based or orbital observer perspective.
  - `System Overview`: Wide-angle perspective of entire planetary systems.
- **4 Scientific Scale Modes**:
  - `Physical`: True astronomical linear scale (enforces prominent `"DISTANCES NOT TO SCALE"` warning when non-linear scales are visualized).
  - `Normalized`: Normalized radii for comparative morphology.
  - `Logarithmic`: Logarithmic distance scaling for deep-space visualization.
  - `System Overview`: Automatic bounding-box scaling.

---

### 2. 🥽 Native WebXR / Immersive VR Support
- **Authentic WebXR Device Integration**: Uses `navigator.xr` querying `immersive-vr` with Three.js stereo rendering (`renderer.xr.enabled = true`, `renderer.setAnimationLoop`).
- **6-DoF Controller Ray Selection**: Dual WebXR controller visualizers with raycasting for direct celestial body picking and teleportation in VR space.
- **Zero Fake VR Enforcement**: When running on desktop without VR hardware, displays diagnostic telemetry and maintains 100% functional 6-DoF desktop 3D spatial controls.
- **Hardware Support**: Tested for Meta Quest 2/3/Pro (Meta Quest Browser), Apple Vision Pro (Safari WebXR), Valve Index, HTC Vive, and Oculus Rift (SteamVR / Oculus Link).

---

### 3. 🤖 Natural Language AI Spatial Control Router
- Ask questions and control the 3D universe in plain English:
  - *"Focus on Mars and show its orbital path"*
  - *"Measure distance from Earth to Jupiter"*
  - *"Switch coordinate frame to Galactic"*
  - *"Simulate an eccentric comet in 3D Orbit Lab"*
  - *"Switch to Physical scale mode"*
- Transparently routes natural language intents directly to 3D scene actions and deterministic calculations without fabricating astronomical data.

---

### 4. 🛰️ Multi-Frame Coordinate Engine & Transformations
- **Supported Coordinate Reference Frames**:
  - `ICRS (J2000)`: International Celestial Reference System (Canonical)
  - `BCRS`: Barycentric Celestial Reference System
  - `HCRS`: Heliocentric Celestial Reference System
  - `GCRS`: Geocentric Celestial Reference System
  - `Galactic (IAU 1958)`: Galactic latitude ($b$) and longitude ($l$)
  - `AltAz (Topocentric)`: Altitude and Azimuth computed with Local Sidereal Time (LST) and observer coordinates
  - `Ecliptic`: Ecliptic longitude ($\lambda$) and latitude ($\beta$)

---

### 5. 🔬 3D Orbit Lab (Keplerian & Numerical RK4 Simulator)
- Interactive 3D orbital mechanics sandbox.
- Input custom semi-major axes ($a$), eccentricity ($e$), inclination ($i$), central mass ($M$), and orbital velocities.
- Renders live 3D trajectories, velocity ($\vec{v}$) and acceleration ($\vec{a}$) vectors, and real-time telemetry (periapsis, apoapsis, orbital period, true anomaly).

---

### 6. 🏷️ Strict Scientific Evidence Labeling System
Every data point across the platform is explicitly categorized with standardized evidence badges:
- 🟢 **OBSERVED**: Direct observational measurement from authoritative catalogs (NASA JPL Horizons, Gaia DR3, SIMBAD).
- 🔵 **CALCULATED**: Derived deterministically via canonical astrophysics formulas.
- 🟣 **SIMULATED**: Output of numerical integration or trajectory propagation (RK4 / Keplerian).
- 🟠 **HYPOTHETICAL**: Theoretical or model-based exoplanetary parameters.
- 🔴 **UNCERTAIN**: Measurement bounds with notable observational error margins.
- Missing values explicitly display **`DATA UNAVAILABLE`** — never fabricated.

---

### 7. 🧪 Research Lab & Investigation Workspace
- Structured hypothesis testing workspace:
  - Formulate hypotheses & research questions
  - Categorize supporting evidence and counter-evidence
  - Attach deterministic calculations, 3D scene snapshots, and simulation states
  - Local persistence across browser sessions

---

## 🛠️ Technology Stack

- **Framework**: React 18, TypeScript, Vite
- **3D & WebXR Rendering**: Three.js, WebXR Device API
- **Styling & UI**: Tailwind CSS, Radix UI, Lucide React, Glassmorphism HUD
- **State & Math**: Custom RK4 numerical integrator, IAU J2000 coordinate matrix transformations, Kepler equation solver

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- pnpm or npm

### Installation
```bash
# Clone the repository
git clone https://github.com/keshavporwal73-ux/ASTRO-SPATIAL-X.git
cd ASTRO-SPATIAL-X

# Install dependencies
pnpm install

# Start local development server
pnpm dev
```

### Production Build & Linting
```bash
# Validate TypeScript and code style
pnpm run lint

# Build production bundle
pnpm build
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed for astronomers, researchers, educators, and spatial computing pioneers.*
