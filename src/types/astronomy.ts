export type EvidenceStatus = 'OBSERVED' | 'CALCULATED' | 'SIMULATED' | 'HYPOTHETICAL' | 'UNCERTAIN';

export interface EvidenceSource {
  name: string;
  dataset?: string;
  sourceType: 'Observatory' | 'Catalog' | 'Peer-Reviewed Paper' | 'Simulation Model' | 'Theoretical Model' | 'Space Mission';
  url?: string;
  date?: string;
  doi?: string;
  dataUsed?: string;
  notes?: string;
}

export interface EvidenceItem {
  status: EvidenceStatus;
  claim: string;
  sources?: EvidenceSource[];
  equation?: string;
  parameters?: Record<string, string | number>;
  assumptions?: string[];
  uncertainty?: string;
  confidenceScore?: number; // 0 to 1
}

export type CelestialObjectType =
  | 'Star'
  | 'Planet'
  | 'Dwarf Planet'
  | 'Moon'
  | 'Asteroid'
  | 'Comet'
  | 'Exoplanet'
  | 'Nebula'
  | 'Galaxy'
  | 'Star Cluster'
  | 'Black Hole'
  | 'Supernova Remnant'
  | 'Quasar';

export type CoordinateFrame = 'ICRS' | 'BCRS' | 'HCRS' | 'GCRS' | 'AltAz' | 'Galactic';

export interface CelestialCoordinates {
  ra: number; // Right Ascension in decimal degrees [0, 360)
  dec: number; // Declination in decimal degrees [-90, +90]
  raHMS?: string; // e.g. "05h 35m 17.3s"
  decDMS?: string; // e.g. "-05° 23' 28\""
  frame: CoordinateFrame;
  epoch?: string; // e.g. "J2000.0"
  distanceLy?: number; // Light years
  distanceParsec?: number; // Parsecs
  distanceAU?: number; // Astronomical Units
  galacticL?: number; // Galactic Longitude degrees
  galacticB?: number; // Galactic Latitude degrees
  alt?: number; // Altitude degrees [-90, +90] for AltAz
  az?: number; // Azimuth degrees [0, 360) for AltAz
}

export interface CelestialObject {
  id: string;
  name: string;
  catalogDesignation?: string;
  alternativeNames?: string[];
  type: CelestialObjectType;
  subType?: string;
  constellation?: string;
  coordinates: CelestialCoordinates;
  apparentMagnitude?: number;
  absoluteMagnitude?: number;
  distanceLy: number;
  distanceParsec?: number;
  massSolar?: number;
  massKg?: string;
  radiusSolar?: number;
  radiusKm?: number;
  temperatureKelvin?: number;
  spectralClass?: string;
  ageGyr?: number;
  discoveryYear?: number;
  discoverer?: string;
  description: string;
  scientificNotes?: string;
  evidenceStatus: EvidenceStatus;
  sources: EvidenceSource[];
  imageUrl?: string;
  color?: string;
  featured?: boolean;
}

export interface SolarSystemBody {
  id: string;
  name: string;
  type: 'Sun' | 'Planet' | 'Dwarf Planet' | 'Moon';
  orderFromSun: number;
  color: string;
  radiusKm: number;
  massKg: string;
  massEarthRelative: number;
  radiusEarthRelative: number;
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationDeg: number;
  orbitalPeriodDays: number;
  orbitalVelocityKmS: number;
  rotationPeriodHours: number;
  axialTiltDeg: number;
  surfaceTempKelvinMean: number;
  surfaceTempKelvinMin?: number;
  surfaceTempKelvinMax?: number;
  atmosphericComposition?: string[];
  surfaceGravityMs2: number;
  knownMoonsCount: number;
  description: string;
  notableFeatures: string[];
  evidenceStatus: EvidenceStatus;
  sources: EvidenceSource[];
  textureColor: string;
}

export interface ExoplanetData {
  id: string;
  name: string;
  hostStar: string;
  hostStarSpectralType: string;
  distanceLy: number;
  orbitalPeriodDays: number;
  semiMajorAxisAU: number;
  eccentricity: number;
  radiusEarth: number;
  radiusJupiter?: number;
  massEarth?: number;
  massJupiter?: number;
  discoveryMethod: 'Transit' | 'Radial Velocity' | 'Direct Imaging' | 'Gravitational Microlensing' | 'Astrometry';
  discoveryYear: number;
  equilibriumTempKelvin?: number;
  insolationFluxEarthRelative?: number;
  isPotentiallyHabitableCandidate: boolean;
  habitabilityNotes?: string;
  surfaceGravityEarthRelative?: number;
  densityGcm3?: number;
  evidenceStatus: EvidenceStatus;
  sources: EvidenceSource[];
  atmosphereNotes?: string;
}

