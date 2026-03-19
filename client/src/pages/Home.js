import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { FiActivity, FiUsers, FiHeart } from 'react-icons/fi';

// --- Global Styles for Fonts & Scroll ---
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');

  body {
    margin: 0;
    padding: 0;
    background: #080a0f;
    color: white;
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }
  
  /* Hide scrollbar */
  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
`;

// --- Keyframes ---
const pulseArrow = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(10px); opacity: 1; }
`;

const particleDrift = keyframes`
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  50% { opacity: 0.3; }
  100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
`;

const streamFlow = keyframes`
  to { stroke-dashoffset: 0; }
`;

const orbPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 170, 0.4); }
  50% { box-shadow: 0 0 60px rgba(0, 212, 170, 0.8), 0 0 100px rgba(0, 212, 170, 0.2); }
`;

const spinNumbers = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(-100%); }
`;

// --- Layout Components ---

const ScrollContainer = styled.div`
  height: 100vh;
  width: 100vw;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
  
  /* Hide scrollbar for cleanly snapping */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ProgressBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background-color: #00d4aa;
  z-index: 100;
  transition: width 0.3s ease-out;
`;

const NavBar = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.5rem 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 90;
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  box-sizing: border-box;
`;

const Brandmark = styled.div`
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 900;
  font-size: 1.5rem;
  letter-spacing: 1px;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  
  a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 0.2s;
    cursor: pointer;
    
    &:hover {
      color: white;
    }
  }
`;

const Section = styled.section`
  height: 100vh;
  width: 100vw;
  scroll-snap-align: start;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #080a0f;
  overflow: hidden;
`;

const ScrollPrompt = styled(motion.div)`
  position: absolute;
  bottom: 40px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  
  span {
    animation: ${pulseArrow} 2s infinite;
  }
`;

const ParticleCanvasContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`;

// --- Typography ---

const HeroWordmark = styled.h1`
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 900;
  font-size: clamp(80px, 10vw, 120px);
  margin: 0;
  line-height: 1;
  letter-spacing: 2px;
  z-index: 10;
`;

const HeroSubline = styled.p`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(20px, 2.5vw, 28px);
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10px;
  z-index: 10;
`;

const HeroStat = styled(motion.div)`
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #00d4aa;
  font-weight: 500;
  letter-spacing: 1px;
  margin-top: 40px;
  z-index: 10;
  font-family: monospace;
`;

const ProblemText = styled(motion.div)`
  font-family: 'Inter', sans-serif;
  font-size: clamp(32px, 5vw, 64px);
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
  max-width: 900px;
  z-index: 10;
  
  .teal {
    color: #00d4aa;
  }
`;

// --- Split Screen (Section 2) ---

const SplitContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
`;

const SplitSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10%;
  background: ${props => props.right ? '#0d0f14' : '#080a0f'};
  position: relative;
`;

const Divider = styled(motion.div)`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-50%);
  z-index: 10;
`;

const SideLabel = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 24px;
`;

const SideBody = styled.p`
  font-size: clamp(24px, 3vw, 36px);
  line-height: 1.4;
  margin-bottom: 40px;
  font-weight: 500;
  color: ${props => props.teal ? '#00d4aa' : 'rgba(255, 255, 255, 0.6)'};
  max-width: 500px;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  color: ${props => props.muted ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.8)'};
  font-size: 0.95rem;
  
  span {
    font-weight: 600;
    color: ${props => props.highlight ? '#00d4aa' : (props.muted ? 'rgba(255, 100, 100, 0.6)' : 'white')};
  }
`;

// --- Data Pulse (Section 3) ---

const PulseContainer = styled.div`
  position: relative;
  width: 800px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CentralOrb = styled(motion.div)`
  width: 120px;
  height: 120px;
  background: #00d4aa;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  box-shadow: 0 0 20px rgba(0, 212, 170, 0.4);
  color: #080a0f;
  text-align: center;
  
  div {
    font-weight: 800;
    font-size: 0.8rem;
    letter-spacing: 1px;
  }
`;

const StreamLine = styled.svg`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
`;

const StreamNode = styled(motion.div)`
  position: absolute;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  ${props => props.position};
`;

const OrbLabels = styled(motion.div)`
  position: absolute;
  bottom: 100px;
  display: flex;
  gap: 30px;
  color: #00d4aa;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const ScoreDisplay = styled(motion.div)`
  position: absolute;
  top: -80px;
  color: white;
  text-align: center;
  
  .score {
    font-size: 2.5rem;
    font-weight: 700;
    color: #00d4aa;
  }
  .label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 1px;
    margin-top: 5px;
  }
