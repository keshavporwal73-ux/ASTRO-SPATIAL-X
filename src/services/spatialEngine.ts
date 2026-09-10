import { CoordinateFrame, ScaleMode, SpatialMeasurement, SpatialObject3D, Vector3D } from '@/types/spatial';
import { EvidenceStatus } from '@/types/astronomy';
import { CELESTIAL_OBJECTS, EXOPLANET_CATALOG, SOLAR_SYSTEM_BODIES } from './astronomyData';

export const ASTRONOMICAL_UNIT_KM = 149597870.7; // 1 AU in km
export const SPEED_OF_LIGHT_KMS = 299792.458; // c in km/s
export const LIGHT_YEAR_KM = 9.460730472e12; // 1 Ly in km
export const G_GRAV_KM = 6.67430e-20; // km^3 / (kg * s^2)
export const SUN_MASS_KG = 1.98847e30;

export class SpatialEngine {
  /**
   * Converts real-world AU coordinates into 3D viewport coordinates based on ScaleMode
   */
  static transformPositionByScale(posAU: Vector3D, mode: ScaleMode): Vector3D {
    const dist = Math.sqrt(posAU.x * posAU.x + posAU.y * posAU.y + posAU.z * posAU.z);
    if (dist === 0) return { x: 0, y: 0, z: 0 };

    const dir = { x: posAU.x / dist, y: posAU.y / dist, z: posAU.z / dist };

    switch (mode) {
      case 'Physical': {
        // True linear physical scale: 1 AU = 35 viewport units
        const factor = 35;
        return {
          x: posAU.x * factor,
          y: posAU.z * factor, // astronomical Z -> 3D Y or keep standard Y-up
          z: posAU.y * factor,
        };
      }
      case 'Normalized': {
        // Non-linear compressed scale for optimal visualization of both inner and outer planets
        // Inner planets (0.3 - 2 AU) spread out; Outer planets (5 - 30 AU) scaled proportionally
        const scaledDist = 12 + Math.pow(dist, 0.62) * 22;
        return {
          x: dir.x * scaledDist,
          y: (posAU.z / Math.max(0.1, dist)) * scaledDist * 0.3,
          z: dir.y * scaledDist,
        };
      }
      case 'Logarithmic': {
        // Logarithmic scale: suitable for solar system up to Oort cloud and stellar neighbors
        const scaledDist = Math.log10(dist + 1) * 38;
        return {
          x: dir.x * scaledDist,
          y: (posAU.z / Math.max(0.1, dist)) * scaledDist * 0.25,
          z: dir.y * scaledDist,
        };
      }
      case 'System Overview': {
        // Compact overview fitting all 8 planets within ~70 radius
        const scaledDist = Math.min(80, 8 + Math.sqrt(dist) * 12.5);
        return {
          x: dir.x * scaledDist,
          y: (posAU.z / Math.max(0.1, dist)) * scaledDist * 0.2,
          z: dir.y * scaledDist,
        };
      }
      default:
        return { x: posAU.x * 20, y: posAU.z * 20, z: posAU.y * 20 };
    }
  }

  /**
   * Calculates planet display radius based on ScaleMode
   */
  static getDisplayRadius(radiusKm: number, isSun: boolean, mode: ScaleMode): number {
    if (isSun) {
      if (mode === 'Physical') return 3.2;
      return 4.2;
    }

    const rEarth = 6371;
    const earthRelative = radiusKm / rEarth;

    switch (mode) {
      case 'Physical':
        // Physical scale: Earth = 0.2 units, Jupiter = 2.2 units
        return Math.max(0.12, earthRelative * 0.08);
      case 'Normalized':
        // Normalized: planets are clearly visible and sized relatively
        return Math.max(0.6, 0.5 + Math.pow(earthRelative, 0.5) * 0.45);
      case 'Logarithmic':
        return Math.max(0.45, 0.4 + Math.log10(earthRelative + 1) * 0.7);
      case 'System Overview':
        return Math.max(0.5, 0.4 + Math.pow(earthRelative, 0.4) * 0.5);
    }
  }

