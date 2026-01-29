import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CreateEvent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeSection, setActiveSection] = useState('details');

    const [eventData, setEventData] = useState({
        title: '',
        category: 'Music',
        date: '',
        time: '',
        venue: '',
        fullAddress: '',
        city: '',
        state: '',
        description: '',
        thumbnail: null,
        gallery: [],
        ticketTypes: [
            { name: 'General Admission', price: 1000, quantity: 100, perks: [] }
        ]
    });

    useEffect(() => {
        // Mock Fetch for Edit Mode
        if (id) {
            // Simulate API call
            console.log("Fetching data for event ID:", id);
            setEventData({
                title: 'Summer Music Festival 2026',
                category: 'Music',
                date: '2026-06-15',
                time: '18:00',
                venue: 'LOD Club',
                address: 'Thamel, Kathmandu',
                description: 'The biggest summer festival is back!',
                ticketTypes: [
                    { name: 'Early Bird', price: 1500, quantity: 50, perks: ['Discounted Price'] },
                    { name: 'VIP', price: 5000, quantity: 20, perks: ['Front Row', 'Meet & Greet', 'Free Drink'] }
                ],
                thumbnail: null, // Would be a URL in real app
                gallery: []
            });
        }
    }, [id]);

    const [files, setFiles] = useState({
        thumbnailPreview: null,
        galleryPreviews: []
    });

    const handleTicketChange = (index, field, value) => {
        const newTickets = [...eventData.ticketTypes];
        newTickets[index][field] = value;
        setEventData({ ...eventData, ticketTypes: newTickets });
    };

    const addTicketType = () => {
        setEventData({
            ...eventData,
            ticketTypes: [...eventData.ticketTypes, { name: '', price: 0, quantity: 0, perks: [] }]
        });
    };

    const removeTicketType = (index) => {
        const newTickets = eventData.ticketTypes.filter((_, i) => i !== index);
        setEventData({ ...eventData, ticketTypes: newTickets });
    };

    const handlePerkChange = (ticketIndex, perkIndex, value) => {
        const newTickets = [...eventData.ticketTypes];
        newTickets[ticketIndex].perks[perkIndex] = value;
        setEventData({ ...eventData, ticketTypes: newTickets });
    };

    const addPerk = (ticketIndex) => {
        const newTickets = [...eventData.ticketTypes];
        newTickets[ticketIndex].perks = [...(newTickets[ticketIndex].perks || []), ''];
        setEventData({ ...eventData, ticketTypes: newTickets });
    };

    const removePerk = (ticketIndex, perkIndex) => {
        const newTickets = [...eventData.ticketTypes];
        newTickets[ticketIndex].perks = newTickets[ticketIndex].perks.filter((_, i) => i !== perkIndex);
        setEventData({ ...eventData, ticketTypes: newTickets });
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEventData({ ...eventData, thumbnail: file });
            setFiles({ ...files, thumbnailPreview: URL.createObjectURL(file) });
        }
    };

    const handleGalleryChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const currentCount = eventData.gallery.length;

        if (currentCount + newFiles.length > 3) {
            alert("You can only upload a maximum of 3 gallery images.");
            return;
        }

        const newPreviews = newFiles.map(file => URL.createObjectURL(file));

        setEventData({ ...eventData, gallery: [...eventData.gallery, ...newFiles] });
        setFiles({ ...files, galleryPreviews: [...files.galleryPreviews, ...newPreviews] });
    };

    const removeGalleryImage = (index) => {
        const newGallery = eventData.gallery.filter((_, i) => i !== index);
        const newPreviews = files.galleryPreviews.filter((_, i) => i !== index);

        setEventData({ ...eventData, gallery: newGallery });
        setFiles({ ...files, galleryPreviews: newPreviews });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!eventData.title || !eventData.date || !eventData.thumbnail) {
            alert('Please fill in all required fields and upload a cover image.');
            return;
        }

        const formData = new FormData();
        formData.append('title', eventData.title);
        formData.append('category', eventData.category); // Send Category
        formData.append('description', eventData.description);
        const fullDate = eventData.time ? `${eventData.date}T${eventData.time}:00` : `${eventData.date}T00:00:00`;
        formData.append('date', fullDate); // Send full timestamp

        formData.append('location', eventData.venue); // Use venue name as main location
        formData.append('fullAddress', eventData.fullAddress);
        formData.append('city', eventData.city);
        formData.append('state', eventData.state);

        // Tiers
        formData.append('tiers', JSON.stringify(eventData.ticketTypes));

        // Files
        if (eventData.thumbnail) {
            formData.append('coverImage', eventData.thumbnail);
        }

        if (eventData.gallery && eventData.gallery.length > 0) {
            eventData.gallery.forEach(file => {
                formData.append('galleryImages', file);
            });
        }

        try {
            const token = localStorage.getItem('partner_token');
            if (!token) {
                alert("You are not logged in. Please log in again.");
                navigate('/partner/login');
                return;
            }

            const response = await fetch('http://localhost:5000/api/events/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert('Event Created Successfully!');
                navigate('/partner/dashboard');
            } else {
                alert(data.error || 'Failed to create event');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating event.');
        }
    };

    const scrollToSection = (id) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Common Input Classes for Consistency
    const inputClasses = "w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400 text-base";
    const labelClasses = "block text-base font-bold text-gray-800 mb-2";

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-20">

            {/* 1. Left Sidebar - Navigation */}
            <aside className="hidden lg:block w-72 h-[calc(100vh-8rem)] sticky top-24">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-heading font-black text-slate-900 mb-6 px-2">Create Event</h2>
                    <nav className="space-y-1">
                        {[
                            { id: 'details', label: 'Basic Details', icon: '📝' },
                            { id: 'media', label: 'Event Media', icon: '🖼️' },
                            { id: 'location', label: 'Date & Venue', icon: '📍' },
                            { id: 'tickets', label: 'Tickets & Pricing', icon: '🎟️' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-3 transition-all ${activeSection === item.id
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Capacity</p>
                                <p className="text-3xl font-black text-slate-900">{eventData.ticketTypes.reduce((acc, curr) => acc + parseInt(curr.quantity || 0), 0)} Tickets</p>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Est. Financials</p>

                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-slate-500">Gross Sales</span>
                                    <span className="text-sm font-black text-slate-900">Rs. {eventData.ticketTypes.reduce((acc, curr) => acc + (parseInt(curr.price || 0) * parseInt(curr.quantity || 0)), 0).toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-slate-500">Platform Fee (5%)</span>
                                    <span className="text-sm font-bold text-red-500">- Rs. {(eventData.ticketTypes.reduce((acc, curr) => acc + (parseInt(curr.price || 0) * parseInt(curr.quantity || 0)), 0) * 0.05).toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
                                    <span className="text-sm font-black text-slate-900 uppercase">Net Earning</span>
                                    <span className="text-xl font-black text-green-600">Rs. {(eventData.ticketTypes.reduce((acc, curr) => acc + (parseInt(curr.price || 0) * parseInt(curr.quantity || 0)), 0) * 0.95).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleSubmit} className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all transform hover:-translate-y-1">
                            Publish Event
                        </button>
                    </div>
                </div>
            </aside>

            {/* 2. Main Form Area */}
            <div className="flex-1 space-y-8">

                {/* Section: Basic Details */}
                <section id="details" className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-10 scroll-mt-28">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">Basic Details</h3>
                    <div className="space-y-6">
                        <div>
                            <label className={labelClasses}>Event Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className={`${inputClasses} text-xl`}
                                placeholder="Enter a catchy event name"
                                value={eventData.title}
                                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Category</label>
                                <select
                                    className={inputClasses}
                                    value={eventData.category}
                                    onChange={(e) => setEventData({ ...eventData, category: e.target.value })}
                                >
                                    <option>Music & Concerts</option>
                                    <option>Nightlife & Parties</option>
                                    <option>Comedy & Shows</option>
                                    <option>Business & Networking</option>
                                    <option>Food & Drink</option>
                                    <option>Arts & Culture</option>
                                    <option>Sports & Fitness</option>
                                    <option>Workshops & Classes</option>
                                    <option>Family & Kids</option>
                                    <option>Charity & Causes</option>
                                    <option>Holiday & Seasonal</option>
                                    <option>Fashion & Beauty</option>
                                    <option>Film & Media</option>
                                    <option>Travel & Outdoor</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Organizer Name</label>
                                <input type="text" className={`${inputClasses} bg-gray-200 text-gray-500 cursor-not-allowed`} value="Acme Events Pvt. Ltd." disabled />
                            </div>
                        </div>
                        <div>
                            <label className={labelClasses}>Description</label>
                            <textarea
                                rows="10"
                                className={`${inputClasses} resize-y`}
                                placeholder="Tell people what makes your event special..."
                                value={eventData.description}
                                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                            ></textarea>
                            <p className="text-right text-xs text-gray-400 mt-2">Markdown supported</p>
                        </div>
                    </div>
                </section>

                {/* Section: Media */}
                <section id="media" className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-10 scroll-mt-28">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">Event Visuals</h3>

                    <div className="mb-8">
                        <label className={`${labelClasses} mb-3 block`}>Cover Image</label>
                        {!files.thumbnailPreview ? (
                            <label className="flex flex-col items-center justify-center w-full h-80 border-3 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-all group">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 border border-slate-100 group-hover:scale-110 transition-transform">
                                    <span className="text-3xl">📷</span>
                                </div>
                                <p className="font-heading font-bold text-xl text-slate-700 group-hover:text-primary">Click to Upload Cover</p>
                                <p className="text-sm text-slate-400 mt-1 font-bold">1920 x 1080 recommended</p>
                                <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailChange} />
                            </label>
                        ) : (
                            <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-lg group">
                                <img src={files.thumbnailPreview} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEventData({ ...eventData, thumbnail: null }); setFiles({ ...files, thumbnailPreview: null }) }} className="px-6 py-3 bg-white text-red-600 font-bold rounded-full hover:bg-red-50 shadow-lg transform hover:scale-105 transition-all">Remove Image</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className={`${labelClasses} mb-3 block`}>Gallery Images</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {files.galleryPreviews.map((src, i) => (
                                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-white group">
                                    <img src={src} className="w-full h-full object-cover" />
                                    <button onClick={() => removeGalleryImage(i)} className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">×</button>
                                </div>
                            ))}
                            <label className="aspect-square border-3 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-all">
                                <span className="text-4xl text-slate-300 mb-2">+</span>
                                <span className="text-xs font-bold text-slate-400 uppercase">Add Photo</span>
                                <input type="file" multiple className="hidden" accept="image/*" onChange={handleGalleryChange} />
                            </label>
                        </div>
                    </div>
                </section>

                {/* Section: Location and Time */}
                <section id="location" className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-10 scroll-mt-28">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">Date & Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>Event Date <span className="text-red-500">*</span></label>
                            <input type="date" className={inputClasses} value={eventData.date} onChange={(e) => setEventData({ ...eventData, date: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClasses}>Start Time <span className="text-red-500">*</span></label>
                            <input type="time" className={inputClasses} value={eventData.time} onChange={(e) => setEventData({ ...eventData, time: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Venue Name <span className="text-red-500">*</span></label>
                            <input type="text" className={inputClasses} placeholder="e.g. Club Fahrenheit" value={eventData.venue} onChange={(e) => setEventData({ ...eventData, venue: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClasses}>Full Address <span className="text-red-500">*</span></label>
                            <input type="text" className={inputClasses} placeholder="Street Address, Area" value={eventData.fullAddress} onChange={(e) => setEventData({ ...eventData, fullAddress: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClasses}>City <span className="text-red-500">*</span></label>
                            <input type="text" className={inputClasses} placeholder="e.g. Kathmandu" value={eventData.city} onChange={(e) => setEventData({ ...eventData, city: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClasses}>State / Province <span className="text-red-500">*</span></label>
                            <input type="text" className={inputClasses} placeholder="e.g. Bagmati" value={eventData.state} onChange={(e) => setEventData({ ...eventData, state: e.target.value })} />
                        </div>
                    </div>
                </section>

                {/* Section: Tickets */}
                <section id="tickets" className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-10 scroll-mt-28">
                    <h3 className="text-2xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">Tickets & Capacity</h3>

                    <div className="space-y-4">
                        {eventData.ticketTypes.map((ticket, i) => (
                            <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded-xl relative">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs">TIER {i + 1}</span>
                                    </h4>
                                    {eventData.ticketTypes.length > 1 && (
                                        <button onClick={() => removeTicketType(i)} className="text-red-500 font-bold text-sm hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">Remove Tier</button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ticket Name</label>
                                        <input type="text" className="w-full px-4 py-3 rounded-lg bg-white border-2 border-slate-200 focus:border-blue-500 font-bold outline-none" placeholder="e.g. General Admission" value={ticket.name} onChange={(e) => handleTicketChange(i, 'name', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Price (Rs.)</label>
                                        <input type="number" className="w-full px-4 py-3 rounded-lg bg-white border-2 border-slate-200 focus:border-blue-500 font-bold outline-none" value={ticket.price} onChange={(e) => handleTicketChange(i, 'price', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Quantity</label>
                                        <input type="number" className="w-full px-4 py-3 rounded-lg bg-white border-2 border-slate-200 focus:border-blue-500 font-bold outline-none" value={ticket.quantity} onChange={(e) => handleTicketChange(i, 'quantity', e.target.value)} />
                                    </div>
                                    <div className="md:col-span-3 pt-4 border-t border-slate-200 mt-2 flex justify-between items-center">
                                        <p className="text-sm font-bold text-slate-500 uppercase">Estimated Revenue from this Tier</p>
                                        <p className="text-xl font-black text-green-600">Rs. {(parseInt(ticket.price || 0) * parseInt(ticket.quantity || 0)).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ticket Perks / Advantages</label>
                                    <div className="space-y-3">
                                        {(ticket.perks || []).map((perk, pIndex) => (
                                            <div key={pIndex} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    className="flex-1 px-4 py-2 rounded-lg bg-white border border-slate-200 focus:border-blue-500 font-medium text-sm outline-none"
                                                    placeholder="e.g. Free Drink, Early Access"
                                                    value={perk}
                                                    onChange={(e) => handlePerkChange(i, pIndex, e.target.value)}
                                                />
                                                <button onClick={() => removePerk(i, pIndex)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg font-bold">×</button>
                                            </div>
                                        ))}
                                        <button onClick={() => addPerk(i)} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                                            <span>+</span> Add Perk
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={addTicketType} type="button" className="w-full py-5 border-3 border-dashed border-slate-300 rounded-xl font-bold text-slate-500 hover:border-primary hover:text-primary hover:bg-blue-50 transition-all text-lg flex items-center justify-center gap-3">
                            <span className="text-2xl">+</span> Add Another Ticket Tier
                        </button>
                    </div>
                </section>
            </div >
        </div >
    );
};

export default CreateEvent;
