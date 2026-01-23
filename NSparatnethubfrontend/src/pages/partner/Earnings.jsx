import React, { useState } from 'react';

const Earnings = () => {
    // Mock Data
    const [transactions] = useState([
        { id: "#TRX-9821", date: "Oct 24, 2026", event: "Summer Music Festival", amount: "Rs. 1,50,000", status: "Processed" },
        { id: "#TRX-9820", date: "Oct 20, 2026", event: "Comedy Night", amount: "Rs. 45,000", status: "Pending" },
        { id: "#TRX-9819", date: "Oct 15, 2026", event: "Tech Summit", amount: "Rs. 2,10,000", status: "Processed" },
    ]);

    return (
        <div className="animate-[fadeIn_0.5s]">

            <h1 className="text-3xl font-heading font-extrabold text-slate-900 mb-8">Earnings & Payouts</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-900 text-white rounded-xl p-8 shadow-xl">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Available for Withdrawal</p>
                    <h2 className="text-4xl font-black mb-6">Rs. 3,45,000</h2>
                    <button className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30">
                        Request Withdrawal
                    </button>
                    <p className="text-xs text-center text-slate-400 mt-4">Next automated payout: Nov 1st</p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Clearance</p>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Rs. 45,000</h2>
                    <p className="text-sm text-slate-500 leading-snug">Funds from recent sales are held for 3-5 days before becoming available.</p>
                </div>

                <div className="bg-white rounded-xl p-8 border border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Withdrawn</p>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Rs. 12,80,000</h2>
                    <p className="text-sm text-slate-500 leading-snug">Lifetime earnings paid out to your bank account.</p>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900">Transaction History</h3>
                    <button className="text-sm font-bold text-primary hover:underline">Download CSV</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Event Source</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.map((trx, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm font-bold text-slate-600">{trx.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{trx.date}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{trx.event}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{trx.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${trx.status === 'Processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {trx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Earnings;
