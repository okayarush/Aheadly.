import React, { useEffect, useState, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styled from "styled-components";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ImageOverlay,
  Marker,
  Popup
} from "react-leaflet";
import L from "leaflet";
import { FiMap, FiActivity, FiLayers, FiSun, FiAlertCircle, FiUsers, FiTrash2, FiDroplet, FiAlertTriangle, FiX, FiCalendar } from "react-icons/fi";
import { DiseaseDataManager } from "../utils/DiseaseDataManager";
import { CommunitySanitationManager } from "../utils/CommunitySanitationManager";
import { getSectorID } from "../utils/HospitalRegistry"; // Import Sector Mapper
import { generateDiseaseSignal, generateDiseaseTimeline, getWardDiseaseProfile, formatDiseaseSignalFromData } from "../services/diseaseService";
import "leaflet/dist/leaflet.css";
import {
  getNDVIStatus, getNDVIReason, getNDVIColor,
  getWaterStagnationSusceptibility, getStagnationReason, getStagnationColor,
  getHeatRiskColor, getHeatRiskReason, calculateHeatRisk,
  getTrendArrow, getDiseaseColor, getDiseaseReason,
  getHRIScore, getHRIColor
} from "../utils/RiskCalculator";
import PortalBanner from "../components/common/PortalBanner";
import { SECTOR_HEALTH_PROFILES, plannerQueue } from "../services/plannerState";

/* ===================== ICONS ===================== */

