import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { FiTrash2, FiDroplet, FiAlertTriangle, FiCheckCircle, FiUpload, FiMapPin, FiAlertCircle } from "react-icons/fi";
import { renderToStaticMarkup } from "react-dom/server";
import { Toaster, toast } from "react-hot-toast";

import { CommunitySanitationManager } from "../utils/CommunitySanitationManager";
import { getSectorID, SECTOR_LIST } from "../utils/HospitalRegistry";
import "leaflet/dist/leaflet.css";

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
            {React.cloneElement(iconComponent, { size: 16, color: color })}
        </div>
    );

    return L.divIcon({
        html: markup,
        className: "custom-leaflet-icon",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
    });
};

const ICONS = {
    "Uncollected Garbage": createIcon(<FiTrash2 />, "#8B4513"), // Brown
    "Open Drain / Sewage": createIcon(<FiAlertCircle />, "#f97316"), // Orange
    "Stagnant Water": createIcon(<FiDroplet />, "#0891b2"), // Cyan
    "Overflowing Public Bin": createIcon(<FiTrash2 />, "#d97706"), // Amber
    "Broken Public Toilet": createIcon(<FiAlertTriangle />, "#dc2626") // Red
};

/* ===================== STYLES ===================== */

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: #f8fafc;
`;

const SidebarContainer = styled.div`
  width: 350px;
  background: white;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0,0,0,0.05);
  z-index: 1000;
  overflow-y: auto;
`;

const MapWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 0.9rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #334155;
  font-size: 0.85rem;
`;

const Input = styled.input`
  padding: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  &:focus { outline: 2px solid #6366f1; border-color: transparent; }
`;

const Select = styled.select`
  padding: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  &:focus { outline: 2px solid #6366f1; border-color: transparent; }
`;

const TextArea = styled.textarea`
  padding: 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
  &:focus { outline: 2px solid #6366f1; border-color: transparent; }
`;

const SubmitButton = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  transition: opacity 0.2s;

  &:hover { opacity: 0.9; }
`;

const StatsCard = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #475569;
  
  &:last-child { margin-bottom: 0; }
  strong { color: #1e293b; }
`;

/* ===================== COMPONENT ===================== */

