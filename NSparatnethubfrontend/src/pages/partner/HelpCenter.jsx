import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { icon: '🚀', title: 'Getting Started', desc: 'Account setup, first event, and basics' },
        { icon: '💰', title: 'Payments & Payouts', desc: 'Bank details, earnings, and withdrawal cycles' },
        { icon: '🎟️', title: 'Ticketing', desc: 'Ticket types, pricing strategies, and promos' },
        { icon: '📱', title: 'Scanner App', desc: 'Using the entry manager and troubleshooting' },
        { icon: '📊', title: 'Analytics', desc: 'Understanding your dashboard and reports' },
        { icon: '🛡️', title: 'Trust & Safety', desc: 'Guidelines, cancellations, and refunds' },
    ];

    const faqs = [
        { question: "How long does it take to get approved?", answer: "Most accounts are verified within 24 hours. You'll receive an email notification once your partner status is active." },
        { question: "When do I get paid?", answer: "Payouts are processed every Wednesday for events completed in the previous week. Funds usually hit your bank by Friday." },
        { question: "Can I edit an event after publishing?", answer: "Yes! You can edit details like description and images anytime. However, critical details like Date/Time cannot be changed if tickets have already been sold." },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-body pb-20">

            {/* Hero Search Section */}
            <div className="bg-[#111827] text-white pt-20 pb-32 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-heading font-black mb-6">How can we help you?</h1>

                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white text-slate-900 font-bold text-lg shadow-2xl focus:ring-4 focus:ring-primary/50 outline-none"
                            placeholder="Validating tickets, Changing bank info..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl text-slate-400">🔍</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {categories.map((cat, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{cat.icon}</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{cat.title}</h3>
                            <p className="text-slate-500 font-medium">{cat.desc}</p>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-heading font-black text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-3">{faq.question}</h3>
                                <p className="text-slate-600 leading-relaxed font-medium">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-20 bg-primary rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-heading font-black mb-4">Still need support?</h2>
                        <p className="text-blue-100 font-bold text-lg mb-8 max-w-xl mx-auto">Our specialized partner support team is available 10AM - 8PM to assist you with any critical issues.</p>
                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            <Link to="/partner/chat" className="bg-white text-primary px-8 py-3 rounded-xl font-black shadow-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                <span>💬</span> Chat with Support
                            </Link>
                            <Link to="/partner/ticket" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-lg border border-blue-400 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                                <span>🎫</span> Submit a Ticket
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HelpCenter;
