import { SECTOR_LIST } from './HospitalRegistry';

const STORAGE_KEY = 'urbanome_disease_state_v3'; // Versioned to force clear old data

export class DiseaseDataManager {

    // --- INITIALIZATION ---
    static initializeBaselineData() {
        const existing = localStorage.getItem(STORAGE_KEY);
        if (existing) return; // Data exists, do nothing

        const mockData = {};

        // 1. HARDCODED PRESET DATA (Ensures variance)
        // We explicitly define some sectors to have specific risks
        const presets = {
            "Sector-01": { dengue: 8, malaria: 2, chikungunya: 0, ari: 5, ili: 3, add: 1, typhoid: 0, cholera: 0, heat: 0 }, // Moderate Cluster (~19 total)
            "Sector-02": { dengue: 0, malaria: 0, chikungunya: 0, ari: 2, ili: 1, add: 0, typhoid: 0, cholera: 0, heat: 0 },      // Green (Routine)
            "Sector-03": { dengue: 10, malaria: 3, chikungunya: 1, ari: 4, ili: 2, add: 1, typhoid: 0, cholera: 0, heat: 1 },  // High Vector (~22 total)
            "Sector-04": { dengue: 0, malaria: 0, chikungunya: 0, ari: 0, ili: 0, add: 0, typhoid: 0, cholera: 0, heat: 0 },        // Green (Clean)
            "Sector-05": { dengue: 1, malaria: 0, chikungunya: 0, ari: 2, ili: 1, add: 15, typhoid: 5, cholera: 2, heat: 0 },  // Water Outbreak (~26 total - Max)
            "Sector-06": { dengue: 1, malaria: 0, chikungunya: 0, ari: 3, ili: 1, add: 0, typhoid: 0, cholera: 0, heat: 0 },       // Green/Yellow
            "Sector-12": { dengue: 3, malaria: 1, chikungunya: 0, ari: 2, ili: 1, add: 2, typhoid: 0, cholera: 0, heat: 0 },     // Yellow (Watch)
        };

        SECTOR_LIST.forEach((sector) => {
            let data = presets[sector];

            // Fallback for others: Mostly Green/Yellow (Realism)
            const rand = Math.random();
            if (rand > 0.8) {
                // 20% Yellow/Orange (3-8 cases total)
                data = {
                    dengue: Math.floor(Math.random() * 3),
                    malaria: Math.floor(Math.random() * 2),
                    chikungunya: 0,
                    ari: Math.floor(Math.random() * 4),
                    ili: Math.floor(Math.random() * 2),
                    add: Math.floor(Math.random() * 2),
                    typhoid: 0,
                    cholera: 0,
                    heat: Math.floor(Math.random() * 2)
                };
            } else {
                // 80% Green (Healthy - 0-3 cases total)
                data = {
                    dengue: Math.floor(Math.random() * 2), // 0 or 1
                    malaria: 0,
                    chikungunya: 0,
                    ari: Math.floor(Math.random() * 2), // 0 or 1
                    ili: 0,
                    add: 0, typhoid: 0, cholera: 0, heat: 0
                };
            }

            // Compute Derived Stats
            const total =
                (data.dengue || 0) + (data.malaria || 0) + (data.chikungunya || 0) +
                (data.add || 0) + (data.cholera || 0) + (data.typhoid || 0) +
                (data.ari || 0) + (data.ili || 0) +
                (data.heat || 0);
            const level = this.computeLevel(total);

            mockData[sector] = {
                ...data,
                total,
                level,
                dominantType: this.computeDominantType(data)
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
            currentData[sector] = {
                dengue: 0, malaria: 0, chikungunya: 0,
                add: 0, cholera: 0, typhoid: 0,
                ari: 0, ili: 0,
                heat: 0,
                total: 0, level: "LOW", dominantType: "None"
            };
        }

        // ADD counts - Vector
        currentData[sector].dengue = (currentData[sector].dengue || 0) + (parseInt(report.dengue) || 0);
        currentData[sector].malaria = (currentData[sector].malaria || 0) + (parseInt(report.malaria) || 0);
        currentData[sector].chikungunya = (currentData[sector].chikungunya || 0) + (parseInt(report.chikungunya) || 0);

        // ADD counts - Water
        currentData[sector].add = (currentData[sector].add || 0) + (parseInt(report.add) || 0);
        currentData[sector].cholera = (currentData[sector].cholera || 0) + (parseInt(report.cholera) || 0);
        currentData[sector].typhoid = (currentData[sector].typhoid || 0) + (parseInt(report.typhoid) || 0);

        // ADD counts - Respiratory
        currentData[sector].ari = (currentData[sector].ari || 0) + (parseInt(report.ari) || 0);
        currentData[sector].ili = (currentData[sector].ili || 0) + (parseInt(report.ili) || 0);

        // ADD counts - Heat
        currentData[sector].heat = (currentData[sector].heat || 0) + (parseInt(report.heat) || 0);

        // Recompute Total
        const total =
            currentData[sector].dengue + currentData[sector].malaria + currentData[sector].chikungunya +
            currentData[sector].add + currentData[sector].cholera + currentData[sector].typhoid +
            currentData[sector].ari + currentData[sector].ili +
            currentData[sector].heat;

        currentData[sector].total = total;
        currentData[sector].level = this.computeLevel(total);
        currentData[sector].dominantType = this.computeDominantType(currentData[sector]);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));

        // Dispatch Global Event
        window.dispatchEvent(new Event('urbanome-data-update'));

        return true;
    }

    // --- HELPERS ---
    static computeLevel(total) {
        if (total >= 16) return "HIGH";
        if (total >= 8) return "MEDIUM";
        return "LOW";
    }

    static computeDominantType(data) {
        // Group totals
        const vector = (data.dengue || 0) + (data.malaria || 0) + (data.chikungunya || 0);
        const water = (data.add || 0) + (data.cholera || 0) + (data.typhoid || 0);
        const respiratory = (data.ari || 0) + (data.ili || 0);
        const heat = (data.heat || 0);

        const max = Math.max(vector, water, respiratory, heat);

        if (max === 0) return "None";
        if (vector === max) return "Vector-Borne";
        if (water === max) return "Water-Borne";
        if (respiratory === max) return "Respiratory";
        return "Heat-Related";
    }
}