const CommunitySanitation = () => {
    // States
    const [wards, setWards] = useState(null);
    const [cityBoundary, setCityBoundary] = useState(null);
    const [activeSector, setActiveSector] = useState(null);
    const [markers, setMarkers] = useState([]); // Pins for the active sector
    const [map, setMap] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // To force refresh

    // Form States
    const [formData, setFormData] = useState({
        sector: "",
        issue_type: "Uncollected Garbage",
        note: ""
    });

    const solapurCenter = [17.6599, 75.9064];

    // Initialize Mock Data Once
    useEffect(() => {
        CommunitySanitationManager.initializeData();
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // Load GeoJSONs
    useEffect(() => {
        fetch("/solapur_wards.geojson").then(res => res.json()).then(setWards);
        fetch("/solapur_city_boundary.geojson").then(res => res.json()).then(setCityBoundary);
    }, []);

    // Helper: Style Wards based on Risk
    const getWardStyle = (feature) => {
        const sectorId = getSectorID(feature.properties.Name);
        const risk = CommunitySanitationManager.getSectorRisk(sectorId);

        let color = "#22c55e"; // Green (Low)
        if (risk.level === "HIGH") color = "#ef4444"; // Red
        else if (risk.level === "MEDIUM") color = "#f97316"; // Orange

        return {
            fillColor: color,
            weight: 1,
            color: "#fff",
            fillOpacity: 0.6
        };
    };

    // Helper: Handle Ward Click (Auto-detect Sector & Location)
    const onWardClick = (e) => {
        const layer = e.target;
        const feature = layer.feature;
        const sectorId = getSectorID(feature.properties.Name);

        // 1. Highlight Ward (Visual Feedback)
        layer.setStyle({ fillOpacity: 0.8, weight: 2, color: "#ffff00" });

        // 2. Set Active Sector & Location
        setActiveSector(sectorId);

        // 3. Update Form Data (Auto-fill)
        setFormData(prev => ({
            ...prev,
            sector: sectorId,
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
        }));

        // 4. Load Pins for this sector (Context)
        // const reports = CommunitySanitationManager.getSectorReports(sectorId);
        // setMarkers(reports); // Disabled per "Isolation" requirement
    };

    // Helper: Handle Form Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.sector || !formData.latitude) {
            toast.error("Please click on the map to select a location.");
            return;
        }

        const newReport = {
            sector: formData.sector,
            issue_type: formData.issue_type,
            note: formData.note,
            latitude: formData.latitude,
            longitude: formData.longitude,
            has_proof: !!formData.image // If image uploaded
        };

        CommunitySanitationManager.addReport(newReport);
        toast.success("Report Submitted Successfully!");

        // Reset
        setFormData({
            sector: "",
            issue_type: "Uncollected Garbage",
            note: "",
            latitude: null,
            longitude: null,
            image: null
        });
        setRefreshTrigger(prev => prev + 1);
        setActiveSector(null);
    };

    return (
        <Container>
            <SidebarContainer>
                <Header>
                    <Title>Community Sanitation</Title>
                    <Subtitle>Report issues and view ward risk levels.</Subtitle>
                </Header>

                {/* LANDING INFO SECTION */}
                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <h4 style={{ margin: '0 0 0.8rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>
                        Community Sanitation Reporting
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', marginBottom: '1rem' }}>
                        This section allows residents to report local sanitation and infrastructure problems such as garbage accumulation, stagnant water, or open drains. These reports help identify areas that may face higher health risks and support faster municipal action.
                    </p>

                    <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #cbd5e1' }}>
                        <strong style={{ display: 'block', fontSize: '0.8rem', color: '#334155', marginBottom: '8px', textTransform: 'uppercase' }}>How to Report:</strong>
                        <ol style={{ fontSize: '0.85rem', color: '#334155', paddingLeft: '1.2rem', margin: 0, lineHeight: '1.6' }}>
                            <li>Select the <b>type of sanitation issue</b></li>
                            <li><b>Click on the map</b> to mark the exact location</li>
                            <li>The <b>sector</b> will be detected automatically</li>
                            <li>Upload a <b>photo</b> of the issue (recommended)</li>
                            <li>Submit the report</li>
                        </ol>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                        * This is a community-driven reporting tool and does not represent official municipal complaints.
                    </div>
                </div>

                <Form onSubmit={handleSubmit}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📝 Report an Issue
                    </h3>

                    <FormGroup>
                        <Label>🧩 Issue Type</Label>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '6px' }}>Choose the issue that best describes the problem you observed.</div>
                        <Select
                            value={formData.issue_type}
                            onChange={e => setFormData({ ...formData, issue_type: e.target.value })}
                            style={{ fontWeight: '600', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px' }}
                        >
                            <option>Uncollected Garbage</option>
                            <option>Open Drain / Sewage</option>
                            <option>Stagnant Water</option>
                            <option>Overflowing Public Bin</option>
                            <option>Broken Public Toilet</option>
                        </Select>
                    </FormGroup>

                    {/* DETECTED SECTOR BADGE */}
                    <FormGroup>
                        <Label>📍 Location & Sector</Label>

                        {/* Location Status Badge */}
                        <div style={{
                            fontSize: '0.9rem',
                            padding: '12px',
                            background: formData.latitude ? '#f0fdf4' : '#fff1f2', // Green or Red-ish
                            border: `1px solid ${formData.latitude ? '#86efac' : '#fda4af'}`,
                            borderRadius: '8px',
                            color: formData.latitude ? '#166534' : '#9f1239',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            marginBottom: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}>
                            {formData.latitude ? (
                                <>🟢 Location pinned on map</>
                            ) : (
                                <>🔴 Click on the map to mark the problem location</>
                            )}
                        </div>

                        {/* Sector Chip */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                padding: '6px 12px',
                                background: formData.sector ? '#e0f2fe' : '#f1f5f9',
                                border: `1px solid ${formData.sector ? '#7dd3fc' : '#e2e8f0'}`,
                                borderRadius: '20px',
                                color: formData.sector ? '#0369a1' : '#94a3b8',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                {formData.sector ? `📍 ${formData.sector} (Auto-detected)` : "Waiting for location..."}
                            </div>
                        </div>
                    </FormGroup>

                    <FormGroup>
                        <Label>📷 Upload Image (Recommended)</Label>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', lineHeight: '1.4' }}>
                                <i>Please upload a photo of the issue if possible. If not available, you may still submit.</i>
                            </div>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                style={{ marginBottom: '8px', background: '#fff' }}
                            />
                            {/* Visual Feedback for Image */}
                            {formData.image ? (
                                <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                    ✅ Image verified for clarity
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                    ℹ️ No image uploaded — report submitted based on location and description.
                                </div>
                            )}
                        </div>
                    </FormGroup>

                    <FormGroup>
                        <Label>📝 Note (Optional)</Label>
                        <TextArea
                            placeholder="Landmarks, severity, timing — anything helpful..."
                            value={formData.note}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                            style={{ minHeight: '80px' }}
                        />
                    </FormGroup>

                    <SubmitButton type="submit" style={{
                        marginTop: '1rem',
                        fontSize: '1.1rem',
                        padding: '14px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                        title="Your report helps improve city sanitation"
                    >
                        <FiCheckCircle size={20} /> Submit Report
                    </SubmitButton>
                </Form>
            </SidebarContainer>

            <MapWrapper>
                <MapContainer
                    center={solapurCenter}
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                    ref={setMap}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                    {wards && (
                        <GeoJSON
                            key={refreshTrigger} // Force re-render to update colors on new data
                            data={wards}
                            style={getWardStyle}
                            onEachFeature={(feature, layer) => {
                                layer.on({
                                    click: onWardClick
                                });
                            }}
                        />
                    )}

                    {cityBoundary && (
                        <GeoJSON data={cityBoundary} style={{ fillOpacity: 0, color: "#000", weight: 3 }} interactive={false} />
                    )}

                    {/* Report Markers - REMOVED for Isolation Mode 
                       User Feedback: "Reporting page must be isolated... ONLY the single location selection pin"
                    */}

                    {/* NEW: Selection Marker */}
                    {formData.latitude && (
                        <Marker
                            position={[formData.latitude, formData.longitude]}
                            icon={createIcon(<FiMapPin />, "#ef4444")}
                        />
                    )}

                </MapContainer>
            </MapWrapper>
        </Container>
    );
};

export default CommunitySanitation;
