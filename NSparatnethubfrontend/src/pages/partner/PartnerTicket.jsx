import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PartnerTicket = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subject: '',
        category: 'Technical Issue',
        priority: 'Normal',
        description: '',
        attachments: null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock Submit
        alert(`Ticket Created: #${Math.floor(Math.random() * 10000)}\nOur team will respond within 24 hours.`);
        navigate('/partner/help');
    };

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link to="/partner/help" className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500">
                    ←
                </Link>
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-900">Submit a Ticket</h1>
                    <p className="text-slate-500 font-medium">Describe your issue and we'll help you resolve it.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Issue Category</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option>Technical Issue</option>
                            <option>Payment & Billing</option>
                            <option>Account Verification</option>
                            <option>Event Approval</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                        <select
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option>Low</option>
                            <option>Normal</option>
                            <option>High</option>
                            <option>Critical</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                    <input
                        type="text"
                        placeholder="Brief summary of the issue"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea
                        rows="6"
                        placeholder="Please provide detailed information about the problem..."
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 resize-y"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Attachments (Optional)</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <span className="text-2xl mb-2">📎</span>
                            <p className="text-sm text-slate-500 font-bold">Click to upload screenshot or files</p>
                        </div>
                        <input type="file" className="hidden" />
                    </label>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Link to="/partner/help" className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                        Cancel
                    </Link>
                    <button type="submit" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all transform active:scale-95">
                        Submit Ticket
                    </button>
                </div>

            </form>
        </div>
    );
};

export default PartnerTicket;
