import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MyEvents = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('created'); // created (all), upcoming, completed

    // Cancellation State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:5000/api/events/my-events', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setEvents(data);
            }
        } catch (error) {
            console.error("Failed to fetch events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openCancelModal = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedEventId(id);
        setShowCancelModal(true);
    };

    const handleCancelEvent = async () => {
        if (!cancelReason || cancelReason.length < 5) return alert('Please provide a valid reason.');

        setIsCancelling(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://localhost:5000/api/events/${selectedEventId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason: cancelReason })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                setShowCancelModal(false);
                setCancelReason('');
                fetchEvents(); // Refresh list
            } else {
                alert(data.error || 'Failed to cancel event');
            }
        } catch (error) {
            console.error('Cancellation error:', error);
            alert('Something went wrong.');
        } finally {
            setIsCancelling(false);
        }
    };

    const getFilteredEvents = () => {
        const today = new Date();
        return events.filter(event => {
            // Note: event.status is calcualted in backend as 'Live'/'Ended' or stored 'Draft'
            // We can rely on it.

            if (activeTab === 'created') return true; // All
            if (activeTab === 'upcoming') {
                return (event.status === 'Live' || event.status === 'active' || event.status === 'Upcoming') && event.status !== 'Ended';
            }
            if (activeTab === 'completed') {
                return event.status === 'Ended' || event.status === 'completed';
            }
            return true;
        });
    };

    const filteredEvents = getFilteredEvents();

    // Check for Sold Out (Capacity is full and status is active)
    // We handle this first because even if active, if sold out, we prioritize that badge
    // EXCEPT if it is 'Live' or 'Ended', those take precedence.

    // Wait, if it's Live, it can be Sold Out. 
    // Logic: 
    // 1. If Ended -> Completed
    // 2. If Live -> Live (maybe with sold out tag?)
    // 3. If Active/Upcoming AND Sold = Capacity -> Sold Out

    if (status === 'Ended' || status === 'completed') {
        return {
            badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
            badgeText: 'Completed',
            actionBtn: 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50',
            actionText: '📊 View Full Insights',
            link: `/partner/events/${id}/analytics`
        };
    }

    if (status === 'Live') {
        return {
            badgeClass: 'bg-red-500 text-white animate-pulse shadow-red-500/50',
            badgeText: '● LIVE NOW',
            actionBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30',
            actionText: '📊 View Analytics',
            link: `/partner/events/${id}/analytics`,
            showCancel: true
        };
    }

    // Sold Out Check (Assuming event object passed to this function has 'sold' and 'capacity')
    // We need to pass the event object or sold/capacity to this function.
    // Currently only status and id are passed.
    // I will need to update the call site to pass the whole event or params.
    // For now, let's assume I fix the call site below.

    // Update: I will modify the call site in the loop to pass the event object.

    const getStatusConfig = (event) => {
        const { status, id, sold, capacity } = event;
        const isSoldOut = capacity > 0 && sold >= capacity;

        if (status === 'Ended' || status === 'completed') {
            return {
                badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
                badgeText: 'Completed',
                actionBtn: 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50',
                actionText: '📊 View Full Insights',
                link: `/partner/events/${id}/analytics`
            };
        }

        if (status === 'Live') {
            return {
                badgeClass: 'bg-red-500 text-white animate-pulse shadow-red-500/50',
                badgeText: '● LIVE NOW',
                actionBtn: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30',
                actionText: '📊 View Analytics',
                link: `/partner/events/${id}/analytics`,
                showCancel: true
            };
        }

        if (isSoldOut) {
            return {
                badgeClass: 'bg-orange-500 text-white border-orange-600 shadow-orange-500/40',
                badgeText: '🔥 SOLD OUT',
                actionBtn: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30',
                actionText: '⚙️ Manage Event',
                link: `/partner/events/${id}/analytics`,
                showCancel: true
            };
        }

        if (status === 'Draft') {
            return {
                badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
                badgeText: 'Draft',
                actionBtn: 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20',
                actionText: '✏️ Continue Editing',
                link: `/partner/edit/${id}`
            };
        }

        // Default: Upcoming
        return {
            badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
            badgeText: 'Upcoming',
            actionBtn: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30',
            actionText: '⚙️ Manage Dashboard',
            link: `/partner/events/${id}/analytics`,
            showCancel: true
        };
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

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 pb-1">
                {['created', 'upcoming', 'completed'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-bold text-sm capitalize transition-colors border-b-2 ${activeTab === tab
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        {tab === 'created' ? 'All Events' : tab}
                    </button>
                ))}
            </div>

            {/* Events List */}
            {isLoading ? (
                <div className="py-20 text-center text-slate-400 font-bold">Loading events...</div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {filteredEvents.map((event) => {
                        const config = getStatusConfig(event);
                        const percentSold = event.capacity > 0 ? Math.round((event.sold / event.capacity) * 100) : 0;

                        return (
                            <div key={event.id} className="group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                                <div className="flex flex-col lg:flex-row gap-6">

                                    {/* Image Section */}
                                    <div className="lg:w-72 h-56 relative rounded-xl overflow-hidden shrink-0 bg-slate-100">
                                        {event.img ? (
                                            <img src={event.img} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">🎆</div>
                                        )}
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
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
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

                                            {/* Revenue Breakdown */}
                                            <div className="col-span-1 border-l border-slate-100 pl-6">
                                                <div className="flex flex-col gap-1">
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase text-slate-400">Net Revenue (95%)</p>
                                                        <p className="text-xl font-black text-slate-900 leading-tight">{event.revenue}</p>
                                                    </div>
                                                    <div className="flex gap-3 mt-1">
                                                        <div className="text-xs">
                                                            <span className="text-slate-400 font-medium">Gross: </span>
                                                            <span className="font-bold text-slate-700">{event.gross || '-'}</span>
                                                        </div>
                                                        <div className="text-xs">
                                                            <span className="text-slate-400 font-medium">Fee: </span>
                                                            <span className="font-bold text-red-500">{event.commission || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
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

                                            {/* Cancel Button */}
                                            {config.showCancel && (
                                                <button
                                                    onClick={(e) => openCancelModal(e, event.id)}
                                                    className="h-12 px-4 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold flex items-center gap-2 transition-colors"
                                                    title="Cancel Event"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    <span className="hidden xl:inline">Cancel</span>
                                                </button>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {filteredEvents.length === 0 && (
                        <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">🎫</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">No events found</h3>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                                {activeTab === 'created'
                                    ? "You haven't created any events yet. Start your journey by publishing your first experience."
                                    : `No ${activeTab} events found.`}
                            </p>
                            <Link to="/partner/create" className="btn-primary py-4 px-10 rounded-xl shadow-xl shadow-primary/20 bg-primary text-white font-bold hover:bg-primary-dark">Create First Event</Link>
                        </div>
                    )}
                </div>
            )}


            {/* Cancellation Modal */}
            {
                showCancelModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s]">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-[scaleIn_0.2s]">
                            <h3 className="text-xl font-black text-slate-900 mb-2">Cancel Event?</h3>
                            <p className="text-slate-500 mb-4 text-sm">
                                Are you sure you want to cancel this event? This action cannot be undone.
                                If tickets have been sold, refunds will be initiated automatically.
                            </p>

                            <div className="mb-6">
                                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Reason for Cancellation</label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none font-medium"
                                    placeholder="e.g. Unforeseen weather conditions..."
                                    rows="3"
                                ></textarea>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Nevermind
                                </button>
                                <button
                                    onClick={handleCancelEvent}
                                    disabled={isCancelling}
                                    className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default MyEvents;
