# Requirements Document

## 1. Application Overview

**Name**: ASTRO (3D Spatial Edition)

**Description**: ASTRO is an AI-native 3D spatial astronomy laboratory platform combining conversational AI, real astronomical datasets, scientific calculations, coordinate transformations, interactive 3D visualizations, production-ready WebXR/VR support, and research tools. The platform integrates a full 3D scientific viewport with existing modules including AI Observatory, APOD, Object Explorer, Scientific Calculator, and Research Lab. The interface follows a dark cinematic NASA/scientific laboratory aesthetic with near-black deep space backgrounds, indigo/navy panels, and crisp scientific telemetry HUD, responsive across desktop, tablet, and mobile.

---

## 2. Users and Use Cases

**Target Users**: Astronomy enthusiasts, students, researchers, science educators, and VR/spatial computing users.

**Core Use Cases**:
- Explore astronomical objects in interactive 3D environment with multiple camera modes and scale modes
- Enter real immersive-vr sessions via WebXR when VR hardware is available
- Interact with AI through natural language commands mapped to spatial actions
- Perform scientific calculations and multi-frame coordinate transformations
- Visualize solar system, orbits, celestial sphere, deep space objects, and exoplanets in 3D
- Conduct structured research investigations with hypothesis and evidence tracking
- Browse APOD and search astronomical object catalog
- Run Keplerian and numerical orbit simulations with synchronized simulation clock

---

## 3. Page Structure and Feature Description

### 3.1 Page Hierarchy

```
ASTRO (3D Spatial Edition)
├── Home / Dashboard
├── 3D Observatory (Main Viewport)
│   ├── Solar System 3D View
│   ├── Deep Space 3D View
│   ├── Exoplanet Systems 3D View
│   ├── Sky Explorer (Celestial Sphere)
│   └── Orbit Lab
├── AI Observatory (Conversational AI with Spatial Control)
├── Scientific Calculator
├── Research Lab
├── Saved Investigations
├── APOD & Featured Discoveries
├── Object Explorer
└── WebXR/VR Mode
```

### 3.2 Home / Dashboard

- Entry point displaying summary cards for all major modules
- Shows current APOD image and caption
- Highlights featured discoveries and recent investigation activity
- Navigation bar provides access to all top-level sections including 3D Observatory
- Quick access button to enter 3D Observatory

### 3.3 3D Observatory (Main Viewport)

Full 3D scientific viewport rendered using Three.js WebGL. All celestial objects, orbits, coordinate grids, and labels are rendered in 3D space with scientific coordinate systems.

#### 3.3.1 Core 3D Rendering Features
- 3D scene displaying Sun, 8 planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune), major moons where data exists, Saturn rings, orbital paths, stars
- Optional celestial grid and ecliptic plane toggle
- Realistic celestial textures and shaders for bodies
- Scientific labels and telemetry HUD overlay
- Efficient geometry with instancing and LOD (Level of Detail) optimization

#### 3.3.2 WebXR/VR Mode
- Visible ENTER VR or CONNECT VR button in 3D Observatory interface
- System detects navigator.xr and immersive-vr support on page load
- When user clicks ENTER VR button, system requests real immersive-vr session through Three.js XRSession API
- If VR hardware detected and session successfully started:
  + Stereo rendering for VR headset
  + Controller ray selection for object interaction
  + Select and back controls for navigation
  + Object focus via controller selection
  + Basic teleportation and locomotion controls
  + Desktop and VR share same scientific state, objects, calculations, and simulation clock
- If VR hardware not detected or session request fails:
  + Display \"VR MODE UNAVAILABLE\" message with diagnostics (browser support, hardware status)
  + ENTER VR button disabled or shows unavailable state
- Desktop 3D Observatory remains fully usable without VR
- Never claim VR is active unless real immersive-vr session exists
- User can exit VR session at any time; system returns to desktop 3D viewport

#### 3.3.3 Camera Modes
User can switch between the following camera modes:
- **Orbit**: Camera orbits around selected object
- **Fly**: Free-flight camera control
- **Follow**: Camera follows selected object in motion
- **Focus**: Camera locks focus on selected object
- **Observer**: Camera positioned at observer location (Earth surface or custom coordinates)
- **System Overview**: Wide-angle view of entire system