export interface OrbitParameters {
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationDeg: number;
  centralBodyMassSolar: number;
  orbitingBodyMassEarth?: number;
  argumentOfPeriapsisDeg?: number;
  longitudeOfAscendingNodeDeg?: number;
  trueAnomalyDeg?: number;
  simulationSpeedDaysPerSec?: number;
}

export interface CalculatedOrbitResult {
  orbitalPeriodYears: number;
  orbitalPeriodDays: number;
  perihelionAU: number;
  aphelionAU: number;
  meanOrbitalVelocityKmS: number;
  perihelionVelocityKmS: number;
  aphelionVelocityKmS: number;
  specificOrbitalEnergyMJkg: number;
  semiMinorAxisAU: number;
  equations: { name: string; formula: string; substituted: string; result: string }[];
  evidenceStatus: EvidenceStatus;
  points: { x: number; y: number; z: number; velocityKmS: number; trueAnomalyDeg: number }[];
}

export interface CoordinateTransformRequest {
  sourceFrame: CoordinateFrame;
  targetFrame: CoordinateFrame;
  raDeg?: number;
  decDeg?: number;
  galacticL?: number;
  galacticB?: number;
  alt?: number;
  az?: number;
  distanceLy?: number;
  observerLatitude?: number;
  observerLongitude?: number;
  observerElevationM?: number;
  timestamp?: string; // ISO string
}

export interface CoordinateTransformResult {
  source: { frame: CoordinateFrame; coords: Record<string, number | string> };
  target: { frame: CoordinateFrame; coords: Record<string, number | string> };
  transformSteps: string[];
  matrixUsed?: number[][];
  lstHours?: number; // Local Sidereal Time
  equationSummary: string;
  evidenceStatus: EvidenceStatus;
}

export interface CalculationResult {
  results: { label: string; symbol: string; value: number; formatted: string; unit: string; description?: string }[];
  steps: { step: number; description: string; formula: string; substituted: string; result: string }[];
  evidenceStatus: EvidenceStatus;
  assumptions: string[];
  sources: EvidenceSource[];
}

export interface CalculationModule {
  id: string;
  name: string;
  category: 'Orbital Mechanics' | 'Stellar Physics' | 'Relativity & Cosmology' | 'Optics & Observational' | 'Coordinate Geometry';
  description: string;
  formulaTex: string;
  variables: {
    id: string;
    name: string;
    symbol: string;
    unit: string;
    defaultValue: number;
    min?: number;
    max?: number;
    step?: number;
    description: string;
  }[];
  calculate: (inputs: Record<string, number>) => CalculationResult;
}

export interface ResearchHypothesis {
  id: string;
  investigationId?: string;
  title: string;
  question: string;
  status: 'Formulating' | 'Active Testing' | 'Supported by Evidence' | 'Refuted' | 'Inconclusive';
  establishedKnowledge: string[];
  competingHypotheses: string[];
  evidencePoints: {
    id: string;
    type: 'Supporting' | 'Counter' | 'Neutral';
    claim: string;
    evidenceStatus: EvidenceStatus;
    source: EvidenceSource;
    quantitativeValue?: string;
    notes?: string;
  }[];
  calculationsPerformed: {
    title: string;
    formula: string;
    result: string;
    evidenceStatus: EvidenceStatus;
  }[];
  simulationsRun?: string[];
  conclusionSummary: string;
  uncertainties: string[];
  sources: EvidenceSource[];
  createdAt: string;
  updatedAt: string;
}

export interface InvestigationRecord {
  id: string;
  title: string;
  researchQuestion: string;
  category: string;
  tags: string[];
  conversationLog: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    evidenceItems?: EvidenceItem[];
    toolCalls?: { name: string; args: Record<string, unknown>; result: unknown }[];
  }[];
  savedCalculations: {
    name: string;
    equation: string;
    inputs: Record<string, number>;
    outputs: Record<string, string>;
    date: string;
  }[];
  savedObjects: string[]; // Object IDs
  datasetsReferenced: string[];
  hypotheses: ResearchHypothesis[];
  notes: string;
  status: 'Draft' | 'Ongoing' | 'Concluded' | 'Archived';
  createdAt: string;
  updatedAt: string;
}

export interface APODRecord {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
  service_version?: string;
  evidenceStatus: EvidenceStatus;
}

export interface DataConnectorState {
  id: string;
  name: string;
  provider: 'NASA' | 'CDS / SIMBAD' | 'NASA Exoplanet Archive' | 'JPL Horizons' | 'ESA Gaia' | 'ESO';
  description: string;
  endpoint: string;
  status: 'Online' | 'Synchronized' | 'Cached' | 'Degraded' | 'Offline';
  recordsCount: string;
  lastUpdated: string;
  supportedQueries: string[];
  authType: 'Open Access API' | 'API Key' | 'Standard TAP / VO';
  latencyMs: number;
}
