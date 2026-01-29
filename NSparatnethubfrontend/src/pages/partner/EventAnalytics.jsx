import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const EventAnalytics = () => {
    const { id } = useParams();
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('partner_token');
                const response = await fetch(`http://localhost:5000/api/events/${id}/analytics`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setAnalyticsData(data);
                } else {
                    console.error("Error fetching analytics:", data);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [id]);

    if (isLoading) return <div className="p-10 text-center font-bold text-slate-500 animate-pulse">Loading analytics...</div>;
    if (!analyticsData) return <div className="p-10 text-center text-red-500 font-bold">Failed to load analytics.</div>;

    const { eventTitle, totalRevenue, totalSold, totalCapacity, tiers, salesTrend } = analyticsData;
    const revenueFormatted = `Rs. ${totalRevenue.toLocaleString()}`;
    const percentSold = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;

    // Data for Pie Chart
    const pieData = tiers.map(t => ({ name: t.name, value: t.sold }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="animate-[fadeIn_0.5s] space-y-8 p-6 lg:p-10 pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <Link to="/partner/events" className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500">
                        ←
                    </Link>
                    <div>
                        <h1 className="text-3xl font-heading font-black text-slate-900 mb-1">Event Analytics</h1>
                        <p className="text-slate-500 font-medium">Insights for <span className="text-slate-900 font-bold">{eventTitle}</span></p>
                    </div>
                </div>
            </div>

            {/* KEY METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-2">Net Revenue (95%)</p>
                    <h3 className="text-3xl font-black text-slate-900 text-green-600">Rs. {analyticsData.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-2">Platform Fees (5%)</p>
                    <h3 className="text-3xl font-black text-red-500">Rs. {analyticsData.totalCommission.toLocaleString()}</h3>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-2">Gross Sales</p>
                    <h3 className="text-3xl font-black text-slate-900">Rs. {analyticsData.totalGross.toLocaleString()}</h3>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-2">Total Tickets</p>
                    <h3 className="text-3xl font-black text-slate-900">{totalSold} <span className="text-lg text-slate-400 font-medium">/ {totalCapacity}</span></h3>
                </div>
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Sales Trend Chart */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Daily Ticket Sales</h3>
                    <div className="h-64 w-full">
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
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#94a3b8', fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        // tickFormatter={(value) => `Rs.${value / 1000}k`} // Removed currency formatting
                                        tick={{ fill: '#94a3b8', fontWeight: 600 }}
                                        allowDecimals={false} // Integer only
                                        dx={-10}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700">
                                                        <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
                                                        <p className="text-lg font-black text-white">
                                                            {payload[0].value} Tickets
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
                                        dataKey="tickets" // CHANGED FROM revenue
                                        stroke="#FF4D00"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff', fill: '#FF4D00' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                No sales data found for this period
                            </div>
                        )}
                    </div>
                </div>

                {/* Tier Distribution Chart */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Ticket Sales by Tier</h3>
                    <div className="flex-grow flex items-center justify-center">
                        {totalSold > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-64 w-full flex items-center justify-center text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                No tickets sold yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* TIER BREAKDOWN TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900">Tier-wise Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Tier Name</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Capacity</th>
                                <th className="px-6 py-4">Sold</th>
                                <th className="px-6 py-4 text-green-600">Available</th>
                                <th className="px-6 py-4 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {tiers.map((tier, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                        {tier.name}
                                    </td>
                                    <td className="px-6 py-4">Rs. {tier.price}</td>
                                    <td className="px-6 py-4">{tier.capacity}</td>
                                    <td className="px-6 py-4">{tier.sold}</td>
                                    <td className="px-6 py-4 text-green-600 font-bold">{tier.available}</td>
                                    <td className="px-6 py-4 text-right font-bold">Rs. {tier.revenue.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default EventAnalytics;
