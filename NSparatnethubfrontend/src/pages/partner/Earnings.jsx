import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Earnings = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalWithdrawn: 0,
        availableBalance: 0,
        events: []
    });
    const [payouts, setPayouts] = useState([]);

    // Modal State
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [step, setStep] = useState(1); // 1: Select/Pass, 2: OTP
    const [withdrawalData, setWithdrawalData] = useState({
        eventId: '',
        amount: '',
        password: '',
        otp: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // History & Filter State
    const [historyFilters, setHistoryFilters] = useState({
        eventId: 'all',
        period: 'all', // all, 6m, 3m, 1m, 1w
        startDate: '',
        endDate: ''
    });

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('partner_token');
            const { eventId, startDate, endDate } = historyFilters;
            const params = new URLSearchParams();
            if (eventId && eventId !== 'all') params.append('event_id', eventId);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const res = await fetch(`http://localhost:5000/api/partners/payouts/history?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setPayouts(await res.json());
        } catch (err) {
            console.error("History fetch error:", err);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [historyFilters]);

    const handleFilterChange = (key, value) => {
        let newFilters = { ...historyFilters, [key]: value };

        // Auto-set dates based on period
        if (key === 'period') {
            const now = new Date();
            const end = now.toISOString().split('T')[0];
            let start = '';

            if (value === '1w') now.setDate(now.getDate() - 7);
            if (value === '1m') now.setMonth(now.getMonth() - 1);
            if (value === '3m') now.setMonth(now.getMonth() - 3);
            if (value === '6m') now.setMonth(now.getMonth() - 6);

            if (value !== 'all') start = now.toISOString().split('T')[0];

            newFilters = { ...newFilters, startDate: start, endDate: end };
        }
        setHistoryFilters(newFilters);
    };

    const [statusFilter, setStatusFilter] = useState('paid'); // paid, pending, all

    const downloadPDF = () => {
        const doc = new jsPDF();

        // --- HEADER ---
        doc.setFillColor(15, 23, 42); // Slate-900
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("NS Partner Hub", 14, 20);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text("Withdrawal Statement", 14, 30);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 20, { align: 'right' });
        doc.text(`Status: ${statusFilter.toUpperCase()}`, 150, 30, { align: 'right' });

        // --- CONTENT ---
        const tableColumn = ["Date", "Event Name", "Amount (NPR)", "Status"];
        const tableRows = [];

        // Dynamic Filtering for PDF
        const filteredPayouts = payouts.filter(p => {
            if (statusFilter === 'all') return true;
            return p.status === statusFilter;
        });

        filteredPayouts.forEach(p => {
            const payoutDate = new Date(p.requested_at).toLocaleDateString();
            const eventTitle = p.events?.title || 'Unknown Event';
            // Clean amount string for PDF
            const amount = parseFloat(p.amount).toLocaleString('en-NP', { minimumFractionDigits: 2 });
            const status = p.status.toUpperCase();
            tableRows.push([payoutDate, eventTitle, amount, status]);
        });

        if (filteredPayouts.length === 0) {
            tableRows.push(['-', 'No records found for selected status', '-', '-']);
        } else {
            // Calculate Total Paid for PDF
            const totalPaid = filteredPayouts
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + parseFloat(p.amount), 0);

            tableRows.push(['', '', 'Total Paid:', formatCurrency(totalPaid)]);
        }

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 4 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                2: { halign: 'right' }, // Amount
                3: { halign: 'center' } // Status
            },
            didParseCell: function (data) {
                // Style the Total row
                if (data.row.index === tableRows.length - 1 && data.row.raw[2] === 'Total Paid:') {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [240, 253, 244]; // Green-50
                    if (data.column.index === 3) {
                        data.cell.styles.textColor = [22, 163, 74]; // Green-600
                    }
                }
            }
        });

        // --- FOOTER ---
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
            doc.text("NS Partner Hub | Contact: support@nspartnerhub.com | www.nspartnerhub.com", 14, 285);
        }

        doc.save(`withdrawal_report_${statusFilter}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('partner_token');
                if (!token) return;

                // 1. Fetch Earnings (Event Breakdown)
                const resEarnings = await fetch('http://localhost:5000/api/partners/earnings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resEarnings.ok) {
                    const data = await resEarnings.json();
                    setStats(data);
                    // Default to first event if available
                    if (data.events.length > 0) {
                        setWithdrawalData(prev => ({ ...prev, eventId: data.events[0].eventId }));
                    }
                }

                // 2. Fetch Payout History
                const resPayouts = await fetch('http://localhost:5000/api/partners/payouts/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resPayouts.ok) setPayouts(await resPayouts.json());

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        setWithdrawalData({ ...withdrawalData, [e.target.name]: e.target.value });
    };

    // Step 1: Initiate (Send OTP)
    const handleInitiate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('partner_token');
            const res = await fetch('http://localhost:5000/api/partners/payouts/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(withdrawalData.amount),
                    password: withdrawalData.password,
                    event_id: withdrawalData.eventId
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to initiate');

            // Success, move to OTP step
            setStep(2);

        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Step 2: Confirm (Verify OTP)
    const handleConfirm = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('partner_token');
            const res = await fetch('http://localhost:5000/api/partners/payouts/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ otp: withdrawalData.otp })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to confirm');

            alert('Withdrawal Request Submitted Successfully!');
            window.location.reload();

        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };


    // Helper: Get max withdrawable for selected event
    const getSelectedEventBalance = () => {
        // Fix: String comparison for safety
        const ev = stats.events.find(e => String(e.eventId) === String(withdrawalData.eventId));
        return ev ? ev.balance : 0;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    // Auto-fill bank details, ensuring defaults
    useEffect(() => {
        if (showWithdrawModal && stats.bankDetails) {
            setWithdrawalData(prev => ({
                ...prev,
                bankName: stats.bankDetails.bankName || '',
                accountNumber: stats.bankDetails.accountNumber || '',
                accountHolder: stats.bankDetails.accountHolder || ''
            }));
        }
    }, [showWithdrawModal, stats.bankDetails]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="animate-[fadeIn_0.5s] p-6 lg:p-10 pb-20 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-black text-slate-900 mb-2">Earnings & Payouts</h1>
                    <p className="text-slate-500 font-medium">Track your revenue, platform fees, and manage withdrawals.</p>
                </div>
                <button
                    onClick={() => { setShowWithdrawModal(true); setStep(1); }}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all transform hover:-translate-y-1 flex items-center gap-2"
                >
                    <span>💸</span> Request Withdrawal
                </button>
            </div>

            {/* FINANCIAL BREAKDOWN CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* 1. Gross Sales */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Total Gross Sales</p>
                    <h3 className="text-3xl font-black text-slate-900">
                        {formatCurrency(stats.totalGross || 0)}
                    </h3>
                </div>

                {/* 2. Platform Fees */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Partner Fees (5%)</p>
                    <h3 className="text-3xl font-black text-red-500">
                        - {formatCurrency(stats.totalCommission || 0)}
                    </h3>
                </div>

                {/* 3. Net Earnings */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <p className="text-xs font-bold uppercase text-green-600 mb-2 tracking-wider">Net Earnings</p>
                    <h3 className="text-3xl font-black text-green-600">
                        {formatCurrency(stats.totalRevenue || 0)}
                    </h3>
                    <p className="text-xs font-bold text-slate-300 mt-1">After 5% Deduction</p>
                </div>

                {/* 4. Available for Withdrawal */}
                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl relative overflow-hidden group text-white">
                    <div className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                    <p className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Available for Payout</p>
                    <h3 className="text-4xl font-black text-white">
                        {formatCurrency(stats.availableBalance || 0)}
                    </h3>
                </div>
            </div>

            {/* EVENT BREAKDOWN TABLE */}
            <div className="bg-white rounded-xl border border-slate-200 mb-10 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Event-Wise Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                            <tr>
                                <th className="px-6 py-4">Event Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Gross Sales</th>
                                <th className="px-6 py-4 text-right">Partner Fees (5%)</th>
                                <th className="px-6 py-4 text-right">Net Revenue</th>
                                <th className="px-6 py-4 text-right">Withdrawn</th>
                                <th className="px-6 py-4 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.events.map(ev => (
                                <tr key={ev.eventId}>
                                    <td className="px-6 py-4 font-bold text-slate-900">{ev.title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${ev.status?.toLowerCase() === 'completed' || ev.status?.toLowerCase() === 'ended'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {ev.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-500">
                                        {formatCurrency(ev.gross || 0)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-orange-600">
                                        -{formatCurrency(ev.commission || 0)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-green-700">
                                        {formatCurrency(ev.revenue)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-red-600">
                                        {formatCurrency(ev.withdrawn)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-slate-900">
                                        {formatCurrency(ev.balance)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* WITHDRAWAL HISTORY & FILTERS */}
            <div className="bg-white rounded-xl border border-slate-200 mb-10">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Withdrawal History</h3>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold outline-none cursor-pointer hover:bg-slate-50"
                        >
                            <option value="paid">Paid Only</option>
                            <option value="pending">Pending Only</option>
                            <option value="rejected">Rejected Only</option>
                            <option value="all">All Statuses</option>
                        </select>
                        <button
                            onClick={downloadPDF}
                            className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-900/10"
                        >
                            <span>⬇</span> Export PDF
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-6 bg-slate-50 flex flex-col md:flex-row gap-4 flex-wrap">
                    <select
                        value={historyFilters.eventId}
                        onChange={(e) => handleFilterChange('eventId', e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm outline-none"
                    >
                        <option value="all">All Events</option>
                        {stats.events.map(ev => (
                            <option key={ev.eventId} value={ev.eventId}>{ev.title}</option>
                        ))}
                    </select>

                    <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden">
                        {['all', '6m', '3m', '1m', '1w'].map(period => (
                            <button
                                key={period}
                                onClick={() => handleFilterChange('period', period)}
                                className={`px-4 py-2 text-sm font-bold capitalize transition-colors ${historyFilters.period === period
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {period === 'all' ? 'All Time' : period}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 items-center">
                        <input
                            type="date"
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold outline-none"
                            value={historyFilters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                        <span className="text-slate-400 font-bold">-</span>
                        <input
                            type="date"
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold outline-none"
                            value={historyFilters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(() => {
                                const filteredTableData = payouts.filter(p => {
                                    if (statusFilter === 'all') return true;
                                    return p.status === statusFilter;
                                });

                                if (filteredTableData.length > 0) {
                                    return filteredTableData.map(p => (
                                        <tr key={p.id}>
                                            <td className="px-6 py-4 font-bold text-slate-700">
                                                {new Date(p.requested_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-600">
                                                {p.events?.title || 'Unknown Event'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900">
                                                {formatCurrency(p.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${p.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ));
                                } else {
                                    return (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-slate-500 font-bold">
                                                No withdrawal history found for selected status.
                                            </td>
                                        </tr>
                                    );
                                }
                            })()}
                        </tbody>
                        {payouts.length > 0 && (
                            <tfoot className="bg-slate-50 border-t-2 border-slate-100">
                                <tr>
                                    <td colSpan="2" className="px-6 py-4 font-bold text-right text-slate-500 uppercase tracking-wide text-xs">
                                        Total Paid (Current Filters):
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-green-600 text-lg">
                                        {formatCurrency(
                                            payouts
                                                .filter(p => p.status === 'paid')
                                                .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                                        )}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div >

            {/* WITHDRAWAL MODAL */}
            {
                showWithdrawModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-[fadeIn_0.3s]">
                            <h3 className="text-2xl font-black text-slate-900 mb-2">
                                {step === 1 ? 'Request Withdrawal' : 'Verify OTP'}
                            </h3>

                            {step === 1 ? (
                                <form onSubmit={handleInitiate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Select Event</label>
                                        <select
                                            name="eventId"
                                            value={withdrawalData.eventId}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 font-bold outline-none"
                                        >
                                            {stats.events.map(ev => (
                                                <option key={ev.eventId} value={ev.eventId}>
                                                    {ev.title}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Selected Event Details */}
                                        {withdrawalData.eventId && (
                                            <div className="mt-3 bg-slate-50 p-3 rounded-lg text-sm">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-slate-500">Total Revenue:</span>
                                                    <span className="font-bold text-slate-700">
                                                        {formatCurrency(stats.events.find(e => String(e.eventId) === String(withdrawalData.eventId))?.revenue || 0)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-500">Status:</span>
                                                    {(() => {
                                                        const ev = stats.events.find(e => String(e.eventId) === String(withdrawalData.eventId));
                                                        return (
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ev?.status?.toLowerCase() === 'completed' || ev?.status?.toLowerCase() === 'ended'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                {ev?.status || '-'}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                                <div className="flex justify-between mt-1">
                                                    <span className="text-slate-500">Available to Withdraw:</span>
                                                    <span className="font-bold text-green-600">
                                                        {formatCurrency(getSelectedEventBalance())}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Amount</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="amount"
                                                required
                                                max={getSelectedEventBalance()}
                                                min="1000"
                                                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 font-bold text-lg outline-none pr-24"
                                                value={withdrawalData.amount}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setWithdrawalData(prev => ({ ...prev, amount: getSelectedEventBalance() }))}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-md hover:bg-slate-200 text-slate-600"
                                            >
                                                MAX
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 font-bold outline-none"
                                            value={withdrawalData.password}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setShowWithdrawModal(false)} className="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                                        <button type="submit" disabled={submitting} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50">
                                            {submitting ? 'Processing...' : 'Next →'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleConfirm} className="space-y-6">
                                    <p className="text-sm text-slate-500">
                                        We sent a verification code to your email. Please enter it below to confirm withdrawal of
                                        <span className="font-bold text-slate-900"> {formatCurrency(withdrawalData.amount)}</span>.
                                    </p>

                                    <input
                                        type="text"
                                        name="otp"
                                        required
                                        placeholder="Enter 6-digit code"
                                        className="w-full px-4 py-4 rounded-lg border-2 border-slate-200 font-black text-center text-2xl tracking-widest outline-none focus:border-slate-900"
                                        value={withdrawalData.otp}
                                        onChange={handleChange}
                                    />

                                    <button type="submit" disabled={submitting} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50">
                                        {submitting ? 'Verifying...' : 'Confirm Withdrawal'}
                                    </button>
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleInitiate}
                                            disabled={submitting}
                                            className="text-sm font-bold text-slate-500 hover:text-slate-900 underline disabled:opacity-50"
                                        >
                                            Resend Code
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Earnings;