`;

// --- Proof (Section 4) ---

const ProofLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 80px;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 80px;
  margin-bottom: 100px;
`;

const StatBlock = styled(motion.div)`
  text-align: center;
  
  .value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 80px;
    font-weight: 900;
    line-height: 1;
    color: #00d4aa;
    margin-bottom: 15px;
  }
  
  .label {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    max-width: 200px;
    margin: 0 auto;
    line-height: 1.4;
  }
`;

const EditorialQuote = styled.div`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(32px, 4vw, 48px);
  color: white;
  max-width: 800px;
  text-align: center;
  font-style: italic;
`;

// --- Invitation (Section 5) ---

const CTAHeadline = styled.h2`
  font-family: 'DM Serif Display', serif;
  font-size: clamp(48px, 6vw, 72px);
  margin: 0 0 20px 0;
`;

const CTASubline = styled.p`
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 50px 0;
`;

const PrimaryButton = styled.button`
  background: #00d4aa;
  color: #080a0f;
  border: none;
  border-radius: 28px;
  padding: 0 40px;
  height: 56px;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 0 30px rgba(0, 212, 170, 0.4);
    transform: translateY(-2px);
  }
`;

// --- Portal Selector (Section 6) ---

const PortalSection = styled.section`
  min-height: 100vh;
  width: 100vw;
  background: #0d0f14;
  padding: 120px 5% 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PortalHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
  
  .label {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 20px;
  }
  
  .headline {
    font-family: 'DM Serif Display', serif;
    font-size: 48px;
    margin: 0 0 10px 0;
  }
  
  .subline {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const PortalGrid = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  width: 100%;
  height: ${props => props.height || '340px'};
  border-radius: 20px;
  background: #151821;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.glowColor};
    box-shadow: 0 10px 40px ${props => props.glowColor}15;
  }
`;

const SMCCardLeft = styled.div`
  flex: 0 0 55%;
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SMCCardRight = styled.div`
  flex: 0 0 45%;
  position: relative;
  overflow: hidden;
  background: #0a0c12;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PillContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
  padding-bottom: 5px;
`;

const Pill = styled.span`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
`;

const LiveStat = styled.div`
  margin-top: auto;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    color: #00d4aa;
    animation: ${pulseArrow} 2s infinite;
  }
`;

const SecondaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`;

const SecondaryCardPadding = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const IconWrapper = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: ${props => props.color || 'white'};
`;

const FooterStrip = styled.footer`
  margin-top: 80px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
  max-width: 1200px;
  padding: 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  
  .live {
    display: flex;
    align-items: center;
    gap: 8px;
    
    span {
      color: #00d4aa;
      animation: ${pulseArrow} 2s infinite;
    }
  }
