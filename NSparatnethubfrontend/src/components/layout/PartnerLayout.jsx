import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';

const PartnerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Protected Route Check
    useEffect(() => {
        const user = localStorage.getItem('partner_user');
        if (!user) {
            navigate('/partner/login');
        }
    }, [navigate]);

    const navItems = [
        { label: 'Dashboard', path: '/partner/dashboard', icon: '📊' },
        { label: 'My Events', path: '/partner/events', icon: '📅' },
        { label: 'Create Event', path: '/partner/create', icon: '➕' },
        { label: 'Earnings', path: '/partner/earnings', icon: '💰' },
        { label: 'Marketing', path: '/partner/marketing', icon: '🚀' },
    ];

    return (
        <div className="flex min-h-screen bg-[#F3F4F6] font-body text-gray-900 relative">

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden animate-[fadeIn_0.2s]"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-[#111827] text-white fixed top-0 bottom-0 left-0 z-30 flex flex-col border-r border-gray-800 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:sticky md:top-0 md:h-screen`}>
                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-gray-800 justify-between">
                    <Link to="/partner/dashboard" className="flex items-center gap-2 font-heading font-black text-xl tracking-tight">
                        <span className="text-primary">NS</span> Partner
                    </Link>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="md:hidden text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Nav */}
                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Main Menu</p>
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}

                    <div className="pt-8">
                        <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Support & Settings</p>
                        <Link
                            to="/partner/help"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/partner/help') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <span>💬</span> Help Center
                        </Link>
                        <Link
                            to="/partner/settings"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/partner/settings') ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <span>⚙️</span> Settings
                        </Link>
                    </div>
                </div>

                {/* User User */}
                <div className="p-4 border-t border-gray-800 bg-[#0B111D]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100" className="w-9 h-9 rounded-lg border border-gray-600" alt="Profile" />
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold truncate">Acme Events</p>
                                <p className="text-xs text-gray-500 truncate">Pro Organizer</p>
                            </div>
                        </div>
                        <Link to="/partner/login" className="text-gray-500 hover:text-red-500 transition-colors" title="Logout">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen w-full">

                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        {/* Hamburger Button */}
                        <button
                            className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="hidden sm:inline">Partner Portal</span>
                            <span className="hidden sm:inline">/</span>
                            <span className="font-bold text-gray-900 capitalize">{location.pathname.split('/').pop()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors relative">
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            🔔
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl w-full mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default PartnerLayout;
