import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PartnerRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Organization
        orgName: '',
        email: '',
        phone: '',
        // Step 2: PAN
        panName: '', // Name on PAN
        panNumber: '',
        panPhoto: null,
        // Step 3: VAT/Tax
        vatNumber: '',
        vatPhoto: null,
        // Step 4: Bank
        bankName: '',
        accountName: '',
        accountNumber: '',
        branch: '',
        // Step 5: Contact
        primaryName: '',
        primaryPhone: '',
        primaryEmail: '',
        backupName: '',
        backupPhone: '',
        backupEmail: '',
        // Step 6: Auth
        password: '',
        confirmPassword: '',
        agreed: false
    });

    const [files, setFiles] = useState({
        panPreview: null,
        vatPreview: null
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, [field]: file }));
            setFiles(prev => ({ ...prev, [field === 'panPhoto' ? 'panPreview' : 'vatPreview']: URL.createObjectURL(file) }));
        }
    };

    const nextStep = () => {
        window.scrollTo(0, 0);
        setStep(step + 1);
    };
    const prevStep = () => {
        window.scrollTo(0, 0);
        setStep(step - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Registration Submitted Successfully!\n\nIMPORTANT: Your account is now under review. This process typically takes 24 hours.\n\nYou will receive an email once your partner account is verified and activated. You will not be able to access the dashboard until then.");
        navigate('/partner/login');
    };

    // UI Helper Components
    const Label = ({ children }) => <label className="block text-sm font-bold text-gray-700 mb-2">{children}</label>;
    const Input = (props) => (
        <input
            {...props}
            className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
        />
    );
    const FileUpload = ({ label, preview, onChange }) => (
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-blue-50/50 hover:border-blue-400 transition-all group bg-white">
            <label className="cursor-pointer block w-full">
                {!preview ? (
                    <>
                        <div className="w-12 h-12 bg-blue-100/50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <span className="text-xl">📄</span>
                        </div>
                        <span className="text-sm font-bold text-gray-600 group-hover:text-primary block">{label}</span>
                        <span className="text-xs text-gray-400 mt-1 block">Click to upload document</span>
                    </>
                ) : (
                    <div className="relative">
                        <img src={preview} alt="Preview" className="h-40 mx-auto rounded-lg object-contain shadow-sm" />
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">Change</span>
                        </div>
                    </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={onChange} />
            </label>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-body flex items-center justify-center p-4 lg:p-8">
            <div className="max-w-6xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[700px]">

                {/* Left Side - Stepper & Info */}
                <div className="lg:w-1/3 bg-[#0F172A] p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -ml-16 -mb-16"></div>

                    <div className="relative z-10">
                        <div className="font-heading font-bold text-2xl mb-1 flex items-center gap-2">
                            <span className="bg-white text-secondary px-2 py-0.5 rounded-lg text-lg">NS</span>
                            PartnerHub
                        </div>
                        <p className="text-slate-400 text-sm">Organizer Registration</p>
                    </div>

                    <div className="relative z-10 py-8 space-y-6">
                        {[
                            { num: 1, title: "Organization", desc: "Basic details" },
                            { num: 2, title: "PAN Details", desc: "Company tax ID" },
                            { num: 3, title: "VAT / Tax", desc: "Registration cert" },
                            { num: 4, title: "Banking", desc: "For payouts" },
                            { num: 5, title: "Contacts", desc: "Key people" },
                            { num: 6, title: "Agreement", desc: "Finalize" },
                        ].map((s) => (
                            <div key={s.num} className={`flex items-center gap-4 transition-all duration-300 ${step === s.num ? 'translate-x-2' : 'opacity-50'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step >= s.num ? 'bg-primary border-primary text-white' : 'border-slate-600 text-slate-400'}`}>
                                    {step > s.num ? '✓' : s.num}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${step === s.num ? 'text-white' : 'text-slate-400'}`}>{s.title}</h4>
                                    <p className="text-xs text-slate-500">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="relative z-10">
                        <p className="text-xs text-slate-500">&copy; 2026 NepaliShows Inc.</p>
                    </div>
                </div>

                {/* Right Side - Form Area */}
                <div className="lg:w-2/3 bg-white p-6 md:p-12 overflow-y-auto">
                    <div className="max-w-xl mx-auto h-full flex flex-col">

                        <div className="flex-grow">
                            <form onSubmit={handleSubmit} className="space-y-6 animate-[fadeIn_0.5s]">

                                {/* Step 1: Organization */}
                                {step === 1 && (
                                    <>
                                        <div>
                                            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">Organization Details</h2>
                                            <p className="text-gray-500">Let's start with your company's basic information.</p>
                                        </div>
                                        <div className="space-y-5">
                                            <div>
                                                <Label>Organization Name</Label>
                                                <Input name="orgName" placeholder="e.g. Acme Events Pvt. Ltd." value={formData.orgName} onChange={handleChange} autoFocus />
                                            </div>
                                            <div>
                                                <Label>Official Email</Label>
                                                <Input name="email" type="email" placeholder="contact@acme.com" value={formData.email} onChange={handleChange} />
                                            </div>
                                            <div>
                                                <Label>Official Phone</Label>
                                                <Input name="phone" type="tel" placeholder="98XXXXXXXX" value={formData.phone} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Step 2: PAN */}
                                {step === 2 && (
                                    <>
                                        <div>
                                            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">PAN Verification</h2>
                                            <p className="text-gray-500">Provide your company's Permanent Account Number.</p>
                                        </div>
                                        <div className="space-y-5">
                                            <div>
                                                <Label>Company Name (as per PAN)</Label>
                                                <Input name="panName" placeholder="Name exactly as on PAN card" value={formData.panName} onChange={handleChange} autoFocus />
                                            </div>
                                            <div>
                                                <Label>PAN Number</Label>
                                                <Input name="panNumber" placeholder="9-digit PAN Number" value={formData.panNumber} onChange={handleChange} />
                                            </div>
                                            <div>
                                                <Label>Upload PAN Card Copy</Label>
                                                <FileUpload label="Upload PAN Photo" preview={files.panPreview} onChange={(e) => handleFileChange(e, 'panPhoto')} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Step 3: VAT */}
                                {step === 3 && (
                                    <>
                                        <div>
                                            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">VAT / Tax Details</h2>
                                            <p className="text-gray-500">Upload your tax registration certificate.</p>
                                        </div>
                                        <div className="space-y-5">
                                            <div>
                                                <Label>VAT / GST Number</Label>
                                                <Input name="vatNumber" placeholder="Tax Registration Number" value={formData.vatNumber} onChange={handleChange} autoFocus />
                                            </div>
                                            <div>
                                                <Label>Upload VAT Certificate</Label>
                                                <FileUpload label="Upload VAT Certificate" preview={files.vatPreview} onChange={(e) => handleFileChange(e, 'vatPhoto')} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Step 4: Bank */}
                                {step === 4 && (
                                    <>
                                        <div>
                                            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">Banking Details</h2>
                                            <p className="text-gray-500">Where should we deposit your ticket revenue?</p>
                                        </div>
                                        <div className="space-y-5 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                            <div>
                                                <Label>Bank Name</Label>
                                                <Input name="bankName" placeholder="e.g. Nabil Bank" value={formData.bankName} onChange={handleChange} autoFocus />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Branch</Label>
                                                    <Input name="branch" placeholder="e.g. Teku" value={formData.branch} onChange={handleChange} />
                                                </div>
                                                <div>
                                                    <Label>Account No.</Label>
                                                    <Input name="accountNumber" placeholder="XXX-XXX-XXXX" value={formData.accountNumber} onChange={handleChange} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Account Holder Name</Label>
                                                <Input name="accountName" placeholder="Name exactly as in bank" value={formData.accountName} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Step 5: Contacts */}
                                {step === 5 && (
                                    <>
                                        <div>
                                            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">Key Contacts</h2>
                                            <p className="text-gray-500">Who manages your events?</p>
                                        </div>
                                        <div className="space-y-8">
                                            {/* Primary Contact */}
                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative">
                                                <div className="absolute -top-3 left-6 bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-primary uppercase tracking-wider shadow-sm">
                                                    Primary Contact
                                                </div>
                                                <div className="space-y-4 mt-2">
                                                    <Input name="primaryName" placeholder="Full Name" value={formData.primaryName} onChange={handleChange} />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Input name="primaryPhone" placeholder="Mobile Number" value={formData.primaryPhone} onChange={handleChange} />
                                                        <Input name="primaryEmail" placeholder="Email Address" value={formData.primaryEmail} onChange={handleChange} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Backup Contact */}
                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative">
                                                <div className="absolute -top-3 left-6 bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider shadow-sm">
                                                    Backup Contact
                                                </div>
                                                <div className="space-y-4 mt-2">
                                                    <Input name="backupName" placeholder="Full Name" value={formData.backupName} onChange={handleChange} />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <Input name="backupPhone" placeholder="Mobile Number" value={formData.backupPhone} onChange={handleChange} />
                                                        <Input name="backupEmail" placeholder="Email Address" value={formData.backupEmail} onChange={handleChange} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Step 6: Agreement */}
                                {step === 6 && (
                                    <>
                                        <div>
                                            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">Final Review & Agreement</h2>
                                            <p className="text-gray-500">Please review our terms before proceeding.</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="h-48 overflow-y-auto bg-gray-50 p-6 rounded-2xl border border-gray-200 text-sm text-gray-600 leading-relaxed shadow-inner">
                                                <h4 className="font-bold text-gray-900 mb-2">PARTNER SERVICE AGREEMENT</h4>
                                                <p className="mb-2">1. <strong>Acceptance of Terms:</strong> By registering as a partner on NepaliShows, you agree to comply with all platform policies regarding ticket sales, event management, and payouts.</p>
                                                <p className="mb-2">2. <strong>Revenue & Payouts:</strong> Revenue is settled within 3-5 business days post-event completion, subject to deduction of platform fees (5%) and applicable taxes.</p>
                                                <p className="mb-2">3. <strong>Cancellations:</strong> Partners are responsible for refunding customers in case of event cancellations. NepaliShows facilitates the process but holds no liability for organizer negligence.</p>
                                                <p className="mb-2">4. <strong>Data Privacy:</strong> Organizer agrees to handle attendee data responsibly and in accordance with Nepal's privacy laws.</p>
                                                <p>5. <strong>Content:</strong> You certify that you hold rights to all content (images, names) uploaded for event promotion.</p>
                                            </div>

                                            <div>
                                                <Label>Create Password</Label>
                                                <Input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                                            </div>

                                            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:bg-blue-100/50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, agreed: !formData.agreed })}>
                                                <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${formData.agreed ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-white'}`}>
                                                    {formData.agreed && '✓'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm select-none">I Agree to the Terms of Service</p>
                                                    <p className="text-xs text-gray-500 select-none">I certify that the information provided is accurate and I am authorized to represent this organization.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Actions Footer */}
                                <div className="pt-8 flex gap-4 border-t border-gray-100 mt-8">
                                    {step > 1 && (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-8 py-4 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                                        >
                                            Back
                                        </button>
                                    )}
                                    {step < 6 ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="flex-grow px-8 py-4 rounded-xl bg-secondary text-white font-bold hover:bg-secondary-light transition-colors shadow-lg shadow-secondary/20"
                                        >
                                            Continue
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className={`flex-grow px-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${formData.agreed ? 'bg-primary hover:bg-primary-dark shadow-primary/30' : 'bg-gray-300 cursor-not-allowed'}`}
                                            disabled={!formData.agreed}
                                        >
                                            Complete Registration
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerRegistration;
