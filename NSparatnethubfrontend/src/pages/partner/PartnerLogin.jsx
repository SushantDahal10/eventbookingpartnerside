import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PartnerLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await response.json();

            if (response.ok) {
                if (data.requirePasswordChange) {
                    navigate('/partner/change-password', { state: { email: data.email } });
                    return;
                }

                // Cookie is set by backend.
                // Store minimal user info if needed
                localStorage.setItem('partner_user', JSON.stringify(data.user));
                navigate('/partner/dashboard');
            } else {
                alert(data.message || data.error || 'Login failed');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-body">

            {/* Header */}
            <header className="h-20 flex items-center justify-between px-6 lg:px-12 border-b border-gray-100">
                <div className="text-2xl font-heading font-black tracking-tight">
                    <span className="text-primary">NS</span> Partner
                </div>
                <Link to="/" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                    Back to Main Site
                </Link>
            </header>

            <div className="flex-1 flex flex-col md:flex-row">

                {/* Left: Login Form */}
                <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
                    <div className="max-w-md w-full">
                        <h1 className="text-4xl font-heading font-black text-slate-900 mb-2">Welcome Back.</h1>
                        <p className="text-lg text-slate-500 mb-8 font-medium">Log in to manage your events.</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900"
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-900">Password</label>
                                    <Link to="/partner/forgot-password" className="text-xs font-bold text-primary hover:underline">Forgot Password?</Link>
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-slate-900"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                />
                            </div>

                            <button disabled={isLoading} type="submit" className="w-full py-4 bg-primary text-white font-black rounded-xl text-lg shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? 'Logging In...' : 'Log In'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm font-bold text-slate-500">
                            Don't have an account? <Link to="/partner/register" className="text-primary hover:underline">Register Here</Link>
                        </p>
                    </div>
                </div>

                {/* Right: Visual */}
                <div className="hidden md:block w-1/2 bg-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-purple-900/40 mix-blend-overlay z-10"></div>
                    <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Concert Crowd" />

                    <div className="absolute bottom-16 left-16 right-16 z-20 text-white">
                        <blockquote className="text-2xl font-black font-heading leading-tight mb-4">
                            "NS Partner Hub transformed how we manage our gigs. It's simply the best tool out there."
                        </blockquote>
                        <p className="font-bold opacity-80">— Sarah Jenkins, Event Director</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PartnerLogin;