`;

// --- Components ---

const ParticleField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      vy: -Math.random() * 0.5 - 0.1,
      opacity: Math.random() * 0.3
    }));

    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.vy;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

const TypewriterText = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let timeout;
    let currentIndex = 0;
    
    const startTyping = () => {
      timeout = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(timeout);
        }
      }, 30);
    };

    const initialDelay = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(timeout);
    };
  }, [text, delay]);

  return <span>{displayText}</span>;
};

// Main Component
export default function Home() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);
      
      // Show nav when reaching Section 5 (approx 95% of scroll)
      if (progress > 95) {
        setShowNav(true);
      } else {
        setShowNav(false);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Section visibility hooks for animations
  const probRef = useRef(null);
  const isProbInView = useInView(probRef, { once: false, amount: 0.5 });
  
  const splitRef = useRef(null);
  const isSplitInView = useInView(splitRef, { once: false, amount: 0.5 });
  
  const pulseRef = useRef(null);
  const isPulseInView = useInView(pulseRef, { once: false, amount: 0.5 });
  
  const proofRef = useRef(null);
  const isProofInView = useInView(proofRef, { once: false, amount: 0.5 });

  return (
    <>
      <GlobalStyle />
      <div style={{ opacity: showPortal ? 0 : 1, transition: 'opacity 0.5s', pointerEvents: 'none' }}>
        <ProgressBar style={{ width: `${scrollProgress}%` }} />
      </div>
      
      <NavBar 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: showPortal || showNav ? 1 : 0, y: showPortal || showNav ? 0 : -20 }}
        visible={showPortal || showNav}
      >
        <Brandmark>AHEADLY</Brandmark>
        <NavLinks>
          <a>How It Works</a>
          <a>Data Sources</a>
        </NavLinks>
      </NavBar>

      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: showPortal ? 0 : 1 }}
        transition={{ duration: 0.8 }}
        style={{ position: showPortal ? 'absolute' : 'relative', top: 0, left: 0, width: '100%', height: '100vh', pointerEvents: showPortal ? 'none' : 'auto', zIndex: 1 }}
      >
        <ScrollContainer ref={containerRef}>
        
        {/* SECTION 0 — COLD OPEN */}
        <Section>
          <ParticleCanvasContainer>
            <ParticleField />
          </ParticleCanvasContainer>
          <HeroWordmark>AHEADLY</HeroWordmark>
          <HeroSubline>Urban Health Intelligence for Solapur</HeroSubline>
          <HeroStat>
            <TypewriterText text="847 disease signals processed in the last hour" delay={1500} />
          </HeroStat>
          
          <ScrollPrompt>
            <span>↓</span> scroll
          </ScrollPrompt>
        </Section>

        {/* SECTION 1 — THE PROBLEM */}
        <Section ref={probRef}>
          <ProblemText>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isProbInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
            >
              Solapur has 1.2 million people.
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isProbInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{ marginTop: '20px' }}
            >
              And no way to see a disease outbreak coming.
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isProbInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 2.0 }}
              style={{ marginTop: '40px' }}
              className="teal"
            >
              Until now.
            </motion.div>
          </ProblemText>
          <ScrollPrompt>
            <span>↓</span> scroll
          </ScrollPrompt>
        </Section>

        {/* SECTION 2 — THE SIGNAL MOMENT */}
        <Section ref={splitRef}>
          <SplitContainer>
            <Divider 
              initial={{ scaleY: 0 }}
              animate={isSplitInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 0.5 }}
            />
            
            <SplitSide>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isSplitInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8 }}
              >
                <SideLabel>THE OLD WAY</SideLabel>
                <SideBody>A dengue outbreak is reported. Health officers respond. 200 people are already sick.</SideBody>
                
                <TimelineItem muted>
                  <span>Day 0:</span> Outbreak begins
                </TimelineItem>
                <TimelineItem muted>
                  <span>Day 7:</span> First cases reported
                </TimelineItem>
                <TimelineItem muted>
                  <span>Day 14:</span> SMC responds
                </TimelineItem>
              </motion.div>
            </SplitSide>

            <SplitSide right>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isSplitInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <SideLabel style={{ color: '#00d4aa' }}>THE AHEADLY WAY</SideLabel>
                <SideBody teal>Satellite detects stagnant water. ASHA surveys flag symptoms. HRI crosses 70. SMC acts.</SideBody>
                
                <TimelineItem>
                  <span highlight>Day 0:</span> Signals detected
                </TimelineItem>
                <TimelineItem>
                  <span highlight>Day 1:</span> HRI alert
                </TimelineItem>
                <TimelineItem>
                  <span highlight>Day 3:</span> SMC intervenes
                </TimelineItem>
                <TimelineItem>
                  <span highlight>Day 8:</span> Outbreak prevented
                </TimelineItem>
              </motion.div>
            </SplitSide>
          </SplitContainer>
          <ScrollPrompt style={{ bottom: '20px' }}>
            <span>↓</span> scroll
          </ScrollPrompt>
        </Section>

        {/* SECTION 3 — THE DATA PULSE */}
        <Section ref={pulseRef}>
          <PulseContainer>
            {/* Streams SVG */}
            <StreamLine viewBox="0 0 800 600">
              {isPulseInView && (
                <>
                  <motion.path d="M 100 150 Q 250 150 400 300" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="10 10" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.3 }} />
                  <motion.path d="M 50 300 L 400 300" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="10 10" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.6 }} />
                  <motion.path d="M 150 500 Q 250 400 400 300" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="10 10" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.9 }} />
                  <motion.path d="M 650 500 Q 550 400 400 300" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="10 10" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.2 }} />
                  <motion.path d="M 750 300 L 400 300" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="10 10" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.5 }} />
                  <motion.path d="M 700 100 Q 550 150 400 300" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="10 10" opacity="0.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.8 }} />
                </>
              )}
            </StreamLine>

            {/* Nodes */}
            <StreamNode position="top: 130px; left: 20px" initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay:0.3}}>🛰 NASA Satellite</StreamNode>
            <StreamNode position="top: 280px; left: -10px" initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay:0.6}}>👩‍⚕️ ASHA Surveys</StreamNode>
            <StreamNode position="top: 500px; left: 60px" initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay:0.9}}>🏥 Hospital HMS</StreamNode>
            
            <StreamNode position="top: 500px; right: 40px" initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay:1.2}}>👥 Community Reports</StreamNode>
            <StreamNode position="top: 280px; right: -30px" initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay:1.5}}>🏛 Govt. Programs</StreamNode>
            <StreamNode position="top: 80px; right: 40px" initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay:1.8}}>🌦 Weather Data</StreamNode>

            {/* Central Orb */}
            <CentralOrb
              initial={{ scale: 0.5, opacity: 0 }}
              animate={isPulseInView ? { scale: 1, opacity: 1, boxShadow: "0 0 60px rgba(0,212,170,0.8)" } : { scale: 0.5, opacity: 0 }}
              transition={{ delay: 2.1, duration: 0.5 }}
            >
              <div>HRI ENGINE</div>
            </CentralOrb>

            {/* Output */}
            {isPulseInView && (
              <ScoreDisplay initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 2.3}}>
                <div className="score">73</div>
                <div className="label">HIGH RISK · SECTOR-12</div>
              </ScoreDisplay>
            )}

            <OrbLabels initial={{opacity:0}} animate={isPulseInView ? {opacity:1}:{}} transition={{delay: 2.6}}>
              <span>Outbreak Alert Sent</span>
              <span>·</span>
              <span>Hospital Notified</span>
              <span>·</span>
              <span>Intervention Dispatched</span>
            </OrbLabels>
          </PulseContainer>
          <ScrollPrompt>
            <span>↓</span> scroll
          </ScrollPrompt>
        </Section>

        {/* SECTION 4 — THE PROOF */}
        <Section ref={proofRef}>
          <ProofLabel>WHAT AHEADLY HAS ALREADY DONE</ProofLabel>
          
          <StatsContainer>
            <StatBlock initial={{opacity:0, y:30}} animate={isProofInView ? {opacity:1, y:0}:{}} transition={{duration:0.6, delay:0.2}}>
              <div className="value">5 days</div>
              <div className="label">Average early warning lead time before outbreak confirmation</div>
            </StatBlock>
            <StatBlock initial={{opacity:0, y:30}} animate={isProofInView ? {opacity:1, y:0}:{}} transition={{duration:0.6, delay:0.4}}>
              <div className="value">84%</div>
              <div className="label">Outbreak prediction accuracy</div>
            </StatBlock>
            <StatBlock initial={{opacity:0, y:30}} animate={isProofInView ? {opacity:1, y:0}:{}} transition={{duration:0.6, delay:0.6}}>
              <div className="value">2.4M</div>
              <div className="label">Health data points processed daily across Solapur</div>
            </StatBlock>
          </StatsContainer>
          
          <motion.div initial={{opacity:0}} animate={isProofInView ? {opacity:1}:{}} transition={{duration:1, delay: 1}}>
            <EditorialQuote>
              "This is not a dashboard. It is Solapur's immune system."
            </EditorialQuote>
          </motion.div>
          
          <ScrollPrompt>
            <span>↓</span> scroll
          </ScrollPrompt>
        </Section>

        {/* SECTION 5 — THE INVITATION */}
        <Section>
          <CTAHeadline>Ready to see inside the system?</CTAHeadline>
          <CTASubline>Choose your role. Enter Aheadly.</CTASubline>
          
          <PrimaryButton onClick={() => setShowPortal(true)}>
            ◉ Experience Aheadly
          </PrimaryButton>
        </Section>

        {/* SECTION 6 — PORTAL SELECTOR */}
      </ScrollContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showPortal ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        style={{ position: showPortal ? 'relative' : 'absolute', top: 0, left: 0, width: '100%', minHeight: '100vh', pointerEvents: showPortal ? 'auto' : 'none', zIndex: 2, background: '#0d0f14' }}
      >
        <PortalSection>
          <PortalHeader>
            <div className="label">4 PORTALS. ONE CITY.</div>
            <h2 className="headline">Every Stakeholder. One System.</h2>
            <p className="subline">Select your role to enter Aheadly.</p>
          </PortalHeader>
          
          <PortalGrid>
            {/* SMC COMMAND CARD */}
            <Card height="320px" glowColor="#00d4aa" onClick={() => navigate('/smc')}>
              <div style={{ display: 'flex', height: '100%' }}>
                <SMCCardLeft>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>SMC HEALTH COMMAND</div>
                  <div style={{ color: '#00d4aa', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '20px' }}>FOR MUNICIPAL DECISION MAKERS</div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5, margin: 0 }}>
                    The command center for Solapur's health officers. Real-time HRI maps, outbreak alerts, intervention planning, AI policy briefs, and city-wide surveillance — all in one view.
                  </p>
                  <PillContainer>
                    <Pill>Digital Twin Ward Map</Pill>
                    <Pill>HRI Risk Scoring</Pill>
                    <Pill>Intervention Planner</Pill>
                    <Pill>AI Policy Brief</Pill>
                    <Pill>Future Overview</Pill>
                    <Pill>Data Sources</Pill>
                  </PillContainer>
                  <LiveStat>
                    <span>●</span> Live — 16 active alerts across Solapur right now
                  </LiveStat>
                </SMCCardLeft>
                <SMCCardRight>
                  {/* Abstract Grid Visual */}
                  <svg width="220" height="220" viewBox="0 0 100 100">
                    <rect x="15" y="15" width="30" height="30" fill="rgba(0, 212, 170, 0.15)" stroke="#00d4aa" strokeWidth="1.5" rx="4"/>
                    <rect x="55" y="15" width="30" height="30" fill="rgba(255, 140, 66, 0.15)" stroke="#ff8c42" strokeWidth="1.5" rx="4"/>
                    <rect x="15" y="55" width="30" height="30" fill="rgba(255, 60, 60, 0.15)" stroke="#ff3c3c" strokeWidth="1.5" rx="4"/>
                    <rect x="55" y="55" width="30" height="30" fill="rgba(0, 212, 170, 0.05)" stroke="#00d4aa" strokeWidth="1.5" rx="4"/>
                  </svg>
                </SMCCardRight>
              </div>
            </Card>

            {/* 3 SECONDARY CARDS */}
            <SecondaryGrid>
              {/* HOSPITAL */}
              <Card height="340px" glowColor="#ff8c42" onClick={() => navigate('/hospital')}>
                <SecondaryCardPadding>
                  <IconWrapper color="#ff8c42"><FiHeart /></IconWrapper>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>Hospital Connect</div>
                  <div style={{ color: '#ff8c42', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>FOR HOSPITAL ADMINISTRATORS</div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>
                    Bed capacity, disease case reporting, medicine stock, and live SMC alerts — built for hospital ops teams.
                  </p>
                  <PillContainer style={{ marginTop: 'auto' }}>
                    <Pill>Bed & ICU Status</Pill>
                    <Pill>Disease Reporting</Pill>
                    <Pill>SMC Alerts</Pill>
                  </PillContainer>
                </SecondaryCardPadding>
              </Card>

              {/* COMMUNITY */}
              <Card height="340px" glowColor="#2dd4a0" onClick={() => navigate('/community')}>
                <SecondaryCardPadding>
                  <IconWrapper color="#2dd4a0"><FiUsers /></IconWrapper>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>Community Portal</div>
                  <div style={{ color: '#2dd4a0', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>FOR CITIZENS & RESIDENTS</div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>
                    Report sanitation issues, check symptoms, track family vaccinations, and access emergency services.
                  </p>
                  <PillContainer style={{ marginTop: 'auto' }}>
                    <Pill>Sanitation Reporter</Pill>
                    <Pill>Symptom Checker</Pill>
                    <Pill>Emergency SOS</Pill>
                  </PillContainer>
                </SecondaryCardPadding>
              </Card>

              {/* ASHA */}
              <Card height="340px" glowColor="#ffd166" onClick={() => navigate('/asha-welcome')}>
                <SecondaryCardPadding>
                  <IconWrapper color="#ffd166"><FiActivity /></IconWrapper>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>ASHA Field</div>
                  <div style={{ color: '#ffd166', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px' }}>FOR ASHA FIELD WORKERS</div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', lineHeight: 1.4, margin: 0 }}>
                    Daily household surveys, AI risk flagging, symptom recording, and escalation alerts.
                  </p>
                  <PillContainer style={{ marginTop: 'auto' }}>
                    <Pill>Household Survey</Pill>
                    <Pill>AI Risk Flag</Pill>
                    <Pill>Escalation Alerts</Pill>
                  </PillContainer>
                </SecondaryCardPadding>
              </Card>
            </SecondaryGrid>
          </PortalGrid>
          
          <FooterStrip>
            <div>AHEADLY · Built for Solapur Municipal Corporation · Powered by satellite + field + community intelligence</div>
            <div className="live"><span>●</span> System live</div>
          </FooterStrip>
        </PortalSection>
      </motion.div>
    </>
  );
}