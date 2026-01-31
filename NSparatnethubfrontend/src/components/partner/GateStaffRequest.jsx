import React, { useState, useEffect } from 'react';

const GateStaffRequest = ({ event, isOpen, onClose, onUpdate }) => {
    const [quantity, setQuantity] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Derived state for validation
    const [isCutoffPassed, setIsCutoffPassed] = useState(false);

    useEffect(() => {
        if (isOpen && event) {
            // Reset state
            setQuantity(event.gate_staff_requested_count || 0);
            setSuccess(false);
            setError(null);

            // Check 12-hour cutoff
            // event.event_date should be available from backend. 
            // If MyEvents.jsx only has formatted date, we might have an issue.
            // Assuming event object has the raw 'event_date' or we can parse 'date' + 'time'.
            // Prefer raw 'event_date' if available. 
            // Only 'date' (YYYY-MM-DD?) and 'time' strings might be available if the controller formats them.
            // But let's check validation logic.

            const eventTime = new Date(event.event_date || `${event.date} ${event.time}`);
            const cutoffTime = new Date(eventTime.getTime() - 12 * 60 * 60 * 1000);

            if (Date.now() > cutoffTime.getTime()) {
                setIsCutoffPassed(true);
            } else {
                setIsCutoffPassed(false);
            }
        }
    }, [isOpen, event]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const token = localStorage.getItem('partner_token');
            const response = await fetch('http://localhost:5000/api/gate-staff/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    eventId: event.id,
                    quantity: parseInt(quantity)
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                if (onUpdate) onUpdate(); // Refresh parent list
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                setError(data.error || 'Failed to submit request');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s]">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-[scaleIn_0.2s] relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <h3 className="text-xl font-black text-slate-900 mb-1">Gate Staff Request</h3>
                <p className="text-slate-500 text-sm mb-6">Request security personnel for {event?.title}</p>

                {isCutoffPassed && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <div className="text-sm font-bold">
                            Requests closed. <span className="font-normal block mt-1">Requests must be made at least 12 hours before the event starts.</span>
                        </div>
                    </div>
                )}

                {!isCutoffPassed && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Number of Staff Needed</label>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(0, quantity - 1))}
                                    className="h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold"
                                >-</button>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                    className="h-10 w-20 text-center font-bold text-lg border-b-2 border-slate-200 focus:border-primary outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold"
                                >+</button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Current Status: <span className={`font-bold uppercase ${event?.gate_staff_request_status === 'approved' ? 'text-green-600' :
                                    event?.gate_staff_request_status === 'rejected' ? 'text-red-600' : 'text-orange-500'
                                    }`}>{event?.gate_staff_request_status || 'None'}</span>
                            </p>
                            {event?.gate_staff_request_status === 'approved' && (
                                <p className="text-xs text-slate-400 mt-1">
                                    Approved Staff: <span className="font-bold text-green-600">{event?.gate_staff_approved_count || 0}</span>
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg font-medium">
                                Request submitted successfully!
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="flex-1 py-3 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Confirm Request'}
                            </button>
                        </div>
                    </form>
                )}

                {isCutoffPassed && (
                    <button
                        onClick={onClose}
                        className="w-full py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Close
                    </button>
                )}

            </div>
        </div>
    );
};

export default GateStaffRequest;