  /**
   * Solves Kepler's Equation for true position at a given time
   */
  static calculateKeplerianOrbitPosition(
    semiMajorAxisAU: number,
    eccentricity: number,
    inclinationDeg: number,
    orbitalPeriodDays: number,
    timeDays: number,
    longitudeOfAscendingNodeDeg = 0,
    argumentOfPeriapsisDeg = 0
  ): { positionAU: Vector3D; velocityKmS: Vector3D; trueAnomalyDeg: number } {
    // Mean motion (radians per day)
    const n = (2 * Math.PI) / Math.max(0.001, orbitalPeriodDays);
    const M = (n * timeDays) % (2 * Math.PI); // Mean anomaly

    // Solve Kepler's Equation for Eccentric Anomaly E: M = E - e*sin(E)
    let E = M;
    for (let i = 0; i < 15; i++) {
      const dE = (E - eccentricity * Math.sin(E) - M) / (1 - eccentricity * Math.cos(E));
      E -= dE;
      if (Math.abs(dE) < 1e-7) break;
    }

    // True anomaly nu
    const sinNu = (Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(E)) / (1 - eccentricity * Math.cos(E));
    const cosNu = (Math.cos(E) - eccentricity) / (1 - eccentricity * Math.cos(E));
    const nu = Math.atan2(sinNu, cosNu);

    // Distance r in AU
    const rAU = semiMajorAxisAU * (1 - eccentricity * Math.cos(E));

    // Position in orbital plane
    const xOrb = rAU * Math.cos(nu);
    const yOrb = rAU * Math.sin(nu);

    // Convert angles to radians
    const inc = (inclinationDeg * Math.PI) / 180;
    const node = (longitudeOfAscendingNodeDeg * Math.PI) / 180;
    const peri = (argumentOfPeriapsisDeg * Math.PI) / 180;

    // 3D Rotation matrices from orbital plane to reference plane
    const Px = Math.cos(node) * Math.cos(peri) - Math.sin(node) * Math.sin(peri) * Math.cos(inc);
    const Py = -Math.cos(node) * Math.sin(peri) - Math.sin(node) * Math.cos(peri) * Math.cos(inc);
    const Qx = Math.sin(node) * Math.cos(peri) + Math.cos(node) * Math.sin(peri) * Math.cos(inc);
    const Qy = -Math.sin(node) * Math.sin(peri) + Math.cos(node) * Math.cos(peri) * Math.cos(inc);
    const Rz = Math.sin(peri) * Math.sin(inc);
    const Sz = Math.cos(peri) * Math.sin(inc);

    const x = xOrb * Px + yOrb * Py;
    const y = xOrb * Qx + yOrb * Qy;
    const z = xOrb * Rz + yOrb * Sz;

    // Vis-Viva velocity in km/s: v = sqrt(GM * (2/r - 1/a))
    const mu = G_GRAV_KM * SUN_MASS_KG; // km^3/s^2
    const rKm = rAU * ASTRONOMICAL_UNIT_KM;
    const aKm = semiMajorAxisAU * ASTRONOMICAL_UNIT_KM;
    const vMag = Math.sqrt(Math.max(0, mu * (2 / rKm - 1 / aKm)));

    // Tangential direction
    const vx = -Math.sin(nu) * vMag;
    const vy = (eccentricity + Math.cos(nu)) * vMag;

    return {
      positionAU: { x, y, z },
      velocityKmS: { x: vx, y: vy, z: 0 },
      trueAnomalyDeg: (nu * 180) / Math.PI,
    };
  }

  /**
   * Generates discrete 3D orbit curve points in AU
   */
  static generateOrbitPath(
    semiMajorAxisAU: number,
    eccentricity: number,
    inclinationDeg: number,
    segments = 120,
    nodeDeg = 0,
    periDeg = 0
  ): Vector3D[] {
    const points: Vector3D[] = [];
    const inc = (inclinationDeg * Math.PI) / 180;
    const node = (nodeDeg * Math.PI) / 180;
    const peri = (periDeg * Math.PI) / 180;

    for (let i = 0; i <= segments; i++) {
      const nu = (i / segments) * 2 * Math.PI;
      const rAU = (semiMajorAxisAU * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(nu));
      const xOrb = rAU * Math.cos(nu);
      const yOrb = rAU * Math.sin(nu);

      const Px = Math.cos(node) * Math.cos(peri) - Math.sin(node) * Math.sin(peri) * Math.cos(inc);
      const Py = -Math.cos(node) * Math.sin(peri) - Math.sin(node) * Math.cos(peri) * Math.cos(inc);
      const Qx = Math.sin(node) * Math.cos(peri) + Math.cos(node) * Math.sin(peri) * Math.cos(inc);
      const Qy = -Math.sin(node) * Math.sin(peri) + Math.cos(node) * Math.cos(peri) * Math.cos(inc);
      const Rz = Math.sin(peri) * Math.sin(inc);
      const Sz = Math.cos(peri) * Math.sin(inc);

      points.push({
        x: xOrb * Px + yOrb * Py,
        y: xOrb * Qx + yOrb * Qy,
        z: xOrb * Rz + yOrb * Sz,
      });
    }
    return points;
  }

