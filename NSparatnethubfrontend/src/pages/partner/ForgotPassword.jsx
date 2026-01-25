import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState({ new: '', confirm: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setStep(2);
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to send code');
            }
        } catch (error) {
            alert('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const code = otp.join('');
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: code, type: 'recovery' }) // type='recovery' ensures backend handles it as PW reset
            });

            if (response.ok) {
                // Backend returns session and sets cookie
                setStep(3);
            } else {
                const data = await response.json();
                alert(data.error || 'Invalid Code');
            }
        } catch (error) {
            alert('Verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (password.new !== password.confirm) {
            alert("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password.new })
            });

            if (response.ok) {
                alert("Password reset successfully! Login with new credentials.");
                navigate('/partner/login');
            } else {
                const data = await response.json();
                alert(data.error || 'Update failed');
            }
        } catch (error) {
            alert('Failed to update password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <Link to="/" className="text-2xl font-heading font-black text-slate-900">
                            <span className="text-primary">NS</span> Partner
                        </Link>
                        <h2 className="text-xl font-bold text-slate-900 mt-4">
                            {step === 1 ? 'Reset Password' : step === 2 ? 'Verify Email' : 'New Password'}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            {step === 1 ? 'Enter your email to receive a recovery code.' :
                                step === 2 ? `We sent a code to ${email}` :
                                    'Secure your account with a strong password.'}
                        </p>
                    </div>

                    {/* STEP 1: EMAIL */}
                    {step === 1 && (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button disabled={isLoading} className="w-full py-4 bg-primary text-white font-black rounded-xl text-lg shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50">
                                {isLoading ? 'Sending...' : 'Send Code'}
                            </button>
                            <div className="text-center">
                                <Link to="/partner/login" className="text-sm font-bold text-slate-500 hover:text-slate-900">Back to Login</Link>
                            </div>
                        </form>
                    )}

                    {/* STEP 2: OTP */}
                    {step === 2 && (
                        <form onSubmit={handleOtpSubmit} className="space-y-6">
                            <div className="flex gap-2 justify-center">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        className="w-12 h-14 rounded-lg border-2 border-slate-200 text-center text-2xl font-black text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                        value={digit}
                                        onChange={(e) => {
                                            const newOtp = [...otp];
                                            newOtp[index] = e.target.value;
                                            setOtp(newOtp);
                                        }}
                                    />
                                ))}
                            </div>
                            <button disabled={isLoading} className="w-full py-4 bg-primary text-white font-black rounded-xl text-lg shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50">
                                {isLoading ? 'Verifying...' : 'Verify Code'}
                            </button>
                            <div className="text-center">
                                <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-slate-500 hover:text-slate-900">Wrong Email?</button>
                            </div>
                        </form>
                    )}

                    {/* STEP 3: NEW PASSWORD */}
                    {step === 3 && (
                        <form onSubmit={handlePasswordReset} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">New Password</label>
                                <input
                                    type="password"
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900"
                                    value={password.new}
                                    onChange={(e) => setPassword({ ...password, new: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900"
                                    value={password.confirm}
                                    onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                                    required
                                />
                            </div>
                            <button disabled={isLoading} className="w-full py-4 bg-slate-900 text-white font-black rounded-xl text-lg shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50">
                                {isLoading ? 'Updating...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
