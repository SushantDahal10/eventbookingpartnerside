import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const EventAnalytics = () => {
    // State to toggle between views (simulating different lifecycle stages for demo)
    const [viewMode, setViewMode] = useState('Overview'); // Overview, Sales, Attendees, Marketing

    // Mock Data - Enhanced for specific insights
    const analytics = {
        totalRevenue: "Rs. 22,50,000",
        ticketsSold: 4500,
        pageViews: "45.2K",
        conversionRate: "10.4%",
        avgOrderValue: "Rs. 2,100",
        waitlist: 840,
        salesVelocity: "+124 / hr",
        salesTrend: [10, 25, 40, 30, 60, 50, 80, 70, 95, 100, 110, 105, 130, 145],
        marketingChannels: [
            { name: "Instagram Ads", traffic: "45%", sales: "52%" },
            { name: "Direct", traffic: "20%", sales: "18%" },
            { name: "Email Blast", traffic: "15%", sales: "22%" },
            { name: "Facebook", traffic: "10%", sales: "5%" },
            { name: "Referral", traffic: "10%", sales: "3%" }
        ],
        ageDemographics: [
            { range: "18-24", pct: 45 },
            { range: "25-34", pct: 30 },
            { range: "35-44", pct: 15 },
            { range: "45+", pct: 10 },
        ]
    };

    // Helper for trend chart mock
    const maxVal = Math.max(...analytics.salesTrend);
    const points = analytics.salesTrend.map((val, i) =>
        `${(i / (analytics.salesTrend.length - 1)) * 100},${100 - (val / maxVal) * 100}`
    ).join(" ");
    const areaPath = `M0,100 L0,${100 - (analytics.salesTrend[0] / maxVal) * 100} ${points} L100,100 Z`;

    const tabs = ['Overview', 'Sales Analysis', 'Marketing', 'Attendees'];

    return (
        <div className="animate-[fadeIn_0.5s] space-y-8 p-6 lg:p-10 pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <Link to="/partner/events" className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500">
                        ←
                    </Link>
                    <div>
                        <h1 className="text-3xl font-heading font-black text-slate-900 mb-1">Event Dashboard</h1>
                        <p className="text-slate-500 font-medium">Insights for <span className="text-slate-900 font-bold">Summer Music Festival 2026</span></p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 hover:text-slate-900 shadow-sm flex items-center gap-2 transition-colors">
                        <span>📥</span> Export Data
                    </button>
                    <Link to="/partner/live/1" className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 flex items-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0">
                        <span>🔴</span> Live Console
                    </Link>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl w-fit max-w-full overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setViewMode(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${viewMode === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* CONTENT AREA */}
            <div className="space-y-8">

                {/* 1. KEY METRICS ROW */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Total Revenue", val: analytics.totalRevenue, change: "+12.5%", good: true, footer: "vs last event" },
                        { label: "Tickets Sold", val: analytics.ticketsSold, change: "+5.2%", good: true, footer: "85% of capacity" },
                        { label: "Sales Velocity", val: analytics.salesVelocity, change: "High Demand", good: true, footer: "Tickets/hour" },
                        { label: "Waitlist Interest", val: analytics.waitlist, change: "+45", good: true, footer: "New signups today" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-xs font-bold uppercase text-slate-400 tracking-wide">{stat.label}</p>
                                <span className={`flex h-2 w-2 rounded-full ${stat.good ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-2 group-hover:scale-105 transition-transform origin-left">{stat.val}</h3>
                            <div className="flex items-center gap-2 text-xs font-medium">
                                <span className={`${stat.good ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'} px-2 py-0.5 rounded font-bold`}>
                                    {stat.change}
                                </span>
                                <span className="text-slate-400">{stat.footer}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. MAIN CHART SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Sales Trends</h3>
                                <p className="text-sm text-slate-500 font-medium">Comparison with previous period</p>
                            </div>
                            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 outline-none hover:border-primary focus:border-primary transition-colors">
                                <option>Last 30 Days</option>
                                <option>Last 7 Days</option>
                                <option>24 Hours</option>
                            </select>
                        </div>

                        <div className="relative h-72 w-full group">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                                <defs>
                                    <linearGradient id="analyticsFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={areaPath} fill="url(#analyticsFill)" />
                                <path
                                    d={`M0,${100 - (analytics.salesTrend[0] / maxVal) * 100} ${points}`}
                                    fill="none"
                                    stroke="#3B82F6"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    vectorEffect="non-scaling-stroke"
                                    className="drop-shadow-sm"
                                />
                                {/* Interactive Dots */}
                                {analytics.salesTrend.map((val, i) => (
                                    <circle
                                        key={i}
                                        cx={`${(i / (analytics.salesTrend.length - 1)) * 100}`}
                                        cy={`${100 - (val / maxVal) * 100}`}
                                        r="3"
                                        className="fill-white stroke-primary stroke-2 hover:r-5 cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                ))}
                            </svg>

                            {/* X-Axis Labels */}
                            <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase">
                                <span>Day 1</span>
                                <span>Day 7</span>
                                <span>Day 14</span>
                                <span>Day 21</span>
                                <span>Today</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. INSIGHTS COLUMN */}
                    <div className="space-y-6">
                        {/* AI Insight Box */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                            </div>
                            <h3 className="font-heading font-bold text-lg mb-2 relative z-10">💡 AI Insight</h3>
                            <p className="text-indigo-100 text-sm mb-4 relative z-10 font-medium leading-relaxed">
                                Tickets are selling <strong>2.4x faster</strong> than your last event. At this rate, you will sell out by <strong>Friday, 4 PM</strong>.
                            </p>
                            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-xs font-bold backdrop-blur-sm transition-colors relative z-10">
                                View Prediction Details
                            </button>
                        </div>

                        {/* Marketing Channels Mini-Table */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-fit">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Top Marketing Channels</h3>
                            <div className="space-y-4">
                                {analytics.marketingChannels.slice(0, 3).map((channel, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                                                {i === 0 ? '📸' : i === 1 ? '🔗' : '📧'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{channel.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{channel.traffic} traffic</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm text-green-600">{channel.sales}</p>
                                            <p className="text-xs text-slate-400">of sales</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 py-2 text-primary font-bold text-sm hover:bg-blue-50 rounded-lg transition-colors">
                                View All Channels →
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. ATTENDEE BREAKDOWN ROW */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Demographics</h3>
                        <div className="flex items-end gap-2 h-32 px-4">
                            {analytics.ageDemographics.map((age, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group cursor-pointer">
                                    <div className="text-xs font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">{age.pct}%</div>
                                    <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden" style={{ height: `${age.pct}%`, minHeight: '10%' }}>
                                        <div className="absolute inset-0 bg-blue-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <div className="text-xs font-bold text-slate-500">{age.range}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Ticket Types</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Early Bird', sold: 500, total: 500, color: 'bg-green-500' },
                                { name: 'General Admission', sold: 2400, total: 3500, color: 'bg-blue-500' },
                                { name: 'VIP Access', sold: 150, total: 200, color: 'bg-purple-500' },
                            ].map((type, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                                        <span>{type.name}</span>
                                        <span className="text-slate-400">{type.sold} / {type.total}</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${type.color}`} style={{ width: `${(type.sold / type.total) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EventAnalytics;