  /**
   * Multi-Frame Coordinate Transformation Matrix calculations
   */
  static transformCoordinates(
    raDeg: number,
    decDeg: number,
    sourceFrame: CoordinateFrame,
    targetFrame: CoordinateFrame,
    observerLat = 0,
    observerLon = 0,
    lstHours = 0
  ): { x: number; y: number; z: number; coords: Record<string, number | string>; evidence: EvidenceStatus } {
    if (sourceFrame === targetFrame) {
      const raRad = (raDeg * Math.PI) / 180;
      const decRad = (decDeg * Math.PI) / 180;
      return {
        x: Math.cos(decRad) * Math.cos(raRad),
        y: Math.cos(decRad) * Math.sin(raRad),
        z: Math.sin(decRad),
        coords: { ra: raDeg, dec: decDeg },
        evidence: 'CALCULATED',
      };
    }

    // Convert equatorial (ICRS) to Cartesian vector
    const raRad = (raDeg * Math.PI) / 180;
    const decRad = (decDeg * Math.PI) / 180;
    let cx = Math.cos(decRad) * Math.cos(raRad);
    let cy = Math.cos(decRad) * Math.sin(raRad);
    let cz = Math.sin(decRad);

    if (targetFrame === 'Galactic') {
      // IAU 1958 standard transformation to Galactic (l, b)
      // North Galactic Pole: RA = 192.85948°, Dec = 27.12825°
      const raG = (192.85948 * Math.PI) / 180;
      const decG = (27.12825 * Math.PI) / 180;
      const l0 = (32.93192 * Math.PI) / 180;

      const sinB = Math.sin(decRad) * Math.sin(decG) + Math.cos(decRad) * Math.cos(decG) * Math.cos(raRad - raG);
      const b = Math.asin(Math.max(-1, Math.min(1, sinB)));
      const cosB = Math.cos(b);

      const sinLminusL0 = (Math.cos(decRad) * Math.sin(raRad - raG)) / (cosB || 1);
      const cosLminusL0 = (Math.sin(decRad) * Math.cos(decG) - Math.cos(decRad) * Math.sin(decG) * Math.cos(raRad - raG)) / (cosB || 1);
      const l = (Math.atan2(sinLminusL0, cosLminusL0) + l0 + 2 * Math.PI) % (2 * Math.PI);

      cx = Math.cos(b) * Math.cos(l);
      cy = Math.cos(b) * Math.sin(l);
      cz = Math.sin(b);

      return {
        x: cx,
        y: cy,
        z: cz,
        coords: {
          galacticL: (l * 180) / Math.PI,
          galacticB: (b * 180) / Math.PI,
        },
        evidence: 'CALCULATED',
      };
    }

    if (targetFrame === 'Ecliptic') {
      // Obliquity of ecliptic eps = 23.4392911°
      const eps = (23.4392911 * Math.PI) / 180;
      const sinLambda = Math.sin(raRad) * Math.cos(eps) + Math.tan(decRad) * Math.sin(eps);
      const cosLambda = Math.cos(raRad);
      const lambda = (Math.atan2(sinLambda, cosLambda) + 2 * Math.PI) % (2 * Math.PI);
      const sinBeta = Math.sin(decRad) * Math.cos(eps) - Math.cos(decRad) * Math.sin(eps) * Math.sin(raRad);
      const beta = Math.asin(Math.max(-1, Math.min(1, sinBeta)));

      return {
        x: Math.cos(beta) * Math.cos(lambda),
        y: Math.cos(beta) * Math.sin(lambda),
        z: Math.sin(beta),
        coords: {
          eclipticLon: (lambda * 180) / Math.PI,
          eclipticLat: (beta * 180) / Math.PI,
        },
        evidence: 'CALCULATED',
      };
    }

    if (targetFrame === 'AltAz') {
      // Topocentric Alt-Az calculation
      const haHours = (lstHours - raDeg / 15 + 24) % 24;
      const haRad = (haHours * 15 * Math.PI) / 180;
      const latRad = (observerLat * Math.PI) / 180;

      const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
      const altRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

      const cosAz = (Math.sin(decRad) - Math.sin(altRad) * Math.sin(latRad)) / (Math.cos(altRad) * Math.cos(latRad) || 1);
      let azRad = Math.acos(Math.max(-1, Math.min(1, cosAz)));
      if (Math.sin(haRad) > 0) azRad = 2 * Math.PI - azRad;

      return {
        x: Math.cos(altRad) * Math.sin(azRad),
        y: Math.cos(altRad) * Math.cos(azRad),
        z: Math.sin(altRad),
        coords: {
          altitude: (altRad * 180) / Math.PI,
          azimuth: (azRad * 180) / Math.PI,
          hourAngle: haHours,
        },
        evidence: 'CALCULATED',
      };
    }

    return {
      x: cx,
      y: cy,
      z: cz,
      coords: { ra: raDeg, dec: decDeg },
      evidence: 'CALCULATED',
    };
  }

