import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const WebScanner = () => {
    const [scanning, setScanning] = useState(true);
    const [lastScanned, setLastScanned] = useState(null);
    const [scanHistory, setScanHistory] = useState([
        { name: 'Sushant D.', ticket: 'GA-2026-88', time: '1 min ago', status: 'Valid' },
        { name: 'Anjali R.', ticket: 'VIP-2026-12', time: '3 mins ago', status: 'Valid' },
        { name: 'Unknown', ticket: 'INV-000-00', time: '5 mins ago', status: 'Invalid' },
    ]);

    // Simulate scanning effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (scanning) {
                // Random mock scan event occasionally
                if (Math.random() > 0.8) {
                    handleMockScan();
                }
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [scanning]);

    const handleMockScan = () => {
        setScanning(false);
        const statuses = ['Valid', 'Valid', 'Valid', 'Duplicate', 'Invalid'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const newScan = {
            name: `Guest #${Math.floor(Math.random() * 1000)}`,
            ticket: `TKT-${Math.floor(Math.random() * 9000) + 1000}`,
            time: 'Just now',
            status: randomStatus
        };

        setLastScanned(newScan);
        setScanHistory(prev => [newScan, ...prev]);

        // Auto-resume scanning after showing result
        setTimeout(() => {
            setScanning(true);
            setLastScanned(null);
        }, 2500);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">

            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-20">
                <Link to="/partner/live/1" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </Link>
                <div className="flex flex-col items-center">
                    <h1 className="font-bold text-lg">Main Gate Scanner</h1>
                    <span className="text-xs text-green-400 font-mono animate-pulse">● CAMERA ACTIVE</span>
                </div>
                <button className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </button>
            </div>

            {/* Viewfinder Area */}
            <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-6">

                {/* Simulated Camera Feed Background */}
                <div className="absolute inset-0 z-0 bg-slate-900">
                    <div className="w-full h-full opacity-20" style={{
                        backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>
                </div>

                {/* Scanner Result Overlay */}
                {lastScanned && (
                    <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 transition-opacity duration-300 ${lastScanned ? 'opacity-100' : 'opacity-0'}`}>
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-2xl scale-110 transition-transform ${lastScanned.status === 'Valid' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}>
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {lastScanned.status === 'Valid' ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                                )}
                            </svg>
                        </div>
                        <h2 className={`text-4xl font-black mb-2 ${lastScanned.status === 'Valid' ? 'text-green-500' : 'text-red-500'}`}>
                            {lastScanned.status.toUpperCase()}
                        </h2>
                        <p className="text-2xl font-bold text-white mb-1">{lastScanned.name}</p>
                        <p className="text-slate-400 font-mono text-lg">{lastScanned.ticket}</p>
                    </div>
                )}

                {/* Viewfinder Box */}
                {!lastScanned && (
                    <div className="relative w-72 h-72 border-2 border-white/30 rounded-3xl z-10 flex items-center justify-center">
                        <div className="absolute inset-0 border-[3px] border-transparent border-t-green-400 border-r-green-400 rounded-tr-3xl w-full h-full"></div>
                        <div className="absolute inset-0 border-[3px] border-transparent border-b-green-400 border-l-green-400 rounded-bl-3xl w-full h-full"></div>

                        {/* Scanning Laser */}
                        <div className="absolute w-full h-1 bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>

                        <p className="text-white/60 font-bold text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur">Align QR Code</p>
                    </div>
                )}

                <div className="mt-8 z-10">
                    <button onClick={handleMockScan} className="px-8 py-3 bg-white text-black font-black rounded-full shadow-xl hover:scale-105 transition-transform active:scale-95">
                        Simulate Scan
                    </button>
                </div>
            </div>

            {/* Recent History Drawer */}
            <div className="bg-slate-900 border-t border-white/10 p-6 rounded-t-3xl h-1/3 z-20">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
                <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">Recent Scans</h3>
                <div className="space-y-4 overflow-y-auto max-h-[150px] pr-2">
                    {scanHistory.map((scan, i) => (
                        <div key={i} className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${scan.status === 'Valid' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div>
                                    <p className="font-bold text-sm text-white">{scan.name}</p>
                                    <p className="text-xs text-slate-500 font-mono">{scan.ticket}</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-600">{scan.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default WebScanner;
