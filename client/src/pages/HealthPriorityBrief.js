import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import {
    FiActivity,
    FiAlertTriangle,
    FiClipboard,
    FiPrinter,
    FiShield,
    FiClock,
    FiTarget,
    FiTrendingUp,
    FiFileText,
    FiMapPin,
    FiDownload,
    FiDroplet,
    FiTrash2,
    FiThermometer,
    FiCheckCircle,
    FiArrowRight,
    FiEdit3,
    FiInfo
} from 'react-icons/fi';
import { hriBridgeService } from '../services/hriBridgeService';
import BoundaryService from '../services/boundaryService';
import { getSectorID } from '../utils/HospitalRegistry';

// --- STYLED COMPONENTS ---

const Container = styled.div`
  height: 100vh;
  width: 100%;
  background: #0f172a;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
`;

// LANDING HEADER
const LandingHeader = styled.div`
  padding: 1.5rem 2rem;
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HeaderTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.02em;
`;

const HeaderSubtitle = styled.div`
  font-size: 1rem;
  color: #94a3b8;
  max-width: 800px;
  line-height: 1.5;
`;

const ExplainerRow = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 0.5rem;
`;

const ExplainerStep = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: ${props => props.active ? '#3b82f6' : '#64748b'};
  font-weight: ${props => props.active ? '600' : '500'};
  opacity: ${props => props.muted ? 0.5 : 1};
`;

const StepNumber = styled.div`
  width: 24px; 
  height: 24px;
  border-radius: 50%;
  background: ${props => props.active ? '#3b82f6' : '#1e293b'};
  border: 1px solid ${props => props.active ? '#3b82f6' : '#334155'};
  color: ${props => props.active ? '#fff' : '#94a3b8'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
`;

const ContentGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 380px 1fr;
  overflow: hidden;
`;

const MapPanel = styled.div`
  background: #020617;
  border-right: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const MainPanel = styled.div`
  background: #0f172a;
  padding: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
`;

const BriefContent = styled.div`
  padding: 2.5rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  text-align: center;
  padding: 3rem;
  gap: 1.5rem;
  
  svg { 
    font-size: 4rem; 
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
  
  h3 {
    font-size: 1.25rem;
    color: #e2e8f0;
    margin: 0;
  }
  
  p {
    max-width: 400px;
    font-size: 0.95rem;
    line-height: 1.6;
  }
`;

// --- WIDGETS ---

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 0.75rem;
  
  svg { color: #3b82f6; }
`;

const SummaryCard = styled.div`
  background: #1e293b;
  border-radius: 12px;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  border: 1px solid #334155;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
`;

const DataPoint = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.05em;
  }
  
  div.value {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  div.sub {
    font-size: 0.85rem;
    color: #cbd5e1;
  }
`;

const DriverRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.25rem;
  background: ${props => props.isPrimary ? 'rgba(239, 68, 68, 0.1)' : '#1e293b'};
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid ${props => props.isPrimary ? '#ef444440' : '#334155'};
`;

const DriverIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.bg};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const ActionTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
  
  th {
    text-align: left;
    padding: 1rem;
    color: #94a3b8;
    border-bottom: 2px solid #334155;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }
  
  td {
    padding: 1rem;
    border-bottom: 1px solid #1e293b;
    color: #e2e8f0;
    vertical-align: top;
    background: #1e293b;
    
    &:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
    &:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
  }
  
  tr { margin-bottom: 0.5rem; display: table-row; }
`;

const PrimaryButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);

  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.5);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #94a3b8;
  border: 1px solid #475569;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    color: white;
    border-color: #94a3b8;
    background: rgba(255,255,255,0.05);
  }
`;

const JustificationBox = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  margin-top: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  line-height: 1.5;
`;

// --- PREVIEW MODE STYLES ---
const PreviewPaper = styled.div`
  background: white;
  color: #1e293b;
  padding: 4rem;
  font-family: 'Times New Roman', serif;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  margin-bottom: 2rem;
  border-radius: 4px;
`;

// --- LOGIC HELPERS ---

const getRiskColor = (score) => {
    if (score >= 9) return '#ef4444';
    if (score >= 6) return '#f97316';
    if (score >= 3) return '#eab308';
    return '#10b981';
};

