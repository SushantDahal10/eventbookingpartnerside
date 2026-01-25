import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PartnerLayout from './components/layout/PartnerLayout';
import PartnerLanding from './pages/partner/PartnerLanding';
import PartnerRegistration from './pages/partner/PartnerRegistrationV2';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import CreateEvent from './pages/partner/CreateEvent';
import MyEvents from './pages/partner/MyEvents';
import Earnings from './pages/partner/Earnings';
import EventLiveConsole from './pages/partner/EventLiveConsole';
import EventAnalytics from './pages/partner/EventAnalytics';
import PartnerLogin from './pages/partner/PartnerLogin';
import PartnerSettings from './pages/partner/PartnerSettings';
import HelpCenter from './pages/partner/HelpCenter';
import WebScanner from './pages/partner/tools/WebScanner';
import PartnerChat from './pages/partner/PartnerChat';
import MarketingCenter from './pages/partner/MarketingCenter';
import PartnerTicket from './pages/partner/PartnerTicket';
import ForgotPassword from './pages/partner/ForgotPassword';
import ChangePassword from './pages/partner/ChangePassword';
import PaymentGateway from './pages/partner/PaymentGateway';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public & Standalone Routes */}
        <Route path="/" element={<PartnerLanding />} />
        <Route path="/become-partner" element={<PartnerLanding />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/partner/change-password" element={<ChangePassword />} />
        <Route path="/partner/payment" element={<PaymentGateway />} />
        <Route path="/partner/forgot-password" element={<ForgotPassword />} />
        <Route path="/partner/register" element={<PartnerRegistration />} />
        <Route path="/partner/help" element={<HelpCenter />} />
        <Route path="/partner/chat" element={<PartnerChat />} />
        <Route path="/partner/ticket" element={<PartnerTicket />} />

        {/* Live Console & Tools (Immersive View) */}
        <Route path="/partner/live/:id" element={<EventLiveConsole />} />
        <Route path="/partner/tools/scanner/:id" element={<WebScanner />} />

        {/* Partner App Routes with Sidebar Layout */}
        <Route element={<PartnerLayout />}>
          <Route path="/partner/dashboard" element={<PartnerDashboard />} />
          <Route path="/partner/events" element={<MyEvents />} />
          <Route path="/partner/events/:id/analytics" element={<EventAnalytics />} />
          <Route path="/partner/edit/:id" element={<CreateEvent />} />
          <Route path="/partner/create" element={<CreateEvent />} />
          <Route path="/partner/earnings" element={<Earnings />} />
          <Route path="/partner/marketing" element={<MarketingCenter />} />
          <Route path="/partner/settings" element={<PartnerSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