#### 3.3.4 Scale Modes
User can switch between the following scale modes:
- **Physical**: True physical scale; when distances are compressed for visibility, system displays \"DISTANCES NOT TO SCALE\" warning prominently in HUD
- **Normalized**: All objects scaled to similar visual size for comparison
- **Logarithmic**: Logarithmic distance scaling for extreme range visualization
- **System Overview**: Automatic scaling to fit entire system in viewport

Scale mode indicator always visible in HUD. For every nonphysical visualization, \"DISTANCES NOT TO SCALE\" warning is mandatory.

#### 3.3.5 Object Inspector Panel
When user selects any celestial body in 3D viewport (via mouse click on desktop or controller ray selection in VR), Object Inspector panel displays:
- Object name and classification
- Authoritative astrophysical data: coordinates, distance, magnitude, size, mass, temperature, orbital parameters, discovery information, scientific description
- Evidence status labels: OBSERVED, CALCULATED, SIMULATED, HYPOTHETICAL, UNCERTAIN
- Missing data displays \"DATA UNAVAILABLE\"; never invent values
- Official catalog citations and data sources
- Quick action buttons: Focus, Follow, Show Orbit

#### 3.3.6 Solar System 3D View
- Interactive 3D rendering of Sun, 8 planets, major moons where data exists, Saturn rings, and orbital paths
- Real-time or user-selected date/time positioning via simulation clock
- Orbital paths rendered as 3D curves
- User can select any body to view Object Inspector
- Supports all camera modes and scale modes

#### 3.3.7 Deep Space 3D View
- 3D distribution of stars, star clusters, nebulae, galaxies
- Interactive selection and Object Inspector for each object
- Real catalog information with evidence labels
- Distance and light-travel time measurement tools

#### 3.3.8 Exoplanet Systems 3D View
- 3D rendering of confirmed exoplanetary systems with host stars and planets
- Real catalog data: host star, distance, period, radius, mass, discovery method
- Speculative worlds labeled HYPOTHETICAL
- Circumstellar habitable zone rendered as 3D shell
- Multi-planet systems with orbital dynamics

#### 3.3.9 Sky Explorer (Celestial Sphere)
- Interactive sky view with stars, constellations, and deep-sky objects
- Real-time coordinate frame rendering: ICRS (J2000), BCRS, HCRS, GCRS, Galactic (IAU 1958), AltAz (topocentric with LST), Ecliptic
- User can switch coordinate frame; grid and labels update accordingly
- Search and selection functionality
- Object focus synchronized with 3D Observatory
- Observer location and datetime input for AltAz frame

#### 3.3.10 Orbit Lab
- Interactive orbital dynamics simulator in 3D space
- User inputs orbital parameters: mass, semi-major axis, eccentricity, inclination, initial velocity vector, duration, timestep, epoch
- Supports Keplerian calculations (two-body analytical solution) and numerical RK4 simulation
- System calculates and renders: trajectory, velocity vectors, acceleration vectors, periapsis, apoapsis, orbital period, true anomaly, telemetry
- All results labeled CALCULATED or SIMULATED
- Simulation controls: play, pause, reset, step, adjust speed, set date/time, set epoch
- Live visual vector telemetry rendered in 3D

#### 3.3.11 Simulation Clock
- Global simulation clock controls: play, pause, reset, step forward/backward, speed adjustment, date/time input, epoch setting
- Desktop and VR modes stay synchronized to same simulation clock state
- Simulation time can be set to past, present, or future dates
- Clock state affects all time-dependent visualizations: planetary positions, orbital paths, sky view

#### 3.3.12 Measurement Tools
User can perform the following measurements with results labeled CALCULATED:
- **Distance**: Measure distance between two objects in AU/light-years/parsecs
- **Light-travel time**: Calculate light-travel time between two objects
- **Angular separation**: Measure angular separation between two objects in degrees/arcminutes/arcseconds
- **Orbital period**: Calculate orbital period from orbital parameters
- **Velocity**: Calculate velocity at any point in orbit
- **Escape velocity**: Calculate escape velocity from celestial body
- **Gravitational force**: Calculate gravitational force between two bodies
- **Schwarzschild radius**: Calculate Schwarzschild radius for given mass
- **Luminosity/flux**: Calculate luminosity or flux from distance and magnitude
- **Redshift**: Calculate redshift and recession velocity

