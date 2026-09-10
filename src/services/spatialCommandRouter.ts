import { CoordinateFrame, ScaleMode, SpatialCommand, ViewportSubMode } from '@/types/spatial';
import { SOLAR_SYSTEM_BODIES, CELESTIAL_OBJECTS, EXOPLANET_CATALOG } from './astronomyData';

export class SpatialCommandRouter {
  /**
   * Parse natural language command into structured SpatialCommand
   */
  static parseCommand(text: string): SpatialCommand | null {
    const raw = text.toLowerCase().trim();

    // 1. Switch View Mode
    if (raw.includes('orbit lab') || raw.includes('orbital lab') || raw.includes('simulate orbit')) {
      return {
        action: 'switch_view_mode',
        viewMode: 'orbit-lab',
        description: 'Switched 3D Viewport to 3D Orbit Lab',
        rawQuery: text,
      };
    }
    if (raw.includes('deep space') || raw.includes('deep-space') || raw.includes('galaxies') || raw.includes('stars catalog')) {
      return {
        action: 'switch_view_mode',
        viewMode: 'deep-space',
        description: 'Switched 3D Viewport to Deep Space Catalog View',
        rawQuery: text,
      };
    }
    if (raw.includes('exoplanet') || raw.includes('habitable zone') || raw.includes('trappist')) {
      return {
        action: 'switch_view_mode',
        viewMode: 'exoplanets',
        description: 'Switched 3D Viewport to Exoplanetary Systems View',
        rawQuery: text,
      };
    }
    if (raw.includes('celestial sphere') || raw.includes('sky map') || raw.includes('sky coordinates')) {
      return {
        action: 'switch_view_mode',
        viewMode: 'celestial-sphere',
        description: 'Switched 3D Viewport to Celestial Sphere Multi-Frame View',
        rawQuery: text,
      };
    }
    if (raw.includes('solar system') || raw.includes('planets view')) {
      return {
        action: 'switch_view_mode',
        viewMode: 'solar-system',
        description: 'Switched 3D Viewport to Solar System 3D View',
        rawQuery: text,
      };
    }

    // 2. Scale Mode switching
    if (raw.includes('physical scale') || raw.includes('true scale') || raw.includes('1:1 scale')) {
      return {
        action: 'change_visualization_scale',
        scaleMode: 'Physical',
        description: 'Switched visualization scale to Physical (1:1 true astronomical ratios)',
        rawQuery: text,
      };
    }
    if (raw.includes('normalized scale') || raw.includes('normalized')) {
      return {
        action: 'change_visualization_scale',
        scaleMode: 'Normalized',
        description: 'Switched visualization scale to Normalized (optimized visual ratios)',
        rawQuery: text,
      };
    }
    if (raw.includes('logarithmic scale') || raw.includes('log scale')) {
      return {
        action: 'change_visualization_scale',
        scaleMode: 'Logarithmic',
        description: 'Switched visualization scale to Logarithmic (extreme distance mapping)',
        rawQuery: text,
      };
    }
    if (raw.includes('system overview') || raw.includes('overview scale')) {
      return {
        action: 'change_visualization_scale',
        scaleMode: 'System Overview',
        description: 'Switched visualization scale to System Overview (compact full-system bounds)',
        rawQuery: text,
      };
    }

    // 3. Coordinate Frame switching
    if (raw.includes('galactic coordinate') || raw.includes('galactic frame') || raw.includes('switch to galactic')) {
      return {
        action: 'set_coordinate_frame',
        coordinateFrame: 'Galactic',
        description: 'Switched reference coordinate frame to Galactic (IAU 1958 l, b)',
        rawQuery: text,
      };
    }
    if (raw.includes('altaz') || raw.includes('horizontal frame') || raw.includes('altitude azimuth')) {
      return {
        action: 'set_coordinate_frame',
        coordinateFrame: 'AltAz',
        description: 'Switched reference coordinate frame to Topocentric AltAz (Observer local horizon)',
        rawQuery: text,
      };
    }
    if (raw.includes('ecliptic coordinate') || raw.includes('ecliptic frame')) {
      return {
        action: 'set_coordinate_frame',
        coordinateFrame: 'Ecliptic',
        description: 'Switched reference coordinate frame to Ecliptic (λ, β)',
        rawQuery: text,
      };
    }
    if (raw.includes('icrs') || raw.includes('equatorial') || raw.includes('j2000')) {
      return {
        action: 'set_coordinate_frame',
        coordinateFrame: 'ICRS',
        description: 'Switched reference coordinate frame to ICRS (International Celestial Reference System)',
        rawQuery: text,
      };
    }

    // 4. Simulation Play/Pause
    if (raw.includes('start simulation') || raw.includes('play simulation') || raw.includes('resume simulation')) {
      return {
        action: 'start_simulation',
        description: 'Started live 3D orbital dynamics simulation',
        rawQuery: text,
      };
    }
    if (raw.includes('pause simulation') || raw.includes('freeze time') || raw.includes('stop simulation')) {
      return {
        action: 'pause_simulation',
        description: 'Paused 3D orbital dynamics simulation',
        rawQuery: text,
      };
    }

    // 5. Measure distance / Compare
    const allObjects = [
      ...SOLAR_SYSTEM_BODIES.map(b => ({ id: b.id, name: b.name })),
      ...CELESTIAL_OBJECTS.map(c => ({ id: c.id, name: c.name })),
      ...EXOPLANET_CATALOG.map(e => ({ id: e.id, name: e.name })),
    ];

    if (raw.includes('measure') || raw.includes('distance between') || raw.includes('how far')) {
      const found: { id: string; name: string }[] = [];
      for (const obj of allObjects) {
        if (raw.includes(obj.name.toLowerCase()) || raw.includes(obj.id.toLowerCase())) {
          found.push(obj);
          if (found.length >= 2) break;
        }
      }
      if (found.length >= 2) {
        return {
          action: 'measure_distance',
          targetId: found[0].id,
          targetName: found[0].name,
          secondaryTargetId: found[1].id,
          secondaryTargetName: found[1].name,
          description: `Measuring 3D spatial distance and light-travel time between ${found[0].name} and ${found[1].name}`,
          rawQuery: text,
        };
      }
    }

    if (raw.includes('compare')) {
      const found: { id: string; name: string }[] = [];
      for (const obj of allObjects) {
        if (raw.includes(obj.name.toLowerCase()) || raw.includes(obj.id.toLowerCase())) {
          found.push(obj);
          if (found.length >= 2) break;
        }
      }
      if (found.length >= 2) {
        return {
          action: 'compare_objects',
          targetId: found[0].id,
          targetName: found[0].name,
          secondaryTargetId: found[1].id,
          secondaryTargetName: found[1].name,
          description: `Comparing physical and orbital telemetry between ${found[0].name} and ${found[1].name}`,
          rawQuery: text,
        };
      }
    }

    // 6. Focus / Show / Orbit for single object
    for (const obj of allObjects) {
      if (raw.includes(obj.name.toLowerCase()) || raw.includes(obj.id.toLowerCase())) {
        if (raw.includes('orbit') || raw.includes('trajectory')) {
          return {
            action: 'show_orbit',
            targetId: obj.id,
            targetName: obj.name,
            description: `Visualizing 3D Keplerian orbital path for ${obj.name}`,
            rawQuery: text,
          };
        }
        return {
          action: 'focus_object',
          targetId: obj.id,
          targetName: obj.name,
          description: `Focusing 3D camera and telemetry inspector on ${obj.name}`,
          rawQuery: text,
        };
      }
    }

    return null;
  }
}
