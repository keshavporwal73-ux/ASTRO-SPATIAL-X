import type { InvestigationRecord, ResearchHypothesis } from '@/types/astronomy';

const STORAGE_KEY = 'astro_investigations_v1';

const INITIAL_INVESTIGATIONS: InvestigationRecord[] = [
  {
    id: 'inv-planet-nine',
    title: 'Extreme TNO Orbital Clustering & Planet Nine Hypothesis',
    researchQuestion: 'Could a distant 5-10 M_Earth planet explain the orbital clustering of extreme trans-Neptunian objects?',
    category: 'Outer Solar System Dynamics',
    tags: ['Planet Nine', 'TNOs', 'Orbital Clustering', 'N-Body Dynamics'],
    conversationLog: [
      {
        role: 'user',
        content: 'Investigate whether Planet Nine can account for the clustering of detached Kuiper Belt objects.',
        timestamp: '2026-09-06T14:30:00Z',
      },
      {
        role: 'assistant',
        content: 'Planet Nine remains a compelling dynamical hypothesis explaining the apsidal alignment and inclination clustering of extreme TNOs like Sedna and 2012 VP113. However, observational selection bias remains an active competing explanation.',
        timestamp: '2026-09-06T14:30:05Z',
        evidenceItems: [
          {
            status: 'HYPOTHETICAL',
            claim: 'Planet Nine predicted with mass 5-10 M_Earth at 400-800 AU.',
          },
        ],
      },
    ],
    savedCalculations: [
      {
        name: "Kepler's 3rd Law at 500 AU",
        equation: 'T = sqrt(500^3 / 1.0)',
        inputs: { a: 500, M: 1.0 },
        outputs: { periodYears: '11180.3', perihelionAU: '350.0', aphelionAU: '650.0' },
        date: '2026-09-06',
      },
    ],
    savedObjects: ['pluto'],
    datasetsReferenced: ['NASA/JPL SSD Horizons', 'OSSOS Survey Catalog'],
    hypotheses: [
      {
        id: 'hyp-p9-1',
        title: 'Massive Super-Earth Perturber in Distant Eccentric Orbit',
        question: 'Does a 5-10 Earth-mass body secularly shepherd extreme TNO orbits?',
        status: 'Active Testing',
        establishedKnowledge: [
          'Extreme TNOs (a > 150 AU, q > 30 AU) exhibit clustered arguments of perihelion ω and longitude of ascending node Ω.',
          'Standard Solar System giant planets cannot shepherd these detached orbits alone.',
        ],
        competingHypotheses: [
          'Observational bias in survey pointings (OSSOS finding).',
          'Self-gravity of a massive planetesimal disk in the scattered disc.',
          'Captured primordial black hole of mass ~5 M_Earth.',
        ],
        evidencePoints: [
          {
            id: 'ep-1',
            type: 'Supporting',
            claim: 'High inclination object 2015 BP519 exhibits severe orbital warping consistent with a distant inclined perturber.',
            evidenceStatus: 'OBSERVED',
            source: { name: 'Batygin et al. (2019) Physics Reports', sourceType: 'Peer-Reviewed Paper' },
          },
          {
            id: 'ep-2',
            type: 'Counter',
            claim: 'OSSOS and DES survey pointings detect no statistically significant clustering after rigorous bias correction.',
            evidenceStatus: 'UNCERTAIN',
            source: { name: 'Shankman et al. (2017) AJ', sourceType: 'Peer-Reviewed Paper' },
          },
        ],
        calculationsPerformed: [
          {
            title: 'Secular Kozai-Lidov resonance timescale',
            formula: 'tau_KL ~ (M_sun / M_p) * (a_p^3 / a^1.5) * G^-0.5',
            result: '~ 1.2 Gyr',
            evidenceStatus: 'CALCULATED',
          },
        ],
        conclusionSummary: 'High dynamical plausibility but unverified until direct optical or infrared detection by Vera C. Rubin Observatory / LSST.',
        uncertainties: ['Exact sky coordinates along the ~15,000 year orbit unknown', 'Visual apparent magnitude estimated V = 21-23'],
        sources: [
          { name: 'Batygin & Brown (2016)', sourceType: 'Peer-Reviewed Paper' },
        ],
        createdAt: '2026-09-06T14:30:00Z',
        updatedAt: '2026-09-07T10:00:00Z',
      },
    ],
    notes: 'Awaiting first light results from Vera Rubin Legacy Survey of Space and Time (LSST).',
    status: 'Ongoing',
    createdAt: '2026-09-06T14:30:00Z',
    updatedAt: '2026-09-07T10:00:00Z',
  },
  {
    id: 'inv-trappist-atmospheres',
    title: 'JWST Atmospheric Characterization of TRAPPIST-1 Habitable Candidates',
    researchQuestion: 'Do TRAPPIST-1e and 1f retain secondary volatile atmospheres against M-dwarf stellar winds?',
    category: 'Exoplanet Atmospheres & Habitability',
    tags: ['TRAPPIST-1', 'JWST', 'Exoplanet Atmospheres', 'Habitability'],
    conversationLog: [
      {
        role: 'user',
        content: 'Analyze equilibrium temperature and transmission spectra for TRAPPIST-1e.',
        timestamp: '2026-09-05T09:15:00Z',
      },
    ],
    savedCalculations: [
      {
        name: 'TRAPPIST-1e Equilibrium Temperature',
        equation: 'T_eq = T_star * sqrt(R_star / (2a)) * (1 - A)^0.25',
        inputs: { T_star: 2566, R_star: 0.1192, a: 0.0293, A: 0.3 },
        outputs: { T_eq: '251.3 K (-21.8 °C)', insolation: '0.662 Earth-flux' },
        date: '2026-09-05',
      },
    ],
    savedObjects: ['trappist-1'],
    datasetsReferenced: ['NASA Exoplanet Archive', 'JWST Cycle 1/2 GTO & GO Spectra'],
    hypotheses: [],
    notes: 'Secondary CO2/N2 atmosphere possible if volatile delivery occurred post-stellar-activity peak.',
    status: 'Ongoing',
    createdAt: '2026-09-05T09:15:00Z',
    updatedAt: '2026-09-05T11:20:00Z',
  },
];

export class InvestigationStorage {
  static getInvestigations(): InvestigationRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Fallback
    }
    this.saveAll(INITIAL_INVESTIGATIONS);
    return INITIAL_INVESTIGATIONS;
  }

  static getById(id: string): InvestigationRecord | undefined {
    return this.getInvestigations().find((inv) => inv.id === id);
  }

  static saveInvestigation(inv: InvestigationRecord): void {
    const list = this.getInvestigations();
    const idx = list.findIndex((item) => item.id === inv.id);
    if (idx >= 0) {
      list[idx] = { ...inv, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...inv, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.saveAll(list);
  }

  static deleteInvestigation(id: string): void {
    const list = this.getInvestigations().filter((item) => item.id !== id);
    this.saveAll(list);
  }

  static addHypothesis(investigationId: string, hypothesis: ResearchHypothesis): void {
    const list = this.getInvestigations();
    const inv = list.find((i) => i.id === investigationId);
    if (inv) {
      inv.hypotheses = inv.hypotheses || [];
      const hIdx = inv.hypotheses.findIndex((h) => h.id === hypothesis.id);
      if (hIdx >= 0) {
        inv.hypotheses[hIdx] = { ...hypothesis, updatedAt: new Date().toISOString() };
      } else {
        inv.hypotheses.unshift({ ...hypothesis, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      this.saveInvestigation(inv);
    }
  }

  private static saveAll(list: InvestigationRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore storage error
    }
  }
}