const createIcon = (iconComponent, color) => {
  const markup = renderToStaticMarkup(
    <div style={{
      backgroundColor: "white",
      border: `2px solid ${color}`,
      borderRadius: "50%",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 5px rgba(0,0,0,0.3)"
    }}>
      {React.cloneElement(iconComponent, { size: 14, color: color })}
    </div>
  );

  return L.divIcon({
    html: markup,
    className: "custom-leaflet-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const SANITATION_ICONS = {
  "Uncollected Garbage": createIcon(<FiTrash2 />, "#8B4513"), // Brown
  "Open Drain / Sewage": createIcon(<FiAlertCircle />, "#f97316"), // Orange (Warning)
  "Stagnant Water": createIcon(<FiDroplet />, "#0891b2"), // Cyan
  "Overflowing Public Bin": createIcon(<FiTrash2 />, "#d97706"), // Amber
  "Broken Public Toilet": createIcon(<FiAlertTriangle />, "#dc2626") // Red
};

const HEALTH_CONTEXT = {
  "Uncollected Garbage": "Prolonged garbage accumulation can increase exposure to disease vectors such as flies and rodents, which may elevate local infection risk if persistent.",
  "Open Drain / Sewage": "Open drains can facilitate pathogen spread and increase the likelihood of water-borne and vector-related illnesses during warm or wet periods.",
  "Stagnant Water": "Stagnant water creates favorable conditions for mosquito breeding, which can amplify vector-related disease risk if not addressed.",
  "Overflowing Public Bin": "Overflowing bins attract pests and animals, potentially spreading waste and pathogens to the surrounding area.",
  "Broken Public Toilet": "Lack of functional sanitation facilities increases open defecation risks and hygiene-related exposure pathogens."
};

// Helper: Select representative reports (Max 4 per sector)
const getRepresentativeReports = (allReports) => {
  if (!allReports || allReports.length === 0) return [];

  const sectorGroups = {};
  allReports.forEach(r => {
    if (!sectorGroups[r.sector]) sectorGroups[r.sector] = [];
    sectorGroups[r.sector].push(r);
  });

  let selected = [];

  Object.keys(sectorGroups).forEach(sector => {
    let reports = sectorGroups[sector];
    // Sort by Date (newest first)
    reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pick unique issue types first
    const uniqueIssues = [];
    const seenIssues = new Set();

    // Pass 1: One of each type
    reports.forEach(r => {
      if (!seenIssues.has(r.issue_type) && uniqueIssues.length < 4) {
        uniqueIssues.push(r);
        seenIssues.add(r.issue_type);
      }
    });

    // Pass 2: Fill remaining slots with newest reports if needed (up to 4)
    if (uniqueIssues.length < 4) {
      const remaining = reports.filter(r => !selected.includes(r) && !uniqueIssues.includes(r)); // Logic check: 'selected' is global list, 'uniqueIssues' is local.
      // Actually just take top N from sorted 'reports' that are not already in uniqueIssues?
      // Simpler: Just take uniqueIssues, and if < 4, fill from remaining sorted list

      const needed = 4 - uniqueIssues.length;
      let added = 0;
      for (let r of reports) {
        if (added >= needed) break;
        if (!uniqueIssues.find(u => u.id === r.id)) {
          uniqueIssues.push(r);
          added++;
        }
      }
    }

    selected = selected.concat(uniqueIssues);
  });

  return selected;
};

/* ===================== UI ===================== */

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0d0f14;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  color: white;
  font-family: 'Inter', sans-serif;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
  padding: 0 2rem 2rem;
  flex: 1;
`;

const MapWrapper = styled.div`
  background: rgba(30, 33, 40, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  overflow: hidden;
  height: calc(100vh - 180px);
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
`;

const ControlPanel = styled.div`
  background: rgba(30, 33, 40, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 1.5rem;
  height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
`;

/* ===================== LAYER EXPLANATIONS ===================== */

const LAYER_EXPLANATIONS = {
  hri: {
    title: "Health Rate Index (HRI)",
    desc: "A composite risk score identifying sectors with the highest public health vulnerability.",
    insight: "High-score sectors require immediate municipal intervention to prevent disease outbreaks.",
    uses: ["Disease Burden", "Heat Stress", "Sanitation & Environment"],
    legend: [
      { color: "#2dd48a", label: "Low (0-44)" },
      { color: "#ff8c42", label: "Moderate (45-64)" },
      { color: "#ff4444", label: "High (65-79)" },
      { color: "#cc2200", label: "Critical (80-100)" }
    ]
  },
  disease: {
    title: "Disease Signals (Mock)",
    desc: "Early warning system tracking reported symptom patterns before they become epidemics.",
    insight: "Rising signals indicate environmental triggers or sanitation failures needing action.",
    uses: ["Fever Trends", "Respiratory Spikes", "Diarrhea Clusters"],
    legend: [
      { color: "#cc2200", label: "Outbreak (Critical)" },
      { color: "#ff4444", label: "Rising (High)" },
      { color: "#ff8c42", label: "Moderate (Stable)" },
      { color: "#2dd48a", label: "Low (Stable)" }
    ]
  },
  community: {
    title: "Community Sanitation Reports",
    desc: "Citizen-reported issues that directly amplify disease risk (e.g., stagnant water, garbage).",
    insight: "Clusters of reports often precede visible health outcomes by 1-2 weeks.",
    uses: ["Vector Breeding Sites", "Contamination Risks", "Public Feedback"],
    legend: [
      { color: "#3b82f6", label: "Validated Report" }
    ]
  },
  heat: {
    title: "Urban Heat Health",
    desc: "Surface temperature analysis identifying areas of dangerous heat stress for residents.",
    insight: "High heat worsens chronic conditions (heart/lung) and risks heat stroke in vulnerable groups.",
    uses: ["Heat Retention", "Thermal Comfort"],
    legend: [
      { color: "#31a354", label: "Comfortable" },
      { color: "#fd8d3c", label: "Caution" },
      { color: "#e31a1c", label: "Dangerous Heat" }
    ]
  },
  stagnation: {
    title: "Water Stagnation Risk",
    desc: "Predictive model for water accumulation sites, the primary driver of mosquito-borne diseases.",
    insight: "Stagnant water sites are direct precursors to Dengue and Malaria outbreaks.",
    uses: ["Terrain Drainage", "Mosquito Risk"],
    legend: [
      { color: "#2ecc71", label: "Good Drainage" },
      { color: "#f97316", label: "Possible Stagnation" },
      { color: "#e74c3c", label: "High Vector Risk" }
    ]
  },
  ndvi: {
    title: "Vegetation Cover (NDVI)",
    desc: "Green cover analysis linking environmental health to long-term resident well-being.",
    insight: "Low vegetation correlates with higher heat stress and poorer air quality.",
    uses: ["Cooling Effect", "Air Filtration"],
    legend: [
      { color: "#dc2626", label: "Very Low (Stress)" },
      { color: "#f59e0b", label: "Moderate" },
      { color: "#16a34a", label: "Healthy Cover" }
    ]
  }
};

const DISEASE_PRIORITY_COLORS = {
  CRITICAL: "#cc2200",
  HIGH: "#ff4444",
  MODERATE: "#ff8c42",
  LOW: "#2dd48a"
};

const TREND_LABELS = {
  Outbreak: "⚠ Outbreak Alert",
  Rising: "Rising ↑",
  Stable: "Stable →"
};

const ACTION_INSIGHTS = {
  Outbreak: "Immediate larviciding, fogging, and case isolation recommended.",
  Rising: "Targeted surveillance and source reduction within 48 hours.",
  Stable: "Continue monitoring. No immediate intervention required."
};

const normalizeDiseaseTrend = (trend) => {
  if (!trend) return "Stable";
  const cleaned = trend.toLowerCase();
  if (cleaned.includes("outbreak") || cleaned === "surge") return "Outbreak";
  if (cleaned.includes("rising")) return "Rising";
  return "Stable";
};

const LayerGuidePanel = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 300px;
  background: rgba(30, 33, 40, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  color: white;
  z-index: 1000;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', sans-serif;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DetailPanel = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: calc(100vh - 220px);
  background: rgba(30, 33, 40, 0.9);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  overflow-y: auto;
  z-index: 2000;
  box-shadow: -10px 20px 40px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

const PanelHeader = styled.div`
  padding: 1.25rem;
  background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const DetailSection = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
`;

const TimelineTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-top: 10px;

  th {
    text-align: left;
    padding: 6px;
    color: #94a3b8;
    font-size: 0.75rem;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  
  td {
    padding: 6px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    color: #f8fafc;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const GuideTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
`;

const GuideDesc = styled.p`
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0 0 1rem 0;
`;

const GuideSection = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const GuideLabel = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const LegendRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #e2e8f0;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.color};
  }
`;

const SectionTitle = styled.h4`
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
`;

const ToggleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ToggleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ active }) =>
    active ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.03)"};
  border: 1px solid
    ${({ active }) => (active ? "#6366f1" : "rgba(255,255,255,0.1)")};
  color: ${({ active }) => (active ? "#fff" : "rgba(255,255,255,0.7)")};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active }) =>
    active ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"};
  }
`;



/* ===================== COMPONENT ===================== */

const DigitalTwin = () => {
  // Data States
  const [wards, setWards] = useState(null);
  const [cityBoundary, setCityBoundary] = useState(null);
  const [ndviTable, setNdviTable] = useState({});
  const [stagnationTable, setStagnationTable] = useState({});
  const [heatTable, setHeatTable] = useState({});
  const [diseaseTable, setDiseaseTable] = useState({});
  const [communityReports, setCommunityReports] = useState([]);

  // Detailed Case Log State
  const [selectedWardDetail, setSelectedWardDetail] = useState(null);

  // HRI needs access to Sanitation Risk per ward, which is calculated per sector
  // We can fetch it live or use the Manager directly in the render loop.
  // Ideally we load it into state to trigger re-renders if it changes.
  const [sanitationRiskTable, setSanitationRiskTable] = useState({});

  // UI States
  // activeLayer: "ndvi" | "stagnation" | "heat" | "disease" | "hri" | null (default)
  const [activeLayer, setActiveLayer] = useState(null);
  const [showNDVI, setShowNDVI] = useState(false); // Raster defaults to off
  const [showCommunityReports, setShowCommunityReports] = useState(false); // New Overlay
  const [showWards, setShowWards] = useState(true);
  const [showCityBoundary, setShowCityBoundary] = useState(true);
  const [plannerPill, setPlannerPill] = useState(null);

  // References for imperative Leaflet updates
  const geoJsonRef = useRef(null);
  const selectedLayerRef = useRef(null);
  const [map, setMap] = useState(null);

  // FIX: Track Community Report markers to programmatically close popups
  const markerRefs = useRef({});

  const solapurCenter = [17.6599, 75.9064];

  /* ===================== CONVERGENCE HELPERS ===================== */
  const computeCentroid = (feature) => {
    try {
      const coords = feature.geometry.type === 'MultiPolygon'
        ? feature.geometry.coordinates[0][0]
        : feature.geometry.coordinates[0];
      const lats = coords.map(c => c[1]);
      const lngs = coords.map(c => c[0]);
      return [
        lats.reduce((a, b) => a + b, 0) / lats.length,
        lngs.reduce((a, b) => a + b, 0) / lngs.length
      ];
    } catch { return null; }
  };

  const getConvergenceCount = (nameKey, sectorId) => {
    const dData = diseaseTable[sectorId] || { level: "LOW" };
    const hData = heatTable[nameKey] || { risk: "LOW" };
    const sData = stagnationTable[nameKey] || { level: "LOW" };
    const nData = ndviTable[nameKey] || { mean: 0.6 };
    const cData = sanitationRiskTable[sectorId] || { level: "LOW" };
    let count = 0;
    if (dData.level === "MEDIUM" || dData.level === "HIGH") count++;
    if (hData.risk === "HIGH" || hData.risk === "EXTREME") count++;
    if (sData.level === "HIGH" || sData.level === "MEDIUM") count++;
    if (nData.mean < 0.3) count++;
    if (cData.level === "MEDIUM" || cData.level === "HIGH") count++;
    return count;
  };

  const createConvergenceBadgeIcon = (count) => {
    const bg = count >= 4 ? '#ef4444' : count >= 3 ? '#f97316' : '#6366f1';
    return L.divIcon({
      html: `<div style="background:${bg};color:white;font-size:11px;font-weight:800;border-radius:20px;padding:2px 7px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4);border:2px solid rgba(255,255,255,0.8);line-height:1.4;">${count}/5</div>`,
      className: '',
      iconSize: null,
      iconAnchor: [20, 10]
    });
  };

  // NDVI overlay bounds
  const ndviBounds = [
    [17.579895034149004, 75.81045030614305], // SW
    [17.73157117798467, 75.96217773858825]   // NE
  ];

  /* ===================== POPUP CLEANUP ===================== */
  // MANDATORY: Force close Community Reports popups when switching layers
  useEffect(() => {
    if (activeLayer) {
      // If we switched TO a layer (HRI, Heat, etc.), close all community popups
      Object.values(markerRefs.current).forEach(marker => {
        if (marker) marker.closePopup();
      });
    }
  }, [activeLayer]);

  /* ===================== LOAD DATA ===================== */

  useEffect(() => {
    fetch("/solapur_wards.geojson").then(res => res.json()).then(data => {
      setWards(data);
    });

    // Load Real Disease Data (calculated from LocalStorage)
    const realData = DiseaseDataManager.getWardAggregates();
    setDiseaseTable(realData);

    // Initialize/Load Community Reports (Mock Data)
    CommunitySanitationManager.initializeData();
    setCommunityReports(CommunitySanitationManager.getAllReports());
    setSanitationRiskTable(CommunitySanitationManager.getRiskTable());

    fetch("/solapur_city_boundary.geojson").then(res => res.json()).then(setCityBoundary);

    // 1. Load NDVI Table (Foundation)
    const ndviPromise = fetch("/Solapur_Wardwise_NDVI_2023.csv").then(res => res.text()).then(text => {
      const lines = text.trim().split(/\r?\n/);
      const headers = lines[0].split(",");
      const nameIdx = headers.indexOf("Name");
      const meanIdx = headers.indexOf("NDVI_mean");
      const map = {};
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const name = cols[nameIdx]?.trim().toLowerCase();
        const mean = parseFloat(cols[meanIdx]);
        if (name) map[name] = { mean };
      }
      setNdviTable(map);
      return map;
    });

    // 2. Load Stagnation Table
    fetch("/Solapur_Ward_Water_Stagnation_Risk.csv").then(res => res.text()).then(text => {
      const lines = text.trim().split(/\r?\n/);
      const headers = lines[0].split(",");
      const nameIdx = headers.indexOf("Name");
      const areaIdx = headers.indexOf("Total_Area");
      const ndviIdx = headers.indexOf("mean");
      const slopeIdx = headers.indexOf("mean_slope_deg");
      const map = {};
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const name = cols[nameIdx]?.trim().toLowerCase();
        if (name) {
          const totalArea = parseFloat(cols[areaIdx]);
          const ndviMean = parseFloat(cols[ndviIdx]);
          const slope = parseFloat(cols[slopeIdx]);
          const level = getWaterStagnationSusceptibility(ndviMean, totalArea);
          map[name] = { totalArea, ndviMean, slope, level };
        }
      }
      setStagnationTable(map);
    });

    // 3. Load & Process Heat Table (Dependent on NDVI logic for Final Risk)
    Promise.all([ndviPromise, fetch("/Solapur_Ward_Heat_Stress_LST.csv").then(res => res.text())]).then(([ndviMap, lstText]) => {
      const lines = lstText.trim().split(/\r?\n/);
      const headers = lines[0].split(",");
      const nameIdx = headers.indexOf("Name");
      const lstIdx = headers.indexOf("mean_lst_c");

      const wardLSTs = [];
      const tempMap = {};

      // First pass: collect valid LSTs
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        const name = cols[nameIdx]?.trim().toLowerCase();
        const meanLst = parseFloat(cols[lstIdx]);
        if (name && !isNaN(meanLst)) {
          wardLSTs.push(meanLst);
          tempMap[name] = { meanLst };
        }
      }

      // Calculate Percentiles
      wardLSTs.sort((a, b) => a - b);
      const p25 = wardLSTs[Math.floor(wardLSTs.length * 0.25)];
      const p75 = wardLSTs[Math.floor(wardLSTs.length * 0.75)];

      // Second pass: Classify Risk
      const finalMap = {};
      Object.keys(tempMap).forEach(key => {
        const wardData = tempMap[key];
        const ndviVal = ndviMap[key]?.mean || 0; // fallback if missing, though typically matched

        // Step A & B & C: Combined Risk calculation refactored to Utility
        const risk = calculateHeatRisk(wardData.meanLst, ndviVal, p25, p75);

        let heatLevel = "MODERATE"; // Fallback for debug/display if needed separately
        if (wardData.meanLst > p75) heatLevel = "HIGH";
        else if (wardData.meanLst < p25) heatLevel = "LOW";

        finalMap[key] = {
          ...wardData,
          ndviMean: ndviVal,
          heatLevel, // Internal debug use mostly
          risk // Final Public Health Risk
        };
      });
      setHeatTable(finalMap);
    });

  }, []);

  /* ===================== CENTRALIZED STYLING ===================== */

  /* ===================== CENTRALIZED STYLING ===================== */

  /* ===================== CENTRALIZED STYLING ===================== */

  /* ===================== CENTRALIZED STYLING ===================== */

  const getWardStyle = (feature) => {
    // 1. Resolve Sector ID
    const rawName = feature.properties.Name;
    const nameKey = rawName?.toLowerCase();
    const sectorId = getSectorID(rawName);

    // 2. Disease Layer Logic
    if (activeLayer === "disease") {
      const dData = diseaseTable[sectorId] || {};
      const diseaseSignal = formatDiseaseSignalFromData(sectorId, dData);
      const primary = diseaseSignal.primary;
      const priority = primary.priority || "LOW";
      const color = DISEASE_PRIORITY_COLORS[priority] || DISEASE_PRIORITY_COLORS.LOW;
      const opacity = priority === "CRITICAL"
        ? 0.9
        : priority === "HIGH"
          ? 0.8
          : priority === "MODERATE"
            ? 0.7
            : 0.55;

      return {
        fillColor: color,
        weight: 2,
        color: "#1f2937",
        fillOpacity: opacity,
        dashArray: null
      };
    }

    // 3. Health Rate Index (HRI) - VISUAL EMPHASIS
    if (activeLayer === "hri") {
      const profile = SECTOR_HEALTH_PROFILES[sectorId];
      const hriScore = profile?.hri ?? 40;
      let color = "#2dd48a";
      if (hriScore >= 80) color = "#cc2200";
      else if (hriScore >= 65) color = "#ff4444";
      else if (hriScore >= 45) color = "#ff8c42";

      const convergenceCount = getConvergenceCount(nameKey, sectorId);
      const isConvergenceZone = convergenceCount >= 4;

      return {
        fillColor: color,
        weight: isConvergenceZone ? 4 : 2,
        color: isConvergenceZone ? "#ef4444" : "#1f2937",
        fillOpacity: 0.7,
        dashArray: isConvergenceZone ? null : null,
      };
    }

    // 4. Other Layers
    if (activeLayer === "heat") {
      const data = heatTable[nameKey];
      return {
        fillColor: getHeatRiskColor(data?.risk),
        weight: 1.4,
        color: "#1f2937",
        fillOpacity: 0.75
      };
    }

    if (activeLayer === "stagnation") {
      const data = stagnationTable[nameKey];
      return {
        fillColor: getStagnationColor(data?.level),
        weight: 1.4,
        color: "#1f2937",
        fillOpacity: 0.75
      };
    }

    if (activeLayer === "ndvi") {
      const mean = ndviTable[nameKey]?.mean;
      return {
        fillColor: getNDVIColor(mean),
        weight: 1.4,
        color: "#1f2937",
        fillOpacity: 0.75
      };
    }

    // Default Neutral (No Layer Active)
    return {
      fillColor: "rgba(59,130,246,0.1)",
      weight: 1.4,
      color: "#93c5fd",
      fillOpacity: 0.4
    };
  };

  /* ===================== FORCE UPDATES & EVENTS ===================== */

  // Listen for live updates from Hospital App
  useEffect(() => {
    const handleDataUpdate = () => {
      // Reload from storage when event fires
      const freshData = DiseaseDataManager.getWardAggregates();
      setDiseaseTable(freshData);
    };

    // BRIDGE for Popup Button Click
    window.handleWardDetail = (wardName) => {
      // Find data from tables
      const sectorId = getSectorID(wardName);
      const nameKey = wardName.toLowerCase();

      // Reconstruct signal logic (Same as map layer)
      const dData = DiseaseDataManager.getWardAggregates()[sectorId] || { level: "LOW" }; // Use direct manager access or state if available
      const hData = heatTable[nameKey] || { risk: "LOW" }; // Use state refs or lookups. Note: state might be stale in window fn closure?
      // Actually, we need access to the CURRENT state. 
      // Better: Dispatch a custom event or use a ref that holds current data tables.
      // Simplified: Just use the passed wardName and re-fetch static data or assume state is accessible via closure if defined inside useEffect?
      // NO, window function defined inside useEffect has closure access to initial state only unless ref used.
      // FIX: Define window function inside a useEffect that depends on the data tables.
    };

    window.addEventListener('urbanome-data-update', handleDataUpdate);
    return () => {
      window.removeEventListener('urbanome-data-update', handleDataUpdate);
      delete window.handleWardDetail;
    };
  }, []); // Initial mount only - this usage of window.handleWardDetail is buggy if it needs fresh state.

  // FIX: Separate Effect to bind the window function with fresh data access
  useEffect(() => {
    window.handleWardDetail = (wardName) => {
      const sectorId = getSectorID(wardName);
      const nameKey = wardName.toLowerCase();

      const dData = diseaseTable[sectorId] || { level: "LOW" };
      const hData = heatTable[nameKey] || { risk: "LOW" };
      const sData = stagnationTable[nameKey] || { level: "LOW" };
      const nData = ndviTable[nameKey] || { mean: 0.6 };
      const cData = sanitationRiskTable[sectorId] || { level: "LOW" }; // Need to ensure this is in scope

      const { score } = getHRIScore(dData.level, hData.risk, sData.level, nData.mean, cData.level);



      const signal = formatDiseaseSignalFromData(wardName, dData);

      setSelectedWardDetail({
        wardName,
        sectorId,
        signal,
        profile: signal.profile, // STRICT MAPPING: Use the same profile as the signal
        score
      });
    };
  }, [diseaseTable, heatTable, stagnationTable, ndviTable, sanitationRiskTable]); // Re-bind when data changes

  useEffect(() => {
    window.addToPlanner = (sectorId) => {
      const profile = SECTOR_HEALTH_PROFILES[sectorId];
      if (!profile) return;
      plannerQueue.add(profile);
      setPlannerPill({ sector: sectorId, label: profile.sectorLabel });
      const btn = document.getElementById(`queue-${sectorId}`);
      if (btn) {
        btn.innerText = "✓ Added to Planner";
        btn.style.background = "#10b981";
        btn.style.color = "#0b1120";
      }
    };
    return () => { delete window.addToPlanner; };
  }, []);

  // Track previous layer to detect switches
  const prevLayerRef = useRef(activeLayer);

  // Effect: When activeLayer or Data changes, update Map
  useEffect(() => {
    if (!geoJsonRef.current) return;

    // A. HANDLE POPUP CLOSING
    // Only close popups if the layer ACTUALLY changed (e.g. from "disease" to "ndvi")
    // Do NOT close if we are just updating data within "disease" layer
    if (prevLayerRef.current !== activeLayer) {
      if (map) map.closePopup();
      prevLayerRef.current = activeLayer;
    }

    // B. Force Style Refresh
    geoJsonRef.current.setStyle(getWardStyle);

    // C. Re-bind Popups
    geoJsonRef.current.eachLayer((layer) => {
      // ALWAYS unbind first to clear old state
      layer.unbindPopup();

      const feature = layer.feature;
      const rawName = feature.properties.Name;
      const nameKey = rawName?.toLowerCase();
      const sectorId = getSectorID(rawName);

      let content = null;

      if (activeLayer === "hri") {
        const profile = SECTOR_HEALTH_PROFILES[sectorId];
        if (profile) {
          const contributors = (profile.contributors || []).map(c => `<li>${c}</li>`).join('');
          content = `
            <div style="font-family:'Inter',sans-serif;min-width:320px;color:#0f172a;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <div>
                  <div style="font-size:0.75rem;letter-spacing:2px;color:#64748b;text-transform:uppercase;font-weight:700;">${profile.sector}</div>
                  <div style="font-size:1.1rem;font-weight:800;">${profile.sectorLabel}</div>
                  <div style="font-size:0.95rem;color:#0d9488;font-weight:700;">HRI: ${profile.hri}/100</div>
                </div>
                <div style="padding:6px 10px;border-radius:10px;border:1px solid rgba(0,0,0,0.08);background:${profile.hri>=80?'#fee2e2':profile.hri>=65?'#ffe4e6':profile.hri>=45?'#fff7ed':'#ecfdf3'};color:${profile.hri>=80?'#b91c1c':profile.hri>=65?'#c2410c':profile.hri>=45?'#b45309':'#0f766e'};font-weight:800;">
                  ${profile.severity}
                </div>
              </div>

              <div style="margin-bottom:12px;padding:10px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;">
                <div style="font-size:0.8rem;color:#475569;font-weight:700;margin-bottom:4px;">Primary Disease Signal</div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div style="font-weight:800;color:#111827;">${profile.disease} — ${profile.cases} Cases</div>
                  <div style="font-size:0.85rem;color:${profile.trend==='outbreak'?'#b91c1c':(profile.trend==='rising'?'#c2410c':'#0f766e')};font-weight:700;">
                    ${profile.trendLabel}
                  </div>
                </div>
                <div style="font-size:0.85rem;color:#475569;margin-top:4px;">Trend: ${profile.trendLabel} · Transmission: ${profile.transmission}</div>
              </div>

              <div style="margin-bottom:12px;">
                <div style="font-size:0.8rem;color:#475569;font-weight:700;margin-bottom:6px;">Score Contributors</div>
                <ul style="margin:0;padding-left:18px;font-size:0.9rem;color:#1f2937;line-height:1.4;">${contributors}</ul>
              </div>

              <div style="margin-bottom:12px;padding:10px;border-radius:10px;background:#0f172a;color:#e2e8f0;">
                <div style="font-size:0.78rem;letter-spacing:1px;text-transform:uppercase;color:#67e8f9;font-weight:700;margin-bottom:4px;">Actionable Insight</div>
                <div style="font-size:0.95rem;line-height:1.5;">"${profile.insight}"</div>
              </div>

              <button id="queue-${sectorId}" onclick="window.addToPlanner && window.addToPlanner('${sectorId}')" style="width:100%;background:#0ea5e9;color:#0b1120;border:none;border-radius:12px;padding:10px 14px;font-weight:800;font-size:0.95rem;cursor:pointer;">
                Send to Intervention Planner →
              </button>
            </div>
          `;
        }
      }
      else if (activeLayer === "disease") {
        const dData = diseaseTable[sectorId] || {};
        const signal = formatDiseaseSignalFromData(sectorId, dData);
        const primary = signal.primary;
        const priority = primary.priority || "LOW";
        const trendKey = normalizeDiseaseTrend(primary.trend);
        const trendLabel = TREND_LABELS[trendKey] || TREND_LABELS.Stable;
        const insight = ACTION_INSIGHTS[trendKey] || ACTION_INSIGHTS.Stable;
        const caseCount = primary.activeCases || 0;
        const caseLabel = `${caseCount} case${caseCount === 1 ? "" : "s"}`;
        const transmission = primary.transmission || "Transmission data unavailable";
        const color = DISEASE_PRIORITY_COLORS[priority] || DISEASE_PRIORITY_COLORS.LOW;
        const diseaseName = primary.displayName || primary.name;

        content = `
            <div style="font-family: 'Inter', sans-serif; min-width: 280px; color: #0f172a;">
              <div style="margin-bottom: 6px; font-size: 0.75rem; color: #475569; text-transform: uppercase; letter-spacing: 0.1em;">Ward</div>
              <div style="font-size: 1rem; font-weight: 700; margin-bottom: 12px;">${rawName}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.65rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.12em;">Priority</span>
                <span style="font-size: 0.85rem; font-weight: 700; color: ${color};">${priority}</span>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="font-size: 0.7rem; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Primary Signal</div>
                <div style="font-size: 1.1rem; font-weight: 700; color: #0f172a;">${diseaseName}</div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                <div>
                  <div style="font-size: 0.65rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px;">Case Load</div>
                  <div style="font-size: 0.95rem; font-weight: 700;">${caseLabel}</div>
                </div>
                <div>
                  <div style="font-size: 0.65rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px;">Trend</div>
                  <div style="font-size: 0.95rem; font-weight: 700; color: ${color};">${trendLabel}</div>
                </div>
              </div>
              <div style="margin-bottom: 10px;">
                <div style="font-size: 0.65rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px;">Transmission Vector</div>
                <div style="font-size: 0.9rem; font-weight: 600; color: #0f172a;">${transmission}</div>
              </div>
              <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                <div style="font-size: 0.65rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Actionable Insight</div>
                <div style="font-size: 0.9rem; font-weight: 600; color: #0f172a; line-height: 1.4;">
                  ${insight}
                </div>
              </div>
            </div>
        `;
      }
      else if (activeLayer === "hri") {
        const dData = diseaseTable[sectorId] || { level: "LOW" };
        const hData = heatTable[nameKey] || { risk: "LOW" };
        const sData = stagnationTable[nameKey] || { level: "LOW" };
        const nData = ndviTable[nameKey] || { mean: 0.6 };
        const cData = sanitationRiskTable[sectorId] || { level: "LOW" };

        const { score, category, breakdown } = getHRIScore(dData.level, hData.risk, sData.level, nData.mean, cData.level);
        const color = getHRIColor(category);

        let insight = "Current indicators suggest stable conditions in this ward. Routine monitoring is sufficient at this stage.";
        if (category === "CRITICAL") insight = "This ward shows multiple overlapping health and environmental stressors. Immediate coordination between public health monitoring, sanitation inspection, and heat or water mitigation teams is recommended.";
        else if (category === "HIGH") insight = "This ward is under elevated health stress driven by a combination of disease burden and environmental factors. Preventive interventions and closer monitoring may help reduce escalation.";
        else if (category === "MODERATE") insight = "Emerging stress indicators are present in this ward. Continued surveillance and early preventive action could limit future health risk.";


        content = `
            <div style="font-family: sans-serif; min-width: 280px;">
              <h3 style="margin: 0 0 5px 0; color: #333;">HEALTH RATE INDEX (HRI)</h3> 
              <div style="margin-bottom: 12px; padding: 8px 10px; background: rgba(0,0,0,0.03); border-radius: 4px;">
                <div style="font-size: 1.1rem; font-weight: 800; color: ${color}; display: flex; align-items: center; justify-content: space-between;">
                  <span>${category}</span>
                  <span style="font-size: 0.9rem; color: #333; font-weight: 600;">Score: ${score} / 12</span>
                </div>
              </div>

              <div style="margin-bottom: 12px;">
                <div style="font-size: 0.75em; font-weight: 700; color: #555; text-transform: uppercase; margin-bottom: 6px;">Score Contributors</div>
                <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.85rem; color: #333; line-height: 1.4;">
                   ${breakdown.length > 0 ? breakdown.map(item => `<li style="margin-bottom:4px;">${item}</li>`).join('') : '<li style="color:#666; font-style:italic;">No significant risks detected.</li>'}
                </ul>
              </div>

              <div style="background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px;">
                <div style="font-size: 0.75em; font-weight: 700; color: #555; text-transform: uppercase; margin-bottom: 4px;">Actionable Insight</div>
                <div style="font-size: 0.85rem; color: #1e293b; line-height: 1.4;">
                  ${insight}
                </div>
              </div>
            </div>
        `;
      }
      else if (activeLayer === "heat") {
        const data = heatTable[nameKey];
        if (data) {
          content = `
  < div style = "font-family: sans-serif; min-width: 260px;" >
              <h3 style="margin: 0 0 8px 0; color: #333;">Ward: ${rawName}</h3>
              <div style="margin-bottom: 12px; padding: 6px 10px; background: rgba(0,0,0,0.03); border-radius: 4px;">
                <b>Urban Heat Health Risk:</b> 
                <span style="color: ${getHeatRiskColor(data.risk)}; font-weight: bold; margin-left: 5px;">
                  ${data.risk}
                </span>
              </div>
              <div style="font-size: 0.95em; margin-bottom: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <div style="font-size: 0.8em; color: #666; text-transform: uppercase;">Mean Temp (LST)</div>
                  <div style="font-weight: 600;">${data.meanLst?.toFixed(1)} °C</div>
                </div>
                <div>
                  <div style="font-size: 0.8em; color: #666; text-transform: uppercase;">Vegetation (NDVI)</div>
                  <div style="font-weight: 600;">${data.ndviMean?.toFixed(2)}</div>
                </div>
              </div>
              <div style="background: #f8f9fa; padding: 10px; border-left: 3px solid ${getHeatRiskColor(data.risk)}; border-radius: 0 4px 4px 0;">
                <div style="font-size: 0.75em; font-weight: 700; color: #555; text-transform: uppercase; margin-bottom: 4px;">Health Implication</div>
                <div style="font-size: 0.9em; color: #333; line-height: 1.4;">
                  ${getHeatRiskReason(data.risk)}
                </div>
              </div>
            </div >
  `;
        }
      }
      else if (activeLayer === "stagnation") {
        const data = stagnationTable[nameKey];
        if (data) {
          content = `
  < div style = "font-family: sans-serif; min-width: 240px;" >
              <h3 style="margin: 0 0 8px 0; color: #333;">Ward: ${rawName}</h3>
              <div style="margin-bottom: 12px; padding: 6px 10px; background: rgba(0,0,0,0.03); border-radius: 4px;">
                <b>Water Stagnation Susceptibility:</b> 
                <span style="color: ${getStagnationColor(data.level)}; font-weight: bold; margin-left: 5px;">
                  ${data.level}
                </span>
              </div>
              <div style="font-size: 0.95em; margin-bottom: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <div style="font-size: 0.8em; color: #666; text-transform: uppercase;">Vegetation (NDVI)</div>
                  <div style="font-weight: 600;">${data.ndviMean?.toFixed(3)}</div>
                </div>
                <div>
                  <div style="font-size: 0.8em; color: #666; text-transform: uppercase;">Terrain Slope</div>
                  <div style="font-weight: 600;">${data.slope}°</div>
                </div>
              </div>
              <div style="background: #f8f9fa; padding: 10px; border-left: 3px solid ${getStagnationColor(data.level)}; border-radius: 0 4px 4px 0;">
                <div style="font-size: 0.75em; font-weight: 700; color: #555; text-transform: uppercase; margin-bottom: 4px;">Health Implication</div>
                <div style="font-size: 0.9em; color: #333; line-height: 1.4;">
                  ${getStagnationReason(data.level)}
                </div>
              </div>
            </div >
  `;
        }
      }
      else if (activeLayer === "ndvi") {
        const mean = ndviTable[nameKey]?.mean;
        const status = getNDVIStatus(mean);
        if (mean != null) {
          content = `
  < div style = "font-family: sans-serif; min-width: 240px;" >
              <h3 style="margin: 0 0 8px 0; color: #333;">Ward: ${rawName}</h3>
              <div style="margin-bottom: 12px; padding: 6px 10px; background: rgba(0,0,0,0.03); border-radius: 4px;">
                <b>Vegetation Health (NDVI):</b> 
                <span style="font-weight: bold; margin-left: 5px;">${mean.toFixed(3)}</span>
              </div>
              <div style="margin-bottom: 12px;">
                <div style="font-size: 0.8em; color: #666; text-transform: uppercase;">Vegetation Status</div>
                <div style="font-weight: 600; color: ${getNDVIColor(mean)};">${status}</div>
              </div>
              <div style="background: #f8f9fa; padding: 10px; border-left: 3px solid ${getNDVIColor(mean)}; border-radius: 0 4px 4px 0;">
                <div style="font-size: 0.75em; font-weight: 700; color: #555; text-transform: uppercase; margin-bottom: 4px;">Health Implication</div>
                <div style="font-size: 0.9em; color: #333; line-height: 1.4;">
                  ${getNDVIReason(status)}
                </div>
              </div>
            </div >
  `;
        }
      }
      // NEW: Ward Summary for Community Reports Mode (When no base layer active)
      else if (!activeLayer && showCommunityReports) {
        const risk = CommunitySanitationManager.getSectorRisk(sectorId);
        // Only show if we have data/risk
        content = `
  < div style = "font-family: sans-serif; min-width: 240px;" >
              <h3 style="margin: 0 0 8px 0; color: #333;">Community Reports Summary</h3>
              <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; color: #1e293b;">Ward: ${sectorId}</div>
              
              <div style="display: flex; gap: 10px; margin-bottom: 12px;">
                 <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0; flex: 1;">
                    <div style="font-size: 0.7rem; color: #64748b; text-transform: uppercase;">Total Reports</div>
                    <div style="font-size: 1.1rem; font-weight: bold; color: #334155;">${risk.count}</div>
                 </div>
                 <div style="background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0; flex: 1;">
                    <div style="font-size: 0.7rem; color: #64748b; text-transform: uppercase;">Dominant Issue</div>
                    <div style="font-size: 0.85rem; font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;" title="${risk.dominantIssue}">${risk.dominantIssue}</div>
                 </div>
              </div>

               <div style="background: #fff; padding: 10px; border-left: 3px solid ${risk.count > 3 ? '#f97316' : '#22c55e'}; border-radius: 0 4px 4px 0; border: 1px solid #f1f5f9;">
                <div style="font-size: 0.75em; font-weight: 700; color: #555; text-transform: uppercase; margin-bottom: 4px;">Insight</div>
                <div style="font-size: 0.85rem; color: #333; line-height: 1.4;">
                  ${risk.count >= 3
            ? "Repeated sanitation-related reports suggest localized environmental stress requiring inspection."
            : "Low urgency. Monitor for new reports."}
                </div>
              </div>
            </div >
  `;
      }

      // ONLY bind if we have content
      if (content) {
        layer.bindPopup(content);
      }
    });

    // If switching TO disease layer, ensure we have fresh data
    // FIX: Do NOT set state here if it causes a loop.
    // Ideally, we just read from the existing state which should be kept fresh by the event listener.
    // If we truly need to refresh on switch, we should check if data differs or use a separate effect.
    // For now, removing this setDiseaseTable to prevent the infinite loop is the Priority #1 Fix.
    // The event listener on mount already handles updates.
    /* 
    if (activeLayer === "disease") {
       // const freshData = DiseaseDataManager.getWardAggregates();
       // setDiseaseTable(freshData); 
    }
    */

  }, [activeLayer, ndviTable, stagnationTable, heatTable, diseaseTable, map, showCommunityReports, communityReports]); // Re-run when layer or data changes

  // Click Handler (Interaction-Only)
  const onWardClick = (e) => {
    if (!activeLayer) return; // Ignore clicks if no layer active

    const layer = e.target;
    if (selectedLayerRef.current) {
      selectedLayerRef.current.setStyle(getWardStyle(selectedLayerRef.current.feature));
    }
    layer.setStyle({ weight: 3, color: "#6366f1", fillOpacity: 0.9 });
    selectedLayerRef.current = layer;

    // Popup is already bound by useEffect, just let it open
    layer.openPopup();
  };

  /* ===================== RENDER ===================== */

  return (
    <Container>
      <PortalBanner portal="smc" />
      <div style={{ padding: "1.5rem 2rem", color: "white" }}>
        <h1>Solapur Digital Twin</h1>
        <p style={{ opacity: 0.7 }}>Ward-level Intelligence</p>
      </div>

      <ContentGrid>
        <MapWrapper>
          <MapContainer
            center={solapurCenter}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            ref={setMap}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

            {showNDVI && (
              <ImageOverlay
                url="/SOLAPURNDVI.png"
                bounds={ndviBounds}
                opacity={0.85}
              />
            )}

            {showWards && wards && (
              <GeoJSON
                data={wards}
                ref={geoJsonRef} // Capture ref for imperative updates
                style={getWardStyle} // Initial render
                onEachFeature={(feature, layer) => {
                  layer.on("click", onWardClick);
                }}
              />
            )}

            {showCityBoundary && cityBoundary && (
              <GeoJSON data={cityBoundary} style={{ fillOpacity: 0, color: "#ef4444", weight: 3 }} interactive={false} />
            )}

            {/* CONVERGENCE BADGES: Show X/5 signal count on each ward when HRI layer is active */}
            {activeLayer === "hri" && wards && wards.features && wards.features.map((feature, idx) => {
              const rawName = feature.properties.Name;
              const nameKey = rawName?.toLowerCase();
              const sectorId = getSectorID(rawName);
              const count = getConvergenceCount(nameKey, sectorId);
              if (count === 0) return null;
              const centroid = computeCentroid(feature);
              if (!centroid) return null;
              return (
                <Marker
                  key={`badge-${idx}`}
                  position={centroid}
                  icon={createConvergenceBadgeIcon(count)}
                  interactive={false}
                />
              );
            })}

            {/* Community Report Markers (Overlay) - Representative Only */}
            {/* FIX: Strictly unmount markers if any other layer is active */}
            {showCommunityReports && !activeLayer && (communityReports || []).length > 0 && getRepresentativeReports(communityReports).map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={SANITATION_ICONS[report.issue_type] || SANITATION_ICONS["Uncollected Garbage"]}
                ref={el => markerRefs.current[report.id] = el}
              >
                <Popup>
                  <div style={{ fontFamily: 'sans-serif', minWidth: '220px' }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#1e293b' }}>Community Report</h4>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                      <b>Issue:</b> {report.issue_type}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                      <b>Ward:</b> {report.sector}
                    </div>
                    <div style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                      <b>Reported:</b> {new Date(report.timestamp).toLocaleDateString()}
                    </div>

                    <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '4px', marginBottom: '8px', borderLeft: '3px solid #6366f1' }}>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 'bold', color: '#475569', marginBottom: '3px' }}>
                        Health Context
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: '1.3' }}>
                        {HEALTH_CONTEXT[report.issue_type] || "This issue requires municipal attention to prevent public health risks."}
                      </div>
                    </div>

                    {report.has_proof && (
                      <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600', marginTop: '5px' }}>
                        📸 Evidence Available
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {plannerPill && (
            <div style={{ position: 'absolute', top: 16, right: 16, background: '#0ea5e9', color: '#0b1120', padding: '10px 14px', borderRadius: '999px', fontWeight: 800, boxShadow: '0 10px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => { window.location.href = '/intervention-planner'; }}>
              → Go to Intervention Planner
              <span style={{ fontWeight: 700, color: '#022c22' }}>{plannerPill.sector}</span>
            </div>
          )}

          {/* LAYER EXPLANATION PANEL */}
          {(() => {
            let activeKey = null;
            if (activeLayer) activeKey = activeLayer;
            else if (showCommunityReports) activeKey = "community";

            if (activeKey && LAYER_EXPLANATIONS[activeKey]) {
              const info = LAYER_EXPLANATIONS[activeKey];
              return (
                <LayerGuidePanel>
                  <GuideTitle>
                    <FiActivity /> {info.title}
                  </GuideTitle>
                  <GuideDesc>{info.desc}</GuideDesc>

                  <GuideSection>
                    <GuideLabel>Public Health Insight</GuideLabel>
                    <div style={{ fontSize: '0.85rem', color: '#fff', fontStyle: 'italic' }}>
                      "{info.insight}"
                    </div>
                  </GuideSection>

                  <GuideSection>
                    <GuideLabel>How to Read</GuideLabel>
                    <LegendRow>
                      {info.legend.map((l, i) => (
                        <LegendItem key={i} color={l.color}>{l.label}</LegendItem>
                      ))}
                    </LegendRow>
                  </GuideSection>
                </LayerGuidePanel>
              );
            }
            return null;
          })()}

          {/* SIDE PANEL: DETAILED CASE LOG */}
          {selectedWardDetail && (
            <DetailPanel>
              <PanelHeader>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Detailed Disease Case Log</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{selectedWardDetail.sectorId}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <FiCalendar /> Last 30 Days
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWardDetail(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                  <FiX size={20} />
                </button>
              </PanelHeader>

              {/* GENERATE LIST OF DISEASES - ALL DISEASES (Profile) */}
              {selectedWardDetail.profile && selectedWardDetail.profile.map((disease, idx) => {
                // Use cached timeline from profile (Single Source of Truth)
                const history = disease.timeline || [];
                const isZero = disease.activeCases === 0;

                return (
                  <DetailSection key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '1rem', fontWeight: '700', color: isZero ? '#64748b' : '#1e293b' }}>{disease.name}</div>
                      <div style={{
                        background: isZero ? '#f1f5f9' : '#fef2f2',
                        color: isZero ? '#64748b' : '#ef4444',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: isZero ? '1px solid #e2e8f0' : '1px solid #fee2e2'
                      }}>
                        {disease.activeCases} Active Cases
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px' }}>
                      Trend: <b style={{ color: !isZero && disease.trend.includes('Rising') ? '#ef4444' : (isZero ? '#94a3b8' : '#f59e0b') }}>{disease.trend}</b> • Transmission: <b>{disease.type}</b>
                    </div>

                    {!isZero && (
                      <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <TimelineTable>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Cases</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.map((row, i) => (
                              <tr key={i}>
                                <td style={{ fontFamily: 'monospace' }}>{row.date}</td>
                                <td style={{ fontWeight: 'bold' }}>{row.cases}</td>
                                <td>
                                  <span style={{
                                    fontSize: '0.7rem',
                                    padding: '1px 4px',
                                    borderRadius: '4px',
                                    background: row.status === 'Confirmed' ? '#dcfce7' : (row.cases > 0 ? '#fff7ed' : 'transparent'),
                                    color: row.status === 'Confirmed' ? '#15803d' : (row.cases > 0 ? '#c2410c' : '#cbd5e1')
                                  }}>
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </TimelineTable>
                      </div>
                    )}
                    {isZero && (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '10px 0', borderTop: '1px dashed #e2e8f0' }}>
                        No cases reported in the last 30 days.
                      </div>
                    )}
                  </DetailSection>
                );
              })}

              {selectedWardDetail.signal.primary?.activeCases > 0 && (
                <DetailSection style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Public Health Interpretation
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', fontStyle: 'italic' }}>
                    "This ward shows sustained {selectedWardDetail.signal.primary?.name.toLowerCase()} transmission over the last 30 days,
                    indicating active {selectedWardDetail.signal.primary?.type === 'Vector-Borne' ? 'vector breeding' : 'environmental exposure'} and local transmission.
                    Immediate containment and surveillance escalation are advised."
                  </div>
                </DetailSection>
              )}

            </DetailPanel>
          )}

        </MapWrapper>

        <ControlPanel>
          <div>
            <SectionTitle>Intelligence Layers</SectionTitle>
            <ToggleGroup>
              {/* FINAL LAYER: Health Rate Index */}
              <ToggleItem
                active={activeLayer === "hri"}
                onClick={() => {
                  const isActive = activeLayer === "hri";
                  setActiveLayer(isActive ? null : "hri");
                  setShowNDVI(false);
                  if (!isActive) setShowCommunityReports(false); // Valid Mutual Exclusivity
                }}
                style={{
                  border: activeLayer === "hri" ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  background: activeLayer === "hri" ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.03)"
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: activeLayer === "hri" ? '#fca5a5' : 'inherit' }}>
                  <FiActivity color={activeLayer === "hri" ? '#fca5a5' : 'inherit'} />
                  Health Rate Index (HRI)
                </div>
              </ToggleItem>

              <ToggleItem
                active={activeLayer === "disease"}
                onClick={() => {
                  if (activeLayer === "disease") {
                    setActiveLayer(null);
                  } else {
                    setActiveLayer("disease");
                    setShowNDVI(false);
                    setShowCommunityReports(false);
                  }
                }}
              >
                Disease Signals (Mock) <FiAlertCircle />
              </ToggleItem>

              {/* NEW: Community Reports Overlay */}
              <ToggleItem
                active={showCommunityReports}
                onClick={() => {
                  const newState = !showCommunityReports;
                  setShowCommunityReports(newState);
                  if (newState) setActiveLayer(null); // Valid Mutual Exclusivity
                }}
                style={{ borderLeft: showCommunityReports ? "4px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)" }}
              >
                Community Reports <FiUsers />
              </ToggleItem>

              <ToggleItem
                active={activeLayer === "heat"}
                onClick={() => {
                  if (activeLayer === "heat") {
                    setActiveLayer(null);
                  } else {
                    setActiveLayer("heat");
                    setShowNDVI(false);
                    setShowCommunityReports(false);
                  }
                }}
              >
                Urban Heat Health <FiSun />
              </ToggleItem>
              <ToggleItem
                active={activeLayer === "stagnation"}
                onClick={() => {
                  if (activeLayer === "stagnation") {
                    setActiveLayer(null);
                  } else {
                    setActiveLayer("stagnation");
                    setShowNDVI(false);
                    setShowCommunityReports(false);
                  }
                }}
              >
                Water Stagnation Risk <FiActivity />
              </ToggleItem>
              <ToggleItem
                active={activeLayer === "ndvi"}
                onClick={() => {
                  if (activeLayer === "ndvi") {
                    setActiveLayer(null);
                    setShowNDVI(false);
                  } else {
                    setActiveLayer("ndvi");
                    setShowNDVI(true);
                    setShowCommunityReports(false);
                  }
                }}
              >
                NDVI Vegetation Index <FiActivity />
              </ToggleItem>
            </ToggleGroup>
          </div>
          <div>
            <SectionTitle>Boundaries</SectionTitle>
            <ToggleGroup>
              <ToggleItem active={showWards} onClick={() => setShowWards(!showWards)}>
                Ward Boundaries <FiMap />
              </ToggleItem>
              <ToggleItem active={showCityBoundary} onClick={() => setShowCityBoundary(!showCityBoundary)}>
                City Outline <FiMap />
              </ToggleItem>
            </ToggleGroup>
          </div>
        </ControlPanel>
      </ContentGrid>
    </Container >
  );
};

export default DigitalTwin;
