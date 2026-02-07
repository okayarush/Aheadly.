import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiDownload, FiPrinter, FiShare2, FiFileText, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Import services
import analysisService from '../services/analysisService';
import { useCityData } from '../context/CityDataContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2rem;
`;

const HeaderInfo = styled.div``;

const Title = styled.h1`
  color: #1e293b;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 1.125rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #8b5cf6;
    background: #f3f4f6;
  }
`;

const PolicyDocument = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Georgia', serif;
  line-height: 1.6;
`;

const DocumentHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
`;

const DocumentTitle = styled.h1`
  color: #1e293b;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const DocumentSubtitle = styled.h2`
  color: #64748b;
  font-size: 1.25rem;
  font-weight: normal;
  margin-bottom: 0.5rem;
`;

const DocumentMeta = styled.div`
  color: #9ca3af;
  font-size: 0.875rem;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h3`
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  border-left: 4px solid #8b5cf6;
  padding-left: 1rem;
`;

const SectionContent = styled.div`
  color: #374151;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
`;

const RecommendationItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #10b981;
`;

const RecommendationNumber = styled.span`
  background: #10b981;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const RecommendationText = styled.div`
  flex: 1;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
`;

const MetricBox = styled.div`
  text-align: center;
  padding: 1rem;
  background: #f1f5f9;
  border-radius: 8px;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e293b;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
`;


const PolicyBrief = () => {
    const { selectedCity } = useCityData();
    const [loading, setLoading] = useState(true);
    const [policyData, setPolicyData] = useState(null);

    useEffect(() => {
        fetchPolicyBrief();
    }, [selectedCity]);

    const fetchPolicyBrief = async () => {
        try {
            setLoading(true);
            const response = await analysisService.generatePolicyBrief(
                1, // cityId
                selectedCity.coordinates[0], // lat
                selectedCity.coordinates[1], // lon
                'comprehensive' // focus
            );
            setPolicyData(response.data);
            toast.success('Policy brief generated successfully');
        } catch (error) {
            console.error('Error fetching policy brief:', error);
            toast.error('Failed to generate policy brief');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container>
                <Header>
                    <HeaderInfo>
                        <Title>Policy Brief</Title>
                        <Subtitle>Generating actionable recommendations...</Subtitle>
                    </HeaderInfo>
                </Header>
                <LoadingSpinner />
            </Container>
        );
    }

    if (!policyData) {
        return (
            <Container>
                <Header>
                    <HeaderInfo>
                        <Title>Policy Brief</Title>
                        <Subtitle>Unable to generate policy brief</Subtitle>
                    </HeaderInfo>
                </Header>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <HeaderInfo>
                    <Title>Policy Brief</Title>
                    <Subtitle>Actionable recommendations for urban planners</Subtitle>
                </HeaderInfo>
                <Actions>
                    <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <FiDownload size={16} />
                        Download PDF
                    </ActionButton>
                    <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <FiPrinter size={16} />
                        Print
                    </ActionButton>
                    <ActionButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <FiShare2 size={16} />
                        Share
                    </ActionButton>
                </Actions>
            </Header>

            <PolicyDocument
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <DocumentHeader>
                    <DocumentTitle>{policyData.title}</DocumentTitle>
                    <DocumentSubtitle>NASA Earth Observation Data for Sustainable Urban Planning</DocumentSubtitle>
                    <DocumentMeta>
                        Generated on {new Date(policyData.generatedAt).toLocaleDateString()} | {selectedCity.name}, {selectedCity.country}
                    </DocumentMeta>
                </DocumentHeader>

                <Section>
                    <SectionTitle>Executive Summary</SectionTitle>
                    <SectionContent>
                        <strong>Overview:</strong> {policyData.executiveSummary.overview}
                    </SectionContent>
                    <SectionContent>
                        <strong>Key Findings:</strong>
                        <ul>
                            {policyData.executiveSummary.keyFindings.map((finding, index) => (
                                <li key={index} style={{ marginBottom: '0.5rem' }}>{finding}</li>
                            ))}
                        </ul>
                    </SectionContent>
                    <SectionContent>
                        <strong>Urgency Level:</strong> {policyData.executiveSummary.urgency}
                    </SectionContent>
                </Section>

                <Section>
                    <SectionTitle>Immediate Policy Recommendations</SectionTitle>
                    <RecommendationList>
                        {policyData.policyRecommendations.immediate.map((rec, index) => (
                            <RecommendationItem key={index}>
                                <RecommendationNumber>{index + 1}</RecommendationNumber>
                                <RecommendationText>
                                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{rec.policy}</div>
                                    <div style={{ marginBottom: '0.5rem' }}>{rec.description}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                        Timeline: {rec.timeline} | Impact: {rec.impact} | Feasibility: {rec.feasibility}
                                    </div>
                                </RecommendationText>
                            </RecommendationItem>
                        ))}
                    </RecommendationList>
                </Section>

                <Section>
                    <SectionTitle>Implementation Strategy</SectionTitle>
                    <SectionContent>
                        <strong>Governance Structure:</strong> {policyData.implementationStrategy.governance.structure}
                    </SectionContent>
                    <SectionContent>
                        <strong>Coordination:</strong> {policyData.implementationStrategy.governance.coordination}
                    </SectionContent>
                    <SectionContent>
                        <strong>Financing:</strong>
                        <ul>
                            {policyData.implementationStrategy.financing.sources.map((source, index) => (
                                <li key={index}>{source}</li>
                            ))}
                        </ul>
                        <div style={{ marginTop: '0.5rem' }}>
                            Estimated Cost: {policyData.implementationStrategy.financing.estimatedCost} |
                            ROI: {policyData.implementationStrategy.financing.returnOnInvestment}
                        </div>
                    </SectionContent>
                </Section>

                <Section>
                    <SectionTitle>Monitoring Framework</SectionTitle>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {policyData.monitoringFramework.kpis.map((kpi, index) => (
                            <div key={index} style={{
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '8px',
                                borderLeft: '4px solid #3b82f6'
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{kpi.indicator}</div>
                                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                    Target: {kpi.target} | Frequency: {kpi.frequency}
                                </div>
                            </div>
                        ))}
                    </div>
                    <SectionContent>
                        <strong>Data Sources:</strong>
                        <ul>
                            {policyData.monitoringFramework.dataSources.map((source, index) => (
                                <li key={index}>{source}</li>
                            ))}
                        </ul>
                    </SectionContent>
                </Section>

                <Section>
                    <SectionTitle>Risk Mitigation</SectionTitle>
                    <SectionContent>
                        <strong>Political Risks:</strong> {policyData.riskMitigation.politicalRisks}
                    </SectionContent>
                    <SectionContent>
                        <strong>Financial Risks:</strong> {policyData.riskMitigation.financialRisks}
                    </SectionContent>
                    <SectionContent>
                        <strong>Technical Risks:</strong> {policyData.riskMitigation.technicalRisks}
                    </SectionContent>
                </Section>

                <Section>
                    <SectionTitle>Data Sources & Quality</SectionTitle>
                    <SectionContent>
                        <strong>Data Quality:</strong> {policyData.dataQuality}
                    </SectionContent>
                    <SectionContent>
                        <strong>Confidence Level:</strong> {policyData.confidenceLevel}
                    </SectionContent>
                    <SectionContent>
                        <strong>Valid Until:</strong> {new Date(policyData.validUntil).toLocaleDateString()}
                    </SectionContent>
                </Section>
            </PolicyDocument>
        </Container>
    );
};


export default PolicyBrief;
