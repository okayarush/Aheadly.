import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiGlobe,
  FiLayers,
  FiTrendingUp,
  FiMapPin,
  FiZap,
  FiRadio,
  FiTarget,
  FiEye,
  FiBarChart2,
  FiCloud,
  FiThermometer,
  FiActivity,
  FiMenu,
  FiX,
  FiSun,
  FiAlertTriangle,
  FiCpu,
  FiCheckCircle
} from 'react-icons/fi';

// Define mobile breakpoint
const MOBILE_BREAKPOINT = '768px';

// Keyframe Animations (No changes needed, they are independent of layout)
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(2deg); }
  50% { transform: translateY(-10px) rotate(-1deg); }
  75% { transform: translateY(-15px) rotate(1deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const drift = keyframes`
  0% { transform: translateX(0px) translateY(0px); }
  25% { transform: translateX(15px) translateY(-10px); }
  50% { transform: translateX(-10px) translateY(-15px); }
  75% { transform: translateX(-15px) translateY(10px); }
  100% { transform: translateX(0px) translateY(0px); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const ripple = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  70% {
    box-shadow: 0 0 0 30px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
`;

const drawPath = keyframes`
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

// =========================================================================
// UPDATED STYLED COMPONENTS FOR RESPONSIVENESS
// =========================================================================

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(-45deg, #0f0f23, #1a1a3e, #2d1b69, #4c1d95);
  background-size: 400% 400%;
  animation: ${gradientShift} 15s ease infinite;
  overflow-x: hidden;
  position: relative;
`;

const BackgroundSVG = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
`;

const AnimatedPath = styled.path`
  stroke: ${props => props.color || '#667eea'};
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 10, 5;
  stroke-dashoffset: 1000;
  animation: ${drawPath} 8s ease-in-out infinite alternate;
  opacity: 0.6;
`;

const FloatingElement = styled(motion.div)`
  position: absolute;
  animation: ${float} ${props => props.duration || '6s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  z-index: 2;
  opacity: 0.1;
`;

const Content = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  padding: 2rem 0;
  text-align: center;
  position: relative;
`;

const NavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 0 1.5rem;
  }
`;

const Logo = styled(motion.div)`
  font-size: 1.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientShift} 8s ease infinite;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavMenu = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    // Mobile menu styling
    position: fixed;
    top: 0;
    right: 0;
    width: 70%;
    height: 100%;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 5rem;
    background: rgba(15, 15, 35, 0.95);
    backdrop-filter: blur(30px);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(100%)')};
    transition: transform 0.4s ease-in-out;
    z-index: 100;

    & > a {
        font-size: 1.5rem;
        padding: 1rem 0;
    }
  }
`;

const NavItem = styled.a`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
  }
  
  &:hover {
    text-decoration: none;
    color: white;
    text-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
    
    &::after {
      width: 100%;
    }
  }

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    &::after {
        bottom: 0px; // Adjust underline position for mobile
    }
  }
`;

const HamburgerButton = styled.button`
    display: none;
    background: none;
    border: none;
    color: white;
    font-size: 1.8rem;
    cursor: pointer;
    z-index: 101;

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        display: block;
    }
`;

const HeroSection = styled.section`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  position: relative;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 2rem 1rem;
    padding-top: 6rem; /* Add space for fixed header on mobile */
  }
`;

const HeroContent = styled.div`
  max-width: 1300px;
  margin: 0 auto;
`;

const HeroBrand = styled(motion.h1)`
  font-size: clamp(5rem, 15vw, 11rem);
  font-weight: 900;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #fff, #667eea, #f093fb, #764ba2);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientShift} 8s ease infinite;
  line-height: 0.9;
  letter-spacing: -4px;
  text-shadow: 0 0 40px rgba(102, 126, 234, 0.4);
