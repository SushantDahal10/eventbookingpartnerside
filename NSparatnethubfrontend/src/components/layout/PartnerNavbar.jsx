import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const PartnerNavbar = () => {
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navItems = [
        { label: 'Dashboard', path: '/partner/dashboard', icon: '📊' },
        { label: 'My Events', path: '/partner/events', icon: '📅' },
        { label: 'Create Event', path: '/partner/create', icon: '➕' },
        { label: 'Earnings', path: '/partner/earnings', icon: '💰' },
    ];

    const isActive = (path) => location.pathname === path;

    // Close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A] text-white shadow-lg font-heading">
            <div className="max-w-[1600px] mx-auto px-6">
                <div className="flex items-center justify-between h-20">

                    {/* 1. Brand Identity - Bold & Clear */}
                    <div className="flex items-center gap-12">
                        <Link to="/partner/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-black text-xl text-white shadow-lg shadow-primary/30">
                                NS
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold tracking-tight text-white leading-none">Partner<span className="text-primary">Hub</span></span>
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] mt-0.5">Organizer Portal</span>
                            </div>
                        </Link>

                        {/* 2. Primary Navigation - Solid Tabs */}
                        <nav className="hidden lg:flex items-center gap-2">
                            {navItems.map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-3 transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-primary text-white shadow-md shadow-primary/20 translate-y-[-1px]'
                                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <span className="text-lg opacity-80">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* 3. Right Actions */}
                    <div className="flex items-center gap-6">

                        <Link
                            to="/"
                            className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 text-slate-300 text-xs font-bold hover:bg-primary hover:border-primary hover:text-white transition-all"
                        >
                            <span>🏠</span> Go to NS Home
                        </Link>

                        <div className="h-8 w-px bg-slate-700 hidden md:block"></div>

                        {/* Notifications */}
                        <button className="relative p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
                            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0F172A]"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-3 p-1 rounded-full transition-all border border-transparent ${isProfileOpen ? 'bg-slate-800 border-slate-700' : 'hover:bg-slate-800'}`}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100"
                                    alt="Org"
                                    className="w-9 h-9 rounded-full object-cover border-2 border-slate-700"
                                />
                                <div className="text-right hidden md:block pr-2">
                                    <span className="block text-sm font-bold text-white leading-tight">Acme Events</span>
                                </div>
                                <span className={`text-slate-500 text-xs pr-2 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}>▼</span>
                            </button>

                            {/* Dark Theme Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute right-0 top-full mt-3 w-72 bg-[#1E293B] rounded-xl shadow-2xl border border-slate-700 py-2 animate-[scaleIn_0.2s] origin-top-right z-50 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-slate-700 bg-[#0F172A]/50">
                                        <p className="text-sm font-bold text-white">Acme Events Pvt. Ltd.</p>
                                        <p className="text-xs text-slate-400 font-medium font-body truncate">partner-admin@acme.com</p>
                                    </div>

                                    <div className="p-2 space-y-1">
                                        {[
                                            { icon: '👤', label: 'My Profile' },
                                            { icon: '💳', label: 'Billing & Plan' },
                                            { icon: '⚙️', label: 'Settings' },
                                        ].map((item, i) => (
                                            <button key={i} className="w-full text-left px-3 py-2.5 rounded-lg text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-3 font-bold text-sm">
                                                <span>{item.icon}</span>
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="border-t border-slate-700 mt-1 p-2">
                                        <button className="w-full text-left px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-3 font-bold text-sm">
                                            <span>🚪</span> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PartnerNavbar;
