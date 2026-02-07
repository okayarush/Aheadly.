import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import styled from 'styled-components';

// Context Providers
import { CityDataProvider } from './context/CityDataContext';
import { InterventionProvider } from './context/InterventionContext';

// Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Dashboard from './pages/Dashboard';
import DigitalTwin from './pages/DigitalTwin';
import InterventionPlanner from './pages/InterventionPlanner';
import FutureOverview from './pages/FutureOverview';
import PolicyBrief from './pages/PolicyBrief';
import HealthPriorityBrief from './pages/HealthPriorityBrief';
import DataSources from './pages/DataSources';

// Styles
import GlobalStyles from './styles/GlobalStyles';
import Home from './pages/Home';
import ComingSoon from './pages/ComingSoon';
import HospitalApp from './pages/HospitalApp';
import CommunitySanitation from './pages/CommunitySanitation';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  background: ${props => props.$isHomePage ? 'transparent' : 'rgba(255, 255, 255, 0.95)'};
  box-shadow: ${props => props.$isHomePage ? 'none' : '0 20px 40px rgba(0, 0, 0, 0.1)'};
  backdrop-filter: ${props => props.$isHomePage ? 'none' : 'blur(10px)'};
`;

// Layout component to handle conditional sidebar
function AppLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <AppContainer>
      <MainContent>
        {!isHomePage && <Sidebar />}
        <ContentArea $isHomePage={isHomePage}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
            <Route path="/intervention-planner" element={<InterventionPlanner />} />
            <Route path="/FutureOverview" element={<FutureOverview />} />
            <Route path="/policy-brief" element={<HealthPriorityBrief />} />
            <Route path="/health-priority" element={<HealthPriorityBrief />} />
            <Route path="/data-sources" element={<DataSources />} />
            <Route path='/ngo' element={<ComingSoon />} />
            <Route path='/govt' element={<ComingSoon />} />
            <Route path='/hospital-reporting' element={<HospitalApp />} />
            <Route path='/community-sanitation' element={<CommunitySanitation />} />
          </Routes>
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
}

function App() {
  return (
    <CityDataProvider>
      <InterventionProvider>
        <Router>
          <GlobalStyles />
          <AppLayout />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </InterventionProvider>
    </CityDataProvider>
  );
}

export default App;
