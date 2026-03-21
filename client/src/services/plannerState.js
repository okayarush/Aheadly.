const TRANSMISSION_BY_DISEASE = {
  Dengue: 'Aedes aegypti (Day biter)',
  Malaria: 'Anopheles mosquito (Night biter)',
  Typhoid: 'Contaminated water/food',
  Diarrhoea: 'Waterborne — open drain exposure',
  Respiratory: 'Airborne — high PM2.5 + humidity',
  Cholera: 'Contaminated water source'
};

const slugInterventionId = (sectorKey, name) => {
  const suffix = String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${sectorKey}-${suffix}`;
};

const contributorLines = (contributors = []) =>
  contributors.map((item) => `${item.source}: ${item.note}`);

const toTrendLabel = (trend) => {
  if (trend === 'OUTBREAK') return '⚠ Outbreak Alert';
  if (trend === 'RISING') return 'Rising ↑';
  return 'Stable →';
};

export const SECTOR_DATA = {
  'sector-03': {
    name: 'Sector-03',
    label: 'Civil Lines',
    hri: 89,
    hriMax: 100,
    severity: 'CRITICAL',
    disease: 'Dengue',
    cases: 31,
    trend: 'OUTBREAK',
    outbreakProbability: 88,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 3.2, max: 3.2, color: '#4da6ff', note: '31 confirmed dengue admissions this week' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.6, max: 2.8, color: '#f5a623', note: '14 HIGH risk households flagged in sector' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.8, max: 2.0, color: '#00d4aa', note: 'LST 43.1°C · Stagnation index CRITICAL' },
      { source: 'Community Reports', icon: '👥', score: 1.2, max: 1.4, color: '#2dd48a', note: '18 stagnant water + 9 symptom reports' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.5, max: 0.6, color: '#b48aff', note: 'Humidity 84% · High breeding conditions' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS reporting 31 dengue admissions — highest clinical burden in city this week',
      'ASHA workers flagged 14 HIGH risk households with fever + joint pain — active transmission confirmed at ground level',
      'NASA satellite shows CRITICAL stagnation index — confirmed by 18 community stagnant water reports'
    ],
    interventions: [
      { name: 'Emergency Fogging Campaign', hriReduction: 12, caseReductionPct: 30, tag: 'RECOMMENDED FROM ALERT', description: 'Immediate thermal fogging in all sub-wards of Sector-03 to disrupt adult mosquito population.' },
      { name: 'Larviciding & Source Reduction', hriReduction: 14, caseReductionPct: 35, tag: 'RECOMMENDED FROM ALERT', description: 'Deploy larvicide in all identified stagnation points. Remove standing water containers.' },
      { name: 'Community Advisory — Dengue', hriReduction: 4, caseReductionPct: 10, tag: null, description: 'Broadcast dengue prevention advisory to all Sector-03 residents via community portal.' },
      { name: 'ASHA Worker Mobilization', hriReduction: 5, caseReductionPct: 8, tag: null, description: 'Intensify household surveys in flagged sub-areas. Daily reporting for 14 days.' },
      { name: 'Hospital Preparedness Alert', hriReduction: 2, caseReductionPct: 0, tag: null, description: 'Notify nearest hospitals to pre-stock NS1 kits and Paracetamol IV.' }
    ],
    expectedImpact: {
      hriAfter: 61,
      timelineDays: 14,
      caseReduction: 65,
      containmentProbability: 78,
      description: 'Implementing Emergency Fogging + Larviciding projects HRI reduction from 89 → 61 within 14 days. Estimated 65% reduction in new dengue cases. Outbreak containment probability: 78%.'
    }
  },
  'sector-08': {
    name: 'Sector-08',
    label: 'North Solapur',
    hri: 86,
    hriMax: 100,
    severity: 'CRITICAL',
    disease: 'Dengue',
    cases: 27,
    trend: 'OUTBREAK',
    outbreakProbability: 82,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 3.1, max: 3.2, color: '#4da6ff', note: '27 dengue admissions — active outbreak' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.4, max: 2.8, color: '#f5a623', note: '11 HIGH risk households flagged' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.7, max: 2.0, color: '#00d4aa', note: 'LST 41.8°C · Stagnation HIGH' },
      { source: 'Community Reports', icon: '👥', score: 1.1, max: 1.4, color: '#2dd48a', note: '14 stagnant water reports this week' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.5, max: 0.6, color: '#b48aff', note: 'Humidity 81%' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS reporting 27 dengue admissions — second highest in city',
      'ASHA surveys flagged 11 HIGH risk households — fever and joint pain cluster confirmed',
      'Satellite stagnation HIGH — breeding sites identified near Railway Colony area'
    ],
    interventions: [
      { name: 'Emergency Fogging Campaign', hriReduction: 11, caseReductionPct: 28, tag: 'RECOMMENDED FROM ALERT', description: 'Immediate fogging across North Solapur sub-wards.' },
      { name: 'Larviciding & Source Reduction', hriReduction: 13, caseReductionPct: 32, tag: 'RECOMMENDED FROM ALERT', description: 'Target stagnation points near Railway Colony.' },
      { name: 'Community Advisory — Dengue', hriReduction: 4, caseReductionPct: 8, tag: null, description: 'Broadcast prevention advisory to Sector-08 residents.' },
      { name: 'ASHA Worker Mobilization', hriReduction: 4, caseReductionPct: 7, tag: null, description: 'Daily household surveys in flagged clusters for 14 days.' }
    ],
    expectedImpact: {
      hriAfter: 58,
      timelineDays: 14,
      caseReduction: 60,
      containmentProbability: 74,
      description: 'Implementing fogging + larviciding projects HRI reduction from 86 → 58 within 14 days. Estimated 60% reduction in new dengue cases.'
    }
  },
  'sector-10': {
    name: 'Sector-10',
    label: 'Central Solapur',
    hri: 74,
    hriMax: 100,
    severity: 'HIGH',
    disease: 'Dengue',
    cases: 22,
    trend: 'RISING',
    outbreakProbability: 71,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 2.8, max: 3.2, color: '#4da6ff', note: '22 dengue cases — rising trend' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.1, max: 2.8, color: '#f5a623', note: '8 HIGH risk households this week' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.4, max: 2.0, color: '#00d4aa', note: 'LST 38.7°C · Stagnation MODERATE' },
      { source: 'Community Reports', icon: '👥', score: 0.9, max: 1.4, color: '#2dd48a', note: '9 reports this week' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.5, max: 0.6, color: '#b48aff', note: 'Humidity 79%' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS showing 22 dengue cases with accelerating week-on-week growth',
      'ASHA surveys flagged 8 HIGH risk households — early cluster forming',
      'Moderate stagnation risk — proactive source reduction can prevent escalation'
    ],
    interventions: [
      { name: 'Drain Desilting Priority', hriReduction: 10, caseReductionPct: 22, tag: 'RECOMMENDED FROM ALERT', description: 'Clear clogged drains to eliminate primary stagnation sources.' },
      { name: 'Targeted Fogging', hriReduction: 9, caseReductionPct: 20, tag: 'RECOMMENDED FROM ALERT', description: 'Preventive fogging in flagged sub-wards before outbreak escalates.' },
      { name: 'Community Advisory', hriReduction: 3, caseReductionPct: 8, tag: null, description: 'Issue dengue prevention advisory to residents.' },
      { name: 'ASHA Surveillance Ramp-up', hriReduction: 4, caseReductionPct: 6, tag: null, description: 'Increase survey frequency in flagged households.' }
    ],
    expectedImpact: {
      hriAfter: 52,
      timelineDays: 10,
      caseReduction: 50,
      containmentProbability: 81,
      description: 'Early intervention projects HRI reduction from 74 → 52 within 10 days. 50% case reduction likely if implemented within 48 hours.'
    }
  },
  'sector-12': {
    name: 'Sector-12', label: 'Market Yard / Siddheshwar',
    hri: 73, hriMax: 100, severity: 'HIGH',
    disease: 'Dengue', cases: 18, trend: 'RISING', outbreakProbability: 67,
    contributors: [
      { source: 'Hospital HMS Cases',     icon: '🏥', score: 2.6, max: 3.2, color: '#4da6ff', note: '18 dengue cases — rising trend' },
      { source: 'ASHA Field Surveys',     icon: '👩‍⚕️', score: 2.0, max: 2.8, color: '#f5a623', note: '9 HIGH risk households flagged near market' },
      { source: 'NASA Satellite Signals', icon: '🛰',  score: 1.5, max: 2.0, color: '#00d4aa', note: 'LST 39.4°C · Stagnation MODERATE-HIGH' },
      { source: 'Community Reports',      icon: '👥', score: 1.1, max: 1.4, color: '#2dd48a', note: '16 stagnant water reports near market drains' },
      { source: 'Weather & Environment',  icon: '🌦', score: 0.5, max: 0.6, color: '#b48aff', note: 'Humidity 81%' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS reporting 18 dengue cases — dense market area accelerating transmission',
      'ASHA surveys flagged 9 HIGH risk households — fever and joint pain cluster near Market Yard',
      '16 citizen reports of stagnant water in market drains — primary breeding source identified'
    ],
    interventions: [
      { name: 'Market Drain Emergency Cleanup', tag: 'RECOMMENDED FROM ALERT', description: 'Clear all clogged drains in Market Yard area — primary stagnation source.', hriReduction: 11, caseReductionPct: 25 },
      { name: 'Targeted Fogging — Market Zone', tag: 'RECOMMENDED FROM ALERT', description: 'Thermal fogging in Market Yard and surrounding residential lanes.', hriReduction: 10, caseReductionPct: 22 },
      { name: 'Community Advisory',             tag: null, description: 'Broadcast dengue prevention advisory to Sector-12 residents.', hriReduction: 3, caseReductionPct: 8 },
      { name: 'ASHA Worker Mobilization',       tag: null, description: 'Intensify surveys in 9 flagged households and surrounding area.', hriReduction: 4, caseReductionPct: 7 }
    ],
    expectedImpact: { hriAfter: 48, timelineDays: 10, caseReduction: 54, containmentProbability: 76,
      description: 'Market drain cleanup + fogging projects HRI reduction from 73 → 48 within 10 days.' }
  },
  'sector-07': {
    name: 'Sector-07',
    label: 'Navy Peth',
    hri: 72,
    hriMax: 100,
    severity: 'HIGH',
    disease: 'Respiratory',
    cases: 19,
    trend: 'RISING',
    outbreakProbability: 64,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 2.6, max: 3.2, color: '#4da6ff', note: '19 respiratory admissions — rising' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.0, max: 2.8, color: '#f5a623', note: '7 households with cough/breathlessness' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.6, max: 2.0, color: '#00d4aa', note: 'PM2.5 elevated · Urban heat island' },
      { source: 'Community Reports', icon: '👥', score: 0.7, max: 1.4, color: '#2dd48a', note: '6 air quality complaints' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.6, max: 0.6, color: '#b48aff', note: 'High humidity + monsoon conditions' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS reporting 19 respiratory admissions — linked to elevated PM2.5 and monsoon humidity',
      'ASHA surveys flagged 7 households with cough and breathlessness clusters',
      'Urban heat island effect elevating vulnerability in dense residential areas of Navy Peth'
    ],
    interventions: [
      { name: 'Air Quality Advisory Broadcast', hriReduction: 8, caseReductionPct: 18, tag: 'RECOMMENDED FROM ALERT', description: 'Issue PM2.5 advisory to Navy Peth residents. Recommend masks outdoors.' },
      { name: 'Mobile Health Camp', hriReduction: 10, caseReductionPct: 22, tag: 'RECOMMENDED FROM ALERT', description: 'Deploy rapid response medical team for respiratory screening.' },
      { name: 'PM2.5 Monitoring Intensification', hriReduction: 4, caseReductionPct: 5, tag: null, description: 'Install temporary air quality monitors in high-density areas.' },
      { name: 'Community Mask Distribution', hriReduction: 5, caseReductionPct: 10, tag: null, description: 'Distribute N95 masks to vulnerable households via ASHA workers.' }
    ],
    expectedImpact: {
      hriAfter: 51,
      timelineDays: 7,
      caseReduction: 45,
      containmentProbability: 72,
      description: 'Air quality advisory + mobile health camp projects HRI reduction from 72 → 51 within 7 days.'
    }
  },
  'sector-01': {
    name: 'Sector-01',
    label: 'Ashok Chowk',
    hri: 71,
    hriMax: 100,
    severity: 'HIGH',
    disease: 'Typhoid',
    cases: 14,
    trend: 'RISING',
    outbreakProbability: 61,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 2.4, max: 3.2, color: '#4da6ff', note: '14 typhoid cases — rising trend' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.2, max: 2.8, color: '#f5a623', note: '9 households — fever + GI symptoms' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.2, max: 2.0, color: '#00d4aa', note: 'Water stagnation near supply lines' },
      { source: 'Community Reports', icon: '👥', score: 1.1, max: 1.4, color: '#2dd48a', note: '12 contaminated water reports' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.4, max: 0.6, color: '#b48aff', note: 'Moderate conditions' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS reporting 14 typhoid cases — contaminated water/food source suspected',
      'ASHA surveys flagged 9 households with fever and gastrointestinal symptoms in same locality',
      '12 citizen reports of contaminated or discoloured water in Ashok Chowk area'
    ],
    interventions: [
      { name: 'Water Quality Testing', hriReduction: 8, caseReductionPct: 20, tag: 'RECOMMENDED FROM ALERT', description: 'Immediate testing of municipal water supply lines in Ashok Chowk.' },
      { name: 'Boil Water Advisory', hriReduction: 12, caseReductionPct: 35, tag: 'RECOMMENDED FROM ALERT', description: 'Issue boil-water advisory to all Sector-01 households immediately.' },
      { name: 'Sanitation Rapid Response', hriReduction: 6, caseReductionPct: 12, tag: null, description: 'Emergency cleanup of open drains near water supply infrastructure.' },
      { name: 'Food Safety Inspection', hriReduction: 4, caseReductionPct: 8, tag: null, description: 'Inspect food establishments in the sector for hygiene compliance.' }
    ],
    expectedImpact: {
      hriAfter: 48,
      timelineDays: 7,
      caseReduction: 55,
      containmentProbability: 76,
      description: 'Water testing + boil advisory projects HRI reduction from 71 → 48 within 7 days. Transmission chain likely broken within 72 hours of water source fix.'
    }
  },
  'sector-09': {
    name: 'Sector-09',
    label: 'Railway Lines',
    hri: 69,
    hriMax: 100,
    severity: 'HIGH',
    disease: 'Typhoid',
    cases: 11,
    trend: 'RISING',
    outbreakProbability: 58,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 2.3, max: 3.2, color: '#4da6ff', note: '11 typhoid admissions from rail colony catchments' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.1, max: 2.8, color: '#f5a623', note: '8 households with fever + GI complaints' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.1, max: 2.0, color: '#00d4aa', note: 'Localized stagnation around service lanes' },
      { source: 'Community Reports', icon: '👥', score: 1.0, max: 1.4, color: '#2dd48a', note: '9 contaminated water complaints in 7 days' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.4, max: 0.6, color: '#b48aff', note: 'Intermittent rain stress on pipelines' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS reports 11 typhoid admissions in a concentrated rail colony catchment',
      'ASHA teams identified 8 symptomatic households with likely common source exposure',
      'Community complaints indicate recurring pipeline contamination near service lanes'
    ],
    interventions: [
      { name: 'Pipeline Leak Rectification', tag: 'RECOMMENDED FROM ALERT', description: 'Repair and flush vulnerable segments near Railway Lines supply routes.' },
      { name: 'Boil Water Advisory', tag: 'RECOMMENDED FROM ALERT', description: 'Issue immediate boil-water notice and ward-level guidance.' },
      { name: 'ORS Distribution Drive', tag: null, description: 'Deploy ORS packets through ASHA workers for vulnerable households.' }
    ],
    expectedImpact: {
      hriAfter: 49,
      timelineDays: 8,
      caseReduction: 52,
      containmentProbability: 75,
      description: 'Leak rectification + advisory measures project HRI reduction from 69 → 49 within 8 days with major reduction in typhoid spread.'
    }
  },
  'sector-05': {
    name: 'Sector-05',
    label: 'Jule Solapur',
    hri: 68,
    hriMax: 100,
    severity: 'HIGH',
    disease: 'Diarrhoea',
    cases: 8,
    trend: 'RISING',
    outbreakProbability: 54,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 2.1, max: 3.2, color: '#4da6ff', note: '8 diarrhoeal admissions with rising week-on-week trend' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 2.0, max: 2.8, color: '#f5a623', note: '7 households flagged near open drains' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.2, max: 2.0, color: '#00d4aa', note: 'Runoff accumulation in dense low-lying pockets' },
      { source: 'Community Reports', icon: '👥', score: 0.9, max: 1.4, color: '#2dd48a', note: '8 open-drain and wastewater overflow complaints' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.4, max: 0.6, color: '#b48aff', note: 'Monsoon humidity sustaining contamination risk' }
    ],
    primaryRiskDrivers: [
      'Hospital admissions indicate a growing diarrhoeal burden in vulnerable blocks',
      'ASHA surveys link new cases to households near open-drain exposure corridors',
      'Community complaints confirm wastewater overflow persistence in the same sub-wards'
    ],
    interventions: [
      { name: 'Drain Desilting Priority', tag: 'RECOMMENDED FROM ALERT', description: 'Execute rapid desilting of open drains in flagged pockets.' },
      { name: 'Water Chlorination Sweep', tag: 'RECOMMENDED FROM ALERT', description: 'Deploy chlorination teams for household and public taps.' },
      { name: 'Hygiene Advisory Campaign', tag: null, description: 'Broadcast handwashing and safe-water practices through field teams.' }
    ],
    expectedImpact: {
      hriAfter: 47,
      timelineDays: 9,
      caseReduction: 48,
      containmentProbability: 73,
      description: 'Desilting + chlorination response projects HRI reduction from 68 → 47 within 9 days and lowers diarrhoeal transmission pressure.'
    }
  },
  'sector-13': {
    name: 'Sector-13',
    label: 'Sector-13',
    hri: 67,
    hriMax: 100,
    severity: 'HIGH',
    disease: 'Cholera',
    cases: 6,
    trend: 'RISING',
    outbreakProbability: 49,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 2.0, max: 3.2, color: '#4da6ff', note: '6 cholera admissions tied to shared water source' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 1.9, max: 2.8, color: '#f5a623', note: '6 households with acute watery diarrhoea symptoms' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.1, max: 2.0, color: '#00d4aa', note: 'Drain backup and wet pockets near borewell strip' },
      { source: 'Community Reports', icon: '👥', score: 0.9, max: 1.4, color: '#2dd48a', note: '7 foul-water complaints this week' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.4, max: 0.6, color: '#b48aff', note: 'Persistent humidity supports contamination survival' }
    ],
    primaryRiskDrivers: [
      'Hospital HMS confirms cholera-linked admissions associated with a common water source',
      'ASHA teams report clustered watery-diarrhoea symptoms in adjacent households',
      'Community complaints indicate foul-water persistence and possible sewage mixing'
    ],
    interventions: [
      { name: 'Boil Water Advisory', tag: 'RECOMMENDED FROM ALERT', description: 'Issue immediate boil-water directive across Sector-13.' },
      { name: 'Emergency Chlorination Drive', tag: 'RECOMMENDED FROM ALERT', description: 'Shock chlorinate identified supply points and storage nodes.' },
      { name: 'Rapid Stool Sample Coordination', tag: null, description: 'Coordinate sample confirmation with nearby public health labs.' }
    ],
    expectedImpact: {
      hriAfter: 46,
      timelineDays: 8,
      caseReduction: 46,
      containmentProbability: 71,
      description: 'Rapid chlorination + advisory response projects HRI reduction from 67 → 46 within 8 days and reduces cholera spread probability.'
    }
  },
  'sector-16': {
    name: 'Sector-16',
    label: 'Sector-16',
    hri: 52,
    hriMax: 100,
    severity: 'MODERATE',
    disease: 'Dengue',
    cases: 9,
    trend: 'STABLE',
    outbreakProbability: 32,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 1.4, max: 3.2, color: '#4da6ff', note: '9 dengue cases with no accelerated spread' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 1.3, max: 2.8, color: '#f5a623', note: '4 households under observation' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 1.0, max: 2.0, color: '#00d4aa', note: 'Localized stagnation pockets manageable' },
      { source: 'Community Reports', icon: '👥', score: 0.6, max: 1.4, color: '#2dd48a', note: '4 stagnant water reports addressed' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.3, max: 0.6, color: '#b48aff', note: 'Moderate humidity profile' }
    ],
    primaryRiskDrivers: [
      'Hospital data shows low but persistent dengue burden requiring sustained control',
      'ASHA surveillance indicates scattered households needing follow-up',
      'Environmental risk remains moderate due to recurring small stagnation points'
    ],
    interventions: [
      { name: 'Routine Fogging Cadence', tag: null, description: 'Maintain weekly fogging in previously flagged lanes.' },
      { name: 'Source Reduction Patrol', tag: null, description: 'Continue larval source checks and container emptying drives.' }
    ],
    expectedImpact: {
      hriAfter: 44,
      timelineDays: 14,
      caseReduction: 28,
      containmentProbability: 88,
      description: 'Routine control measures keep risk moderated, projecting HRI reduction from 52 → 44 over two weeks.'
    }
  },
  'sector-14': {
    name: 'Sector-14',
    label: 'Sector-14',
    hri: 45,
    hriMax: 100,
    severity: 'MODERATE',
    disease: 'Respiratory',
    cases: 4,
    trend: 'STABLE',
    outbreakProbability: 21,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 1.1, max: 3.2, color: '#4da6ff', note: '4 respiratory admissions, stable trajectory' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 1.0, max: 2.8, color: '#f5a623', note: '3 households with mild respiratory symptoms' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 0.9, max: 2.0, color: '#00d4aa', note: 'Moderate PM2.5 pockets near arterial roads' },
      { source: 'Community Reports', icon: '👥', score: 0.5, max: 1.4, color: '#2dd48a', note: '2 air quality complaints logged' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.3, max: 0.6, color: '#b48aff', note: 'Humidity stable, no severe spikes' }
    ],
    primaryRiskDrivers: [
      'Clinical burden remains low and stable with no clustering escalation',
      'Localized PM2.5 exposure near high-traffic corridors is the key residual risk',
      'Community signal volume remains limited and manageable'
    ],
    interventions: [
      { name: 'Air Quality Monitoring', hriReduction: 4, caseReductionPct: 8, tag: null, description: 'Deploy mobile air quality sensors to identify high PM2.5 zones.' },
      { name: 'Preventive Health Advisory', hriReduction: 5, caseReductionPct: 12, tag: null, description: 'Issue health advisories for vulnerable populations in high-risk zones.' },
      { name: 'ASHA Routine Surveillance', hriReduction: 3, caseReductionPct: 6, tag: null, description: 'Increase frequency of household visits for respiratory symptom tracking.' }
    ],
    expectedImpact: {
      hriAfter: 39,
      timelineDays: 12,
      caseReduction: 22,
      containmentProbability: 90,
      description: 'Advisory + follow-up screening projects modest HRI reduction from 45 → 39 while maintaining stable respiratory conditions.'
    }
  },
  'sector-02': {
    name: 'Sector-02',
    label: 'Bhavani Peth',
    hri: 42,
    hriMax: 100,
    severity: 'MODERATE',
    disease: 'Malaria',
    cases: 3,
    trend: 'STABLE',
    outbreakProbability: 18,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 0.9, max: 3.2, color: '#4da6ff', note: '3 malaria cases with no rise trend' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 0.9, max: 2.8, color: '#f5a623', note: '2 households under watch' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 0.8, max: 2.0, color: '#00d4aa', note: 'Low-to-moderate breeding conditions' },
      { source: 'Community Reports', icon: '👥', score: 0.4, max: 1.4, color: '#2dd48a', note: 'Minimal mosquito complaints this week' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.2, max: 0.6, color: '#b48aff', note: 'Weather stable and moderate' }
    ],
    primaryRiskDrivers: [
      'Malaria burden remains limited with isolated case pattern',
      'ASHA surveillance indicates no active household cluster progression',
      'Vector breeding indicators remain within controlled baseline limits'
    ],
    interventions: [
      { name: 'Routine Larval Surveillance', tag: null, description: 'Continue weekly larval site checks in known hotspots.' },
      { name: 'Bed-Net Advisory Refresh', tag: null, description: 'Reinforce night-time mosquito prevention messaging.' }
    ],
    expectedImpact: {
      hriAfter: 36,
      timelineDays: 14,
      caseReduction: 24,
      containmentProbability: 93,
      description: 'Routine surveillance and preventive advisories maintain control and project HRI reduction from 42 → 36 in two weeks.'
    }
  },
  'sector-11': {
    name: 'Sector-11',
    label: 'South Solapur',
    hri: 38,
    hriMax: 100,
    severity: 'LOW',
    disease: 'Malaria',
    cases: 2,
    trend: 'STABLE',
    outbreakProbability: 12,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 0.4, max: 3.2, color: '#4da6ff', note: '2 malaria cases — no active trend' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 0.6, max: 2.8, color: '#f5a623', note: '1 HIGH risk household this week' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 0.8, max: 2.0, color: '#00d4aa', note: 'Normal LST · Low stagnation' },
      { source: 'Community Reports', icon: '👥', score: 0.2, max: 1.4, color: '#2dd48a', note: 'No active reports' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.3, max: 0.6, color: '#b48aff', note: 'Normal conditions' }
    ],
    primaryRiskDrivers: [
      '2 isolated malaria cases — no cluster pattern detected',
      'ASHA surveys show no symptomatic clusters in this sector',
      'Satellite and community signals within normal baseline range'
    ],
    interventions: [
      { name: 'Routine Surveillance', hriReduction: 3, caseReductionPct: 8, tag: null, description: 'Continue standard weekly ASHA surveys. No immediate escalation required.' },
      { name: 'Preventive Advisory', hriReduction: 2, caseReductionPct: 5, tag: null, description: 'Circulate standard mosquito prevention guidelines.' }
    ],
    expectedImpact: {
      hriAfter: 32,
      timelineDays: 14,
      caseReduction: 20,
      containmentProbability: 95,
      description: 'Routine surveillance maintains current low-risk status. No significant intervention required.'
    }
  },
  'sector-06': {
    name: 'Sector-06',
    label: 'MIDC Area',
    hri: 34,
    hriMax: 100,
    severity: 'LOW',
    disease: 'Dengue',
    cases: 5,
    trend: 'STABLE',
    outbreakProbability: 16,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 0.8, max: 3.2, color: '#4da6ff', note: '5 dengue cases, trend remains stable' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 0.7, max: 2.8, color: '#f5a623', note: '2 households under observation' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 0.7, max: 2.0, color: '#00d4aa', note: 'Low stagnation profile in monitored zones' },
      { source: 'Community Reports', icon: '👥', score: 0.3, max: 1.4, color: '#2dd48a', note: 'Few vector complaints, mostly resolved' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.2, max: 0.6, color: '#b48aff', note: 'No adverse weather trigger' }
    ],
    primaryRiskDrivers: [
      'Case burden remains stable without expansion into new sub-wards',
      'Environmental and survey indicators are within low-risk operational thresholds',
      'Existing preventive response appears sufficient to prevent escalation'
    ],
    interventions: [
      { name: 'Routine Fogging Cadence', tag: null, description: 'Continue scheduled anti-vector fogging in industrial-adjacent pockets.' },
      { name: 'Community Source Check', tag: null, description: 'Reinforce weekly container and water storage checks.' }
    ],
    expectedImpact: {
      hriAfter: 30,
      timelineDays: 14,
      caseReduction: 18,
      containmentProbability: 94,
      description: 'Current preventive routines sustain low risk, with projected HRI reduction from 34 → 30 over two weeks.'
    }
  },
  'sector-15': {
    name: 'Sector-15',
    label: 'Sector-15',
    hri: 28,
    hriMax: 100,
    severity: 'LOW',
    disease: 'Diarrhoea',
    cases: 1,
    trend: 'STABLE',
    outbreakProbability: 9,
    contributors: [
      { source: 'Hospital HMS Cases', icon: '🏥', score: 0.3, max: 3.2, color: '#4da6ff', note: '1 isolated diarrhoeal case recorded' },
      { source: 'ASHA Field Surveys', icon: '👩‍⚕️', score: 0.4, max: 2.8, color: '#f5a623', note: 'No household cluster flagged' },
      { source: 'NASA Satellite Signals', icon: '🛰', score: 0.5, max: 2.0, color: '#00d4aa', note: 'Low environmental stress indicators' },
      { source: 'Community Reports', icon: '👥', score: 0.2, max: 1.4, color: '#2dd48a', note: 'No sanitation escalation reports' },
      { source: 'Weather & Environment', icon: '🌦', score: 0.2, max: 0.6, color: '#b48aff', note: 'Stable weather conditions' }
    ],
    primaryRiskDrivers: [
      'Only one isolated case with no epidemiological linkage detected',
      'ASHA and community signals remain at baseline across monitoring points',
      'No immediate environmental trigger requiring escalation'
    ],
    interventions: [
      { name: 'Routine Hygiene Messaging', tag: null, description: 'Continue baseline hygiene and safe-water awareness outreach.' },
      { name: 'Standard Water Monitoring', tag: null, description: 'Maintain routine quality checks at distribution points.' }
    ],
    expectedImpact: {
      hriAfter: 24,
      timelineDays: 14,
      caseReduction: 15,
      containmentProbability: 97,
      description: 'Routine monitoring keeps Sector-15 in low-risk mode, with projected HRI improvement from 28 → 24 over two weeks.'
    }
  }
};

export const toSectorKey = (nameOrKey) => {
  if (!nameOrKey) return 'sector-03';
  const lower = String(nameOrKey).trim().toLowerCase();
  if (SECTOR_DATA[lower]) return lower;
  const match = lower.match(/(\d+)/);
  if (!match) return 'sector-03';
  const num = Math.max(1, Math.min(16, parseInt(match[0], 10)));
  return `sector-${String(num).padStart(2, '0')}`;
};

export const getSectorDataByName = (nameOrKey) => SECTOR_DATA[toSectorKey(nameOrKey)] || SECTOR_DATA['sector-03'];

export const calculateImpact = (sectorKey, appliedInterventionNames = []) => {
  const sector = SECTOR_DATA[toSectorKey(sectorKey)];
  if (!sector) return null;

  const baseHRI = sector.hri;
  if (!appliedInterventionNames || appliedInterventionNames.length === 0) return null;

  let totalHriReduction = 0;
  let compoundedCaseReduction = 0; // percent (0-100)

  appliedInterventionNames.forEach((appliedName) => {
    const needle = String(appliedName || '').trim().toLowerCase();
    const intervention = (sector.interventions || []).find((entry) => String(entry.name || '').trim().toLowerCase() === needle);

    if (!intervention) {
      // Debug: log which name failed to match
      // eslint-disable-next-line no-console
      console.warn(`[Intervention Match Failed] Sector: ${toSectorKey(sectorKey)}, Looking for: "${appliedName}"`);
      // eslint-disable-next-line no-console
      console.warn('[Available interventions]:', (sector.interventions || []).map(i => i.name));
      return;
    }

    if (intervention.hriReduction) totalHriReduction += intervention.hriReduction;

    const pct = intervention.caseReductionPct || 0;
    // compound: new = 1 - (1 - prev)*(1 - pct)
    const prev = compoundedCaseReduction / 100;
    const next = 1 - (1 - prev) * (1 - pct / 100);
    compoundedCaseReduction = next * 100;
  });

  // Safety check — if still 0 after loop, something likely mismatched
  if (totalHriReduction === 0) {
    // eslint-disable-next-line no-console
    console.error(`[calculateImpact] Zero HRI reduction for sector ${toSectorKey(sectorKey)} with interventions:`, appliedInterventionNames);
    return null;
  }

  totalHriReduction = Math.min(totalHriReduction, Math.max(0, baseHRI - 15));
  const totalCaseReduction = Math.min(Math.round(compoundedCaseReduction), 85);

  const projectedHRI = Math.round(baseHRI - totalHriReduction);
  const projectedSeverity = projectedHRI >= 80 ? 'CRITICAL'
    : projectedHRI >= 65 ? 'HIGH'
      : projectedHRI >= 45 ? 'MODERATE'
        : 'LOW';

  const timelineDays = appliedInterventionNames.length >= 3
    ? 7
    : appliedInterventionNames.length === 2
      ? 10
      : 14;

  return {
    projectedHRI,
    reduction: totalHriReduction,
    projectedSeverity,
    caseReduction: totalCaseReduction,
    timelineDays,
    appliedCount: appliedInterventionNames.length,
    totalInterventions: (sector.interventions || []).length,
    baseHRI
  };
};

export const SECTOR_SELECTOR_OPTIONS = Object.values(SECTOR_DATA)
  .slice()
  .sort((a, b) => b.hri - a.hri)
  .map((item) => ({
    key: toSectorKey(item.name),
    name: item.name,
    label: item.label,
    hri: item.hri,
    severity: item.severity,
    display: `${item.name} — ${item.label} · ${item.hri} · ${item.severity}`
  }));

export const SECTOR_HEALTH_PROFILES = Object.values(SECTOR_DATA).reduce((acc, item) => {
  acc[item.name] = {
    sector: item.name,
    sectorLabel: item.label,
    hri: item.hri,
    severity: item.severity,
    disease: item.disease,
    cases: item.cases,
    trend: item.trend.toLowerCase(),
    trendLabel: toTrendLabel(item.trend),
    transmission: TRANSMISSION_BY_DISEASE[item.disease] || 'Transmission data unavailable',
    contributors: contributorLines(item.contributors),
    insight: item.expectedImpact?.description || 'Continue monitoring.'
  };
  return acc;
}, {});

export const PREDEFINED_SECTORS = {
  'Sector-03': SECTOR_HEALTH_PROFILES['Sector-03'],
  'Sector-08': SECTOR_HEALTH_PROFILES['Sector-08'],
  'Sector-10': SECTOR_HEALTH_PROFILES['Sector-10'],
  'Sector-07': SECTOR_HEALTH_PROFILES['Sector-07'],
  'Sector-01': SECTOR_HEALTH_PROFILES['Sector-01']
};

export const plannerQueue = {
  items: [],

  add(item) {
    const sector = item?.sector || item?.name;
    const disease = item?.disease;
    if (!sector || !disease) return;

    const exists = this.items.find((queued) => queued.sector === sector && queued.disease === disease && !queued.consumed);
    if (!exists) {
      this.items.push({ ...item, sector, addedAt: new Date(), consumed: false });
      this.notify();
    }
  },

  getUnconsumed() {
    return this.items.filter((entry) => !entry.consumed);
  },

  markConsumed(sector) {
    const item = this.items.find((entry) => entry.sector === sector);
    if (item) item.consumed = true;
    this.notify();
  },

  listeners: [],
  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== fn);
    };
  },
  notify() {
    this.listeners.forEach((fn) => fn([...this.items]));
  }
};

export const mapSectorInterventions = (sectorName) => {
  const sector = getSectorDataByName(sectorName);
  return (sector?.interventions || []).map((entry) => ({
    id: slugInterventionId(toSectorKey(sector.name), entry.name),
    name: entry.name,
    description: entry.description,
    tag: entry.tag,
    hriReduction: entry.hriReduction || 0,
    caseReductionPct: entry.caseReductionPct || 0,
    expectedHealthImpact: sector.expectedImpact?.description,
    executionSteps: [entry.description],
    riskDrivers: sector.primaryRiskDrivers || [],
    effort: 'Moderate',
    costCategory: 'Municipal'
  }));
};
