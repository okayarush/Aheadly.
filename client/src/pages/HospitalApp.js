import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  FiActivity, FiLock, FiCheckCircle, FiShield, FiDatabase, FiCpu, FiFileText,
  FiArrowRight, FiAlertTriangle, FiThermometer, FiDroplet, FiWind, FiSun, FiMap
} from "react-icons/fi";
import { SECTOR_LIST } from "../utils/HospitalRegistry";
import { DiseaseDataManager } from "../utils/DiseaseDataManager";
import toast from "react-hot-toast";

// --- ANIMATIONS ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

const flowLineAnim = keyframes`
  0% { transform: scaleX(0); transform-origin: left; }
  50% { transform: scaleX(1); transform-origin: left; }
  50.1% { transform: scaleX(1); transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; }
`;

// --- STYLED COMPONENTS (CENTRALIZED COMMAND THEME) ---
const Container = styled.div`
  min-height: 100vh;
  background-color: #020617; /* Slate 950 */
  color: #e2e8f0;
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Navbar = styled.nav`
  width: 100%;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #1e293b;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  color: white;
  text-transform: uppercase;
`;

const StatusBadge = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// --- MAIN CONTENT WRAPPER ---
const MainContent = styled.main`
  max-width: 900px;
  width: 100%;
  padding: 4rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
`;

// --- INTRO SECTION ---
const IntroSection = styled.div`
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
  max-width: 800px;
`;

const PageTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  letter-spacing: -0.025em;
  line-height: 1.2;
  
  span {
    color: #6366f1; /* Indigo 500 */
  }
`;

const SubText = styled.p`
  color: #94a3b8;
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 650px;
  margin: 0 auto 2rem;
  
  strong {
    color: #e2e8f0;
    font-weight: 600;
  }
`;

// --- PIPELINE VISUALIZATION ---
const PipelineWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  margin-bottom: 2rem;
  padding: 2rem;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 16px;
  animation: ${fadeIn} 0.8s ease-out;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const StepCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  text-align: center;
  position: relative;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }

  .icon {
    width: 48px;
    height: 48px;
    background: #1e293b;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: #64748b;
    border: 1px solid #334155;
    transition: all 0.3s;
  }

  &:hover .icon {
    border-color: #6366f1;
    color: #818cf8;
    background: rgba(99, 102, 241, 0.1);
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
  }

  h4 {
    color: #e2e8f0;
    font-size: 0.9rem;
    font-weight: 700;
    margin: 0;
  }

  p {
    color: #64748b;
    font-size: 0.8rem;
    margin: 0;
    line-height: 1.4;
  }
`;

const ArrowConnector = styled.div`
  flex: 0 0 40px;
  height: 2px;
  background: #334155;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0; 
    left: 0;
    width: 100%;
    height: 100%;
    background: #6366f1;
    animation: ${flowLineAnim} 2s infinite ease-in-out;
  }

  @media (max-width: 768px) {
    width: 2px;
    height: 40px;
    flex: 0 0 40px;
    
    &::after {
        animation: none; /* Simplify for vertical mobile */
    }
  }
`;

// --- ACCESS CONTROL CARD ---
const AccessCard = styled.div`
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
  animation: ${fadeIn} 1s ease-out;
`;

const CardHeader = styled.div`
  background: #1a2436;
  padding: 1.5rem;
  border-bottom: 1px solid #334155;
  text-align: center;
  
  h3 {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: #f8fafc;
    font-size: 1.1rem;
  }
`;

const CardBody = styled.div`
  padding: 2rem;
`;

const InputGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #94a3b8;
    margin-bottom: 0.5rem;
  }

  input, select {
    width: 100%;
    padding: 0.875rem;
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    color: white;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  background: #4f46e5;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #4338ca;
    transform: translateY(-1px);
  }
`;

// --- REPORTING FORM STYLES ---
const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  animation: ${fadeIn} 0.4s ease-out;
`;

const FormHeader = styled.div`
  background: #0f172a;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h4`
  color: #60a5fa;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
`;

const CompactLabel = styled.label`
  display: block;
  font-size: 0.8rem;
  color: #cbd5e1;
  margin-bottom: 0.4rem;
