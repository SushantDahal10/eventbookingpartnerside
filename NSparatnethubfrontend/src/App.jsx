import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PartnerLayout from './components/layout/PartnerLayout';
import PartnerLanding from './pages/partner/PartnerLanding';
import PartnerRegistration from './pages/partner/PartnerRegistration';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import CreateEvent from './pages/partner/CreateEvent';
import MyEvents from './pages/partner/MyEvents';
import Earnings from './pages/partner/Earnings';

// Temporary Home Component
const Home = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-body">
    <h1 className="text-4xl font-heading font-bold mb-8 text-secondary">Welcome to NS</h1>
    <Link to="/partner" className="btn-primary py-3 px-6 shadow-xl no-underline">
      Go to Partner Portal
    </Link>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/partner" element={<PartnerLanding />} />
        <Route path="/partner/register" element={<PartnerRegistration />} />

        {/* Partner App Routes with Sidebar Layout */}
        <Route element={<PartnerLayout />}>
          <Route path="/partner/dashboard" element={<PartnerDashboard />} />
          <Route path="/partner/events" element={<MyEvents />} />
          <Route path="/partner/earnings" element={<Earnings />} />
          <Route path="/partner/create" element={<CreateEvent />} />
        </Route>

        <Route path="/become-partner" element={<PartnerLanding />} />
      </Routes>
    </Router>
  );
}

export default App;
