// plannerState.js

export const PREDEFINED_SECTORS = {
  "Sector-03": {
    sector: "Sector-03",
    sectorLabel: "Civil Lines",
    disease: "Dengue",
    severity: "CRITICAL",
    outbreakProbability: 88,
    hri: 8.0,
    hriMax: 12,
    context: {
      heatExposure: 3.2,
      sanitationStress: 2.8,
      vectorDensity: 2.5,
      waterStagnation: 2.1,
      diseaseBurden: 1.4
    },
    primaryDrivers: "High stagnant water post-monsoon combined with elevated vector density in dense residential blocks.",
    recommendedActions: [
      { id: "fogging", label: "Deploy fogging within 48h", interventionType: "Sanitation Rapid Response" },
      { id: "boilwater", label: "Issue boil-water advisory", interventionType: "Community Advisory" },
      { id: "asha", label: "Alert ASHA workers", interventionType: "Field Mobilization — ASHA" }
    ],
    source: "Future Overview AI",
    addedAt: null,
    consumed: false
  },
  "Sector-10": {
    sector: "Sector-10",
    sectorLabel: "MIDC Area",
    disease: "Dengue",
    severity: "MODERATE",
    outbreakProbability: 82,
    hri: 5.0,
    hriMax: 12,
    context: {
      heatExposure: 2.1,
      sanitationStress: 3.0,
      vectorDensity: 1.5,
      waterStagnation: 1.8,
      diseaseBurden: 0.8
    },
    primaryDrivers: "Industrial water runoff combined with recent sanitation complaints.",
    recommendedActions: [
      { id: "drain", label: "Clear industrial drains", interventionType: "Sanitation Rapid Response" },
      { id: "inspect", label: "Factory inspections", interventionType: "Targeted Inspections" }
    ],
    source: "Future Overview AI",
    addedAt: null,
    consumed: false
  },
  "Sector-07": {
    sector: "Sector-07",
    sectorLabel: "Bhavani Peth",
    disease: "Dengue",
    severity: "MODERATE",
    outbreakProbability: 78,
    hri: 4.2,
    hriMax: 12,
    context: {
      heatExposure: 1.5,
      sanitationStress: 2.0,
      vectorDensity: 1.8,
      waterStagnation: 1.5,
      diseaseBurden: 1.2
    },
    primaryDrivers: "High population density and isolated water stagnation reports.",
    recommendedActions: [
      { id: "asha", label: "Alert ASHA workers", interventionType: "Field Mobilization — ASHA" },
      { id: "fogging", label: "Targeted fogging", interventionType: "Sanitation Rapid Response" }
    ],
    source: "Future Overview AI",
    addedAt: null,
    consumed: false
  }
};

export const plannerQueue = {
  items: [],
  
  add(item) {
    // Prevent duplicates
    const exists = this.items.find(i => i.sector === item.sector && i.disease === item.disease);
    if (!exists) {
      this.items.push({ ...item, addedAt: new Date(), consumed: false });
      this.notify();
    }
  },
  
  getUnconsumed() {
    return this.items.filter(i => !i.consumed);
  },
  
  markConsumed(sector) {
    const item = this.items.find(i => i.sector === sector);
    if (item) item.consumed = true;
    this.notify();
  },

  listeners: [],
  subscribe(fn) { 
    this.listeners.push(fn); 
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  },
  notify() { 
    this.listeners.forEach(fn => fn([...this.items])); 
  }
};
