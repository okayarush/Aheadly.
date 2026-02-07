import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiDatabase, FiGlobe, FiLink, FiDownload, FiInfo, FiExternalLink } from 'react-icons/fi';

const breakpoints = {
  mobile: '600px',
  tablet: '900px',
};

const Container = styled.div`
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b69 100%);

  @media (min-width: ${breakpoints.mobile}) {
    padding: 1.5rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    padding: 2rem;
  }
`;

const Header = styled.div`
  margin-bottom: 1.5rem;

  @media (min-width: ${breakpoints.tablet}) {
    margin-bottom: 2rem;
  }
`;

const Title = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #fff, #667eea, #f093fb);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;

  @media (min-width: ${breakpoints.mobile}) {
    font-size: 1.75rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.4;

  @media (min-width: ${breakpoints.mobile}) {
    font-size: 1rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 1.125rem;
  }
`;

const DataSourcesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: ${breakpoints.mobile}) {
    gap: 1.25rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }
`;

const DataSourceCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  @media (min-width: ${breakpoints.mobile}) {
    padding: 1.5rem;
    border-radius: 15px;
  }

  @media (min-width: ${breakpoints.tablet}) {
    padding: 2rem;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;

  @media (min-width: ${breakpoints.mobile}) {
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const SourceIcon = styled.div`
  padding: 0.625rem;
  border-radius: 10px;
  background: ${props => props.color};
  color: white;
  flex-shrink: 0;

  @media (min-width: ${breakpoints.mobile}) {
    padding: 0.75rem;
    border-radius: 12px;
  }
`;

const SourceInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SourceTitle = styled.h3`
  color: white;
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
  word-wrap: break-word;

  @media (min-width: ${breakpoints.mobile}) {
    font-size: 1.125rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 1.25rem;
  }
`;

const SourceProvider = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;

  @media (min-width: ${breakpoints.mobile}) {
    font-size: 0.8rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 0.875rem;
  }
`;

const SourceDescription = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;

  @media (min-width: ${breakpoints.mobile}) {
    font-size: 0.95rem;
    margin-bottom: 1.25rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const SourceMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
  
  @media (min-width: ${breakpoints.mobile}) {
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    margin-bottom: 1.5rem;
  }
`;

const MetaItem = styled.div`
  padding: 0.625rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;

  @media (min-width: ${breakpoints.mobile}) {
    padding: 0.75rem;
  }
`;

const MetaLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
  letter-spacing: 0.5px;

  @media (min-width: ${breakpoints.mobile}) {
    font-size: 0.7rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 0.75rem;
  }
`;

const MetaValue = styled.div`
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  word-wrap: break-word;

  @media (min-width: ${breakpoints.mobile}) {
    font-size: 0.9rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 1rem;
  }
`;

const SourceActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  
  @media (min-width: ${breakpoints.mobile}) {
    gap: 0.75rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    gap: 1rem;
  }
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  flex: 1 1 calc(50% - 0.25rem);
  min-width: 0;

  @media (min-width: ${breakpoints.mobile}) {
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
    flex: 1 1 auto;
  }

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 0.875rem;
    flex: 0 1 auto;
  }

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    color: white;
  }

  &.primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-color: #667eea;
    flex: 1 1 100%;

    @media (min-width: ${breakpoints.mobile}) {
      flex: 1 1 auto;
    }

    @media (min-width: ${breakpoints.tablet}) {
      flex: 0 1 auto;
    }

    &:hover {
      background: linear-gradient(135deg, #5a67d8, #6b46c1);
    }
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.status === 'active' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(240, 147, 251, 0.2)'};
  color: ${props => props.status === 'active' ? '#667eea' : '#f093fb'};
  border: 1px solid ${props => props.status === 'active' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(240, 147, 251, 0.3)'};
  flex-shrink: 0;
  align-self: flex-start;

  @media (min-width: ${breakpoints.mobile}) {
    padding: 0.25rem 0.75rem;
    font-size: 0.7rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 0.75rem;
  }
`;

const ExpandedDetails = styled(motion.div)`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;

const DetailsTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: white;
  font-size: 0.9rem;

  @media (min-width: ${breakpoints.mobile}) {
    font-size: 1rem;
  }
`;

const DetailsList = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  line-height: 1.6;

  @media (min-width: ${breakpoints.mobile}) {
    font-size: 0.9rem;
    padding-left: 1.5rem;
  }

  @media (min-width: ${breakpoints.tablet}) {
    font-size: 1rem;
  }

  li {
    margin-bottom: 0.25rem;
  }
`;

const DataSources = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const dataSources = [
    {
      id: 1,
      title: "ECOSTRESS Land Surface Temperature",
      provider: "Collected by ECOsystem Spaceborne Thermal Radiometer Experiment on Space Station",
      description: "High-resolution thermal imagery for monitoring urban heat island effects and surface temperature patterns across cities.",
      icon: <FiGlobe size={20} />,
      color: "#ef4444",
      resolution: "70m",
      frequency: "Apr-Sep 2025",
      coverage: "Dhaka, BD",
      url: "https://www.earthdata.nasa.gov/data/catalog/lpcloud-eco2lste-001",
      applications: ["Heat island mapping", "Energy demand modeling", "Climate monitoring"],
      status: "active"
    },
    {
      id: 3,
      title: "Sentinel-2 NDVI",
      provider: "European Space Agency Sentinel-2 Mission",
      description: "Normalized Difference Vegetation Index for monitoring urban green spaces, vegetation health, and land cover changes.",
      icon: <FiDatabase size={20} />,
      color: "#10b981",
      resolution: "30m",
      frequency: "16 days",
      coverage: "Dhaka, BD",
      url: "https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel-2/ndvi/",
      applications: ["Green space monitoring", "Urban planning", "Ecosystem health"],
      status: "active"
    },
    {
      id: 4,
      title: "SRTM Elevation Data",
      provider: "NASA Shuttle Radar Topography Mission",
      description: "Digital elevation models for topographic analysis, flood risk modeling, and infrastructure planning.",
      icon: <FiGlobe size={20} />,
      color: "#8b5cf6",
      resolution: "30m",
      frequency: "Static",
      coverage: "60°N-56°S",
      url: "https://lpdaac.usgs.gov/products/srtmgl1v003/",
      applications: ["Topographic analysis", "Watershed modeling", "Infrastructure planning"],
      status: "archived"
    },
    {
      id: 5,
      title: "OpenAQ Air Quality",
      provider: "OpenAQ Platform",
      description: "Global open-source air quality monitoring with real-time and historical data. Provides PM2.5, PM10, NO2, O3, CO, and other pollutants.",
      icon: <FiDatabase size={20} />,
      color: "#10b981",
      resolution: "Varies",
      frequency: "Hourly",
      coverage: "Global",
      status: "active",
      url: "https://openaq.org/",
      applications: [
        "Urban air quality assessment",
        "Policy and decision-making",
        "Health and exposure studies",
        "Environmental research",
      ],
    },
  ];

  const getStatus = (source) => source.status || 'active';

  return (
    <Container>
      <Header>
        <Title>NASA Earth Observation Data Sources</Title>
        <Subtitle>Satellite datasets powering urban sustainability analysis</Subtitle>
      </Header>

      <DataSourcesGrid>
        {dataSources.map((source, index) => (
          <DataSourceCard
            key={source.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <CardHeader>
              <SourceIcon color={source.color}>
                {source.icon}
              </SourceIcon>
              <SourceInfo>
                <SourceTitle>{source.title}</SourceTitle>
                <SourceProvider>{source.provider}</SourceProvider>
              </SourceInfo>
              <StatusBadge status={getStatus(source)}>{getStatus(source)}</StatusBadge>
            </CardHeader>

            <SourceDescription>{source.description}</SourceDescription>

            <SourceMeta>
              <MetaItem>
                <MetaLabel>Resolution</MetaLabel>
                <MetaValue>{source.resolution}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Frequency</MetaLabel>
                <MetaValue>{source.frequency}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Coverage</MetaLabel>
                <MetaValue>{source.coverage}</MetaValue>
              </MetaItem>
              <MetaItem>
                <MetaLabel>Applications</MetaLabel>
                <MetaValue>{source.applications.length} use cases</MetaValue>
              </MetaItem>
            </SourceMeta>

            <SourceActions>
              <ActionButton
                className="primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open(source.url, '_blank')}
              >
                <FiExternalLink size={14} />
                Access Data
              </ActionButton>
              <ActionButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiDownload size={14} />
                Download
              </ActionButton>
              <ActionButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedCard(expandedCard === source.id ? null : source.id)}
              >
                <FiInfo size={14} />
                Details
              </ActionButton>
            </SourceActions>

            {expandedCard === source.id && (
              <ExpandedDetails
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <DetailsTitle>Applications:</DetailsTitle>
                <DetailsList>
                  {source.applications.map((app, i) => (
                    <li key={i}>{app}</li>
                  ))}
                </DetailsList>
              </ExpandedDetails>
            )}
          </DataSourceCard>
        ))}
      </DataSourcesGrid>
    </Container>
  );
};

export default DataSources;