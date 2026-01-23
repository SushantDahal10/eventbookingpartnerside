import React from 'react';
import { Link } from 'react-router-dom';

const EventLiveConsole = () => {
    // Mock Data for Live Console
    const liveStats = {
        checkedIn: 642,
        totalSold: 840,
        revenue: "Rs. 8,40,000",
        capacity: 1000,
        recentActivity: [
            { time: "Just Now", action: "Ticket Scanned", user: "Ravi K.", gate: "Main Gate" },
            { time: "2 min ago", action: "Ticket Scanned", user: "Sita M.", gate: "VIP Entrance" },
            { time: "5 min ago", action: "New Ticket Sale", user: "John D.", type: "General Admission" },
            { time: "8 min ago", action: "Issue Reported", user: "Gate A", type: "Scanner Error" },
            { time: "12 min ago", action: "Ticket Scanned", user: "Anita S.", gate: "Main Gate" },
        ]
    };

    const checkInPercentage = Math.round((liveStats.checkedIn / liveStats.totalSold) * 100);

    return (
        <div className="min-h-screen bg-slate-950 text-white font-body selection:bg-red-500 selection:text-white pb-20">

            {/* Top Bar - Command Center Header */}
            <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link to="/partner/events" className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-400">
                        ←
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-heading font-bold tracking-tight">Summer Music Festival 2026</h1>
                            <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[10px] uppercase font-bold animate-pulse">● Live Now</span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold tracking-wider">LOD CLUB, KATHMANDU • DOORS OPEN</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-400 font-bold uppercase">Current Time</p>
                        <p className="text-xl font-mono font-bold text-white">19:42:05</p>
                    </div>
                    <button className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-red-600/20 transition-all">
                        Emergency Stop
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">

                {/* 1. Real-Time KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Check-ins */}
                    <div className="bg-slate-900 rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <svg className="w-12 h-12 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Checked-In</p>
                        <h2 className="text-5xl font-black text-white mb-2">{liveStats.checkedIn}</h2>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                            <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${checkInPercentage}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                            <span className="text-green-400 font-bold">{checkInPercentage}%</span> of {liveStats.totalSold} tickets active
                        </p>
                    </div>

                    {/* Sales (Live) */}
                    <div className="bg-slate-900 rounded-2xl p-6 border border-white/5 group hover:border-blue-500/30 transition-colors">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Live Revenue</p>
                        <h2 className="text-4xl font-black text-white mb-1">{liveStats.revenue}</h2>
                        <p className="text-xs text-green-400 font-bold flex items-center gap-1">
                            <span>▲</span> +Rs. 12,000 in last hour
                        </p>
                    </div>

                    {/* Capacity */}
                    <div className="bg-slate-900 rounded-2xl p-6 border border-white/5">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Venue Capacity</p>
                        <h2 className="text-4xl font-black text-white mb-2">{Math.round((liveStats.checkedIn / liveStats.capacity) * 100)}%</h2>
                        <p className="text-xs text-slate-400 font-bold">Occupancy Rate</p>
                    </div>

                    {/* Issues */}
                    <div className="bg-slate-900 rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
                        <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">Active Alerts</p>
                        <h2 className="text-4xl font-black text-white mb-2">1</h2>
                        <p className="text-xs text-red-300 font-bold">Gate A Scanner Malfunction</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 2. Live Activity Feed */}
                    <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                            <h3 className="font-heading font-bold text-white">Live Activity Feed</h3>
                            <div className="flex gap-2">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs text-green-500 font-bold uppercase">Updating</span>
                            </div>
                        </div>
                        <div className="p-0">
                            {liveStats.recentActivity.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${item.action.includes("Error") ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"}`}>
                                            {item.action.includes("Error") ? "!" : "✓"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{item.action}</p>
                                            <p className="text-xs text-slate-400">{item.user} • {item.gate || item.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono font-bold text-slate-500">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="p-4 text-center">
                                <button className="text-sm font-bold text-slate-400 hover:text-white transition-colors">View All Activity ↓</button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Quick Actions */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-6 border border-white/5">
                            <h3 className="font-heading font-bold text-white mb-4">Scanner Controls</h3>
                            <div className="space-y-3">
                                <Link to="/partner/tools/scanner/1" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                                    <span>📱</span> Open Web Scanner
                                </Link>
                                <Link to="/partner/events/1/analytics" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2">
                                    <span>📊</span> View Full Analytics
                                </Link>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-heading font-bold text-white mb-2">Push Notification</h3>
                                <p className="text-xs text-purple-200 mb-4 font-medium">Send an update to all 642 checked-in attendees.</p>
                                <textarea className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-purple-300/50 mb-3 outline-none focus:border-purple-400" placeholder="Type your message... (e.g. Main act starting in 10 mins!)"></textarea>
                                <button className="w-full py-2 bg-white text-purple-900 font-black rounded-lg text-sm hover:bg-purple-50 transition-colors">
                                    Send Broadcast 🚀
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EventLiveConsole;