  /**
   * Spatial Distance and Light-Travel Time computation between two 3D positions in AU
   */
  static measureDistance(
    objA: { id: string; name: string; positionAU: Vector3D },
    objB: { id: string; name: string; positionAU: Vector3D }
  ): SpatialMeasurement {
    const dx = objA.positionAU.x - objB.positionAU.x;
    const dy = objA.positionAU.y - objB.positionAU.y;
    const dz = objA.positionAU.z - objB.positionAU.z;

    const distAU = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const distKm = distAU * ASTRONOMICAL_UNIT_KM;
    const distLy = distKm / LIGHT_YEAR_KM;
    const lightTravelSeconds = distKm / SPEED_OF_LIGHT_KMS;

    let lightFormatted = '';
    if (lightTravelSeconds < 60) {
      lightFormatted = `${lightTravelSeconds.toFixed(2)} seconds`;
    } else if (lightTravelSeconds < 3600) {
      lightFormatted = `${(lightTravelSeconds / 60).toFixed(2)} minutes`;
    } else if (lightTravelSeconds < 86400) {
      lightFormatted = `${(lightTravelSeconds / 3600).toFixed(2)} hours`;
    } else {
      lightFormatted = `${(lightTravelSeconds / 86400).toFixed(2)} days (${distLy.toFixed(4)} light-years)`;
    }

    // Angular separation from Sun/origin viewpoint
    const dot =
      objA.positionAU.x * objB.positionAU.x +
      objA.positionAU.y * objB.positionAU.y +
      objA.positionAU.z * objB.positionAU.z;
    const magA = Math.sqrt(
      objA.positionAU.x ** 2 + objA.positionAU.y ** 2 + objA.positionAU.z ** 2
    );
    const magB = Math.sqrt(
      objB.positionAU.x ** 2 + objB.positionAU.y ** 2 + objB.positionAU.z ** 2
    );

    let angDeg = 0;
    if (magA > 0 && magB > 0) {
      const cosTheta = Math.max(-1, Math.min(1, dot / (magA * magB)));
      angDeg = (Math.acos(cosTheta) * 180) / Math.PI;
    }

    const d = Math.floor(angDeg);
    const m = Math.floor((angDeg - d) * 60);
    const s = ((angDeg - d - m / 60) * 3600).toFixed(1);

    return {
      id: `meas-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'distance',
      sourceObjectId: objA.id,
      sourceObjectName: objA.name,
      targetObjectId: objB.id,
      targetObjectName: objB.name,
      distanceAU: distAU,
      distanceKm: distKm,
      distanceLy: distLy,
      lightTravelTimeSeconds: lightTravelSeconds,
      lightTravelTimeFormatted: lightFormatted,
      angularSeparationDeg: angDeg,
      angularSeparationDMS: `${d}° ${m}' ${s}"`,
      evidenceStatus: 'CALCULATED',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Runge-Kutta 4th Order (RK4) N-Body Integrator for 3D Orbit Lab
   */
  static rk4OrbitStep(
    pos: Vector3D,
    vel: Vector3D,
    centralMassKg: number,
    dtSeconds: number
  ): { pos: Vector3D; vel: Vector3D; acc: Vector3D } {
    const calcAcc = (p: Vector3D): Vector3D => {
      const rKm = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
      if (rKm === 0) return { x: 0, y: 0, z: 0 };
      const factor = (-G_GRAV_KM * centralMassKg) / (rKm * rKm * rKm);
      return { x: p.x * factor, y: p.y * factor, z: p.z * factor };
    };

    // k1
    const a1 = calcAcc(pos);
    const v1 = vel;

    // k2
    const p2 = {
      x: pos.x + 0.5 * dtSeconds * v1.x,
      y: pos.y + 0.5 * dtSeconds * v1.y,
      z: pos.z + 0.5 * dtSeconds * v1.z,
    };
    const vel2 = {
      x: vel.x + 0.5 * dtSeconds * a1.x,
      y: vel.y + 0.5 * dtSeconds * a1.y,
      z: vel.z + 0.5 * dtSeconds * a1.z,
    };
    const a2 = calcAcc(p2);

    // k3
    const p3 = {
      x: pos.x + 0.5 * dtSeconds * vel2.x,
      y: pos.y + 0.5 * dtSeconds * vel2.y,
      z: pos.z + 0.5 * dtSeconds * vel2.z,
    };
    const vel3 = {
      x: vel.x + 0.5 * dtSeconds * a2.x,
      y: vel.y + 0.5 * dtSeconds * a2.y,
      z: vel.z + 0.5 * dtSeconds * a2.z,
    };
    const a3 = calcAcc(p3);

    // k4
    const p4 = {
      x: pos.x + dtSeconds * vel3.x,
      y: pos.y + dtSeconds * vel3.y,
      z: pos.z + dtSeconds * vel3.z,
    };
    const vel4 = {
      x: vel.x + dtSeconds * a3.x,
      y: vel.y + dtSeconds * a3.y,
      z: vel.z + dtSeconds * a3.z,
    };
    const a4 = calcAcc(p4);

    const newPos = {
      x: pos.x + (dtSeconds / 6) * (v1.x + 2 * vel2.x + 2 * vel3.x + vel4.x),
      y: pos.y + (dtSeconds / 6) * (v1.y + 2 * vel2.y + 2 * vel3.y + vel4.y),
      z: pos.z + (dtSeconds / 6) * (v1.z + 2 * vel2.z + 2 * vel3.z + vel4.z),
    };

    const newVel = {
      x: vel.x + (dtSeconds / 6) * (a1.x + 2 * a2.x + 2 * a3.x + a4.x),
      y: vel.y + (dtSeconds / 6) * (a1.y + 2 * a2.y + 2 * a3.y + a4.y),
      z: vel.z + (dtSeconds / 6) * (a1.z + 2 * a2.z + 2 * a3.z + a4.z),
    };

    return { pos: newPos, vel: newVel, acc: a1 };
  }

  /**
   * Builds the comprehensive 3D Solar System object registry
   */
  static getSolarSystemObjects(simDays = 0, scaleMode: ScaleMode = 'Normalized'): SpatialObject3D[] {
    return SOLAR_SYSTEM_BODIES.map((body) => {
      let posAU: Vector3D = { x: 0, y: 0, z: 0 };
      let velKmS: Vector3D = { x: 0, y: 0, z: 0 };
      let orbitPoints: Vector3D[] = [];

      if (body.type !== 'Sun') {
        const kepler = this.calculateKeplerianOrbitPosition(
          body.semiMajorAxisAU,
          body.eccentricity,
          body.inclinationDeg,
          body.orbitalPeriodDays,
          simDays
        );
        posAU = kepler.positionAU;
        velKmS = kepler.velocityKmS;
        orbitPoints = this.generateOrbitPath(body.semiMajorAxisAU, body.eccentricity, body.inclinationDeg);
      }

      const displayRadius = this.getDisplayRadius(body.radiusKm, body.type === 'Sun', scaleMode);

      return {
        id: body.id,
        name: body.name,
        type: body.type as any,
        position: posAU,
        velocity: velKmS,
        radiusKm: body.radiusKm,
        displayRadius,
        color: body.color,
        hasRings: body.id === 'saturn',
        ringInnerRadius: body.id === 'saturn' ? displayRadius * 1.3 : undefined,
        ringOuterRadius: body.id === 'saturn' ? displayRadius * 2.3 : undefined,
        ringColor: '#D97706',
        orbitPath: orbitPoints,
        semiMajorAxisAU: body.semiMajorAxisAU,
        eccentricity: body.eccentricity,
        inclinationDeg: body.inclinationDeg,
        orbitalPeriodDays: body.orbitalPeriodDays,
        rotationPeriodHours: body.rotationPeriodHours,
        axialTiltDeg: body.axialTiltDeg,
        massKg: body.massKg,
        surfaceTempK: body.surfaceTempKelvinMean,
        evidenceStatus: body.evidenceStatus,
        sources: body.sources,
        description: body.description,
      };
    });
  }

  /**
   * Builds the comprehensive 3D Deep Space catalog objects
   */
  static getDeepSpaceObjects(): SpatialObject3D[] {
    return CELESTIAL_OBJECTS.map((obj) => {
      // Map RA and Dec and distance into 3D Cartesian coordinates (in light-years or scaled AU)
      const raRad = (obj.coordinates.ra * Math.PI) / 180;
      const decRad = (obj.coordinates.dec * Math.PI) / 180;
      const distLy = obj.distanceLy || 100;
      // Logarithmic placement in 3D scene
      const rScene = Math.log10(distLy + 1) * 35;

      const x = rScene * Math.cos(decRad) * Math.cos(raRad);
      const y = rScene * Math.sin(decRad);
      const z = rScene * Math.cos(decRad) * Math.sin(raRad);

      return {
        id: obj.id,
        name: obj.name,
        type: obj.type as any,
        subType: obj.subType,
        position: { x, y, z },
        radiusKm: obj.radiusKm || (obj.radiusSolar ? obj.radiusSolar * 696340 : 100000),
        displayRadius: Math.max(0.8, Math.min(3.5, 1.2 + (obj.apparentMagnitude ? (10 - obj.apparentMagnitude) * 0.15 : 0))),
        color: obj.color || '#38BDF8',
        spectralType: obj.spectralClass,
        distanceLy: obj.distanceLy,
        apparentMagnitude: obj.apparentMagnitude,
        surfaceTempK: obj.temperatureKelvin,
        evidenceStatus: obj.evidenceStatus,
        sources: obj.sources,
        description: obj.description,
      };
    });
  }

  /**
   * Builds the 3D Exoplanet Systems catalog
   */
  static getExoplanetSystems(simDays = 0): { hostStar: SpatialObject3D; planets: SpatialObject3D[] }[] {
    // Group by host star
    const map = new Map<string, typeof EXOPLANET_CATALOG>();
    EXOPLANET_CATALOG.forEach((exo) => {
      if (!map.has(exo.hostStar)) {
        map.set(exo.hostStar, []);
      }
      map.get(exo.hostStar)!.push(exo);
    });

    const systems: { hostStar: SpatialObject3D; planets: SpatialObject3D[] }[] = [];

    map.forEach((planets, starName) => {
      const first = planets[0];
      const hostStar: SpatialObject3D = {
        id: `star-${first.hostStar.toLowerCase().replace(/\s+/g, '-')}`,
        name: first.hostStar,
        type: 'Star',
        subType: `Host Star (${first.hostStarSpectralType})`,
        position: { x: 0, y: 0, z: 0 },
        radiusKm: 696340 * 0.8,
        displayRadius: 2.5,
        color: first.hostStarSpectralType.startsWith('M') ? '#EF4444' : '#F59E0B',
        spectralType: first.hostStarSpectralType,
        distanceLy: first.distanceLy,
        evidenceStatus: first.evidenceStatus,
        sources: first.sources,
        description: `Host star for ${planets.length} cataloged exoplanet(s). Distance: ${first.distanceLy} ly.`,
      };

      const planetObjects: SpatialObject3D[] = planets.map((exo) => {
        const kepler = this.calculateKeplerianOrbitPosition(
          exo.semiMajorAxisAU,
          exo.eccentricity,
          0,
          exo.orbitalPeriodDays,
          simDays
        );
        const orbitPath = this.generateOrbitPath(exo.semiMajorAxisAU, exo.eccentricity, 0);

        return {
          id: exo.id,
          name: exo.name,
          type: 'Exoplanet',
          subType: `${exo.discoveryMethod} Discovery (${exo.discoveryYear})`,
          position: kepler.positionAU,
          radiusKm: exo.radiusEarth * 6371,
          displayRadius: Math.max(0.4, exo.radiusEarth * 0.25),
          color: exo.isPotentiallyHabitableCandidate ? '#10B981' : '#60A5FA',
          orbitPath,
          semiMajorAxisAU: exo.semiMajorAxisAU,
          eccentricity: exo.eccentricity,
          orbitalPeriodDays: exo.orbitalPeriodDays,
          surfaceTempK: exo.equilibriumTempKelvin,
          evidenceStatus: exo.evidenceStatus,
          sources: exo.sources,
          description: exo.habitabilityNotes || `Discovered via ${exo.discoveryMethod} in ${exo.discoveryYear}.`,
          habitabilityNotes: exo.habitabilityNotes,
          isPotentiallyHabitableCandidate: exo.isPotentiallyHabitableCandidate,
        };
      });

      systems.push({ hostStar, planets: planetObjects });
    });

    return systems;
  }
}
