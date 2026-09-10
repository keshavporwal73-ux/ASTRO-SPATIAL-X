import { EvidenceSource, EvidenceStatus } from './astronomy';

export type CameraMode = 'Orbit' | 'Fly' | 'Follow' | 'Focus' | 'Observer' | 'System Overview';

export type ScaleMode = 'Physical' | 'Normalized' | 'Logarithmic' | 'System Overview';

export type ViewportSubMode = 'solar-system' | 'deep-space' | 'exoplanets' | 'celestial-sphere' | 'orbit-lab';

export type CoordinateFrame = 'ICRS' | 'BCRS' | 'HCRS' | 'GCRS' | 'Galactic' | 'AltAz' | 'Ecliptic';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface SpatialObject3D {
  id: string;
  name: string;
  type: 'Sun' | 'Planet' | 'Dwarf Planet' | 'Moon' | 'Asteroid' | 'Comet' | 'Star' | 'Exoplanet' | 'Nebula' | 'Galaxy' | 'Black Hole' | 'Supernova Remnant';
  subType?: string;
  position: Vector3D; // In AU or Simulation Units
  velocity?: Vector3D; // In km/s
  radiusKm: number;
  displayRadius: number; // Viewport-scaled radius
  color: string;
  textureType?: 'sun' | 'rocky' | 'gas_giant' | 'ice_giant' | 'terrestrial' | 'star_spectral' | 'nebula' | 'galaxy' | 'ringed';
  hasRings?: boolean;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  ringColor?: string;
  orbitPath?: Vector3D[];
  parentBodyId?: string;
  semiMajorAxisAU?: number;
  eccentricity?: number;
  inclinationDeg?: number;
  orbitalPeriodDays?: number;
  rotationPeriodHours?: number;
  axialTiltDeg?: number;
  massKg?: string | number;
  surfaceTempK?: number;
  spectralType?: string;
  distanceLy?: number;
  apparentMagnitude?: number;
  evidenceStatus: EvidenceStatus;
  sources: EvidenceSource[];
  description: string;
  habitabilityNotes?: string;
  isPotentiallyHabitableCandidate?: boolean;
}

export interface SpatialMeasurement {
  id: string;
  type: 'distance' | 'angular_separation' | 'light_travel_time';
  sourceObjectId: string;
  sourceObjectName: string;
  targetObjectId: string;
  targetObjectName: string;
  distanceAU: number;
  distanceKm: number;
  distanceLy: number;
  lightTravelTimeSeconds: number;
  lightTravelTimeFormatted: string;
  angularSeparationDeg?: number;
  angularSeparationDMS?: string;
  evidenceStatus: EvidenceStatus;
  timestamp: string;
}

export interface SpatialCommand {
  action: 'focus_object' | 'show_object' | 'compare_objects' | 'show_orbit' | 'set_coordinate_frame' | 'measure_distance' | 'measure_angular_separation' | 'start_simulation' | 'pause_simulation' | 'set_simulation_time' | 'change_visualization_scale' | 'switch_view_mode';
  targetId?: string;
  targetName?: string;
  secondaryTargetId?: string;
  secondaryTargetName?: string;
  scaleMode?: ScaleMode;
  coordinateFrame?: CoordinateFrame;
  simulationTimeISO?: string;
  timeSpeed?: number;
  viewMode?: ViewportSubMode;
  description: string;
  rawQuery?: string;
}

export interface WebXRStatus {
  supported: boolean;
  vrSupported: boolean;
  arSupported: boolean;
  activeSession: boolean;
  sessionType: 'immersive-vr' | 'immersive-ar' | 'inline' | null;
  errorMessage?: string;
}

export interface SpatialSceneSnapshot {
  id: string;
  title: string;
  timestamp: string;
  cameraMode: CameraMode;
  cameraPosition: Vector3D;
  cameraTarget: Vector3D;
  selectedObjectId?: string;
  scaleMode: ScaleMode;
  coordinateFrame: CoordinateFrame;
  simulationTime: string;
  subMode: ViewportSubMode;
  measurements: SpatialMeasurement[];
  evidenceStatus: EvidenceStatus;
}
