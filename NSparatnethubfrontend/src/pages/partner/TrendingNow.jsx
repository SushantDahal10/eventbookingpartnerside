import React, { useState, useEffect } from 'react';

const TrendingNow = () => {
    const [quote, setQuote] = useState(null);
    const [loadingQuote, setLoadingQuote] = useState(true);

    const [selectedDomain, setSelectedDomain] = useState('All');

    // Mock Safe Data for Nepal with Domains
    // --- DATA POOLS FOR ROTATION ---
    const TRENDING_POOLS = {
        NEPAL: [
            { id: 101, topic: 'Nepal Cricket Team', volume: '250K Searches', trend: 'up', domain: 'Sports' },
            { id: 102, topic: 'Visit Nepal 2026 Campaign', volume: '120K Searches', trend: 'up', domain: 'Travel' },
            { id: 103, topic: 'Kathmandu Weather Updates', volume: '80K Searches', trend: 'stable', domain: 'General' },
            { id: 104, topic: 'Share Market (NEPSE) Bull Run', volume: '1.2M Views', trend: 'down', domain: 'Business' },
            { id: 105, topic: 'New Nepali Movie Releases', volume: '50K Searches', trend: 'up', domain: 'Entertainment' },
            { id: 106, topic: 'Everest Climbing Season', volume: '40K Searches', trend: 'up', domain: 'Travel' },
            { id: 107, topic: 'Cyber Security in Banking', volume: '10K Searches', trend: 'up', domain: 'Technology' },
            { id: 108, topic: 'Traditional Jatra Festivals', volume: '70K Searches', trend: 'stable', domain: 'Art & Culture' },
            { id: 109, topic: 'Sandeep Lamichhane News', volume: '300K Searches', trend: 'up', domain: 'Sports' },
            { id: 110, topic: 'Electric Vehicles (EV) Tax', volume: '25K Searches', trend: 'down', domain: 'Business' },
            { id: 111, topic: 'Nepali Pop Music Trends', volume: '90K Searches', trend: 'up', domain: 'Entertainment' },
            { id: 112, topic: '5G Expansion in Nepal', volume: '15K Searches', trend: 'up', domain: 'Technology' },
            { id: 113, topic: 'Organic Farming Markets', volume: '12K Searches', trend: 'stable', domain: 'Food' },
            { id: 114, topic: 'Startups in Kathmandu', volume: '5K Searches', trend: 'stable', domain: 'Business' }
        ],
        GLOBAL: [
            { id: 201, title: 'AI in Event Management', category: 'Technology' },
            { id: 202, title: 'Sustainable Tourism', category: 'Travel' },
            { id: 203, title: 'Digital Wallets in Nepal', category: 'FinTech' },
            { id: 204, title: 'Virtual Reality Experiences', category: 'Technology' },
            { id: 205, title: 'Global Music Festivals Return', category: 'Entertainment' },
            { id: 206, title: 'Blockchain Ticketing', category: 'Technology' }
        ]
    };

    const [nepalTrends, setNepalTrends] = useState([]);
    const [techTrends, setTechTrends] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const ROTATION_INTERVAL = 6 * 60 * 60 * 1000; // 6 Hours in ms

        const loadTrends = () => {
            const storedData = localStorage.getItem('trending_data');
            const now = Date.now();

            if (storedData) {
                const parsed = JSON.parse(storedData);
                if (now - parsed.timestamp < ROTATION_INTERVAL) {
                    // Load saved data if < 6 hours old
                    setNepalTrends(parsed.nepal);
                    setTechTrends(parsed.global);
                    setLastUpdated(parsed.timestamp);
                    return;
                }
            }

            // Shuffle & Select New Data
            const shuffledNepal = [...TRENDING_POOLS.NEPAL].sort(() => 0.5 - Math.random()).slice(0, 7);
            const shuffledGlobal = [...TRENDING_POOLS.GLOBAL].sort(() => 0.5 - Math.random()).slice(0, 3);

            const newData = {
                timestamp: now,
                nepal: shuffledNepal,
                global: shuffledGlobal
            };

            localStorage.setItem('trending_data', JSON.stringify(newData));
            setNepalTrends(shuffledNepal);
            setTechTrends(shuffledGlobal);
            setLastUpdated(now);
        };

        loadTrends();
    }, []);

    const topCities = [
        { id: 1, name: 'Kathmandu', demand: 'High', topInterest: 'Tech & Music Events' },
        { id: 2, name: 'Pokhara', demand: 'High', topInterest: 'Adventure & Tourism' },
        { id: 3, name: 'Lalitpur', demand: 'Medium', topInterest: 'Art & Culture' },
        { id: 4, name: 'Chitwan', demand: 'Medium', topInterest: 'Wildlife & Food' },
        { id: 5, name: 'Biratnagar', demand: 'Low', topInterest: 'Business Expos' },
        { id: 6, name: 'Butwal', demand: 'Low', topInterest: 'Trade Fairs' },
        { id: 7, name: 'Dharan', demand: 'Medium', topInterest: 'Music Concerts' },
        { id: 8, name: 'Bhaktapur', demand: 'Medium', topInterest: 'Cultural Festivals' },
        { id: 9, name: 'Nepalgunj', demand: 'Low', topInterest: 'Educational Seminars' },
        { id: 10, name: 'Itahari', demand: 'Low', topInterest: 'Community Gatherings' },
    ];

    // Mock Global Trends


    useEffect(() => {
        // Fetch from Safe External API (Quotable)
        const fetchQuote = async () => {
            try {
                const res = await fetch('https://api.quotable.io/random?tags=technology,business,inspirational');
                const data = await res.json();
                setQuote(data);
            } catch (err) {
                console.error("Failed to fetch quote", err);
                // Fallback if API fails
                setQuote({ content: "The best way to predict the future is to create it.", author: "Peter Drucker" });
            } finally {
                setLoadingQuote(false);
            }
        };

        fetchQuote();
    }, []);

    const filteredTrends = selectedDomain === 'All'
        ? nepalTrends
        : nepalTrends.filter(t => t.domain === selectedDomain);

    const domains = ['All', 'Sports', 'Travel', 'Business', 'Entertainment', 'Technology', 'Food', 'General'];

    return (
        <div className="animate-[fadeIn_0.5s]">
            <h1 className="text-3xl font-heading font-extrabold text-slate-900 mb-2">Trending Now</h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-baseline justify-between mb-8">
                <p className="text-slate-500 font-bold">Real-time insights tailored for Nepal.</p>
                {lastUpdated && (
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                        Last Updated: {new Date(lastUpdated).toLocaleTimeString()} (Auto-refresh: 6h)
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* Section 1: Trending in Nepal */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">NP</span>
                                <h2 className="text-lg font-black text-slate-900">Trending in Nepal</h2>
                            </div>
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">LIVE</span>
                        </div>

                        {/* Domain Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {domains.map(domain => (
                                <button
                                    key={domain}
                                    onClick={() => setSelectedDomain(domain)}
                                    className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${selectedDomain === domain
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    {domain}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[400px]">
                        {filteredTrends.length > 0 ? filteredTrends.map((item, index) => (
                            <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-default">
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-300 font-black text-xl w-6">#{index + 1}</span>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <p className="font-bold text-slate-900">{item.topic}</p>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 rounded">{item.domain}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">{item.volume}</p>
                                    </div>
                                </div>
                                <div>
                                    {item.trend === 'up' && <span className="text-green-500 font-bold">↗</span>}
                                    {item.trend === 'down' && <span className="text-red-500 font-bold">↘</span>}
                                    {item.trend === 'stable' && <span className="text-slate-400 font-bold">-</span>}
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-slate-400 font-bold text-sm">
                                No trending topics found for {selectedDomain}.
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 2: Daily Inspiration & Global Tech */}
                <div className="space-y-8">

                    {/* External API Widget */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="text-9xl font-serif">"</span>
                        </div>
                        <h3 className="text-sm font-bold opacity-75 uppercase tracking-widest mb-4">Daily Inspiration</h3>

                        {loadingQuote ? (
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                                <div className="h-4 bg-white/20 rounded w-1/2"></div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xl md:text-2xl font-heading font-bold leading-relaxed mb-4">
                                    "{quote?.content}"
                                </p>
                                <p className="font-medium opacity-80">— {quote?.author}</p>
                            </div>
                        )}
                        <p className="mt-6 text-xs opacity-50">Powered by Quotable API</p>
                    </div>

                    {/* Global Trends */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Global Insights</h3>
                        <div className="space-y-4">
                            {techTrends.map(t => (
                                <div key={t.id} className="flex items-start gap-3">
                                    <div className="bg-slate-100 p-2 rounded-lg">
                                        <span className="text-xl">🌍</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{t.title}</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase">{t.category}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* City Insights Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">City-Wise Event Opportunities</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {topCities.map((city, i) => (
                        <div key={city.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-black text-slate-300 text-lg">0{i + 1}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${city.demand === 'High' ? 'bg-green-100 text-green-700' :
                                    city.demand === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {city.demand} Demand
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">{city.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">Top Interest:</p>
                            <p className="text-xs font-bold text-primary">{city.topInterest}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrendingNow;
