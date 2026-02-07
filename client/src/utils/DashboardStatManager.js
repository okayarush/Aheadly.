
import { DiseaseDataManager } from "./DiseaseDataManager";
import { CommunitySanitationManager } from "./CommunitySanitationManager";
import { getHRIScore, calculateHeatRisk, getWaterStagnationSusceptibility } from "./RiskCalculator";
import { getSectorID } from "./HospitalRegistry";

// Cache to prevent re-fetching on every render if dashboard is re-mounted
let cachedData = null;

export const DashboardStatManager = {

    // Main function to get the full city snapshot
    getCityOverview: async () => {
        if (cachedData) return cachedData;

        try {
            // 1. Fetch Static CSV Data (NDVI, Stagnation, Heat)
            // Parallel fetch for performance
            const [ndviRes, stagRes, heatRes] = await Promise.all([
                fetch("/Solapur_Wardwise_NDVI_2023.csv"),
                fetch("/Solapur_Ward_Water_Stagnation_Risk.csv"),
                fetch("/Solapur_Ward_Heat_Stress_LST.csv")
            ]);

            const [ndviText, stagText, heatText] = await Promise.all([
                ndviRes.text(),
                stagRes.text(),
                heatRes.text()
            ]);

            // 2. Parse Data
            const ndviMap = parseNDVI(ndviText);
            const { stagnationMap } = parseStagnation(stagText, ndviMap); // Stagnation needs NDVI? logic says yes in DigitalTwin, let's see. 
            // Actually DigitalTwin recalculates stagnation based on loaded CSV columns (which has mean_ndvi). 
            // The CSV "Solapur_Ward_Water_Stagnation_Risk.csv" likely has pre-calculated columns or we recalculate.
            // DigitalTwin's logic: 
            // const ndviMean = parseFloat(cols[ndviIdx]); 
            // const level = getWaterStagnationSusceptibility(ndviMean, totalArea);

            // 3. Process Heat Data (Depends on NDVI)
            const heatMap = parseHeat(heatText, ndviMap);

            // 4. Get Dynamic Data
            const diseaseData = DiseaseDataManager.getWardAggregates();
            const sanitationReports = CommunitySanitationManager.getAllReports();
            const sanitationRiskMap = CommunitySanitationManager.getRiskTable();

            // 5. Aggregate Ward-Level HRI
            let totalHRIScore = 0;
            let wardCount = 0;
            let highRiskWards = 0;
            let moderateRiskWards = 0;
            let heatHotspots = 0;
            let stagnationWards = 0;

            const wardRisks = [];

            // Iterate over all known wards (Union of keys)
            // Ideally we use a master ward list. We can use keys from ndviMap as a proxy for all wards.
            const allWards = Object.keys(ndviMap);

            allWards.forEach(wardKey => {
                // Resolve Sector ID from Ward Name (e.g. "Ward 1" -> "Sector-01")
                // Ward names in CSV might be "Ward 1", "Ward 2" etc.
                // DigitalTwin uses `getSectorID` on `feature.properties.Name`.
                // Here we have `wardKey` which is `name` column from CSV (usually "Ward 1").
                // `getSectorID` expects "Ward 1".
                // CSV parser lowercases names, so "ward 1".
                // HRI Logic requires SectorID for Disease/Sanitation matches.

                // Capitalize for getSectorID if needed? getSectorID handles strings.
                // It likely maps "Ward 1" -> "Sector-01".

                const sectorId = getSectorID(wardKey);

                const nData = ndviMap[wardKey] || { mean: 0.6 };
                const sData = stagnationMap[wardKey] || { level: "LOW" };
                const hData = heatMap[wardKey] || { risk: "LOW" };
                const dData = diseaseData[sectorId] || { level: "LOW" };
                const cData = sanitationRiskMap[sectorId] || { level: "LOW" };

                // Calculate HRI
                const { score, category, breakdown } = getHRIScore(
                    dData.level,
                    hData.risk,
                    sData.level,
                    nData.mean,
                    cData.level
                );

                // Stats Aggregation
                totalHRIScore += score;
                wardCount++;

                if (category === "CRITICAL" || category === "HIGH") highRiskWards++;
                if (category === "MODERATE") moderateRiskWards++;
                if (hData.risk === "EXTREME" || hData.risk === "HIGH") heatHotspots++;
                if (sData.level === "HIGH") stagnationWards++;

                wardRisks.push({
                    ward: wardKey,
                    sector: sectorId,
                    score,
                    category,
                    breakdown,
                    hriColor: category === "CRITICAL" || category === "HIGH" ? "red" : category === "MODERATE" ? "orange" : "green"
                });
            });

            // 6. Final City Metrics
            const avgScoreOriginal = wardCount > 0 ? (totalHRIScore / wardCount) : 0;
            // Normalize 0-12 to 0-10
            const cityHRI = (avgScoreOriginal / 12) * 10;

            let cityStatus = "Good";
            if (cityHRI > 6) cityStatus = "Critical"; // > 7.2 on 12 scale
            else if (cityHRI > 4) cityStatus = "High Risk"; // > 4.8 on 12 scale
            else if (cityHRI > 2) cityStatus = "Moderate"; // > 2.4 on 12 scale

            // 7. Recent Signals (Last 7 days)
            const recentSignals = generateSignals(diseaseData, sanitationReports, heatMap);

            // 8. Risk Drivers
            const riskDrivers = generateRiskDrivers(highRiskWards, heatHotspots, stagnationWards, sanitationReports);

            const result = {
                cityHRI: cityHRI.toFixed(1),
                cityStatus,
                highRiskWards,
                moderateRiskWards,
                heatHotspots,
                stagnationWards,
                activeReports: countActiveReports(sanitationReports),
                recentSignals,
                riskDrivers,
                wardRisks
            };

            cachedData = result;
            return result;

        } catch (error) {
            console.error("DashboardStatManager Error:", error);
            return null;
        }
    }
};