Measurement results persist in HUD until cleared.

### 3.4 AI Observatory (Conversational AI with Spatial Control)

- Chat interface where users ask astronomy-related questions in natural language
- AI responses include inline evidence/confidence labels: OBSERVED, CALCULATED, SIMULATED, HYPOTHETICAL, UNCERTAIN
- AI can invoke spatial actions based on user queries, including:
  + `focus_object`: Focus 3D camera on specified object
  + `show_object`: Display specified object in 3D viewport
  + `show_orbit`: Render orbital path of specified object
  + `set_coordinate_frame`: Switch celestial sphere coordinate frame
  + `measure_distance`: Measure distance between two objects
  + `measure_angular_separation`: Measure angular separation between two objects
  + `start_simulation`: Start orbital simulation in Orbit Lab
  + `pause_simulation`: Pause current simulation
  + `set_simulation_time`: Set simulation date/time
  + `change_scale_mode`: Switch scale mode in 3D viewport
- AI Router connects user queries with authoritative calculations and 3D scene data; AI verifies actual state and does not invent data
- Conversation history preserved within session
- Scientific calculation engine invoked transparently when queries require numerical results

### 3.5 Scientific Calculator

- Structured calculator supporting astronomy-specific equations:
  - Kepler's third law
  - Luminosity-distance relationship
  - Schwarzschild radius
  - Coordinate transformations: ICRS, BCRS, HCRS, GCRS, AltAz, Galactic, Ecliptic, Topocentric
  - Redshift and recession velocity
  - Angular resolution (Rayleigh criterion)
  - Orbital mechanics: periapsis, apoapsis, orbital period, true anomaly, velocity at any point, escape velocity, gravitational force
  - Light-travel time
  - Angular separation
- User selects equation category, inputs parameters, receives computed results with CALCULATED label
- Calculation steps shown for transparency
- Results can be saved to Saved Investigations

### 3.6 Research Lab

- Structured workspace for scientific investigation with extended hypothesis testing framework:
  - Hypothesis statement
  - Question formulation
  - Supporting evidence items (each labeled: OBSERVED / CALCULATED / SIMULATED / HYPOTHETICAL / UNCERTAIN)
  - Counter-evidence items
  - Established knowledge references
  - Competing explanations
  - Calculations performed
  - Simulations run (linked to Orbit Lab or other simulation outputs)
  - Conclusion or status field
  - Uncertainty assessment
  - Peer-reviewed sources and citations
- Users can create, edit, and delete research entries
- Entries are saved to Saved Investigations
- Research entries can reference 3D scene states, measurement results, and simulation outputs

### 3.7 Saved Investigations

- Persistent workspace where users save investigations, calculations, notes, 3D scene snapshots, and simulation results
- Timeline view showing saved items in chronological order
- Users can revisit, edit, or delete saved items
- Supports saving outputs from: AI Observatory, Scientific Calculator, Research Lab, 3D Observatory (scene snapshots, measurement results, simulation states)
- Backend storage ensures persistence across sessions

### 3.8 APOD and Featured Discoveries

- Displays NASA Astronomy Picture of the Day with title, date, and explanation
- Featured Discoveries section highlights curated astronomical findings with evidence labels
- Each item links to detail view with full description and related data
- User can navigate to previous dates to view past APOD entries
- Real data connector to NASA APOD API

### 3.9 Object Explorer

- Searchable catalog of astronomical objects: stars, galaxies, nebulae, clusters, planets, moons, asteroids, comets, exoplanets
- Each object detail page includes:
  - Physical and observational properties with evidence labels
  - Coordinates in multiple frames: ICRS, Galactic, AltAz (if applicable), Ecliptic, Topocentric
  - Related visualizations: quick link to view object in 3D Observatory
  - Calculator links for relevant equations
  - Official catalog citations and data sources
