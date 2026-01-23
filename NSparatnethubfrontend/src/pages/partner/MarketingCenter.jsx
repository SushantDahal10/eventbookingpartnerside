import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MarketingCenter = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('boost'); // 'boost' or 'insights'
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Mock Data
    const myEvents = [
        { id: 1, name: 'Summer Music Festival', date: '2026-06-15', status: 'Published' },
        { id: 2, name: 'Tech Startups Meetup', date: '2026-07-02', status: 'Published' },
        { id: 3, name: 'Nepal Food Carnival', date: '2026-08-20', status: 'Draft' },
    ];

    const trendingTopics = [
        { id: 1, topic: 'Live Rock Music', volume: 'High', growth: '+25%' },
        { id: 2, topic: 'Stand-up Comedy', volume: 'Medium', growth: '+12%' },
        { id: 3, topic: 'EDM Nights', volume: 'Very High', growth: '+40%' },
        { id: 4, topic: 'Art Workshops', volume: 'Low', growth: '+5%' },
    ];

    const socialBuzz = [
        { platform: 'Instagram', tag: '#KTMNightLife', posts: '12K+ today' },
        { platform: 'TikTok', tag: '#NepalConcerts', posts: '5K+ today' },
        { platform: 'Twitter', tag: '#WeekendVibes', posts: '8K+ today' },
    ];

    const handleBoost = (pkg, price, eventNameOverride = null) => {
        const targetEventName = eventNameOverride || selectedEvent?.name;

        if (!targetEventName) {
            alert("Please select an event to boost first!");
            return;
        }
        navigate('/partner/payment', {
            state: {
                eventName: targetEventName,
                pkgName: pkg,
                price: price
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-[fadeIn_0.5s]">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-heading font-black text-slate-900 mb-2">Marketing Center</h1>
                <p className="text-slate-500 font-medium text-lg">Grow your audience with powerful tools and data-driven insights.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-6 border-b border-slate-200 mb-8">
                <button
                    onClick={() => setActiveTab('boost')}
                    className={`pb-4 px-2 font-bold text-sm transition-all ${activeTab === 'boost' ? 'text-primary border-b-4 border-primary' : 'text-slate-400 hover:text-slate-700'}`}
                >
                    🚀 Boost Events
                </button>
                <button
                    onClick={() => setActiveTab('insights')}
                    className={`pb-4 px-2 font-bold text-sm transition-all ${activeTab === 'insights' ? 'text-primary border-b-4 border-primary' : 'text-slate-400 hover:text-slate-700'}`}
                >
                    📈 Market Insights
                </button>
            </div>

            {/* BOOST TAB */}
            {activeTab === 'boost' && (
                <div className="space-y-8">

                    {/* Active Boosts (Urgency / FOMO Section) */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-16 -mt-16"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-white/10 rounded-xl flex items-center justify-center text-3xl animate-pulse">
                                    🚀
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Active Boost: Summer Music Festival</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-300">
                                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                        <span>Homepage Hero Live</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Expires In</p>
                                    <div className="font-mono text-3xl font-black text-red-500">04:12:30</div>
                                </div>
                                <button onClick={() => handleBoost('Homepage Hero', '5,000', 'Summer Music Festival')} className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-lg">
                                    ⚡ Extend Now
                                </button>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 w-[85%]"></div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 text-right">85% of time elapsed. Renew to keep your spot!</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Event Selector */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                            <h3 className="font-bold text-slate-900 mb-4">1. Select Event</h3>
                            <div className="space-y-3">
                                {myEvents.filter(e => e.status === 'Published').map(event => (
                                    <div
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedEvent?.id === event.id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-300'}`}
                                    >
                                        <h4 className="font-bold text-slate-900">{event.name}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{event.date} • {event.status}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Package Selector */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="font-bold text-slate-900">2. Choose Boost Package</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Package 1 */}
                                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 relative overflow-hidden group hover:shadow-lg transition-all">
                                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Popular</div>
                                    <h4 className="text-xl font-heading font-black text-slate-900 mb-2">Homepage Hero</h4>
                                    <p className="text-slate-500 text-sm mb-6 h-10">Feature your event on the main carousel for 24 hours.</p>
                                    <div className="text-3xl font-black text-slate-900 mb-6">Rs. 5,000 <span className="text-sm font-medium text-slate-400">/day</span></div>
                                    <button onClick={() => handleBoost('Homepage Hero', '5,000')} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all">
                                        Boost Now
                                    </button>
                                </div>

                                {/* Package 2 */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 group hover:shadow-lg transition-all">
                                    <h4 className="text-xl font-heading font-black text-slate-900 mb-2">Category Top</h4>
                                    <p className="text-slate-500 text-sm mb-6 h-10">Pin to top of "Music" or "Nightlife" category.</p>
                                    <div className="text-3xl font-black text-slate-900 mb-6">Rs. 2,500 <span className="text-sm font-medium text-slate-400">/day</span></div>
                                    <button onClick={() => handleBoost('Category Top', '2,500')} className="w-full py-3 bg-white border-2 border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-all">
                                        Boost Now
                                    </button>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-slate-900 rounded-2xl p-6 text-white mt-8">
                                <h4 className="font-bold mb-2">🔥 Why Boost?</h4>
                                <p className="text-slate-400 text-sm">Boosted events see an average of <span className="text-white font-bold">3.5x more ticket sales</span> and <span className="text-white font-bold">5x more page views</span> compared to organic listings.</p>
                            </div>
                        </div>
                    </div>
            )}

                    {/* INSIGHTS TAB */}
                    {activeTab === 'insights' && (
                        <div className="space-y-8">

                            {/* Trending Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-2xl">🔥</span>
                                        <h3 className="text-xl font-bold text-slate-900">Trending Now</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {trendingTopics.map((item, i) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                                <span className="font-bold text-slate-700">#{i + 1} {item.topic}</span>
                                                <span className="text-green-600 font-bold text-sm bg-green-100 px-2 py-1 rounded">{item.growth}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-[#1DA1F2]/10 to-transparent p-8 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-2xl">💬</span>
                                        <h3 className="text-xl font-bold text-slate-900">Social Pulse</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {socialBuzz.map((buzz, i) => (
                                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-bold text-slate-900">{buzz.tag}</span>
                                                    <span className="text-xs font-bold text-slate-400 uppercase">{buzz.platform}</span>
                                                </div>
                                                <p className="text-sm text-slate-500">{buzz.posts} mentions</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Planning Assistant */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-2xl">📅</span>
                                    <h3 className="text-xl font-bold text-slate-900">Smart Planner</h3>
                                </div>
                                <p className="text-slate-500 mb-6">Based on historical data and competitor analysis, here are the best opportunities for your next event.</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                                        <h4 className="font-bold text-green-800 mb-2">Next Weekend Gap</h4>
                                        <p className="text-sm text-green-700">High demand for <span className="font-bold">Family Events</span> on Saturday, 14th Sep. Low competition detected.</p>
                                    </div>
                                    <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                                        <h4 className="font-bold text-purple-800 mb-2">Genre Surge</h4>
                                        <p className="text-sm text-purple-700">Searches for <span className="font-bold">Jazz/Blues</span> have spiked 40% in Kathmandu this week.</p>
                                    </div>
                                    <div className="p-5 bg-orange-50 rounded-xl border border-orange-100">
                                        <h4 className="font-bold text-orange-800 mb-2">Location Tip</h4>
                                        <p className="text-sm text-orange-700">Users in <span className="font-bold">Lalitpur</span> are actively looking for events nearby.</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MarketingCenter;