// Strict Priority Logic
const getClinicalPriority = (clinicalData) => {
    const { activeCases, trend, cluster, hri } = clinicalData;

    // URGENT: Evidence of transmission
    if (activeCases > 0 && (trend === 'Rising' || trend === 'Rapidly Rising' || cluster === 'Confirmed Cluster')) {
        return {
            level: 'URGENT RESPONSE',
            color: '#ef4444',
            reason: `Active transmission detected (${activeCases} cases) with ${trend.toLowerCase()} trend.`
        };
    }

    // HIGH: Active cases but stable
    if (activeCases > 0) {
        return {
            level: 'HIGH PRIORITY',
            color: '#f97316',
            reason: `Active cases present (${activeCases}) but currently stable. Monitoring required.`
        };
    }

    // MODERATE: No cases, but high environmental risk
    if (activeCases === 0 && hri >= 7) {
        return {
            level: 'MODERATE RISK',
            color: '#eab308',
            reason: `Zero reported cases, but high environmental risk (HRI ${hri ? hri.toFixed(1) : 'N/A'}) supports vector breeding.`
        };
    }

    // ROUTINE: No cases, low risk
    return {
        level: 'ROUTINE MONITORING',
        color: '#10b981',
        reason: 'No active cases and manageable environmental risk profile.'
    };
};

const getClinicalData = (hri, wardName) => {
    // Deterministic mock based on ward name
    const seed = wardName.charCodeAt(0) + wardName.charCodeAt(wardName.length - 1);

    let disease = 'Dengue';
    let type = 'Vector-Borne';
    let transmission = 'Aedes aegypti mosquito';

    // Introduce variety
    if (seed % 3 === 0) { disease = 'Malaria'; transmission = 'Anopheles mosquito'; }
    if (seed % 3 === 1) { disease = 'Cholera'; type = 'Waterborne'; transmission = 'Contaminated water sources'; }

    let activeCases = 0;
    let trend = 'Stable';
    let cluster = 'None';

    // Logic: High HRI correlates with cases, but not always (some high HRI areas might just be lucky/prevented)
    // To fix the "0 cases = Urgent" bug, we explicitly separate Risk from Current Status.

    if (hri >= 8.5) {
        // High Risk Area
        activeCases = (seed % 10) > 2 ? (seed % 15) + 5 : 0; // 70% chance of cases
        if (activeCases > 0) {
            trend = (seed % 2 === 0) ? 'Rising' : 'Stable';
            cluster = (activeCases > 10) ? 'Confirmed Cluster' : 'Suspected Cluster';
        }
    } else if (hri >= 5) {
        // Moderate Risk Area
        activeCases = (seed % 10) > 7 ? (seed % 5) + 1 : 0; // 30% chance of cases
        if (activeCases > 0) trend = 'Stable';
    }

    return { disease, type, transmission, activeCases, trend, cluster, hri };
};

// --- COMPONENT ---

