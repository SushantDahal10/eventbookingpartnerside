import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PartnerRegistration = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        orgName: '',
        email: '',

        // Phone separate fields
        phoneCode: '+977',
        phoneNumber: '',

        // Address separate fields
        country: 'Nepal',
        state: '',
        city: '',
        fullAddress: '',

        // Legal / PAN
        panName: '',
        panNumber: '',
        vatNumber: '', // Optional

        // Bank
        bankName: '',
        branch: '',
        accountName: '',
        accountNumber: '',

        // Backup Contact
        backupName: '',
        backupPhoneCode: '+977',
        backupPhoneNumber: '',
        backupEmail: '',

        acceptedTerms: false
    });

    const [files, setFiles] = useState({
        panPhoto: null,
        vatPhoto: null
    });

    const [filePreviews, setFilePreviews] = useState({
        panPhoto: null,
        vatPhoto: null
    });

    // Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files: uploadedFiles } = e.target;
        if (uploadedFiles && uploadedFiles[0]) {
            const file = uploadedFiles[0];
            setFiles(prev => ({
                ...prev,
                [name]: file
            }));
            // Create preview URL
            setFilePreviews(prev => ({
                ...prev,
                [name]: URL.createObjectURL(file)
            }));
        }
    };

    const handleRemoveFile = (name) => {
        setFiles(prev => ({ ...prev, [name]: null }));
        setFilePreviews(prev => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: Phone 10 digits
        if (formData.phoneNumber.length !== 10) {
            alert("Authorized Phone Number must be exactly 10 digits.");
            return;
        }

        // Validation: Backup Phone if provided
        if (formData.backupPhoneNumber && formData.backupPhoneNumber.length !== 10) {
            alert("Backup Phone Number must be exactly 10 digits.");
            return;
        }

        if (!formData.acceptedTerms) {
            alert("Please accept the terms and conditions.");
            return;
        }

        setIsLoading(true);

        const submitData = new FormData();
        // Basic Info
        submitData.append('orgName', formData.orgName);
        submitData.append('email', formData.email);

        // Combine Phone
        submitData.append('phone', `${formData.phoneCode}-${formData.phoneNumber}`);

        // Address
        submitData.append('country', formData.country);
        submitData.append('state', formData.state);
        submitData.append('city', formData.city);
        submitData.append('fullAddress', formData.fullAddress);

        // Legal
        submitData.append('panName', formData.panName);
        submitData.append('panNumber', formData.panNumber);
        if (formData.vatNumber) submitData.append('vatNumber', formData.vatNumber);

        // Bank
        submitData.append('bankName', formData.bankName);
        submitData.append('branch', formData.branch);
        submitData.append('accountName', formData.accountName);
        submitData.append('accountNumber', formData.accountNumber);

        // Backup
        if (formData.backupName) submitData.append('backupName', formData.backupName);
        if (formData.backupPhoneNumber) submitData.append('backupPhone', `${formData.backupPhoneCode}-${formData.backupPhoneNumber}`);
        if (formData.backupEmail) submitData.append('backupEmail', formData.backupEmail);

        submitData.append('acceptedTerms', formData.acceptedTerms);

        // Files
        if (files.panPhoto) submitData.append('panPhoto', files.panPhoto);
        if (files.vatPhoto) submitData.append('vatPhoto', files.vatPhoto);

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                body: submitData
            });

            const data = await response.json();

            if (response.ok) {
                alert("Application submitted successfully! It may take up to 24 hours to verify. After verification, a password setup link will be sent to your email. After that, you may login with your registered email and the new password.");
                navigate('/partner/login');
            } else {
                alert(data.error || 'Registration failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Styles
    // Styles - Darker border for better visibility
    const inputClasses = "w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400";
    const labelClasses = "block text-sm font-bold text-slate-700 mb-2";

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white relative">

            {/* Agreement Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] animate-[slideUp_0.3s]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-heading font-black text-slate-900">Partner Service Agreement</h3>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors">✕</button>
                        </div>
                        <div className="p-8 overflow-y-auto prose prose-slate">
                            <h4>1. Introduction</h4>
                            <p>This agreement matches you with the best ticketing platform in Nepal.</p>
                            <h4>2. Payments & Fees</h4>
                            <p>We charge a standard commission rate on ticket sales. Payouts are processed weekly.</p>
                            <h4>3. Code of Conduct</h4>
                            <p>Events must comply with local laws and regulations. No fraudulent activities.</p>
                            <h4>4. Termination</h4>
                            <p>We reserve the right to suspend accounts violating these terms.</p>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-slate-50 rounded-b-2xl flex justify-end">
                            <button onClick={() => { setFormData(prev => ({ ...prev, acceptedTerms: true })); setShowModal(false); }} className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors">
                                I Agree
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Left: Info / Visual */}
            <div className="lg:w-4/12 bg-slate-900 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
                <div className="relative z-10">
                    <Link to="/" className="inline-flex items-center gap-2 mb-12">
                        <span className="text-2xl font-heading font-black">NS Partner</span>
                    </Link>
                    <h1 className="text-4xl lg:text-5xl font-heading font-black leading-tight mb-6">
                        Join Nepal's Premium Event Network.
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        Get access to thousands of ticket buyers, real-time analytics, and instant payouts.
                        Complete your KYC verification below to get started.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
                            <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">✓</span>
                            Verified Organizations Only
                        </div>
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
                            <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">✓</span>
                            Bank Account Required
                        </div>
                        <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
                            <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">✓</span>
                            PAN/VAT Registration
                        </div>
                    </div>
                </div>
                <div className="relative z-10 text-xs text-slate-500 mt-12">
                    © 2026 NepaliShows Inc. All rights reserved.
                </div>
            </div>

            {/* Right: Scrollable Form */}
            <div className="lg:w-8/12 h-screen overflow-y-auto bg-white">
                <div className="max-w-3xl mx-auto p-8 lg:p-16">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                        <h2 className="text-2xl font-heading font-bold text-slate-900">Partner Registration</h2>
                        <Link to="/partner/login" className="text-sm font-bold text-primary hover:underline">Already have an account?</Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* 1. Organization Details */}
                        <section>
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                                Organization Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Organization Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="orgName" required className={inputClasses} placeholder="e.g. Acme Events Pvt. Ltd." value={formData.orgName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Official Email <span className="text-red-500">*</span></label>
                                    <input type="email" name="email" required className={inputClasses} placeholder="admin@acme.com" value={formData.email} onChange={handleChange} />
                                </div>
                            </div>
                        </section>

                        {/* 2. Contact & Address (NEW) */}
                        <section>
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
                                Location & Contact
                            </h3>

                            {/* Phone Split */}
                            <div className="mb-6">
                                <label className={labelClasses}>Authorized Phone Number <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    <select
                                        name="phoneCode"
                                        className="w-28 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:border-primary outline-none font-bold"
                                        value={formData.phoneCode}
                                        onChange={handleChange}
                                    >
                                        <option value="+977">🇳🇵 +977</option>
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+61">🇦🇺 +61</option>
                                        <option value="+44">🇬🇧 +44</option>
                                    </select>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        required
                                        maxLength="10"
                                        className={inputClasses}
                                        placeholder="98XXXXXXXX"
                                        value={formData.phoneNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^0-9]/g, '');
                                            setFormData({ ...formData, phoneNumber: val });
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2 font-medium">Please enter a valid 10-digit mobile number.</p>
                            </div>

                            {/* Address Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className={labelClasses}>Country <span className="text-red-500">*</span></label>
                                    <select name="country" required className={inputClasses} value={formData.country} onChange={handleChange}>
                                        <option value="Nepal">Nepal</option>
                                        <option value="India">India</option>
                                        <option value="USA">USA</option>
                                        <option value="Australia">Australia</option>
                                        <option value="UK">UK</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>State / Province <span className="text-red-500">*</span></label>
                                    <input type="text" name="state" required className={inputClasses} placeholder="e.g. Bagmati" value={formData.state} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={labelClasses}>City <span className="text-red-500">*</span></label>
                                    <input type="text" name="city" required className={inputClasses} placeholder="e.g. Kathmandu" value={formData.city} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>Full Address <span className="text-red-500">*</span></label>
                                <input type="text" name="fullAddress" required className={inputClasses} placeholder="Search or enter street address" value={formData.fullAddress} onChange={handleChange} />
                            </div>
                        </section>

                        {/* 3. Legal Information */}
                        <section>
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3</span>
                                Legal & Documents
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className={labelClasses}>PAN/VAT Holder Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="panName" required className={inputClasses} value={formData.panName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={labelClasses}>PAN Number <span className="text-red-500">*</span></label>
                                    <input type="text" name="panNumber" required className={inputClasses} value={formData.panNumber} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className={labelClasses}>Upload PAN Card Copy <span className="text-red-500">*</span></label>
                                {!filePreviews.panPhoto ? (
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-primary transition-all group">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform text-2xl">
                                            📷
                                        </div>
                                        <p className="font-bold text-slate-600 group-hover:text-primary">Click to Upload PAN</p>
                                        <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
                                        <input type="file" name="panPhoto" accept="image/*" required onChange={handleFileChange} className="hidden" />
                                    </label>
                                ) : (
                                    <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-md border border-slate-200 group">
                                        <img src={filePreviews.panPhoto} alt="PAN Preview" className="w-full h-full object-contain bg-slate-100" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button type="button" onClick={() => handleRemoveFile('panPhoto')} className="px-6 py-2 bg-white text-red-600 font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
                                                Remove & Change
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <hr className="my-6 border-slate-100" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className={labelClasses}>VAT Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <input type="text" name="vatNumber" className={inputClasses} value={formData.vatNumber} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={`${labelClasses} text-gray-400`}>Upload VAT Certificate <span className="font-normal">(Optional)</span></label>
                                    {!filePreviews.vatPhoto ? (
                                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-primary transition-all group">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform text-2xl">
                                                📄
                                            </div>
                                            <p className="font-bold text-slate-600 group-hover:text-primary">Click to Upload VAT</p>
                                            <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
                                            <input type="file" name="vatPhoto" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        </label>
                                    ) : (
                                        <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-md border border-slate-200 group">
                                            <img src={filePreviews.vatPhoto} alt="VAT Preview" className="w-full h-full object-contain bg-slate-100" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => handleRemoveFile('vatPhoto')} className="px-6 py-2 bg-white text-red-600 font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
                                                    Remove & Change
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* 4. Banking Details */}
                        <section>
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">4</span>
                                Bank Account
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Bank Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="bankName" required className={inputClasses} value={formData.bankName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Branch <span className="text-red-500">*</span></label>
                                    <input type="text" name="branch" required className={inputClasses} value={formData.branch} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Account Holder Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="accountName" required className={inputClasses} value={formData.accountName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Account Number <span className="text-red-500">*</span></label>
                                    <input type="text" name="accountNumber" required className={inputClasses} value={formData.accountNumber} onChange={handleChange} />
                                </div>
                            </div>
                        </section>

                        {/* 5. Backup Contact */}
                        <section>
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">5</span>
                                Backup Contact (Optional)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClasses}>Contact Name</label>
                                    <input type="text" name="backupName" className={inputClasses} value={formData.backupName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Email</label>
                                    <input type="email" name="backupEmail" className={inputClasses} placeholder="backup@example.com" value={formData.backupEmail} onChange={handleChange} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Phone</label>
                                    <div className="flex gap-4 w-full md:w-2/3">
                                        <select
                                            name="backupPhoneCode"
                                            className="w-32 px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:border-primary outline-none font-bold"
                                            value={formData.backupPhoneCode}
                                            onChange={handleChange}
                                        >
                                            <option value="+977">🇳🇵 +977</option>
                                            <option value="+91">🇮🇳 +91</option>
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+61">🇦🇺 +61</option>
                                            <option value="+44">🇬🇧 +44</option>
                                        </select>
                                        <input
                                            type="tel"
                                            name="backupPhoneNumber"
                                            maxLength="10"
                                            className={inputClasses}
                                            placeholder="98XXXXXXXX"
                                            value={formData.backupPhoneNumber}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                setFormData({ ...formData, backupPhoneNumber: val });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Submit */}
                        <div className="pt-8 border-t border-slate-100">
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input type="checkbox" name="acceptedTerms" checked={formData.acceptedTerms} onChange={handleChange} className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                    <span className="text-sm text-slate-600 font-medium">
                                        I verify that all information provided is accurate and belongs to the specified organization.
                                        I agree to the <button type="button" onClick={() => setShowModal(true)} className="font-bold text-blue-600 hover:underline">Partner Service Agreement</button>.
                                    </span>
                                </label>
                            </div>

                            <button disabled={isLoading} type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-xl text-xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? 'Submitting Application...' : 'Submit Application'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default PartnerRegistration;
