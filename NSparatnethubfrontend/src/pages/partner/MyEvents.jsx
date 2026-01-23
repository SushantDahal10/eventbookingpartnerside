import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MyEvents = () => {
    // Mock Data with more detailed stats for the new UI
    const events = [
        {
            id: 1,
            title: "Summer Music Festival 2026",
            date: "Oct 24, 2026",
            time: "18:00 PM",
            venue: "LOD Club, Kathmandu",
            status: "Live",
            sold: 840,
            capacity: 1000,
            revenue: "Rs. 8,40,000",
            img: "https://images.unsplash.com/photo-1459749411177-287ce63e3ba9?auto=format&fit=crop&q=80&w=800",
            views: "12.5K",
            conversion: "6.8%"
        },
        {
            id: 2,
            title: "Tech Innovators Summit",
            date: "Nov 12, 2026",
            time: "09:00 AM",
            venue: "Hyatt Regency",
            status: "Draft",
            sold: 0,
            capacity: 500,
            revenue: "Rs. 0",
            img: "https://images.unsplash.com/photo-1540575467063-17e6fc8c62d8?auto=format&fit=crop&q=80&w=800",
            views: "1.2K",
            conversion: "0%"
        },
        {
            id: 3,
            title: "Nepal Food Carnival",
            date: "Aug 15, 2026",
            time: "12:00 PM",
            venue: "Bhrikutimandap, KTM",
            status: "Ended",
            sold: 4500,
            capacity: 5000,
            revenue: "Rs. 22,50,000",
            img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
            views: "45K",
            conversion: "10%"
        }
    ];

    const getStatusConfig = (status, id) => {
        switch (status) {
            case 'Live':
                return {
                    badgeClass: 'bg-red-500 text-white animate-pulse shadow-red-500/50',
                    badgeText: '● LIVE NOW',
                    actionBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30',
                    actionText: '🔴 Live Console',
                    link: `/partner/live/${id}`
                };
            case 'Draft':
                return {
                    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
                    badgeText: 'Draft',
                    actionBtn: 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20',
                    actionText: '✏️ Continue Editing',
                    link: `/partner/edit/${id}`
                };
            case 'Ended':
                return {
                    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
                    badgeText: 'Completed',
                    actionBtn: 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50',
                    actionText: '📊 View Full Insights',
                    link: `/partner/events/${id}/analytics`
                };
            default: // Upcoming
                return {
                    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
                    badgeText: 'Upcoming',
                    actionBtn: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30',
                    actionText: '⚙️ Manage Dashboard',
                    link: `/partner/events/${id}/analytics` // Or a manage page
                };
        }
    };

    return (
        <div className="animate-[fadeIn_0.5s] space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-slate-100">
                <div>
                    <h1 className="text-4xl font-heading font-black text-slate-900 mb-2">My Events</h1>
                    <p className="text-slate-500 font-medium text-lg">Track performance and manage your experiences.</p>
                </div>

                <div className="flex gap-3">
                    <button className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </button>
                    <Link to="/partner/create" className="h-12 px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-xl shadow-slate-900/10 flex items-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0">
                        <span>➕</span> Create New
                    </Link>
                </div>
            </div>

            {/* Events List */}
            <div className="grid grid-cols-1 gap-8">
                {events.map((event) => {
                    const config = getStatusConfig(event.status, event.id);
                    const percentSold = Math.round((event.sold / event.capacity) * 100);

                    return (
                        <div key={event.id} className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="flex flex-col lg:flex-row gap-6">

                                {/* Image Section */}
                                <div className="lg:w-72 h-56 relative rounded-xl overflow-hidden shrink-0">
                                    <img src={event.img} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider shadow-sm ${config.badgeClass}`}>
                                        {config.badgeText}
                                    </span>
                                </div>

                                {/* Content Section */}
                                <div className="flex-grow py-2 pr-4 flex flex-col justify-between">

                                    {/* Top Row: Title & Date */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{event.title}</h3>
                                            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    {event.date}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    {event.time}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                    {event.venue}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Row: Key Stats Grid */}
                                    <div className="grid grid-cols-3 gap-6 mb-6">
                                        {/* Sales Progress */}
                                        <div className="col-span-1">
                                            <div className="flex justify-between text-xs font-bold uppercase text-slate-400 mb-2">
                                                <span>Tickets Sold</span>
                                                <span className={`${percentSold > 80 ? 'text-green-600' : 'text-slate-900'}`}>{percentSold}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${percentSold > 80 ? 'bg-green-500' : 'bg-slate-900'}`}
                                                    style={{ width: `${percentSold}%` }}
                                                ></div>
                                            </div>
                                            <div className="mt-1 text-xs font-bold text-slate-900">
                                                {event.sold} <span className="text-slate-400 font-normal">/ {event.capacity}</span>
                                            </div>
                                        </div>

                                        {/* Revenue */}
                                        <div className="col-span-1 border-l border-slate-100 pl-6">
                                            <p className="text-xs font-bold uppercase text-slate-400 mb-1">Gross Revenue</p>
                                            <p className="text-xl font-black text-slate-900">{event.revenue}</p>
                                        </div>

                                        {/* Views/Traffic */}
                                        <div className="col-span-1 border-l border-slate-100 pl-6 hidden md:block">
                                            <p className="text-xs font-bold uppercase text-slate-400 mb-1">Page Views</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-black text-slate-900">{event.views}</span>
                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">+{event.conversion}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Row: Actions */}
                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                        <Link to={config.link} className={`flex-grow h-12 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${config.actionBtn}`}>
                                            {config.actionText}
                                        </Link>
                                        <button className="h-12 w-12 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {events.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">🎫</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No events found</h3>
                        <p className="text-slat-500 mb-8 max-w-sm mx-auto">You haven't created any events yet. Start your journey by publishing your first experience.</p>
                        <Link to="/partner/create" className="btn-primary py-4 px-10 rounded-xl shadow-xl shadow-primary/20">Create First Event</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEvents;
