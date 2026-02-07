import React, { useState } from "react";
import styled from "styled-components";
import { FiActivity, FiLock, FiCheckCircle, FiUser } from "react-icons/fi";
import { SECTOR_LIST } from "../utils/HospitalRegistry";
import { DiseaseDataManager } from "../utils/DiseaseDataManager";
import toast from "react-hot-toast";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8fafc;
  padding: 2rem;
`;

const Card = styled.div`
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  padding: 2.5rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  color: #1e293b;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 0.95rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #334155;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #6366f1;
    ring: 2px solid rgba(99,102,241,0.1);
  }
  &:disabled {
    background: #f1f5f9;
    color: #64748b;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
  background: white;
  &:focus {
    outline: none;
    border-color: #6366f1;
  }
`;

const Button = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
  margin-top: 1rem;

  &:hover {
    background: #4f46e5;
  }
`;

const AlertBox = styled.div`
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 0.75rem;
  border-radius: 4px;
  color: #1e40af;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const HospitalApp = () => {
    const [currentUser, setCurrentUser] = useState(null); // { name, ward }

    // Login State
    const [facilityName, setFacilityName] = useState("");
    const [selectedWard, setSelectedWard] = useState("");

    // Report State
    const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
    const [counts, setCounts] = useState({ fever: 0, diarrhea: 0, respiratory: 0 });

    const handleLogin = (e) => {
        e.preventDefault();
        if (!facilityName || !selectedWard) return;

        setCurrentUser({ name: facilityName, ward: selectedWard });
        toast.success(`Welcome, ${facilityName}`);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setFacilityName("");
        setSelectedWard("");
        setCounts({ fever: 0, diarrhea: 0, respiratory: 0 });
    };

    const handleSubmitReport = (e) => {
        e.preventDefault();

        const report = {
            hospital: currentUser.name,
            ward: currentUser.ward,
            date: reportDate,
            fever: parseInt(counts.fever) || 0,
            diarrhea: parseInt(counts.diarrhea) || 0,
            respiratory: parseInt(counts.respiratory) || 0,
            timestamp: new Date().toISOString()
        };

        const success = DiseaseDataManager.saveReport(report);

        if (success) {
            toast.success("Report submitted successfully!");
            // Reset counts? Or keep them for reference? 
            // Typically forms reset or stay to show what was submitted. Let's keep for confirmation.
        } else {
            toast.error("Failed to save report.");
        }
    };

    // --- VIEW 1: AUTH ---
    if (!currentUser) {
        return (
            <Container>
                <Card>
                    <Header>
                        <Title><FiLock /> Staff Login</Title>
                        <Subtitle>Enter Facility Details to Begin Reporting</Subtitle>
                    </Header>
                    <Form onSubmit={handleLogin}>
                        <FormGroup>
                            <Label>Facility / Clinic Name</Label>
                            <Input
                                type="text"
                                placeholder="e.g., City Hospital"
                                value={facilityName}
                                onChange={e => setFacilityName(e.target.value)}
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>Sector / Ward</Label>
                            <Select
                                value={selectedWard}
                                onChange={e => setSelectedWard(e.target.value)}
                                required
                            >
                                <option value="">-- Select Ward --</option>
                                {SECTOR_LIST.map((ward, i) => (
                                    <option key={i} value={ward}>{ward}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <Button type="submit">Continue to Reporting</Button>
                    </Form>
                </Card>
            </Container>
        );
    }

    // --- VIEW 2: REPORTING ---
    return (
        <Container>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <Subtitle>Welcome, <b>{currentUser.name}</b></Subtitle>
                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: '600' }}
                    >
                        Logout
                    </button>
                </div>

                <Header>
                    <Title><FiActivity /> Daily Case Report</Title>
                    <Subtitle>Submit aggregated daily counts for disease surveillance.</Subtitle>
                </Header>

                <AlertBox>
                    Reporting for Ward: <b>{currentUser.ward}</b>
                </AlertBox>

                <Form onSubmit={handleSubmitReport}>
                    <FormGroup>
                        <Label>Reporting Date</Label>
                        <Input
                            type="date"
                            value={reportDate}
                            onChange={e => setReportDate(e.target.value)}
                            required
                        />
                    </FormGroup>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <FormGroup>
                            <Label>Fever Cases</Label>
                            <Input
                                type="number"
                                min="0"
                                value={counts.fever}
                                onChange={e => setCounts({ ...counts, fever: e.target.value })}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Diarrhea Cases</Label>
                            <Input
                                type="number"
                                min="0"
                                value={counts.diarrhea}
                                onChange={e => setCounts({ ...counts, diarrhea: e.target.value })}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Respiratory Cases</Label>
                            <Input
                                type="number"
                                min="0"
                                value={counts.respiratory}
                                onChange={e => setCounts({ ...counts, respiratory: e.target.value })}
                            />
                        </FormGroup>
                    </div>

                    <Button type="submit">Submit Report</Button>
                </Form>
            </Card>
        </Container>
    );
};

export default HospitalApp;
