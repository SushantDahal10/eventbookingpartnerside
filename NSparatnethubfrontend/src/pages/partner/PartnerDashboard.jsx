import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PartnerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('partner_token');
                if (!token) {
                    window.location.href = '/partner/login';
                    return;
                }

                const response = await fetch('http://localhost:5000/api/partners/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401) {
                    const errData = await response.json();
                    console.error('Dashboard 401 Error:', errData);
                    localStorage.removeItem('partner_token');
                    window.location.href = '/partner/login';
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }

                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Error loading dashboard: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800"
                >
                    Retry
                </button>
            </div>
        );
    }

    const { totalRevenue, totalSold, activeEvents, topEvents, salesTrend } = stats;

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="animate-[fadeIn_0.5s]">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight mb-2">
                        Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl">
                        Overview of your events and performance.
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

                {/* 1. Main Revenue Chart (Span 8) */}
                <div className="col-span-1 md:col-span-8 grid grid-cols-2 gap-6 p-0 bg-transparent border-0">
                    {/* Revenue Card */}
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Net Revenue (95%)</p>
                        <h2 className="text-4xl font-black text-slate-900">{formatCurrency(totalRevenue)}</h2>
                        <p className="text-sm font-bold text-green-600 mt-2">
                            Gross: {formatCurrency(stats.totalGross || 0)}
                        </p>
                    </div>

                    {/* Commission Card */}
                    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.15-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.62 1.87 1.26 0 2.53-.8 2.53-2.13 0-1.39-1.68-1.79-3.24-2.36-2.25-.82-3.42-2.1-3.42-3.85 0-1.94 1.28-3.13 2.97-3.5V2.98h2.67v1.93c1.38.23 2.63 1.13 2.87 2.9h-1.95c-.15-.81-.98-1.54-2.58-1.54-1.12 0-2.3.69-2.3 1.86 0 1.22 1.48 1.62 3.1 2.2 2.15.77 3.63 1.99 3.63 4.09 0 2.05-1.58 3.29-3.32 3.67z" /></svg>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Platform Fees (5%)</p>
                        <h2 className="text-4xl font-black text-slate-900">{formatCurrency(stats.totalCommission || 0)}</h2>
                        <p className="text-sm font-medium text-slate-400 mt-2">Deducted from sales</p>
                    </div>
                </div>

                {/* Chart (Moved down slightly or spans full width below) */}
                <div className="col-span-1 md:col-span-8 bg-white rounded-xl p-8 border border-slate-200 mt-0">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Sales Trend (Net)</h3>

                    {/* Chart */}
                    <div className="h-80 w-full mt-4">
                        {salesTrend && salesTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF4D00" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#FF4D00" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `Rs ${value}`}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700">
                                                        <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
                                                        <p className="text-lg font-black text-white">
                                                            {formatCurrency(payload[0].value)}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                        cursor={{ stroke: '#FF4D00', strokeWidth: 2, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#FF4D00"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff', fill: '#FF4D00' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 font-medium bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <span className="text-4xl mb-2">📉</span>
                                No sales data available yet
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Key Stats (Span 4) */}
                <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
                    {/* Active Events */}
                    <div className="bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden flex-1">
                        <div className="relative z-10">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300 mb-4">Active Events</h3>
                            <div className="text-5xl font-black mb-2">{activeEvents}</div>
                            <p className="text-slate-400 text-sm">Events currently live or upcoming</p>
                        </div>
                        <div className="absolute -bottom-4 -right-4 text-slate-800 opacity-50">
                            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" /></svg>
                        </div>
                    </div>

                    {/* Total Tickets */}
                    <div className="bg-white rounded-xl p-8 border border-slate-200 flex-1">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-4">Total Tickets Sold</h3>
                        <div className="text-4xl font-black text-slate-900 mb-2">{totalSold}</div>
                        <p className="text-slate-500 text-sm">Lifetime ticket sales</p>
                    </div>
                </div>

                {/* 3. Top Performing Events Table (Full Width) */}
                <div className="col-span-1 md:col-span-12 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-heading font-bold text-lg text-slate-900">Top Performing Events</h3>
                        <Link to="/partner/events" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                            View All Events →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Event Name</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Tickets Sold</th>
                                    <th className="px-6 py-4 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {topEvents && topEvents.length > 0 ? (
                                    topEvents.map((event) => (
                                        <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">{event.title}</td>
                                            <td className="px-6 py-4 text-slate-500">{event.date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${event.status === 'active' || event.status === 'Live'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-700">{event.sold}</td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(event.revenue)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                                            No events found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PartnerDashboard;
