import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PartnerChat = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'agent', text: 'Hello! Welcome to NS Partner Support. How can I assist you today?', time: '10:00 AM' }
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const userMsg = { id: messages.length + 1, sender: 'user', text: newMessage, time: 'Just now' };
        setMessages([...messages, userMsg]);
        setNewMessage('');

        // Mock Reply
        setTimeout(() => {
            setMessages(prev => [...prev, { id: prev.length + 1, sender: 'agent', text: "Thanks for reaching out. An agent will be with you shortly.", time: 'Just now' }]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">NS</div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Priority Partner Support</h3>
                        <p className="text-xs text-slate-400">Online • Typically replies in 2m</p>
                    </div>
                </div>
                <Link to="/partner/help" className="text-slate-400 hover:text-white">✕</Link>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm font-medium ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'}`}>
                            <p>{msg.text}</p>
                            <span className={`text-[10px] block mt-1 opacity-70 ${msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>{msg.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <button type="button" className="p-3 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
                        📎
                    </button>
                    <input
                        type="text"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium text-slate-900"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-all">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PartnerChat;