- Search results can be filtered by object type, distance range, brightness, discovery date
- Real catalog data connectors with citations

---

## 4. Business Rules and Logic

### 4.1 Evidence / Confidence Labeling
- Every factual data point displayed across the platform carries one of five labels: OBSERVED, CALCULATED, SIMULATED, HYPOTHETICAL, UNCERTAIN
- Labels are visually distinct (color-coded) and consistently applied across AI responses, Object Inspector, research entries, calculator outputs, and measurement results
- Missing data displays \"DATA UNAVAILABLE\"; never invent values

### 4.2 Calculation Engine Decoupling
- Scientific calculation engine operates as independent logic layer
- 3D visualization modules and AI Observatory consume calculation outputs; they do not perform calculations internally
- AI Router invokes calculation engine for quantitative queries

### 4.3 Coordinate Engine and Frame Transformations
- Supported frames: ICRS (J2000), BCRS, HCRS, GCRS, Galactic (IAU 1958), AltAz (topocentric with LST), Ecliptic, Topocentric
- AltAz and Topocentric transformations require observer latitude, longitude, and datetime as inputs
- All coordinate outputs labeled CALCULATED
- Sky Explorer updates grid and labels when user switches coordinate frame
- Coordinate frame indicator always visible in HUD

### 4.4 Scale Mode and Physical Accuracy
- When Physical scale mode is active and distances are compressed for visibility, \"DISTANCES NOT TO SCALE\" warning is displayed prominently in HUD
- System never implies false physical scale; warnings are mandatory when true scale is not rendered
- Scale mode indicator always visible in HUD

### 4.5 AI Spatial Control Mapping
- AI Observatory natural language queries are parsed and mapped to structured spatial actions
- Spatial actions trigger corresponding 3D viewport updates: camera focus, object display, coordinate frame switch, measurement tool activation, simulation control
- AI responses include confirmation of spatial action performed
- AI verifies actual state before responding; does not invent data

### 4.6 Orbit Lab Simulation Rules
- User inputs orbital parameters; system validates physical plausibility before rendering
- Keplerian mode: two-body problem, analytical solution
- Numerical mode: RK4 integration, user-specified timestep
- Simulation time can be set to past, present, or future dates via simulation clock
- Simulation results (trajectory, telemetry, vectors) labeled CALCULATED or SIMULATED

### 4.7 Simulation Clock Synchronization
- Global simulation clock state shared across desktop and VR modes
- Clock controls: play, pause, reset, step, speed adjustment, date/time input, epoch setting
- All time-dependent visualizations (planetary positions, orbital paths, sky view) synchronized to simulation clock

### 4.8 Saved Investigations Persistence
- Saved items persist across sessions via backend storage
- Timeline ordered by save timestamp, newest first
- Users can delete individual saved items
- 3D scene snapshots include camera position, scale mode, selected objects, and coordinate frame state

### 4.9 WebXR/VR Session Management
- System checks navigator.xr and immersive-vr support on page load
- ENTER VR button enabled only if WebXR supported and VR hardware detected
- When user clicks ENTER VR, system requests real immersive-vr session through Three.js XRSession API
- If session request fails, system displays \"VR MODE UNAVAILABLE\" message with diagnostics (browser support, hardware status)
- Never claim VR is active unless real immersive-vr session exists
- User can exit VR session at any time; system returns to desktop 3D viewport
- Desktop and VR share same scientific state, objects, calculations, and simulation clock

### 4.10 APOD Data
- APOD content fetched from NASA APOD API and displayed for current date by default
- User can navigate to previous dates to view past APOD entries
- Real data connector with citations

### 4.11 Real Data Connectors and Citations
- All astronomical data sourced from authoritative catalogs and APIs
- Official catalog citations displayed in Object Inspector and Object Explorer
- Real data connectors for: NASA APOD, exoplanet catalogs, star catalogs, deep space object catalogs

### 4.12 Authentication
- User authentication system for saving investigations and personalized settings
- Login and registration functionality preserved

### 4.13 Responsive UI
- Interface responsive across desktop, tablet, and mobile devices
- Dark cinematic NASA/scientific laboratory aesthetic with near-black deep space backgrounds, indigo/navy panels, and crisp scientific telemetry HUD

