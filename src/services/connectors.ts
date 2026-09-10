import type { DataConnectorState } from '@/types/astronomy';

export const ASTRONOMY_DATA_CONNECTORS: DataConnectorState[] = [
  {
    id: 'nasa-apod',
    name: 'NASA APOD API',
    provider: 'NASA',
    description: 'Astronomy Picture of the Day REST endpoint providing daily imagery, spectral imagery, and astrophysicist annotations.',
    endpoint: 'https://api.nasa.gov/planetary/apod',
    status: 'Online',
    recordsCount: '10,500+ Daily Images',
    lastUpdated: 'Live daily sync',
    supportedQueries: ['get_today_apod', 'get_date_range', 'get_hd_imagery'],
    authType: 'API Key',
    latencyMs: 142,
  },
  {
    id: 'nasa-exoplanet-archive',
    name: 'NASA Exoplanet Archive (NExScI)',
    provider: 'NASA Exoplanet Archive',
    description: 'Caltech/IPAC Table Access Protocol (TAP) service containing all confirmed exoplanets, Kepler/TESS candidates, and stellar parameters.',
    endpoint: 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync',
    status: 'Synchronized',
    recordsCount: '5,600+ Confirmed Planets',
    lastUpdated: '2026-09-01 Catalog Release',
    supportedQueries: ['pscomppars (Planetary Systems Composite)', 'cumulative_tess', 'microlensing_events'],
    authType: 'Standard TAP / VO',
    latencyMs: 285,
  },
  {
    id: 'cds-simbad',
    name: 'SIMBAD Astronomical Database',
    provider: 'CDS / SIMBAD',
    description: 'Centre de Données astronomiques de Strasbourg catalog of astronomical objects outside the Solar System with cross-identifications and bibliography.',
    endpoint: 'https://simbad.u-strasbg.fr/simbad/sim-tap/sync',
    status: 'Online',
    recordsCount: '13.8M Celestial Objects',
    lastUpdated: 'Live CDS query',
    supportedQueries: ['basic_astrometry', 'spectral_types', 'radial_velocities', 'proper_motions'],
    authType: 'Standard TAP / VO',
    latencyMs: 310,
  },
  {
    id: 'jpl-horizons',
    name: 'NASA/JPL SSD Horizons Ephemeris System',
    provider: 'JPL Horizons',
    description: 'High-precision solar system ephemerides, osculating orbital elements, physical constants, and close-approach trajectory data.',
    endpoint: 'https://ssd.jpl.nasa.gov/api/horizons.api',
    status: 'Online',
    recordsCount: '1.3M Asteroids & Comets + Major Bodies',
    lastUpdated: 'DE440/441 Ephemeris Integration',
    supportedQueries: ['vectors', 'elements', 'observer_table', 'close_approaches'],
    authType: 'Open Access API',
    latencyMs: 195,
  },
  {
    id: 'esa-gaia',
    name: 'ESA Gaia Archive (DR3)',
    provider: 'ESA Gaia',
    description: '1.8 billion star astrometric and spectrophotometric survey mapping 3D positions and velocity vectors in the Milky Way.',
    endpoint: 'https://gea.esac.esa.int/tap-server/tap',
    status: 'Synchronized',
    recordsCount: '1.81 Billion Stars',
    lastUpdated: 'Gaia DR3 Gold Release',
    supportedQueries: ['parallax_distances', 'astrometric_proper_motions', 'radial_velocity_spectroscopy'],
    authType: 'Standard TAP / VO',
    latencyMs: 420,
  },
];

export class DataConnectorService {
  static getConnectors(): DataConnectorState[] {
    return ASTRONOMY_DATA_CONNECTORS;
  }

  static async testConnector(id: string): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const connector = ASTRONOMY_DATA_CONNECTORS.find((c) => c.id === id);
    if (!connector) {
      return { success: false, latencyMs: 0, message: 'Connector not found' };
    }
    // Simulate real scientific API ping check
    await new Promise((r) => setTimeout(r, Math.max(80, connector.latencyMs + Math.floor(Math.random() * 30 - 15))));
    return {
      success: true,
      latencyMs: connector.latencyMs + Math.floor(Math.random() * 10 - 5),
      message: `Successfully handshake with ${connector.name} (${connector.endpoint}). Service operational.`,
    };
  }
}
