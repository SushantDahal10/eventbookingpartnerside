import React, { useState, useEffect } from 'react';

const PartnerSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        pan: '',
        vat: ''
    });

    const [bank, setBank] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        branch: ''
    });

    // Password state removed as per request


    // State for password removed.

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('partner_token');
            if (!token) {
                // Redirect or handle logout
                window.location.href = '/partner/login';
                return;
            }

            const res = await fetch('http://localhost:5000/api/partners/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile({
                    name: data.organization_name || '',
                    email: data.official_email || '',
                    phone: data.official_phone || '',
                    address: data.full_address || '',
                    city: data.city || '',
                    state: data.state || '',
                    country: data.country || '',
                    pan: data.pan_number || '',
                    vat: data.vat_number || ''
                });

                if (data.bank_name) {
                    setBank({
                        accountName: data.account_holder_name || '',
                        accountNumber: data.account_number || '',
                        bankName: data.bank_name || '',
                        branch: data.bank_branch || ''
                    });
                }
            } else if (res.status === 401 || res.status === 403) {
                // Invalid token
                console.error("Auth Error, redirecting...");
                localStorage.removeItem('partner_token');
                window.location.href = '/partner/login';
            } else {
                console.error("Profile Fetch Failed:", res.status);
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    // Password Change Logic Removed

    // OTP Logic Removed

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

    const ReadOnlyGroup = ({ label, value, isMasked = false }) => (
        <div className="mb-5">
            <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <div className="w-full px-4 py-3 rounded-xl border-2 bg-slate-50 border-slate-200 text-slate-600 font-bold">
                {value || <span className="text-slate-400 italic">Not set</span>}
            </div>
        </div>
    );

    const InfoBanner = ({ email, type }) => (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div>
                <h4 className="font-bold text-blue-900 text-sm">Update Information</h4>
                <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                    To ensure security, these details are read-only. To request changes for your <strong>{type}</strong>, please email support at:
                    <a href={`mailto:${email}`} className="block font-bold mt-1 text-blue-800 hover:underline">{email}</a>
                </p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <h1 className="text-3xl font-heading font-black text-slate-900 mb-2">Account Settings</h1>
            <p className="text-slate-500 font-medium mb-8">Manage your profile updates, security, and payout methods.</p>

            <div className="flex flex-col md:flex-row gap-8">

                {/* Sidebar Tabs */}
                <div className="md:w-64 flex-shrink-0 w-full">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-row md:flex-col overflow-x-auto no-scrollbar md:overflow-visible">
                        {[
                            { id: 'profile', label: 'Company Profile', icon: '🏢' },
                            { id: 'bank', label: 'Payout Settings', icon: '🏦' },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-auto md:w-full text-left px-5 py-4 font-bold text-sm flex items-center gap-3 transition-colors shrink-0 whitespace-nowrap ${activeTab === item.id ? 'bg-slate-50 text-slate-900 border-b-4 md:border-b-0 md:border-l-4 border-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
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
                            <h2 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Company Information</h2>

                            <InfoBanner email="sss@gmail.com" type="Company Details" />

                            <div className="flex items-center gap-6 mb-8">
                                <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center text-4xl border-2 border-white shadow-lg">
                                    🏢
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{profile.name || 'Company Name'}</h3>
                                    <p className="text-slate-500 text-sm">Verified Partner</p>
                                </div>
                            </div>

                            <ReadOnlyGroup label="Company Name" value={profile.name} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyGroup label="Official Email" value={profile.email} />
                                <ReadOnlyGroup label="Contact Phone" value={profile.phone} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyGroup label="Registered Address" value={profile.address} />
                                <ReadOnlyGroup label="City" value={profile.city} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyGroup label="State / Province" value={profile.state} />
                                <ReadOnlyGroup label="Country" value={profile.country} />
                            </div>

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

                            <InfoBanner email="bank@gmail.com" type="Bank Information" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ReadOnlyGroup label="Bank Name" value={bank.bankName} />
                                <ReadOnlyGroup label="Branch Name" value={bank.branch} />
                            </div>
                            <ReadOnlyGroup label="Account Holder Name" value={bank.accountName} />

                            <div className="mb-5">
                                <MaskedDisplay
                                    label="Account Number"
                                    value={bank.accountNumber}
                                    isVisible={visibility.account}
                                    onToggle={() => toggleVisibility('account')}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>



        </div>
    );
};

export default PartnerSettings;