`;

const HeroTitle = styled(motion.h2)`
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: 2rem;
  color: white;
  line-height: 1.2;
  letter-spacing: -1px;
  
  span {
    color: #f093fb;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const CredibilityText = styled(motion.p)`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 700;
  
  span {
    color: white;
    font-weight: 900;
  }
`;

const ValueSection = styled(motion.div)`
  background: rgba(102, 126, 234, 0.1);
  border-left: 4px solid #f093fb;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto 5rem;
  text-align: left;
  border-radius: 0 20px 20px 0;
  backdrop-filter: blur(10px);
  
  h3 {
    color: #fff;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
    line-height: 1.6;
    margin: 0;
  }
`;

const SectionDivider = styled(motion.div)`
  height: 2px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  margin-top: 4rem;
  margin-bottom: 4rem;
`;

const HRISection = styled(motion.section)`
  padding: 4rem 2rem;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(102, 126, 234, 0.05) 100%);
  position: relative;
`;

const HRIContainer = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 4rem;
  align-items: center;
  background: rgba(15, 15, 35, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem;
  border-radius: 30px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 2rem;
  }
`;

const HRIContent = styled.div`
  text-align: left;

  h2 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    color: #fff;
    letter-spacing: -1px;
    
    span {
      color: #f093fb;
    }
  }
  
  p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.7;
    margin-bottom: 2rem;
  }

  blockquote {
    border-left: 4px solid #f093fb;
    padding-left: 1.5rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: white;
    margin-top: 2rem;
    background: linear-gradient(90deg, rgba(240, 147, 251, 0.1), transparent);
    padding: 1rem 1.5rem;
    border-radius: 0 10px 10px 0;
  }
`;

const HRIList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    svg {
      color: #f093fb;
      flex-shrink: 0;
    }
  }
`;

const CTAContainer = styled(motion.div)`
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4rem;

  @media (max-width: 500px) {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }
`;

const PrimaryButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  padding: 1.5rem 3rem;
  border-radius: 50px;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);

  @media (max-width: 500px) {
    padding: 1rem 2rem;
    font-size: 1rem;
    width: 100%;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
    filter: brightness(1.1);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    animation: ${ripple} 0.6s linear;
  }
`;

const SecondaryButton = styled(motion.button)`
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 1.5rem 3rem;
  border-radius: 50px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  @media (max-width: 500px) {
    padding: 1rem 2rem;
    font-size: 1rem;
    width: 100%;
  }
  
  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
  }
`;

const FeatureGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 650px) {
    grid-template-columns: 1fr; /* Stack cards vertically on smaller screens */
    padding: 0 1rem;
  }
`;

const FeatureCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 2rem 1.5rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #667eea, transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const FeatureIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, ${props => props.gradient || '#667eea, #764ba2'});
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: white;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 22px;
    background: linear-gradient(45deg, transparent, ${props => props.gradient || '#667eea'}, transparent);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  font-size: 0.95rem;
`;

const StatsSection = styled(motion.section)`
  padding: 6rem 2rem;
  text-align: center;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  margin-top: 4rem;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 4rem 1rem;
    margin-top: 2rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  max-width: 1200px;
  margin: 3rem auto 0;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    grid-template-columns: 1fr 1fr; /* 2 columns on mobile */
    gap: 1.5rem;
  }

  @media (max-width: 450px) {
    grid-template-columns: 1fr; /* 1 column on very small screens */
  }
`;

const StatItem = styled(motion.div)`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 2.5rem;
  }
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 0.8rem;
  }
`;

const GlowOrb = styled(motion.div)`
  position: absolute;
  width: ${props => props.size || '200px'};
  height: ${props => props.size || '200px'};
  border-radius: 50%;
  background: radial-gradient(circle, ${props => props.color || 'rgba(102, 126, 234, 0.3)'} 0%, transparent 70%);
  filter: blur(20px);
  animation: ${drift} ${props => props.duration || '20s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  z-index: 1;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100px;
    height: 100px;
  }
`;

const Footer = styled(motion.footer)`
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem 2rem 2rem;
  text-align: center;
  position: relative;
  z-index: 10;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 2rem 1rem 1rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #667eea, #f093fb, transparent);
    opacity: 0.6;
  }
`;

