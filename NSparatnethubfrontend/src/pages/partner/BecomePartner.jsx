import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Dedicated Simple Header for Partner Landing
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
                <button className="text-white hover:text-primary font-bold text-sm transition-colors cursor-pointer">Login</button>
            </div>
        </div>
    </header>
);

const BecomePartner = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        orgName: '',
        contactPerson: '',
        email: '',
        phone: '',
        eventType: 'Music & Concerts',
        eventFrequency: 'Monthly',
        audienceSize: '500-2000',
        pricingModel: 'Commission (5% per ticket)',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Welcome to PartnerHub! Setting up your dashboard...");
        navigate('/partner/dashboard');
    };

    return (
        <div className="min-h-screen flex flex-col font-body bg-slate-900 overflow-x-hidden">
            <PartnerLandingHeader />

            {/* Split Layout: Hero & Form */}
            <div className="flex flex-col lg:flex-row min-h-screen">

                {/* Left Side: Value Proposition */}
                <div className="lg:w-5/12 relative flex flex-col justify-center p-8 md:p-16 lg:p-20 text-white">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1600')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/50"></div>

                    <div className="relative z-10 space-y-8 animate-[slideRight_0.6s]">
                        <div>
                            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">Organizer Portal</span>
                            <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight mb-6">
                                Powering Nepal's <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Best Events.</span>
                            </h1>
                            <p className="text-lg text-slate-300 leading-relaxed max-w-md">
                                From concerts in Kathmandu to workshops in Pokhara, NepaliShows PartnerHub gives you the tools to sell tickets, manage crowds, and grow your brand.
                            </p>
                        </div>

                        <div className="space-y-4 pt-4">
                            {[
                                { title: "Instant Payouts", desc: "Get revenue deposited directly to your bank." },
                                { title: "Real-time Analytics", desc: "Track sales and check-ins as they happen." },
                                { title: "100% Control", desc: "Manage pricing, seats, and guest lists instantly." }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                                    <div>
                                        <h4 className="font-bold text-white">{feature.title}</h4>
                                        <p className="text-sm text-slate-400">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Registration Form */}
                <div className="lg:w-7/12 bg-white flex flex-col justify-center px-4 py-20 md:p-16 lg:p-24 overflow-y-auto">
                    <div className="max-w-xl mx-auto w-full animate-[fadeIn_0.8s]">
                        <div className="mb-10">
                            <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">Create Partner Account</h2>
                            <p className="text-slate-500">Join 500+ top organizers in Nepal today.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Organization Name</label>
                                    <input
                                        type="text"
                                        name="orgName"
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={formData.orgName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Contact Person</label>
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Official Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Primary Event Type</label>
                                <select
                                    name="eventType"
                                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    value={formData.eventType}
                                    onChange={handleChange}
                                >
                                    <option>Music & Concerts</option>
                                    <option>Nightlife & Clubbing</option>
                                    <option>Arts & Theater</option>
                                    <option>Sports & Fitness</option>
                                    <option>Conferences</option>
                                </select>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" required className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-600">
                                        I agree to the <a href="#" className="font-bold text-blue-600 hover:underline">Partner Service Agreement</a> and understand that my account is subject to verification.
                                    </span>
                                </label>
                            </div>

                            <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl text-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 transform hover:-translate-y-1 cursor-pointer">
                                Get Started
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BecomePartner;