---

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|---|---|
| AI query outside astronomy domain | Respond that platform is scoped to astronomy topics |
| Orbit Lab receives physically invalid parameters | Display inline validation error; do not render orbit |
| Sky Explorer AltAz frame without observer location | Prompt user to enter observer coordinates before rendering |
| APOD data unavailable | Display fallback message indicating data temporarily unavailable |
| Calculation results in undefined/infinite values | Display error label next to result field |
| Object not found in catalog search | Display \"No results found\" with suggestion to try alternate names |
| WebXR hardware not detected | Display \"VR MODE UNAVAILABLE\" with diagnostics; disable ENTER VR button |
| WebXR session request fails | Display error message with browser/hardware status; return to desktop viewport |
| 3D viewport rendering performance degradation | System automatically reduces visual detail or suggests switching to simpler scale mode |
| User attempts to measure distance between objects in different coordinate frames | System transforms coordinates to common frame before calculation; displays CALCULATED label |
| User selects object outside current 3D viewport bounds | Camera automatically adjusts to bring object into view |
| VR controller loses tracking | System displays tracking lost warning; user can recalibrate or exit VR |
| Desktop and VR simulation clock desynchronization | System enforces single global clock state; any clock change propagates to both modes |
| Missing astronomical data in catalog | Display \"DATA UNAVAILABLE\" in Object Inspector; never invent values |

---

## 6. Acceptance Criteria

1. User opens ASTRO and sees Home Dashboard with APOD, navigation to all modules, and quick access to 3D Observatory.
2. User navigates to 3D Observatory, views Solar System in 3D with Sun, 8 planets, major moons, Saturn rings, and orbital paths rendered, switches camera mode to Follow and scale mode to Normalized.
3. User selects a planet in 3D viewport, Object Inspector panel displays authoritative astrophysical data with evidence labels and \"DATA UNAVAILABLE\" for missing data.
4. User clicks ENTER VR button, system detects VR hardware, starts real immersive-vr session through Three.js, enters stereo rendering mode, uses controller ray selection to select object, and exits VR successfully.
5. User opens AI Observatory, types \"focus on Mars and show its orbit\", AI responds with spatial action confirmation, 3D viewport focuses on Mars with orbital path rendered.
6. User opens Orbit Lab, inputs custom orbital parameters, starts Keplerian simulation, views live trajectory and vector telemetry in 3D with CALCULATED labels, adjusts simulation clock to future date, and verifies planetary positions update accordingly.
7. User opens Sky Explorer, switches coordinate frame to Galactic, grid and labels update accordingly, searches for a star, selects it, and verifies 3D Observatory focuses on selected star.
8. User uses Distance Measurement tool to measure distance between Earth and Jupiter, result displayed in AU and light-travel time with CALCULATED label.
9. User opens Scientific Calculator, selects Kepler's third law, inputs parameters, receives result with CALCULATED label and visible calculation steps.
10. User opens Research Lab, creates hypothesis entry with evidence items, saves to Saved Investigations, and verifies entry appears in timeline with persistence across sessions.
11. User opens Object Explorer, searches for an exoplanet, views detail page with real catalog data (host star, distance, period, radius, mass, discovery method) and evidence labels, clicks link to view exoplanet in 3D Observatory.
12. User verifies \"DISTANCES NOT TO SCALE\" warning displays when Physical scale mode compresses distances for visibility.

---

## 7. Out of Scope

- Real-time telescope control or live observatory feeds
- Community features: comments, sharing, forums
- Mobile native app (iOS/Android)
- Multi-language support
- Export or download of investigation data in file formats (PDF, CSV, etc.)
- Notifications or alerts for upcoming astronomical events
- Advanced XR hand tracking or eye tracking beyond basic WebXR controller input
- Multiplayer or collaborative VR sessions
- Custom shader programming interface for users
- Integration with external planetarium software or telescope control systems
- Offline mode or progressive web app (PWA) functionality
- Voice input for AI Observatory (text input only)
- Automated hypothesis generation or AI-driven research suggestions
- Rebuilding existing working features unnecessarily