import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MapContainer, GeoJSON } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import {
  FiActivity,
  FiAlertTriangle,
  FiThermometer,
  FiDroplet,
  FiTrash2,
  FiArrowRight,
  FiMap,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiShield
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { DashboardStatManager } from '../utils/DashboardStatManager';
import { getSectorID } from '../utils/HospitalRegistry';
import { hriBridgeService } from '../services/hriBridgeService';
import { generateDiseaseSignal } from '../services/diseaseService';
import { Popup, Marker } from 'react-leaflet';

// --- STYLED COMPONENTS ---

const DashboardContainer = styled.div`
  padding: 2rem;
  background: #0f172a; /* Slate 900 - Dark Command Center Theme */
  min-height: 100vh;
  color: #f8fafc;
  font-family: 'Inter', sans-serif;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  border-bottom: 1px solid #334155;
  padding-bottom: 1rem;
`;

const TitleGroup = styled.div``;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Subtitle = styled.div`
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 4px;
`;

const DateDisplay = styled.div`
  color: #94a3b8;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 600px) {
      display: none;
  }
`;

const HeroSection = styled.div`
  margin-bottom: 2rem;
`;

const HealthCard = styled(motion.div)`
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;

  &::before {
      content: '';
      position: absolute;
      top: 0; 
      left: 0;
      width: 4px;
      height: 100%;
      background: ${props => props.color || '#3b82f6'};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
`;

const HealthScore = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const ScoreCircle = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 8px solid ${props => props.color || '#3b82f6'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.05);
  box-shadow: 0 0 20px ${props => props.color ? props.color + '40' : 'rgba(59,130,246,0.2)'};
`;

const ScoreValue = styled.span`
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  line-height: 1;
`;

const ScoreLabel = styled.span`
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: uppercase;
  font-weight: 600;
`;

const HealthInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HealthStatus = styled.h2`
  font-size: 1.8rem;
  margin: 0;
  color: ${props => props.color || 'white'};
  font-weight: 700;
`;

const HealthDesc = styled.p`
  color: #94a3b8;
  margin: 0;
  max-width: 400px;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled(motion.div)`
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.2s;

  &:hover {
      transform: translateY(-2px);
      border-color: #475569;
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: white;
`;

const MetricContext = styled.div`
  font-size: 0.8rem;
  color: ${props => props.color || '#64748b'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MainContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MapPanel = styled.div`
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.5rem;
  height: 500px;
  display: flex;
  flex-direction: column;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PanelTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MapFrame = styled.div`
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #0f172a;
  position: relative;
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InfoCard = styled.div`
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1.25rem;
`;

const CardTitle = styled.h4`
    font-size: 0.95rem;
    color: #cbd5e1;
    margin: 0 0 1rem 0;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const List = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const ListItem = styled.li`
    padding: 0.75rem;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
    font-size: 0.85rem;
    color: #e2e8f0;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    border-left: 3px solid ${props => props.color || '#475569'};
`;

const ActionGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
`;

const ActionButton = styled.button`
    background: transparent;
    border: 1px solid #475569;
    color: #cbd5e1;
    padding: 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;

    &:hover {
        background: #334155;
        border-color: #64748b;
        color: white;
    }
    
    svg {
        font-size: 1.2rem;
        color: #3b82f6;
    }
`;

const LoadingContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  color: #94a3b8;
  font-size: 1.2rem;
`;

// --- COMPONENT ---

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [wardsGeo, setWardsGeo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Parallel fetch
        const [statsData, geoData] = await Promise.all([
          DashboardStatManager.getCityOverview(),
          fetch("/solapur_wards.geojson").then(res => res.json())
        ]);

        setStats(statsData);
        setWardsGeo(geoData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !stats) {
    return <LoadingContainer>Initializing City Command Center...</LoadingContainer>;
  }

  // Color definitions
  const getStatusColor = (status) => {
    switch (status) {
      case "Critical": return "#ef4444";
      case "High Risk": return "#f97316";
      case "Moderate": return "#f59e0b";
      default: return "#10b981";
    }
  };

  const statusColor = getStatusColor(stats.cityStatus);

  const wardStyle = (feature) => {
    const sectorId = getSectorID(feature.properties.Name);
    // Find ward risk in stats
    const risk = stats.wardRisks.find(w => w.sector === sectorId);

    let color = "#3b82f6"; // Default Blue
    if (risk) color = risk.hriColor;

    return {
      fillColor: color,
      weight: 1,
      color: "#1e293b",
      fillOpacity: 0.7
    };
  };

  // Map Style Function
  // WardPopup was unused and causing confusion. Removed.

  return (
    <DashboardContainer>
      <Header>
        <TitleGroup>
          <Title><FiActivity /> City Intelligence Center</Title>
          <Subtitle>Real-time ecosystem monitoring & risk assessment</Subtitle>
        </TitleGroup>
        <DateDisplay>
          <FiClock /> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </DateDisplay>
      </Header>

      {/* 1. HERO: CITY HEALTH SNAPSHOT */}
      <HeroSection>
        <HealthCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          color={statusColor}
        >
          <HealthScore>
            <ScoreCircle color={statusColor}>
              <ScoreValue>{stats.cityHRI}</ScoreValue>
              <ScoreLabel>HRI Score</ScoreLabel>
            </ScoreCircle>
            <HealthInfo>
              <HealthStatus color={statusColor}>{stats.cityStatus} Health Status</HealthStatus>
              <HealthDesc>
                Composite risk index based on urban heat, water stagnation updates, disease signals, and {stats.activeReports} active citizen reports.
              </HealthDesc>
            </HealthInfo>
          </HealthScore>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Mini Action */}
            <ActionButton onClick={() => navigate('/digital-twin')} style={{ flexDirection: 'row', padding: '10px 20px', background: 'rgba(255,255,255,0.1)', border: 'none' }}>
              View Full Analysis <FiArrowRight />
            </ActionButton>
          </div>
        </HealthCard>
      </HeroSection>

      {/* 2. KEY METRICS ROW */}
      <MetricsGrid>
        <MetricCard whileHover={{ scale: 1.02 }}>
          <MetricHeader>Critical Wards <FiAlertTriangle /></MetricHeader>
          <MetricValue>{stats.highRiskWards}</MetricValue>
          <MetricContext color="#ef4444">Requires immediate attention</MetricContext>
        </MetricCard>

        <MetricCard whileHover={{ scale: 1.02 }}>
          <MetricHeader>Heat Hotspots <FiThermometer /></MetricHeader>
          <MetricValue>{stats.heatHotspots}</MetricValue>
          <MetricContext color="#f97316">LST {'>'} 75th percentile</MetricContext>
        </MetricCard>

        <MetricCard whileHover={{ scale: 1.02 }}>
          <MetricHeader>Stagnation Risk <FiDroplet /></MetricHeader>
          <MetricValue>{stats.stagnationWards}</MetricValue>
          <MetricContext color="#3b82f6">High vector breeding risk</MetricContext>
        </MetricCard>

        <MetricCard whileHover={{ scale: 1.02 }}>
          <MetricHeader>Citizen Reports <FiTrash2 /></MetricHeader>
          <MetricValue>{stats.activeReports}</MetricValue>
          <MetricContext color="#10b981">
            Active in last 7 days
          </MetricContext>
        </MetricCard>
      </MetricsGrid>

      {/* 3. CENTRAL GRID */}
      <MainContentGrid>
        {/* 3a. RISK MAP PREVIEW */}
        <MapPanel>
          <PanelHeader>
            <PanelTitle><FiMap /> City Risk Heatmap</PanelTitle>
            <ActionButton onClick={() => navigate('/digital-twin')} style={{ padding: '6px 12px', fontSize: '0.8rem', flexDirection: 'row' }}>
              Open Digital Twin
            </ActionButton>
          </PanelHeader>
          <MapFrame>
            {wardsGeo && (
              <MapContainer
                center={[17.6599, 75.9064]}
                zoom={12}
                style={{ height: "100%", width: "100%", background: '#0f172a' }}
                zoomControl={false}
                scrollWheelZoom={false}
                dragging={false}
                doubleClickZoom={false}
              >
                <GeoJSON
                  data={wardsGeo}
                  style={wardStyle}
                  onEachFeature={(feature, layer) => {
                    // Bind a simple tooltip for now as async popups require component refactoring
                    // The full Digital Twin has the complex popup.
                    layer.bindTooltip(`${feature.properties.Name}: HRI Analysis Required`);
                  }}
                />
              </MapContainer>
            )}
          </MapFrame>
        </MapPanel>

        {/* 3b. SIDE PANEL (Drivers & Signals) */}
        <SidePanel>
          {/* RISK DRIVERS */}
          <InfoCard>
            <CardTitle><FiTrendingUp /> Top Risk Drivers</CardTitle>
            <List>
              {stats.riskDrivers.map((driver, i) => (
                <ListItem key={i} color="#f59e0b">
                  <FiAlertTriangle style={{ minWidth: '16px', color: '#f59e0b' }} />
                  {driver}
                </ListItem>
              ))}
            </List>
          </InfoCard>

          {/* RECENT SIGNALS */}
          <InfoCard>
            <CardTitle><FiActivity /> Live Signals (7d)</CardTitle>
            <List>
              {stats.recentSignals.length > 0 ? stats.recentSignals.map(signal => (
                <ListItem key={signal.id} color="#3b82f6">
                  <span style={{ fontSize: '1.2rem' }}>{signal.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', color: 'white' }}>{signal.header}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{signal.message}</div>
                  </div>
                </ListItem>
              )) : (
                <ListItem color="#10b981">
                  <FiCheckCircle /> No critical signals in last 7 days.
                </ListItem>
              )}
            </List>
          </InfoCard>

          {/* QUICK ACTIONS */}
          <InfoCard>
            <CardTitle>Strategy Command</CardTitle>
            <ActionGrid>
              <ActionButton onClick={() => navigate('/health-priority')}>
                <FiShield /> Health Strategy
              </ActionButton>
              <ActionButton onClick={() => navigate('/intervention-planner')}>
                <FiCheckCircle /> Intervention
              </ActionButton>
              <ActionButton onClick={() => navigate('/community-sanitation')}>
                <FiTrash2 /> Reports
              </ActionButton>
              <ActionButton onClick={() => navigate('/digital-twin')}>
                <FiActivity /> Monitor
              </ActionButton>
            </ActionGrid>
          </InfoCard>
        </SidePanel>
      </MainContentGrid>
    </DashboardContainer>
  );
}