const TeamName = styled(motion.div)`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea, #f093fb, #764ba2);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientShift} 8s ease infinite;
  text-shadow: 0 0 20px rgba(102, 126, 234, 0.3);

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 2rem;
  }
`;

const TeamDescription = styled(motion.p)`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
`;

const Copyright = styled(motion.div)`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 2rem;

  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 0.75rem;
    padding-top: 1.5rem;
    margin-top: 1.5rem;
  }
`;

// =========================================================================
// REACT COMPONENT
// =========================================================================

function Home() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleNavigate = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const features = [
    {
      icon: FiSun,
      title: "Environmental Stress Signals",
      description: "NDVI, Land Surface Temperature, elevation, and water stagnation indicators identify heat stress, poor drainage, and vector-friendly zones.",
      gradient: "#f6ad55, #ed8936"
    },
    {
      icon: FiActivity,
      title: "Disease Signals (Early Warning)",
      description: "Ward-level trends in fever, diarrhea, and respiratory illness highlight emerging health stress before hospitals are overwhelmed.",
      gradient: "#e53e3e, #c53030"
    },
    {
      icon: FiAlertTriangle,
      title: "Community Sanitation Reports",
      description: "Citizen-reported garbage, stagnant water, and open drains act as ground-truth signals that validate environmental and disease risk.",
      gradient: "#38a169, #2f855a"
    },
    {
      icon: FiCpu,
      title: "Health Rate Index (HRI)",
      description: "All signals are combined into a single, explainable Health Rate Index that explains what is driving risk and what action is needed.",
      gradient: "#805ad5, #6b46c1"
    }
  ];

  return (
    <HomeContainer>
      {/* Animated Background Elements */}
      <BackgroundSVG viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#667eea", stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: "#f093fb", stopOpacity: 0.3 }} />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#38a169", stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: "#3182ce", stopOpacity: 0.3 }} />
          </linearGradient>
        </defs>

        <AnimatedPath
          d="M0,400 Q300,200 600,300 T1200,250"
          color="url(#grad1)"
        />
        <AnimatedPath
          d="M0,200 Q400,50 800,150 T1200,100"
          color="url(#grad2)"
          style={{ animationDelay: '2s' }}
        />
        <AnimatedPath
          d="M0,600 Q200,450 500,500 Q800,550 1200,400"
          color="#667eea"
          style={{ animationDelay: '4s' }}
        />
        <AnimatedPath
          d="M200,0 Q500,300 800,100 T1200,200"
          color="#f093fb"
          style={{ animationDelay: '6s' }}
        />
      </BackgroundSVG>

      <GlowOrb
        size="300px"
        color="rgba(102, 126, 234, 0.2)"
        duration="25s"
        delay="0s"
        style={{ top: '10%', left: '80%' }}
      />
      <GlowOrb
        size="200px"
        color="rgba(56, 161, 105, 0.15)"
        duration="30s"
        delay="5s"
        style={{ top: '60%', left: '10%' }}
      />
      <GlowOrb
        size="150px"
        color="rgba(240, 147, 251, 0.2)"
        duration="20s"
        delay="10s"
        style={{ top: '30%', left: '50%' }}
      />

      <FloatingElement duration="8s" delay="0s" style={{ top: '15%', right: '15%' }}>
        <FiRadio size={40} color="rgba(102, 126, 234, 0.3)" />
      </FloatingElement>
      <FloatingElement duration="10s" delay="2s" style={{ top: '70%', left: '20%' }}>
        <FiGlobe size={35} color="rgba(56, 161, 105, 0.3)" />
      </FloatingElement>
      <FloatingElement duration="12s" delay="4s" style={{ top: '40%', right: '25%' }}>
        <FiLayers size={30} color="rgba(240, 147, 251, 0.3)" />
      </FloatingElement>

      <Content>
        <Header>
          <NavBar>
            <Logo
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <FiGlobe color='white' size={28} />
              AHEADLY
            </Logo>

            <NavMenu isOpen={isMenuOpen}>
              <NavItem onClick={() => handleNavigate('/dashboard')}>Health Insights</NavItem>
              <NavItem onClick={() => handleNavigate('/digital-twin')}>Digital Twin</NavItem>
              <NavItem onClick={() => handleNavigate('/intervention-planner')}>Planning</NavItem>
            </NavMenu>

            <HamburgerButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </HamburgerButton>
          </NavBar>
        </Header>

        <HeroSection>
          <HeroContent>
            <HeroBrand
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              AHEADLY
            </HeroBrand>

            <HeroTitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Urban Health Intelligence for <br /> <span>Smarter Cities</span>
            </HeroTitle>

            <HeroSubtitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              AHEADLY is a ward-level digital twin platform that combines environmental data, community reports, and disease trends to detect public health risks before outbreaks occur.
            </HeroSubtitle>

            <CredibilityText
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Built by <span>TEAM GODDAMN</span>
            </CredibilityText>

            <ValueSection
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{ marginBottom: '3rem' }}
            >
              <h3><FiZap size={24} color="#f093fb" /> What makes Aheadly different?</h3>
              <p>
                Cities don’t fail because of one problem — they fail when heat, water, sanitation, and disease overlap.
                Aheadly brings these signals together into a single, explainable health score for every ward.
              </p>
            </ValueSection>

            <CTAContainer
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <PrimaryButton
                onClick={() => handleNavigate('/digital-twin')}
                whileHover={{ boxShadow: "0 15px 40px rgba(102, 126, 234, 0.5)" }}
                whileTap={{ scale: 0.98 }}
              >
                Explore Digital Twin <FiArrowRight style={{ marginLeft: '0.5rem' }} />
              </PrimaryButton>
              <SecondaryButton
                onClick={() => handleNavigate('/dashboard')}
                whileHover={{ borderColor: "#667eea" }}
                whileTap={{ scale: 0.98 }}
              >
                View Health Insights
              </SecondaryButton>
            </CTAContainer>

            <FeatureGrid
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.0 }}
            >
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.1 + index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.3 } }}
                >
                  <FeatureIcon
                    gradient={feature.gradient}
                    whileHover={{ rotateY: 180, transition: { duration: 0.6 } }}
                  >
                    <feature.icon />
                  </FeatureIcon>
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureDescription>{feature.description}</FeatureDescription>
                </FeatureCard>
              ))}
            </FeatureGrid>
          </HeroContent>
        </HeroSection>

        <SectionDivider
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: "100%", opacity: 1, maxWidth: "800px" }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        />

        <HRISection>
          <HRIContainer>
            <HRIContent>
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                Our Core Innovation: <br /><span>Health Rate Index (HRI)</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                HRI is an original, explainable health intelligence score developed by AHEADLY.
                Instead of viewing heat, water, sanitation, or disease data in isolation, HRI combines them into a single interpretable risk score for every ward.
              </motion.p>

              <HRIList>
                <motion.li initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                  <FiThermometer /> Disease burden trends → early outbreak signals
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                  <FiSun /> Heat and vegetation stress → heat illness & vulnerability
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}>
                  <FiAlertTriangle /> Water stagnation and sanitation risk → vector-borne disease drivers
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}>
                  <FiActivity /> Community-reported issues → real-world, ground-level signals
                </motion.li>
              </HRIList>

              <motion.blockquote
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                “HRI doesn’t just indicate risk — it explains why a ward is vulnerable.”
              </motion.blockquote>
            </HRIContent>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <GlowOrb size="400px" color="rgba(240, 147, 251, 0.15)" style={{ position: 'relative', top: 0, left: 0 }} />
            </motion.div>
          </HRIContainer>
        </HRISection>

        <Footer>
          <TeamName>Team GODDAMN</TeamName>
          <TeamDescription>
            Transforming urban health planning through explainable, data-driven intelligence.
          </TeamDescription>
          <Copyright>
            © 2025 TEAM GODDAMN • AHEADLY — Urban Health Intelligence Platform
          </Copyright>
        </Footer>
      </Content>
    </HomeContainer>
  );
}

export default Home;