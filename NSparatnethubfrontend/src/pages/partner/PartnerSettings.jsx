import React, { useState } from 'react';

const PartnerSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const [profile, setProfile] = useState({
        name: 'Acme Events Pvt. Ltd.',
        email: 'contact@acmeevents.com',
        phone: '+977 9812345678',
        address: 'Thamel, Kathmandu',
        pan: '300123984',
        vat: '601293848'
    });

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const [bank, setBank] = useState({
        accountName: 'Acme Events Pvt. Ltd.',
        accountNumber: '012012****3456',
        bankName: 'Nabil Bank',
        branch: 'Thamel'
    });

    const [password, setPassword] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setIsEditingProfile(false);
        alert('Profile Updated Successfully!');
    };

    const handleSaveBank = (e) => {
        e.preventDefault();
        alert('Bank Discrepancy Verification Initiated. Changes will reflect in 24 hours.');
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (password.new !== password.confirm) {
            alert("Passwords do not match!");
            return;
        }
        setShowOtpModal(true);
    };

    const verifyOtp = () => {
        alert('Password Changed Successfully!');
        setShowOtpModal(false);
        setPassword({ current: '', new: '', confirm: '' });
    };

    // Visibility States
    const [visibility, setVisibility] = useState({
        pan: false,
        vat: false,
        account: false
    });

    const toggleVisibility = (field) => {
        setVisibility(prev => ({ ...prev, [field]: !prev[field] }));
    };

    // UI Helper Components
    const MaskedDisplay = ({ label, value, isVisible, onToggle }) => (
        <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                <span className="font-mono font-bold text-slate-700 text-lg">
                    {isVisible ? value : '•••• •••• ••••'}
                </span>
                <button type="button" onClick={onToggle} className="text-slate-400 hover:text-primary transition-colors">
                    {isVisible ? '🙈' : '👁️'}
                </button>
            </div>
        </div>
    );

    const InputGroup = ({ label, type = "text", value, onChange, placeholder, disabled = false }) => (
        <div className="mb-5">
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <input
                type={type}
                className={`w-full px-4 py-3 rounded-xl border-2 ${disabled ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-white border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'} font-bold text-slate-900 outline-none transition-all`}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-heading font-black text-slate-900 mb-2">Account Settings</h1>
            <p className="text-slate-500 font-medium mb-8">Manage your profile updates, security, and payout methods.</p>

            <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar Tabs */}
                <div className="md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        {[
                            { id: 'profile', label: 'Company Profile', icon: '🏢' },
                            { id: 'security', label: 'Login & Security', icon: '🔒' },
                            { id: 'bank', label: 'Payout Settings', icon: '🏦' },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full text-left px-5 py-4 font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === item.id ? 'bg-slate-50 text-slate-900 border-l-4 border-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8">

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="animate-[fadeIn_0.3s]">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">Company Information</h2>
                                {!isEditingProfile ? (
                                    <button onClick={() => setIsEditingProfile(true)} className="text-primary font-bold text-sm hover:underline">Edit Profile</button>
                                ) : (
                                    <button onClick={() => setIsEditingProfile(false)} className="text-red-500 font-bold text-sm hover:underline">Cancel</button>
                                )}
                            </div>

                            <form onSubmit={handleSaveProfile}>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center text-4xl border-2 border-white shadow-lg relative cursor-pointer hover:opacity-80 transition-opacity group">
                                        🏢
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Change</div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">{profile.name}</h3>
                                        <p className="text-slate-500 text-sm">Partner ID: #88291</p>
                                    </div>
                                </div>

                                <InputGroup label="Company Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} disabled={!isEditingProfile} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Official Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} disabled={!isEditingProfile} />
                                    <InputGroup label="Contact Phone" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!isEditingProfile} />
                                </div>
                                <InputGroup label="Registered Address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} disabled={!isEditingProfile} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <MaskedDisplay
                                        label="PAN Number"
                                        value={profile.pan}
                                        isVisible={visibility.pan}
                                        onToggle={() => toggleVisibility('pan')}
                                    />
                                    <MaskedDisplay
                                        label="VAT Number"
                                        value={profile.vat}
                                        isVisible={visibility.vat}
                                        onToggle={() => toggleVisibility('vat')}
                                    />
                                </div>

                                {isEditingProfile && (
                                    <div className="pt-6 flex justify-end">
                                        <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all transform active:scale-95">
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="animate-[fadeIn_0.3s]">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Login & Security</h2>
                            <form onSubmit={handlePasswordChange} className="max-w-md">
                                <InputGroup label="Current Password" type="password" placeholder="••••••••" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} />
                                <div className="h-4"></div>
                                <InputGroup label="New Password" type="password" placeholder="Minimum 8 characters" value={password.new} onChange={(e) => setPassword({ ...password, new: e.target.value })} />
                                <InputGroup label="Confirm New Password" type="password" placeholder="Retype new password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} />

                                <div className="flex items-center justify-end pt-6">
                                    <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all">
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* BANK TAB */}
                    {activeTab === 'bank' && (
                        <div className="animate-[fadeIn_0.3s]">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">Payout Details</h2>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Verified
                                </span>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
                                <h4 className="font-bold text-yellow-800 text-sm flex items-center gap-2">⚠️ Important</h4>
                                <p className="text-xs text-yellow-700 mt-1 leading-relaxed">
                                    Changing bank details will trigger a 24-hour verification hold. You won't be able to withdraw earnings during this period.
                                </p>
                            </div>

                            <form onSubmit={handleSaveBank}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Bank Name" value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} />
                                    <InputGroup label="Branch Name" value={bank.branch} onChange={(e) => setBank({ ...bank, branch: e.target.value })} />
                                </div>
                                <InputGroup label="Account Holder Name" value={bank.accountName} onChange={(e) => setBank({ ...bank, accountName: e.target.value })} />

                                <div className="mb-5">
                                    <MaskedDisplay
                                        label="Account Number"
                                        value={bank.accountNumber}
                                        isVisible={visibility.account}
                                        onToggle={() => toggleVisibility('account')}
                                    />
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">
                                        Request Change
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
                {/* OTP Modal */}
                {showOtpModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-[scaleIn_0.2s_ease-out]">
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Verify Identity</h3>
                            <p className="text-slate-500 text-sm mb-6">Enter the 6-digit code sent to your registered email to confirm password change.</p>

                            <div className="flex gap-2 justify-center mb-6">
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
                                            // Auto-focus next input logic could go here
                                        }}
                                    />
                                ))}
                            </div>

                            <button onClick={verifyOtp} className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-all">
                                Verify & Update
                            </button>
                            <button onClick={() => setShowOtpModal(false)} className="w-full mt-3 py-2 text-slate-500 font-bold text-sm hover:text-slate-900">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartnerSettings;
