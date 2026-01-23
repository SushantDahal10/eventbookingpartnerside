import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MyEvents = () => {
    // Mock Data
    const events = [
        {
            id: 1,
            title: "Summer Music Festival 2026",
            date: "Oct 24, 2026",
            venue: "LOD Club, Kathmandu",
            status: "Live",
            sold: 840,
            capacity: 1000,
            revenue: "Rs. 8,40,000",
            img: "https://images.unsplash.com/photo-1459749411177-287ce63e3ba9?auto=format&fit=crop&q=80&w=300"
        },
        {
            id: 2,
            title: "Tech Innovators Summit",
            date: "Nov 12, 2026",
            venue: "Hyatt Regency",
            status: "Draft",
            sold: 0,
            capacity: 500,
            revenue: "Rs. 0",
            img: "https://images.unsplash.com/photo-1540575467063-17e6fc8c62d8?auto=format&fit=crop&q=80&w=300"
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Live': return 'bg-green-100 text-green-700 border-green-200';
            case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'Ended': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="animate-[fadeIn_0.5s]">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-heading font-extrabold text-slate-900 mb-2">My Events</h1>
                    <p className="text-slate-500 font-medium">Manage your upcoming and past events.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:border-primary outline-none text-sm font-medium w-64 shadow-sm"
                        />
                        <span className="absolute left-3 top-3 text-slate-400">🔍</span>
                    </div>
                    <button className="px-4 py-3 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-50 text-sm shadow-sm">
                        Filter ▾
                    </button>
                    <Link to="/partner/create" className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark shadow-lg shadow-primary/20 flex items-center gap-2">
                        <span>➕</span> Create
                    </Link>
                </div>
            </div>

            {/* Events List */}
            <div className="grid grid-cols-1 gap-6">
                {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-center">
                        <img src={event.img} alt={event.title} className="w-full md:w-48 h-32 object-cover rounded-lg shadow-sm" />

                        <div className="flex-grow w-full">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border mb-2 ${getStatusColor(event.status)}`}>
                                        {event.status}
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">•••</button>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4 font-medium">
                                <span className="flex items-center gap-1">📅 {event.date}</span>
                                <span className="flex items-center gap-1">📍 {event.venue}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Sold</p>
                                    <p className="font-bold text-slate-900">{event.sold} / {event.capacity}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Gross Rev.</p>
                                    <p className="font-bold text-slate-900">{event.revenue}</p>
                                </div>
                                <div className="text-right">
                                    <button className="text-sm font-bold text-primary hover:text-primary-dark">Manage Dashboard →</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {events.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="text-6xl mb-4">🎫</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No events found</h3>
                    <p className="text-slate-500 mb-6">Get started by creating your first event.</p>
                    <Link to="/partner/create" className="btn-primary py-3 px-8">Create Event</Link>
                </div>
            )}

        </div>
    );
};

export default MyEvents;
