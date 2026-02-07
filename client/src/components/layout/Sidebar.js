import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiMap,
  FiLayers,
  FiTrendingUp,
  FiFileText,
  FiDatabase,
  FiActivity, // Added for Hospital Reporting
  FiUsers,
  FiMenu, // New icon for the menu button
  FiX // New icon for the close button
} from 'react-icons/fi';

// Define a breakpoint for responsiveness
const BREAKPOINT = '768px';

// --- Sidebar Container Styles ---

const SidebarContainer = styled.aside`
  width: 250px;
  background: linear-gradient(135deg, #1a1a3e 0%, #2d1b69 100%);
  padding: 2rem 1rem;
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(102, 126, 234, 0.2);
  // Transition for smooth open/close animation
  transition: transform 0.3s ease-in-out; 
  z-index: 1000; // Keep it above main content

  // Default style for desktop/larger screens (fixed, visible)
  position: sticky;
  top: 0;
  height: 100vh;
  box-shadow: none;

  // Responsive styles for mobile/smaller screens
  @media (max-width: ${BREAKPOINT}) {
    position: fixed; // Fix position for overlay on mobile
    height: 100%;
    transform: translateX(${props => (props.$isOpen ? '0' : '-100%')});
    box-shadow: 2px 0 5px rgba(0,0,0,0.5);
  }
`;

// --- Menu Toggle Button Styles ---

const MenuToggleButton = styled.button`
  display: none; // Default: hide on desktop

  @media (max-width: ${BREAKPOINT}) {
    display: block; // Show on mobile
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 1001; // Above the sidebar overlay
    background: #667eea;
    color: white;
    border: none;
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    transition: background 0.2s;

    &:hover {
      background: #764ba2;
    }
  }
`;

// --- Overlay for when sidebar is open on mobile ---

const Overlay = styled.div`
  display: none;

  @media (max-width: ${BREAKPOINT}) {
    display: ${props => (props.$isOpen ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

// --- Other Styles (Kept largely the same) ---

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem; // Add a bit more padding for the content below the toggle
`;

const SidebarLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s;

  &:hover {
    text-decoration: none;
    background-color: rgba(102, 126, 234, 0.2);
    color: #667eea;
  }

  &.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
  }
`;

const SectionTitle = styled.h3`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 2rem 0 1rem 0;
  padding-left: 1rem;
`;

// --- Sidebar Component ---

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Function to close the sidebar (useful when a link is clicked)
  const closeSidebar = () => {
    if (window.innerWidth <= parseInt(BREAKPOINT)) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Toggle Button appears on mobile */}
      <MenuToggleButton
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </MenuToggleButton>

      {/* Overlay appears on mobile when sidebar is open */}
      <Overlay $isOpen={isOpen} onClick={() => setIsOpen(false)} />

      {/* Sidebar component, $isOpen prop passed for conditional styling */}
      <SidebarContainer $isOpen={isOpen}>
        <SidebarNav>
          {/* Dashboard */}
          <SidebarLink to="/dashboard" end onClick={closeSidebar}>
            <FiHome size={20} />
            Dashboard
          </SidebarLink>

          <SectionTitle>Planning Tools</SectionTitle>

          {/* Digital Twin */}
          <SidebarLink to="/digital-twin" onClick={closeSidebar}>
            <FiMap size={20} />
            Digital Twin
          </SidebarLink>

          {/* Intervention Planner */}
          <SidebarLink to="/intervention-planner" onClick={closeSidebar}>
            <FiLayers size={20} />
            Intervention Planner
          </SidebarLink>

          {/* Future Overview */}
          <SidebarLink to="/FutureOverview" onClick={closeSidebar}>
            <FiTrendingUp size={20} />
            Future Overview
          </SidebarLink>

          <SectionTitle>Reports & Data</SectionTitle>

          {/* Policy Brief */}
          <SidebarLink to="/policy-brief" onClick={closeSidebar}>
            <FiFileText size={20} />
            Policy Brief
          </SidebarLink>

          {/* Data Sources */}
          <SidebarLink to="/data-sources" onClick={closeSidebar}>
            <FiDatabase size={20} />
            Data Sources
          </SidebarLink>

          <SectionTitle>Collaborate</SectionTitle>

          {/* NGOs */}
          <SidebarLink to="/ngo" onClick={closeSidebar}>
            <FiUsers size={20} />
            NGOs
          </SidebarLink>

          {/* Government */}
          <SidebarLink to="/govt" onClick={closeSidebar}>
            <FiHome size={20} />
            Government
          </SidebarLink>

          {/* Hospital Reporting */}
          <SidebarLink to="/hospital-reporting" onClick={closeSidebar}>
            <FiActivity size={20} />
            Hospital Reporting
          </SidebarLink>

          {/* Community Sanitation */}
          <SidebarLink to="/community-sanitation" onClick={closeSidebar}>
            <FiUsers size={20} />
            Community Sanitation
          </SidebarLink>
        </SidebarNav>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;