const HealthPriorityBrief = () => {
    const [wardsGeo, setWardsGeo] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [clinicalData, setClinicalData] = useState(null);
    const [priorityInfo, setPriorityInfo] = useState(null);
    const [viewMode, setViewMode] = useState('landing');
    const mapRef = useRef(null);

    useEffect(() => {
        async function load() {
            try {
                const geo = await BoundaryService.loadWardData();
                setWardsGeo(geo);
            } catch (e) { console.error(e); }
        }
        load();
    }, []);

    const handleWardSelect = async (feature) => {
        setSelectedWard(feature);
        setViewMode('analysis');

        try {
            const baseline = await hriBridgeService.getBaselineHRIFromTwin(feature.properties.Name);
            const clinical = baseline.disease.primary;
            const priority = getClinicalPriority({ ...clinical, hri: baseline.score });

            setClinicalData({ ...baseline, ...clinical, secondary: baseline.disease.secondary });
            setPriorityInfo(priority);
        } catch (e) {
            console.error(e);
        }
    };

    const wardStyle = (feature) => {
        const isSelected = selectedWard?.properties?.Name === feature.properties.Name;
        return {
            fillColor: isSelected ? '#3b82f6' : '#1e293b',
            weight: isSelected ? 2 : 1,
            color: isSelected ? '#fff' : '#475569',
            fillOpacity: isSelected ? 0.6 : 0.2
        };
    };

    const onEachStartWard = (feature, layer) => {
        layer.on({ click: () => handleWardSelect(feature) });
    };

    return (
        <Container>
            <LandingHeader>
                <HeaderTitle>
                    <FiShield /> Ward Health Decision & Policy Brief System
                </HeaderTitle>
                <HeaderSubtitle>
                    AI-assisted public health risk assessment and decision documentation. Analyzes disease signals, vector density, and sanitation data to guide municipal response.
                </HeaderSubtitle>

                <ExplainerRow>
                    <ExplainerStep active={!selectedWard}>
                        <StepNumber active={!selectedWard}>1</StepNumber> Select a Ward
                    </ExplainerStep>
                    <FiArrowRight style={{ color: '#334155' }} />
                    <ExplainerStep active={selectedWard && viewMode === 'analysis'}>
                        <StepNumber active={selectedWard && viewMode === 'analysis'}>2</StepNumber> Review Clinical Risk
                    </ExplainerStep>
                    <FiArrowRight style={{ color: '#334155' }} />
                    <ExplainerStep active={viewMode === 'preview'}>
                        <StepNumber active={viewMode === 'preview'}>3</StepNumber> Generate Brief
                    </ExplainerStep>
                </ExplainerRow>
            </LandingHeader>

            <ContentGrid>
                {/* 1. MAP PANEL */}
                <MapPanel>
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000, background: 'rgba(2,6,23,0.9)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155', fontSize: '0.85rem', color: '#cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                        <FiMapPin style={{ marginRight: '0.5rem', color: '#3b82f6' }} />
                        {selectedWard ? selectedWard.properties.Name : "Select a Ward to begin analysis"}
                    </div>
                    {wardsGeo && (
                        <MapContainer
                            center={[17.6599, 75.9064]}
                            zoom={12}
                            style={{ height: '100%', width: '100%', background: '#020617' }}
                            zoomControl={false}
                            whenCreated={mapInstance => (mapRef.current = mapInstance)}
                        >
                            <GeoJSON data={wardsGeo} style={wardStyle} onEachFeature={onEachStartWard} />
                        </MapContainer>
                    )}
                </MapPanel>

                {/* 2. MAIN CONTENT (Gated) */}
                <MainPanel>
                    {/* STATE 0: LANDING */}
                    {!selectedWard && (
                        <EmptyState>
                            <FiMapPin />
                            <h3>No Ward Selected</h3>
                            <p>Select a ward on the map to begin health risk analysis. The system will integrate live disease findings with environmental data.</p>
                        </EmptyState>
                    )}

                    {/* STATE 1: ANALYSIS */}
                    {selectedWard && clinicalData && priorityInfo && viewMode === 'analysis' && (
                        <BriefContent>
                            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ward Analysis</div>
                                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', margin: 0 }}>{selectedWard.properties.Name}</h2>
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                        Sector ID: {getSectorID(selectedWard.properties.Name)} • Population Density: High
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: priorityInfo.color }}>
                                        {priorityInfo.level}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>Decision Status</div>
                                </div>
                            </div>

                            <Section>
                                <SectionTitle><FiActivity /> Situation Summary</SectionTitle>
                                <SummaryCard>
                                    <DataPoint>
                                        <label>{clinicalData.name} Cases</label>
                                        <div className="value" style={{ color: clinicalData.activeCases > 0 ? '#ef4444' : '#94a3b8' }}>
                                            {clinicalData.activeCases} Reported
                                        </div>
                                        <div className="sub">{clinicalData.trend} Trend</div>
                                    </DataPoint>
                                    <DataPoint>
                                        <label>Transmission Mode</label>
                                        <div className="value" style={{ fontSize: '1.1rem', color: '#e2e8f0' }}>
                                            {clinicalData.transmission}
                                        </div>
                                        <div className="sub">{clinicalData.type}</div>
                                    </DataPoint>
                                    <DataPoint>
                                        <label>Environmental Risk</label>
                                        <div className="value" style={{ color: getRiskColor(clinicalData.score) }}>
                                            {clinicalData.score.toFixed(1)} HRI
                                        </div>
                                        <div className="sub">Baseline Susceptibility</div>
                                    </DataPoint>
                                </SummaryCard>

                                <JustificationBox>
                                    <FiInfo style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <strong>Why {priorityInfo.level}?</strong> {priorityInfo.reason}
                                    </div>
                                </JustificationBox>
                            </Section>

                            <Section>
                                <SectionTitle><FiAlertTriangle /> Clinical Risk Drivers</SectionTitle>

                                <DriverRow isPrimary>
                                    <DriverIcon bg={clinicalData.activeCases > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(148, 163, 184, 0.2)"} color={clinicalData.activeCases > 0 ? "#ef4444" : "#94a3b8"}><FiActivity /></DriverIcon>
                                    <div>
                                        <div style={{ fontWeight: '700', color: clinicalData.activeCases > 0 ? '#fca5a5' : '#cbd5e1', marginBottom: '0.25rem' }}>
                                            Primary: {clinicalData.name} Transmission Risk
                                        </div>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                            {clinicalData.activeCases > 0
                                                ? `Confirmed ${clinicalData.activeCases} active cases. ${clinicalData.cluster === 'Confirmed Cluster' ? 'Local clustering suggests sustained transmission.' : 'Sporadic cases detected.'}`
                                                : `No active cases reported, but surveillance is required due to environmental favorability.`
                                            }
                                        </div>
                                    </div>
                                </DriverRow>


                                {clinicalData.secondary && clinicalData.secondary.map((signal, idx) => (
                                    <DriverRow key={idx}>
                                        <DriverIcon bg="rgba(249, 115, 22, 0.2)" color="#f97316"><FiActivity /></DriverIcon>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#fdba74', marginBottom: '0.25rem' }}>Secondary: {signal.name}</div>
                                            <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                                                {signal.activeCases} cases reported. {signal.trend} trend indicates emerging risk.
                                            </div>
                                        </div>
                                    </DriverRow>
                                ))}

                                {clinicalData.contributors.sanitationStress > 1.5 && (
                                    <DriverRow>
                                        <DriverIcon bg="rgba(249, 115, 22, 0.2)" color="#f97316"><FiTrash2 /></DriverIcon>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#fdba74', marginBottom: '0.25rem' }}>Secondary: Sanitation & Waste Stress</div>
                                            <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                                                Existing waste accumulation supports bacterial growth and vector breeding.
                                            </div>
                                        </div>
                                    </DriverRow>
                                )}
                            </Section>

                            <Section>
                                <SectionTitle><FiTarget /> Recommended Clinical Actions</SectionTitle>
                                <ActionTable>
                                    <thead><tr><th>Action</th><th>Target Disease</th><th>Mechanism</th><th>Dept.</th></tr></thead>
                                    <tbody>
                                        {clinicalData.type === 'Vector-Borne' ? (
                                            <>
                                                <tr>
                                                    <td style={{ color: '#fff', fontWeight: '600' }}>Targeted Fogging & Larvicide</td>
                                                    <td>{clinicalData.name} (Vector)</td>
                                                    <td>Interrupts adult mosquito lifecycle instantly.</td>
                                                    <td style={{ color: '#93c5fd' }}>Health / Malaria</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ color: '#fff', fontWeight: '600' }}>Source Reduction Drive</td>
                                                    <td>{clinicalData.name} (Larvae)</td>
                                                    <td>Removal of stagnation points preventing breeding.</td>
                                                    <td style={{ color: '#93c5fd' }}>SWM / Health</td>
                                                </tr>
                                            </>
                                        ) : (
                                            <>
                                                <tr>
                                                    <td style={{ color: '#fff', fontWeight: '600' }}>Water Quality Testing</td>
                                                    <td>{clinicalData.name} (Bacterial)</td>
                                                    <td>Identify contamination source in supply lines.</td>
                                                    <td style={{ color: '#93c5fd' }}>Health / Water</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ color: '#fff', fontWeight: '600' }}>Chlorine Tablet Distribution</td>
                                                    <td>{clinicalData.name}</td>
                                                    <td>Immediate point-of-use water purification.</td>
                                                    <td style={{ color: '#93c5fd' }}>Health (ASHA)</td>
                                                </tr>
                                            </>
                                        )}
                                        {clinicalData.activeCases > 0 && (
                                            <tr>
                                                <td style={{ color: '#fff', fontWeight: '600' }}>Fever Screening & Isolation</td>
                                                <td>{clinicalData.name}</td>
                                                <td>Identify symptomatic individuals to stop spread.</td>
                                                <td style={{ color: '#93c5fd' }}>Medical Officer</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </ActionTable>
                            </Section>

                            <div style={{ marginTop: '4rem', padding: '2rem', background: '#1e293b', borderRadius: '12px', textAlign: 'center' }}>
                                <h3 style={{ color: 'white', marginBottom: '1rem' }}>Ready to Formalize Decision?</h3>
                                <PrimaryButton onClick={() => setViewMode('preview')}>
                                    <FiFileText /> Generate Ward Policy Brief
                                </PrimaryButton>
                            </div>
                        </BriefContent>
                    )}

                    {/* STATE 2: PREVIEW & DOWNLOAD */}
                    {selectedWard && clinicalData && priorityInfo && viewMode === 'preview' && (
                        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <SecondaryButton onClick={() => setViewMode('analysis')}>
                                    <FiEdit3 /> Back to Analysis
                                </SecondaryButton>
                                <PrimaryButton onClick={() => window.print()} style={{ width: 'auto' }}>
                                    <FiDownload /> Download Policy Brief (PDF)
                                </PrimaryButton>
                            </div>

                            <PreviewPaper className="print-content">
                                <div style={{ borderBottom: '2px solid black', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 'bold' }}>Public Health Policy Brief</h1>
                                        <div style={{ fontSize: '14px', marginTop: '5px', color: '#444' }}>Solapur Municipal Corporation • Ward {selectedWard.properties.Name}</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                                        <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                                        <div><strong>Ref:</strong> SMC-{selectedWard.properties.Name.substring(0, 3).toUpperCase()}-2026-001</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>1. Clinical Assessment</h3>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                        Ward <strong>{selectedWard.properties.Name}</strong> is currently presenting a <strong>{priorityInfo.level}</strong> profile.
                                        Primary concern is <strong>{clinicalData.name}</strong> ({clinicalData.type}).
                                        <strong>{clinicalData.activeCases} active cases</strong> reported with <strong>{clinicalData.trend} trend</strong>.
                                    </p>
                                    <p style={{ fontSize: '14px', lineHeight: '1.6', marginTop: '10px', fontStyle: 'italic' }}>
                                        <strong>Justification:</strong> {priorityInfo.reason}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>2. Risk Factors</h3>
                                    <ul style={{ fontSize: '14px', lineHeight: '1.6', paddingLeft: '20px' }}>
                                        <li><strong>Transmission Mode:</strong> {clinicalData.transmission}.</li>
                                        <li><strong>Environmental Susceptibility:</strong> HRI Score {clinicalData.score.toFixed(1)} indicates {clinicalData.score > 7 ? 'high' : 'moderate'} favorability for pathogen survival.</li>
                                    </ul>
                                </div>

                                <div style={{ marginBottom: '4rem' }}>
                                    <h3 style={{ fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>3. Mandated Actions</h3>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '10px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #000' }}>
                                                <th style={{ textAlign: 'left', padding: '8px' }}>Action Item</th>
                                                <th style={{ textAlign: 'left', padding: '8px' }}>Department</th>
                                                <th style={{ textAlign: 'left', padding: '8px' }}>Target</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clinicalData.type === 'Vector-Borne' ? (
                                                <>
                                                    <tr><td style={{ padding: '8px' }}>Targeted Fogging</td><td style={{ padding: '8px' }}>Health / Malaria</td><td style={{ padding: '8px' }}>Adult Mosquitoes</td></tr>
                                                    <tr><td style={{ padding: '8px' }}>Source Reduction</td><td style={{ padding: '8px' }}>SWM / Health</td><td style={{ padding: '8px' }}>Larval Breeding</td></tr>
                                                </>
                                            ) : (
                                                <>
                                                    <tr><td style={{ padding: '8px' }}>Chlorine Distribution</td><td style={{ padding: '8px' }}>Health (ASHA)</td><td style={{ padding: '8px' }}>Water Safety</td></tr>
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderTop: '1px solid #000', paddingTop: '2rem' }}>
                                    <div>Submitted By: AHEADLY Decision Support</div>
                                    <div>Approved By: __________________________<br /><span style={{ color: '#666' }}>Municipal Health Officer</span></div>
                                </div>
                            </PreviewPaper>
                        </div>
                    )}
                </MainPanel>
            </ContentGrid>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-content, .print-content * { visibility: visible; }
                    .print-content { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 40px; box-shadow: none; border-radius: 0; }
                }
            `}</style>
        </Container>
    );
};

export default HealthPriorityBrief;
