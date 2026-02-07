import { SECTOR_LIST } from './HospitalRegistry';

const STORAGE_KEY = 'urbanome_disease_state_v2'; // Versioned to force clear old data

export class DiseaseDataManager {

    // --- INITIALIZATION ---
    static initializeBaselineData() {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (existing) return; // Data exists, do nothing

        const mockData = {};

        // 1. HARDCODED PRESET DATA (Ensures variance)
        // We explicitly define some sectors to have specific risks
        const presets = {
            "Sector-01": { fever: 140, diarrhea: 30, respiratory: 50 }, // Total: 220 -> HIGH
            "Sector-02": { fever: 40, diarrhea: 10, respiratory: 20 },  // Total: 70 -> MEDIUM
            "Sector-03": { fever: 90, diarrhea: 25, respiratory: 35 },  // Total: 150 -> HIGH
            "Sector-04": { fever: 15, diarrhea: 5, respiratory: 8 },    // Total: 28 -> LOW
            "Sector-05": { fever: 100, diarrhea: 100, respiratory: 20 },// Total: 220 -> HIGH (Diarrhea Dominant)
            "Sector-06": { fever: 10, diarrhea: 10, respiratory: 30 },  // Total: 50 -> LOW
            "Sector-12": { fever: 20, diarrhea: 80, respiratory: 20 }   // Total: 120 -> MEDIUM (Diarrhea Dominant)
        };

        SECTOR_LIST.forEach((sector) => {
            let data = presets[sector];

            if (!data) {
                // Fallback for others: Random LOW/MEDIUM
                const fever = Math.floor(Math.random() * 30);
                const diarrhea = Math.floor(Math.random() * 20);
                const respiratory = Math.floor(Math.random() * 30);
                data = { fever, diarrhea, respiratory };
            }

            // Compute Derived Stats
            const total = data.fever + data.diarrhea + data.respiratory;
            const level = this.computeLevel(total);

            mockData[sector] = {
                ...data,
                total,
                level,
                dominantType: this.computeDominantType(data.fever, data.diarrhea, data.respiratory)
            };
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
        console.log("Initialized Foolproof Baseline Data (Sector-XX)");
    }

    // --- READ ---
    static getWardAggregates() {
        this.initializeBaselineData();
        const json = localStorage.getItem(STORAGE_KEY);
        return json ? JSON.parse(json) : {};
    }

    // --- WRITE ---
    static saveReport(report) {
        const currentData = this.getWardAggregates();
        const sector = report.ward;

        if (!currentData[sector]) {
            // Should not happen, but safeguard
            currentData[sector] = { fever: 0, diarrhea: 0, respiratory: 0, total: 0, level: "LOW", dominantType: "None" };
        }

        // ADD counts
        currentData[sector].fever += (parseInt(report.fever) || 0);
        currentData[sector].diarrhea += (parseInt(report.diarrhea) || 0);
        currentData[sector].respiratory += (parseInt(report.respiratory) || 0);

        // Recompute
        const total = currentData[sector].fever + currentData[sector].diarrhea + currentData[sector].respiratory;
        currentData[sector].total = total;
        currentData[sector].level = this.computeLevel(total);
        currentData[sector].dominantType = this.computeDominantType(
            currentData[sector].fever,
            currentData[sector].diarrhea,
            currentData[sector].respiratory
        );

        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));

        // Dispatch Global Event
        window.dispatchEvent(new Event('urbanome-data-update'));

        return true;
    }

    // --- HELPERS ---
    static computeLevel(total) {
        if (total >= 150) return "HIGH";
        if (total >= 60) return "MEDIUM";
        return "LOW";
    }

    static computeDominantType(f, d, r) {
        const max = Math.max(f, d, r);
        if (max === 0) return "None";
        if (f === max) return "Fever";
        if (d === max) return "Diarrhea";
        return "Respiratory";
    }
}