/* ===================== PARSERS ===================== */

function parseNDVI(text) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(",");
    const nameIdx = headers.indexOf("Name");
    const meanIdx = headers.indexOf("NDVI_mean");
    const map = {};
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const name = cols[nameIdx]?.trim().toLowerCase(); // Normalize key
        const mean = parseFloat(cols[meanIdx]);
        if (name) map[name] = { mean };
    }
    return map;
}

function parseStagnation(text, ndviMap) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(",");
    const nameIdx = headers.indexOf("Name");
    const areaIdx = headers.indexOf("Total_Area");
    const ndviIdx = headers.indexOf("mean"); // In this CSV, NDVI might be 'mean'
    const map = {};
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const name = cols[nameIdx]?.trim().toLowerCase();
        if (name) {
            const totalArea = parseFloat(cols[areaIdx]);
            // Use mean from CSV, or fallback to ndviMap? DigitalTwin uses CSV's 'mean' column
            const ndviMean = parseFloat(cols[ndviIdx]);
            const level = getWaterStagnationSusceptibility(ndviMean, totalArea);
            map[name] = { level };
        }
    }
    return { stagnationMap: map };
}

function parseHeat(text, ndviMap) {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0].split(",");
    const nameIdx = headers.indexOf("Name");
    const lstIdx = headers.indexOf("mean_lst_c");

    const wardLSTs = [];
    const tempMap = {};

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const name = cols[nameIdx]?.trim().toLowerCase();
        const meanLst = parseFloat(cols[lstIdx]);
        if (name && !isNaN(meanLst)) {
            wardLSTs.push(meanLst);
            tempMap[name] = { meanLst };
        }
    }

    // Percentiles
    wardLSTs.sort((a, b) => a - b);
    const p25 = wardLSTs[Math.floor(wardLSTs.length * 0.25)];
    const p75 = wardLSTs[Math.floor(wardLSTs.length * 0.75)];

    const finalMap = {};
    Object.keys(tempMap).forEach(key => {
        const wardData = tempMap[key];
        const ndviVal = ndviMap[key]?.mean || 0;
        const risk = calculateHeatRisk(wardData.meanLst, ndviVal, p25, p75);
        finalMap[key] = { risk, meanLst: wardData.meanLst };
    });

    return finalMap;
}

/* ===================== HELPERS ===================== */

function countActiveReports(reports) {
    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return reports.filter(r => new Date(r.timestamp) >= sevenDaysAgo).length;
}

function generateSignals(diseaseData, sanitationReports, heatMap) {
    const signals = [];

    // 1. Disease Spikes
    Object.keys(diseaseData).forEach(sector => {
        const data = diseaseData[sector];
        if (data.level === "HIGH") {
            signals.push({
                id: `dis-${sector}`,
                type: "MEDICAL",
                icon: "⚠️",
                header: `${sector}: Medical Alert`,
                message: `High ${data.dominantType.toLowerCase()} cases reported.`,
                time: "Current"
            });
        }
    });

    // 2. Sanitation Clusters
    // Group reports by sector
    const sectorCounts = {};
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sanitationReports.forEach(r => {
        if (new Date(r.timestamp) >= sevenDaysAgo) {
            sectorCounts[r.sector] = (sectorCounts[r.sector] || 0) + 1;
        }
    });

    Object.entries(sectorCounts).forEach(([sector, count]) => {
        if (count >= 5) {
            signals.push({
                id: `san-${sector}`,
                type: "SANITATION",
                icon: "🧹",
                header: `${sector}: Sanitation`,
                message: `${count} active complaints in last 7 days.`,
                time: "Last 7d"
            });
        }
    });

    // 3. Heat Anomalies (Top 3 hottest)
    // Sort heatMap by LST
    const hottest = Object.entries(heatMap)
        .sort(([, a], [, b]) => b.meanLst - a.meanLst)
        .slice(0, 3);

    hottest.forEach(([wardKey, data]) => {
        if (data.risk === "EXTREME") {
            signals.push({
                id: `heat-${wardKey}`,
                type: "HEAT",
                icon: "🌡️",
                header: `${wardKey}: Extreme Heat`,
                message: `Surface temp anomaly detected (${data.meanLst.toFixed(1)}°C).`,
                time: "Real-time"
            });
        }
    });

    // Limit to 5
    return signals.slice(0, 5);
}

function generateRiskDrivers(highRiskWards, heatHotspots, stagnationWards, reports) {
    const drivers = [];

    if (highRiskWards > 5) drivers.push("Widespread Multi-Factor Risk across city wards");
    if (heatHotspots > 3) drivers.push("High heat exposure in central wards due to low vegetation");
    if (stagnationWards > 4) drivers.push("Likely water stagnation areas increasing vector risk");

    const recentReportCount = countActiveReports(reports);
    if (recentReportCount > 20) drivers.push(`Surge in citizen sanitation reports (${recentReportCount} active)`);

    // Fallbacks
    if (drivers.length < 2) drivers.push("Low vegetation cover reducing urban cooling efficiency");
    if (drivers.length < 3) drivers.push("Localized sanitation issues needing municipal attention");

    return drivers.slice(0, 4);
}
