/**
 * Intervention Impact Map
 * 
 * STRICT ARCHITECTURE RULE:
 * This file defines STATIC IMPACT DELTAS.
 * It does NOT contain formulas or dynamic logic.
 * It maps an Intervention Type -> Component Delta (Magnitude/Direction).
 */

export const INTERVENTION_IMPACT_MAP = {
    'mobile-health-camp': {
        name: "Mobile Health Camp",
        description: "Deploying rapid response medical teams to high, acute-risk zones.",
        riskDrivers: ['vectorDensity', 'sanitationStress'],
        affectedComponents: {
            vectorDensity: -2.0, // High impact on immediate risk
            sanitationStress: -1.0
        },
        feasibility: "High",
        costCategory: "Low",
        effort: "Immediate",
        executionSteps: [
            "Identify cluster of recent fever/gastro cases.",
            "Deploy mobile van with diagnostic kits (RDTs) and basic meds.",
            "Distribute ORS/Zinc and conduct on-spot awareness.",
            "Refer severe cases to nearest Urban Health Center (UHC)."
        ],
        expectedHealthImpact: "Immediate reduction in untreated morbidity; prevents progression of acute outbreaks."
    },
    'disease-surveillance': {
        name: "Intensified Surveillance",
        description: "Active case finding and larval surveys in hotspot wards.",
        riskDrivers: ['vectorDensity', 'waterStagnation'],
        affectedComponents: {
            vectorDensity: -1.5,
            waterStagnation: -0.5
        },
        feasibility: "Medium",
        costCategory: "Low",
        effort: "Ongoing",
        executionSteps: [
            "Deploy health workers for House-to-House (H2H) surveys.",
            "Map active breeding sites using GIS mobile app.",
            "Report daily fever count to Municipal surveillance unit.",
            "Issue immediate notices to households with breeding spots."
        ],
        expectedHealthImpact: "Early detection of outbreak clusters allows for preemptive containment."
    },
    'fogging-campaign': {
        name: "Targeted Fogging",
        description: "Emergency vector control measure in high-risk zones.",
        riskDrivers: ['vectorDensity'],
        affectedComponents: {
            vectorDensity: -2.5
        },
        feasibility: "High",
        costCategory: "Medium",
        effort: "Immediate",
        executionSteps: [
            "Delimit high-risk zones based on active disease signals.",
            "Schedule fogging during peak mosquito activity (dusk/dawn).",
            "Notify residents to cover water and food sources.",
            "Conduct follow-up larval survey after 48 hours."
        ],
        expectedHealthImpact: "Rapidly knocks down adult mosquito population, breaking immediate disease transmission cycles."
    },
    'sanitation-response': {
        name: "Sanitation Rapid Response",
        description: "Emergency cleanup of open dumps and overflow drains.",
        riskDrivers: ['sanitationStress', 'vectorDensity'],
        affectedComponents: {
            sanitationStress: -2.0,
            vectorDensity: -1.0
        },
        feasibility: "High",
        costCategory: "Medium",
        effort: "Immediate",
        executionSteps: [
            "Deploy fast-response sanitation squad to reported blackspots.",
            "Clear open waste piles and sprinkle bleaching powder.",
            "Unclog critical drain choke points manually.",
            "Install temporary bins if needed."
        ],
        expectedHealthImpact: "Removes immediate pathogen sources and breeding grounds, reducing enteric and vector risk."
    },
    'drain-desilting': {
        name: "Drain Desilting",
        description: "Clearing clogged drains to improve flow.",
        riskDrivers: ['waterStagnation', 'vectorDensity'],
        affectedComponents: {
            waterStagnation: -1.5,
            sanitationStress: -0.5,
            vectorDensity: -0.5
        },
        feasibility: "High",
        costCategory: "Low",
        effort: "Short-term",
        executionSteps: [
            "Identify blockage points using ward map.",
            "Deploy manual/mechanical desilting crews pre-monsoon.",
            "Ensure safe disposal of silt at designated landfills.",
            "Install wire mesh guards to prevent solid waste entry."
        ],
        expectedHealthImpact: "Reduces standing water, lowering dengue/malaria vector breeding potential."
    },
    'cool-roofing': {
        name: "Cool Roofing",
        description: "Painting roofs white to lower indoor temps.",
        riskDrivers: ['heatExposure'],
        affectedComponents: {
            heatExposure: -2.0
        },
        feasibility: "High",
        costCategory: "Low",
        effort: "Short-term",
        executionSteps: [
            "Identify low-income households with tin/asbestos roofs.",
            "Apply high-albedo white reflective coating (lime-based or synthetic).",
            "Monitor indoor surface temperature reduction.",
            "Re-apply coating annually pre-summer."
        ],
        expectedHealthImpact: "Lowers indoor temperatures by 3-5°C, significantly reducing heat stress."
    }
};

export const getAvailableInterventions = () => {
    return Object.entries(INTERVENTION_IMPACT_MAP).map(([id, data]) => ({
        id,
        ...data
    }));
};
