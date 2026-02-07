/**
 * diseaseService.js
 * Centralized service for mocking India-relevant public health disease signals.
 * Aligns environmental data (HRI, Sanitation, Vector) with clinical outcomes.
 */

const DISEASE_TYPES = {
    VECTOR: 'Vector-Borne',
    WATER: 'Water-Borne',
    RESPIRATORY: 'Respiratory',
    HEAT: 'Heat-Related'
};

const DISEASES = {
    DENGUE: { name: 'Dengue', type: DISEASE_TYPES.VECTOR, transmission: 'Aedes aegypti (Day biter)', vector: 'Mosquito' },
    MALARIA: { name: 'Malaria', type: DISEASE_TYPES.VECTOR, transmission: 'Anopheles (Night biter)', vector: 'Mosquito' },
    CHIKUNGUNYA: { name: 'Chikungunya', type: DISEASE_TYPES.VECTOR, transmission: 'Aedes aegypti', vector: 'Mosquito' },
    ADD: { name: 'Acute Diarrheal Disease', type: DISEASE_TYPES.WATER, transmission: 'Fecal-Oral Route', vector: 'Water/Food' },
    CHOLERA: { name: 'Cholera', type: DISEASE_TYPES.WATER, transmission: 'Contaminated Water', vector: 'Water' },
    TYPHOID: { name: 'Typhoid', type: DISEASE_TYPES.WATER, transmission: 'Fecal-Oral Route', vector: 'Food/Water' },
    ARI: { name: 'Acute Respiratory Infection', type: DISEASE_TYPES.RESPIRATORY, transmission: 'Airborne Droplets', vector: 'Air' },
    ILI: { name: 'Influenza-Like Illness', type: DISEASE_TYPES.RESPIRATORY, transmission: 'Airborne/Contact', vector: 'Air' },
    HEAT_STRESS: { name: 'Heat Stress', type: DISEASE_TYPES.HEAT, transmission: 'Environmental Exposure', vector: 'Sun/Heat' }
};

export const generateDiseaseSignal = (wardName, hriScore, sanitationStress, vectorDensity) => {
    const profile = getWardDiseaseProfile(wardName, hriScore, sanitationStress, vectorDensity);

    // Filter for active diseases
    const activeDetails = profile.filter(d => d.activeCases > 0);

    // Sort by severity (cases * priority weight)
    activeDetails.sort((a, b) => b.activeCases - a.activeCases);

    const primary = activeDetails.length > 0 ? activeDetails[0] : { ...DISEASES.DENGUE, activeCases: 0, trend: 'No Activity', cluster: 'None' };
    const secondary = activeDetails.length > 1 ? activeDetails.slice(1) : [];

    return {
        primary,
        secondary,
        summary: `${primary.name}: ${primary.activeCases} active cases (${primary.trend})`,
        profile // Return full profile
    };
};

/**
 * Returns the full disease profile (ALL diseases) for a ward.
 * Acts as the Single Source of Truth for Digital Twin & Analytics.
 */
export const getWardDiseaseProfile = (wardName, hriScore, sanitationStress, vectorDensity) => {
    // Deterministic seed
    const seed = wardName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Helper to determine cases based on drivers
    const calculateCases = (disease, seedOffset) => {
        let riskFactor = 0;
        let cases = 0;
        let trend = 'Stable';
        let cluster = 'Sporadic';

        // DRIVER LOGIC
        if (disease.type === DISEASE_TYPES.VECTOR) {
            if (vectorDensity > 0.6 && hriScore > 6) riskFactor = 0.8;
            else if (vectorDensity > 0.4) riskFactor = 0.4;
        }
        else if (disease.type === DISEASE_TYPES.WATER) {
            if (sanitationStress > 0.7) riskFactor = 0.9;
            else if (sanitationStress > 0.4) riskFactor = 0.5;
        }
        else if (disease.type === DISEASE_TYPES.RESPIRATORY) {
            // Random seasonal + density proxy
            riskFactor = (hriScore > 5) ? 0.3 : 0.1;
            if (seed % 3 === 0) riskFactor += 0.4; // Random "outbreak" spot
        }
        else if (disease.type === DISEASE_TYPES.HEAT) {
            // Heat risk proxy (using HRI as rough guide if no direct temp)
            if (vectorDensity < 0.2 && hriScore > 5) riskFactor = 0.7; // Low green, high risk
        }

        // ADD NOISE
        const rand = Math.sin(seed + seedOffset) * 10000;
        const noise = rand - Math.floor(rand); // 0-1

        if (riskFactor > 0.7 && noise > 0.3) {
            cases = Math.floor(10 + (noise * 30));
            trend = noise > 0.7 ? 'Rising' : 'Stable';
            if (cases > 25) cluster = 'confirmed Cluster';
        } else if (riskFactor > 0.3 && noise > 0.6) {
            cases = Math.floor(1 + (noise * 10));
            trend = 'Stable';
        }

        // ZERO CASE OVERRIDE (Safety)
        if (cases === 0) {
            trend = 'No Activity';
            cluster = 'None';
        }

        return { cases, trend, cluster };
    };

    // GENERATE FOR ALL DISEASE TYPES
    const allDiseases = Object.values(DISEASES).map((d, index) => {
        const stats = calculateCases(d, index);
        const active = { ...d, activeCases: stats.cases, trend: stats.trend, cluster: stats.cluster };
        // Hydrate timeline immediately
        active.timeline = generateDiseaseTimeline(active, wardName);
        return active;
    });

    return allDiseases;
};

/**
 * Generates a deterministic 30-day case history based on current status.
 * @param {Object} disease - The disease object found in the signal (e.g., { activeCases, trend, name }).
 * @param {string} wardName - Used for seeding random variances.
 * @returns {Array} - Array of { date, cases, status } objects.
 */
export const generateDiseaseTimeline = (disease, wardName) => {
    if (!disease || disease.activeCases === 0) return [];

    const history = [];
    const seed = wardName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const today = new Date();

    let currentCases = disease.activeCases;

    // Helper for deterministic random
    const pseudoRandom = (dayOffset) => {
        const x = Math.sin(seed + dayOffset) * 10000;
        return x - Math.floor(x);
    };

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        let count = 0;
        const noise = Math.floor(pseudoRandom(i) * 3) - 1; // -1, 0, 1

        if (disease.trend === 'Rising' || disease.trend === 'Rapidly Rising' || disease.trend === 'Explosive') {
            // Logarithmic ramp up: cases were lower 30 days ago
            // Formula: cases * (1 - (i / 35)) roughly
            // Day 0 (30 days ago) -> small fraction
            // Day 29 (Today) -> full cases
            const progress = (30 - i) / 30; // 0 to 1
            const base = Math.max(0, Math.floor(disease.activeCases * Math.pow(progress, 2))); // Exponential growth reverse look
            count = Math.max(0, base + noise);
        }
        else if (disease.cluster && disease.cluster.includes('Cluster')) {
            // Sudden spike in last 7 days
            if (i < 7) {
                count = Math.max(1, disease.activeCases - (i * 1) + noise); // High recently
            } else {
                count = Math.max(0, Math.floor(disease.activeCases * 0.2) + noise); // Low baseline
            }
        }
        else {
            // Stable / Seasonal: Fluctuation around mean
            count = Math.max(0, disease.activeCases + noise);
        }

        // Status logic
        let status = 'Suspected';
        if (i < 5) status = 'Confirmed'; // Recent ones confirmed
        if (count === 0) status = '-';

        history.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            cases: count,
            status: count > 0 ? status : '-'
        });
    }

    return history.reverse(); // Newest first
};
