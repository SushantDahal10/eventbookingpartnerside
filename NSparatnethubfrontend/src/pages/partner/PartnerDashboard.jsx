import React from 'react';
import { Link } from 'react-router-dom';

const PartnerDashboard = () => {
    // Generate a smooth curve for the chart
    const dataPoints = [20, 40, 35, 50, 45, 60, 55, 75, 70, 90, 85, 100];
    const points = dataPoints.map((val, i) => `${(i / (dataPoints.length - 1)) * 100},${100 - val}`).join(" ");
    const areaPath = `M0,100 L0,${100 - dataPoints[0]} ${points} L100,100 Z`;

    return (
        <div className="animate-[fadeIn_0.5s]">

            {/* Header with Date Widget */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight mb-2">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl">
                        Here's what's happening today.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Link to="/partner/create" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-lg shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2">
                        <span>➕</span> Create Event
                    </Link>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* 1. Main Revenue Card (Span 8) */}
                <div className="col-span-1 md:col-span-8 bg-white rounded-xl p-8 border border-slate-200">
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-4xl font-black text-slate-900">Rs. 12,45,000</h2>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200">
                                    ▲ 15.2%
                                </span>
                            </div>
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                            {['1D', '1W', '1M', '1Y'].map((t, i) => (
                                <button key={t} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${i === 2 ? 'bg-white shadow-sm text-slate-900 border border-slate-200' : 'text-slate-400 hover:text-slate-700'}`}>{t}</button>
                            ))}
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="relative h-64 w-full">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                            <defs>
                                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d={areaPath} fill="url(#chartFill)" />
                            <path
                                d={`M0,${100 - dataPoints[0]} ${points}`}
                                fill="none"
                                stroke="#3B82F6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {/* 2. Live Now Card (Span 4) */}
                <div className="col-span-1 md:col-span-4 bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                    <div className="relative z-10 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">Live Now</h3>
                            </div>
                        </div>

                        <div className="flex-grow space-y-6">
                            <div className="text-center py-4">
                                <div className="text-5xl font-black mb-2">452</div>
                                <p className="text-slate-500 font-bold text-xs">Active Attendees</p>
                            </div>

                            <div className="bg-white/10 rounded-lg p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded bg-indigo-500 flex items-center justify-center font-bold">SM</div>
                                <div>
                                    <p className="font-bold text-sm">Summer Music Fest</p>
                                    <p className="text-xs text-slate-400">LOD, Kathmandu</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Secondary Stats */}
                {[
                    { label: 'Tickets Sold', val: '1,240', sub: '+12 today', icon: '🎟️' },
                    { label: 'Page Views', val: '45.2K', sub: '+5% this week', icon: '👁️' },
                    { label: 'Conversion', val: '4.8%', sub: 'Top 10%', icon: '⚡' },
                    { label: 'Followers', val: '8.5K', sub: '+120 new', icon: '👥' }
                ].map((stat, i) => (
                    <div key={i} className="col-span-1 md:col-span-3 bg-white rounded-xl p-6 border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-2xl">{stat.icon}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">{stat.val}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PartnerDashboard;