`;

// --- COMPONENT ---
const HospitalApp = () => {
  const [view, setView] = useState('LANDING'); // LANDING, FORM, SUCCESS
  const [user, setUser] = useState({ facility: '', ward: '' });

  const [formData, setFormData] = useState({
    dengue: '', malaria: '', chikungunya: '',
    add: '', cholera: '', typhoid: '',
    ari: '', ili: '',
    heat: ''
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (user.facility && user.ward) setView('FORM');
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    if (value === '' || (parseInt(value) >= 0 && !isNaN(value))) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const report = {
      ward: user.ward,
      facility: user.facility,
      ...formData,
      timestamp: new Date().toISOString()
    };
    const success = DiseaseDataManager.saveReport(report);
    if (success) {
      setView('SUCCESS');
      toast.success("Data successfully synced to Digital Twin");
    } else {
      toast.error("Submission failed");
    }
  };

  const resetForm = () => {
    setFormData({
      dengue: '', malaria: '', chikungunya: '',
      add: '', cholera: '', typhoid: '',
      ari: '', ili: '',
      heat: ''
    });
    setView('LANDING');
    setUser({ facility: '', ward: '' });
  };

  return (
    <Container>
      {/* TOP BAR */}
      <Navbar>
        <Logo>
          <FiShield color="#ef4444" size={24} />
          SMC × AHEADLY
        </Logo>
        <StatusBadge>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
          LIVE SURVEILLANCE
        </StatusBadge>
      </Navbar>

      <MainContent>

        {/* 1. HERO CONTEXT (LANDING) */}
        {view === 'LANDING' && (
          <>
            <IntroSection>
              <PageTitle>Hospital Disease Reporting Portal</PageTitle>
              <SubText>
                This is the <strong>official ward-level reporting system</strong> for Solapur Municipal Corporation.
                Your data is used for <strong>outbreak detection, risk scoring (HRI), and city action</strong>.
                <br /><br />
                <span style={{ color: '#ef4444', fontSize: '0.9em', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <FiAlertTriangle style={{ display: 'inline', verticalAlign: 'middle' }} /> Early reporting enables faster containment and saves lives.
                </span>
              </SubText>
            </IntroSection>

            <PipelineWrapper>
              <StepCard>
                <div className="icon"><FiDatabase /></div>
                <h4>Hospital Input</h4>
                <p>Aggregated Cases</p>
              </StepCard>
              <ArrowConnector />
              <StepCard>
                <div className="icon"><FiActivity /></div>
                <div className="content">
                  <h4>Digital Twin</h4>
                  <p>Live Mapping</p>
                </div>
              </StepCard>
              <ArrowConnector />
              <StepCard>
                <div className="icon"><FiMap /></div>
                <div className="content">
                  <h4>Health Risk Index</h4>
                  <p>Ward Scoring</p>
                </div>
              </StepCard>
              <ArrowConnector />
              <StepCard>
                <div className="icon"><FiCheckCircle /></div>
                <div className="content">
                  <h4>City Action</h4>
                  <p>Intervention</p>
                </div>
              </StepCard>
            </PipelineWrapper>

            <AccessCard>
              <CardHeader>
                <h3><FiLock /> Authorized Clinical Access</h3>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleLogin}>
                  <InputGroup>
                    <label>Facility Registration Name</label>
                    <input
                      type="text"
                      placeholder="E.g. CITY GENERAL HOSPITAL"
                      required
                      value={user.facility}
                      onChange={e => setUser({ ...user, facility: e.target.value })}
                    />
                  </InputGroup>
                  <InputGroup>
                    <label>Assigned Ward Sector</label>
                    <select
                      required
                      value={user.ward}
                      onChange={e => setUser({ ...user, ward: e.target.value })}
                    >
                      <option value="">SELECT SECTOR...</option>
                      {SECTOR_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </InputGroup>
                  <PrimaryButton type="submit">
                    Authenticate & Proceed <FiArrowRight />
                  </PrimaryButton>
                  <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                    Action Logging ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                  </div>
                </form>
              </CardBody>
            </AccessCard>
          </>
        )}

        {/* 2. REPORTING FORM (LOCKED VIEW) */}
        {view === 'FORM' && (
          <FormContainer>
            <FormHeader>
              <div>
                <h2 style={{ color: 'white', fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Daily Disease Case Submission</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                  Reporting for: <strong style={{ color: '#60a5fa' }}>{user.facility}</strong> in <strong style={{ color: '#60a5fa' }}>{user.ward}</strong>
                </p>
              </div>
              <StatusBadge>RECORDING</StatusBadge>
            </FormHeader>

            <div style={{ padding: '2rem' }}>
              <form onSubmit={handleSubmit}>
                <SectionTitle><FiAlertTriangle /> Vector-Borne Diseases</SectionTitle>
                <InputGrid>
                  <div><CompactLabel>Dengue Cases</CompactLabel><input type="number" min="0" placeholder="0" className="styled-input" name="dengue" value={formData.dengue} onChange={handleInput} /></div>
                  <div><CompactLabel>Malaria Cases</CompactLabel><input type="number" min="0" placeholder="0" className="styled-input" name="malaria" value={formData.malaria} onChange={handleInput} /></div>
                  <div><CompactLabel>Chikungunya</CompactLabel><input type="number" min="0" placeholder="0" className="styled-input" name="chikungunya" value={formData.chikungunya} onChange={handleInput} /></div>
                </InputGrid>

                <SectionTitle><FiDroplet /> Water-Borne Diseases</SectionTitle>
                <InputGrid>
                  <div><CompactLabel>Acute Diarrhea (ADD)</CompactLabel><input type="number" min="0" placeholder="0" className="styled-input" name="add" value={formData.add} onChange={handleInput} /></div>
                  <div><CompactLabel>Cholera Cases</CompactLabel><input type="number" min="0" placeholder="0" className="styled-input" name="cholera" value={formData.cholera} onChange={handleInput} /></div>
                  <div><CompactLabel>Typhoid Cases</CompactLabel><input type="number" min="0" placeholder="0" className="styled-input" name="typhoid" value={formData.typhoid} onChange={handleInput} /></div>
                </InputGrid>

                <SectionTitle><FiWind /> Respiratory Diseases</SectionTitle>
                <InputGrid>
                  <div><CompactLabel>Acute Resp. Infection</CompactLabel><input type="number" min="0" placeholder="0" className="styled-input" name="ari" value={formData.ari} onChange={handleInput} /></div>
                  <div><CompactLabel>Influenza-like Illness</CompactLabel><input type="number" min="0" placeholder="0" className="styled-input" name="ili" value={formData.ili} onChange={handleInput} /></div>
                </InputGrid>

                <SectionTitle><FiSun /> Environmental</SectionTitle>
                <InputGrid>
                  <div><CompactLabel>Heat Illness / Stroke</CompactLabel><input type="number" min="0" placeholder="0" className="styled-input" name="heat" value={formData.heat} onChange={handleInput} /></div>
                </InputGrid>

                <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', borderTop: '1px solid #334155', paddingTop: '2rem' }}>
                  <button type="button" onClick={() => setView('LANDING')} style={{ background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', padding: '1rem', borderRadius: '8px', cursor: 'pointer', flex: 1 }}>
                    Cancel
                  </button>
                  <PrimaryButton type="submit" style={{ flex: 2 }}>
                    Secure Submit <FiCheckCircle />
                  </PrimaryButton>
                </div>
              </form>
            </div>
            {/* Inline styles for inputs to avoid massive styled component block repetition */}
            <style>{`
                            .styled-input {
                                width: 100%;
                                background: #0f172a;
                                border: 1px solid #334155;
                                color: white;
                                padding: 0.75rem;
                                border-radius: 6px;
                                font-family: 'JetBrains Mono', monospace;
                            }
                            .styled-input:focus {
                                outline: none;
                                border-color: #6366f1;
                            }
                        `}</style>
          </FormContainer>
        )}

        {/* 3. SUCCESS / CONFIRMATION */}
        {view === 'SUCCESS' && (
          <div style={{ textAlign: 'center', maxWidth: '600px', padding: '3rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px' }}>
            <FiCheckCircle size={80} color="#22c55e" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.75rem' }}>Data Logged to Intelligence Platform</h2>
            <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '2rem' }}>
              The <strong>Digital Twin</strong> and <strong>Ward Risk Models (HRI)</strong> have been updated with your report for <strong>{user.ward}</strong>.
              <br />
              Municipal teams have been notified of any critical signals.
            </p>
            <PrimaryButton onClick={resetForm} style={{ maxWidth: '300px', margin: '0 auto' }}>
              Submit Another Report
            </PrimaryButton>
          </div>
        )}

      </MainContent>
    </Container>
  );
};

export default HospitalApp;
