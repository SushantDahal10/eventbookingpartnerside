import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PartnerLandingHeader = () => (
    <header className="absolute top-0 left-0 right-0 z-50 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-white text-secondary p-1.5 rounded-lg font-bold font-heading text-xl shadow-lg group-hover:scale-105 transition-transform">NS</div>
                <span className="text-2xl font-heading font-bold text-white tracking-tight drop-shadow-md">
                    Partner<span className="text-primary-light">Hub</span>
                </span>
            </Link>
            <div className="flex gap-4">
                <Link to="/partner/dashboard" className="text-white hover:text-primary font-bold text-sm transition-colors cursor-pointer">Login</Link>
            </div>
        </div>
    </header>
);

const PartnerLanding = () => {
    return (
        <div className="min-h-screen flex flex-col font-body bg-slate-900 text-white overflow-x-hidden">
            <PartnerLandingHeader />

            {/* Hero Section */}
            <div className="relative min-h-screen flex items-center justify-center p-8 text-center text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900"></div>

                <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-[slideUp_0.8s]">
                    <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/10 text-blue-300 border border-blue-400/20 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                        For Event Organizers
                    </span>
                    <h1 className="text-5xl md:text-7xl font-heading font-extrabold leading-tight">
                        Create Experiences. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Manage Everything.</span>
                    </h1>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
                        The all-in-one platform for Nepali event organizers. Sell tickets, manage check-ins, tracking earnings, and grow your audience.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link to="/partner/register" className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full text-lg hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                            Become a Partner
                        </Link>
                        <button className="px-8 py-4 bg-white/10 text-white font-bold rounded-full text-lg backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all">
                            View Demo
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 px-4 bg-slate-900">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Instant Payouts", desc: "Revenue deposited directly to your bank account after every event.", icon: "💰" },
                            { title: "Real-time Analytics", desc: "Monitor ticket sales, revenue, and attendee demographics live.", icon: "📊" },
                            { title: "QR Check-in", desc: "Scan tickets instantly with our partner app. No hardware needed.", icon: "📱" }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all group">
                                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                                <h3 className="text-2xl font-heading font-bold mb-4 text-white">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 px-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                <p>&copy; 2026 NepaliShows. All rights reserved.</p>
            </footer>

        </div>
    );
};

export default PartnerLanding;
