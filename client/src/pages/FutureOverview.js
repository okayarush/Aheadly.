import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FutureReport = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem 3rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const YearTitle = styled.h2`
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  font-size: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const MetricBox = styled.div`
  background: #f9fafb;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const MetricTitle = styled.h3`
  font-size: 1.1rem;
  color: #374151;
  margin-bottom: 0.75rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props) => props.color || "#111827"};
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const DetailsButton = styled.button`
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #2563eb;
  }

  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
`;

const FutureOverview = () => {
  const [data, setData] = useState({
    greenspace: [],
    temp: [],
    rainfall: [],
    windspeed: [],
  });
  const [selectedYear, setSelectedYear] = useState("2025");

  const loadFile = async (filename) => {
    const res = await fetch(`/${filename}`);
    const text = await res.text();
    return text
      .split("\n")
      .map((line) => {
        const [year, value] = line.split(",");
        return { year: year.trim(), value: value.trim() };
      })
      .filter((row) =>
        ["2025", "2026", "2027", "2028", "2029", "2030"].includes(row.year)
      );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const greenspace = await loadFile("greenspace.txt");
        const temp = await loadFile("temp.txt");
        const rainfall = await loadFile("Rainfall.txt");
        const windspeed = await loadFile("windspeed.txt");

        setData({ greenspace, temp, rainfall, windspeed });
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };

    fetchData();
  }, []);

  const getCurrent = (dataset) =>
    dataset.find((row) => row.year === selectedYear)?.value || "N/A";

  const handleSeeDetails = (pdfName) => {
    window.open(`/${pdfName}`, "_blank");
  };

  return (
    <Container>
      <FutureReport
        key={selectedYear}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <YearTitle>Future Report {selectedYear}</YearTitle>

        {/* Year Selector */}
        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {data.greenspace.map((row) => (
            <option key={row.year} value={row.year}>
              {row.year}
            </option>
          ))}
        </Select>

        {/* Metric Boxes */}
        <MetricsGrid>
          <MetricBox>
            <MetricTitle>Greenspace(Grassland+Trees)</MetricTitle>
            <MetricValue color="#10b981">
              {getCurrent(data.greenspace)}%
            </MetricValue>
            <DetailsButton onClick={() => handleSeeDetails("Greenspace.pdf")}>
              See Details
            </DetailsButton>
          </MetricBox>

          <MetricBox>
            <MetricTitle>Average Temperature</MetricTitle>
            <MetricValue color="#f97316">
              {getCurrent(data.temp)}°C
            </MetricValue>
            <DetailsButton onClick={() => handleSeeDetails("Temp.pdf")}>
              See Details
            </DetailsButton>
          </MetricBox>

          <MetricBox>
            <MetricTitle>Average Rainfall</MetricTitle>
            <MetricValue color="#3b82f6">
              {getCurrent(data.rainfall)} mm
            </MetricValue>
            <DetailsButton onClick={() => handleSeeDetails("Rainfall.pdf")}>
              See Details
            </DetailsButton>
          </MetricBox>

          <MetricBox>
            <MetricTitle>Average Windspeed</MetricTitle>
            <MetricValue color="#6366f1">
              {getCurrent(data.windspeed)} km/h
            </MetricValue>
            <DetailsButton onClick={() => handleSeeDetails("Windspeed.pdf")}>
              See Details
            </DetailsButton>
          </MetricBox>
        </MetricsGrid>
      </FutureReport>
    </Container>
  );
};

export default FutureOverview;