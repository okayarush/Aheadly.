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

    // TARGET: sum must exactly equal disease.activeCases
    let remainingCases = disease.activeCases;
    const days = 30;
    const dailyCounts = new Array(days).fill(0);

    // Helper for deterministic random seeding
    const pseudoRandom = (seed, offset) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
    };

    // Distribute cases based on trend
    // Strategy: Assign cases one by one to days based on probability distribution
    for (let c = 0; c < remainingCases; c++) {
        let dayIndex = -1;

        // Distribution weights based on trend
        // Rising: Higher probability for recent days (index 0 is Today)
        // Stable: Uniform probability
        // No Activity: Should not happen if cases > 0

        const rand = pseudoRandom(seed, c * 13); // Varied random per case

        if (disease.trend === 'Rising' || disease.trend === 'Surge') {
            // Skew towards 0 (Today)
            // Weight ~ 1 / (day + 1)
            // Simple approach: pick two random days, choose the smaller index (closer to today)
            const r1 = Math.floor(pseudoRandom(seed, c * 7) * days);
            const r2 = Math.floor(pseudoRandom(seed, c * 19) * days);
            dayIndex = Math.min(r1, r2);
        } else {
            // Uniform distribution
            dayIndex = Math.floor(rand * days);
        }

        dailyCounts[dayIndex]++;
    }

    // Convert to history array
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const count = dailyCounts[i];
        let status = '-';
        if (count > 0) status = i < 5 ? 'Confirmed' : 'Suspected';

        history.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            cases: count,
            status
        });
    }

    // existing code returned history.reverse() but our loop builds today -> past (history[0] is today)
    // The previous implementation built past->present (reverse loop 29 to 0) and then returned history.reverse() => trend was generic.
    // Here we built 0 (Today) to 29 (Past). 
    // If the UI expects [Yesterday, Today], or [Day -29 ... Today], we need to check.
    // Looking at the table rendering: map(row => tr) suggests order matters.
    // Usually tables show recent first.
    // Let's return it as is (Today first).
    return history;
};

/**
 * Converts stored flat report data (from DiseaseDataManager) into the UI Signal format.
 * Replaces mock generation with Real Data for Digital Twin dashboard.
 */
export const formatDiseaseSignalFromData = (wardName, data) => {
    // Basic structural data structure if data is missing
    const safeData = data || { dengue: 0, malaria: 0, chikungunya: 0, add: 0, cholera: 0, typhoid: 0, ari: 0, ili: 0, heat: 0 };

    // 1. Create Array of all diseases with current counts
    const allDiseases = [
        { ...DISEASES.DENGUE, activeCases: safeData.dengue || 0 },
        { ...DISEASES.MALARIA, activeCases: safeData.malaria || 0 },
        { ...DISEASES.CHIKUNGUNYA, activeCases: safeData.chikungunya || 0 },
        { ...DISEASES.ADD, activeCases: safeData.add || 0 },
        { ...DISEASES.CHOLERA, activeCases: safeData.cholera || 0 },
        { ...DISEASES.TYPHOID, activeCases: safeData.typhoid || 0 },
        { ...DISEASES.ARI, activeCases: safeData.ari || 0 },
        { ...DISEASES.ILI, activeCases: safeData.ili || 0 },
        { ...DISEASES.HEAT_STRESS, activeCases: safeData.heat || 0 }
    ];

    // 2. Add Trend/Cluster Logic (Simple thresholds for now)
    const processed = allDiseases.map(d => {
        let trend = 'Stable';
        let cluster = 'None';

        if (d.activeCases > 50) {
            trend = 'Surge';
            cluster = 'Outbreak';
        } else if (d.activeCases > 15) {
            trend = 'Rising';
            cluster = 'Cluster';
        } else if (d.activeCases === 0) {
            trend = 'No Activity';
        }

        // Hydrate timeline for charts
        d.timeline = generateDiseaseTimeline({ ...d, trend, cluster }, wardName);
        d.trend = trend;
        d.cluster = cluster;

        return d;
    });

    // 3. Filter & Sort for "Active" display
    const activeDetails = processed.filter(d => d.activeCases > 0).sort((a, b) => {
        // 1. Case Count (Descending)
        if (b.activeCases !== a.activeCases) return b.activeCases - a.activeCases;

        // 2. Trend (Rising > Stable > No Activity)
        const trendScore = { 'Surge': 3, 'Rising': 2, 'Stable': 1, 'No Activity': 0 };
        if (trendScore[b.trend] !== trendScore[a.trend]) return trendScore[b.trend] - trendScore[a.trend];

        // 3. Type Priority (Vector > Water > Respiratory > Heat)
        const typeScore = { 'Vector-Borne': 4, 'Water-Borne': 3, 'Respiratory': 2, 'Heat-Related': 1, 'None': 0 };
        if (typeScore[b.type] !== typeScore[a.type]) return typeScore[b.type] - typeScore[a.type];

        // 4. Name (Alphabetical fallback for absolute determinism)
        return a.name.localeCompare(b.name);
    });

    // 4. Determine Primary (Headline) Disease
    const primary = activeDetails.length > 0
        ? activeDetails[0]
        : { name: 'No Active Signal', type: 'None', activeCases: 0, trend: 'No Activity', cluster: 'None', timeline: [], transmission: 'None', vector: 'None' };

    const secondary = activeDetails.length > 1 ? activeDetails.slice(1) : [];

    return {
        primary,
        secondary,
        summary: `${primary.name}: ${primary.activeCases} active cases`,
        profile: processed // Return full list for deep dive
    };
};
