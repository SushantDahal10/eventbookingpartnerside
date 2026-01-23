import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const PartnerLayout = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: 'Dashboard', path: '/partner/dashboard', icon: '📊' },
        { label: 'My Events', path: '/partner/events', icon: '📅' },
        { label: 'Create Event', path: '/partner/create', icon: '➕' },
        { label: 'Earnings', path: '/partner/earnings', icon: '💰' },
    ];

    return (
        <div className="flex min-h-screen bg-[#F3F4F6] font-body text-gray-900">

            {/* Sidebar */}
            <aside className="w-64 bg-[#111827] text-white fixed h-full z-30 hidden md:flex flex-col border-r border-gray-800">
                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <Link to="/partner/dashboard" className="flex items-center gap-2 font-heading font-black text-xl tracking-tight">
                        <span className="text-primary">NS</span> Partner
                    </Link>
                </div>

                {/* Nav */}
                <div className="flex-1 py-6 px-3 space-y-1">
                    <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Main Menu</p>
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
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
                        <p className="px-3 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Support</p>
                        <Link to="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
                            <span>💬</span> Help Center
                        </Link>
                        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
                            <span>🏠</span> Back to Home
                        </Link>
                    </div>
                </div>

                {/* User User */}
                <div className="p-4 border-t border-gray-800 bg-[#0B111D]">
                    <div className="flex items-center gap-3">
                        <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100" className="w-9 h-9 rounded-lg border border-gray-600" alt="Profile" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">Acme Events</p>
                            <p className="text-xs text-gray-500 truncate">Pro Organizer</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Nav Overlay (Simple for now) */}
            {/* You could add a hamburger menu state here later */}

            {/* Main Content Area */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Partner Portal</span>
                        <span>/</span>
                        <span className="font-bold text-gray-900 capitalize">{location.pathname.split('/').pop()}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors relative">
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            🔔
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 lg:p-10 max-w-7xl w-full mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default PartnerLayout;
