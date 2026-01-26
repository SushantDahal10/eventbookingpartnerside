import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentGateway = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Default to some mock data if accessed directly
    const { eventName, pkgName, price } = location.state || {
        eventName: 'Summer Music Festival',
        pkgName: 'Homepage Hero',
        price: '5,000'
    };

    const [selectedMethod, setSelectedMethod] = useState('esewa');
    const [processing, setProcessing] = useState(false);

    const handlePayment = () => {
        setProcessing(true);
        // Mock API call simulation
        setTimeout(() => {
            setProcessing(false);
            alert(`Payment Successful via ${selectedMethod.toUpperCase()}!\nTransaction ID: TXN-${Math.floor(Math.random() * 1000000)}`);
            navigate('/partner/dashboard'); // Redirect to dashboard since marketing is disabled
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-body flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

                {/* Order Summary */}
                <div className="md:w-1/3 bg-slate-900 p-8 text-white flex flex-col justify-between">
                    <div>
                        <div className="font-heading font-black text-2xl mb-1 flex items-center gap-2">
                            <span className="bg-white text-slate-900 px-2 py-0.5 rounded-lg text-lg">NS</span>
                            Pay
                        </div>
                        <p className="text-slate-400 text-sm mb-8">Secure Payment Gateway</p>

                        <div className="space-y-6">
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Item</p>
                                <p className="font-bold text-lg">{pkgName}</p>
                                <p className="text-sm text-slate-400">Event Boost (24h)</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Target Event</p>
                                <p className="font-bold">{eventName}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-700">
                        <div className="flex justify-between items-end">
                            <span className="text-slate-400 font-bold">Total</span>
                            <span className="text-3xl font-black">Rs. {price}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="md:w-2/3 p-8 lg:p-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Select Payment Method</h2>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {[
                            { id: 'esewa', name: 'eSewa', color: 'bg-green-500' },
                            { id: 'khalti', name: 'Khalti', color: 'bg-purple-600' },
                            { id: 'ips', name: 'ConnectIPS', color: 'bg-blue-600' },
                            { id: 'card', name: 'Card', color: 'bg-slate-700' },
                        ].map(method => (
                            <div
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`cursor-pointer rounded-xl p-4 border-2 flex items-center gap-3 transition-all ${selectedMethod === method.id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className={`w-4 h-4 rounded-full border-2 ${selectedMethod === method.id ? 'border-primary bg-primary' : 'border-slate-300'}`}></div>
                                <span className={`font-bold ${selectedMethod === method.id ? 'text-slate-900' : 'text-slate-500'}`}>{method.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Dynamic Form based on method would go here, simplified for mock */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
                        <p className="text-sm text-slate-500 font-medium mb-4">You will be redirected to {selectedMethod === 'card' ? 'secure card gateway' : `${selectedMethod} login`} to complete payment.</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                            <span>🔒</span> 256-bit SSL Secured
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePayment}
                            className="flex-[2] py-4 bg-primary text-white font-black rounded-xl text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                    Processing...
                                </>
                            ) : (
                                `Pay Rs. ${price}`
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PaymentGateway;
