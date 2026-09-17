import { generateId } from '../constants';
import { supabase } from '../lib/supabase';
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([
                {
                    id: generateId(),
                    text: t('chatbotWelcome'),
                    sender: 'bot'
                }
            ]);
        } else {
            // Reset when closed
            setMessages([]);
            setInput('');
            setIsLoading(false);
            setError(null);
        }
    }, [isOpen, t]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Try to get token from Supabase if available
        let token = 'dummy-token';
        let contextData = null;
        try {
            const stored = localStorage.getItem('wallet_user');
            if (stored) {
               const user = JSON.parse(stored);
               token = user.id; // Just a rudimentary token for prototype
            }
            
            // Gather context
            const localData = localStorage.getItem('wallet_data');
            if (localData) {
                const parsed = JSON.parse(localData);
                const txs = parsed.transactions || [];
                const income = txs.filter((t: any) => t.type === 'income').reduce((a: any, b: any)=>a+b.amount,0);
                const expenses = txs.filter((t: any) => t.type !== 'income').reduce((a: any, b: any)=>a+b.amount,0);
                contextData = {
                    totalIncome: income,
                    totalExpenses: expenses,
                    netBalance: income - expenses,
                    recentTransactions: JSON.stringify(txs.slice(0, 5).map((t: any) => ({name: t.name, amount: t.amount, type: t.type})))
                };
            }
        } catch(e) {}

        const userMessage: Message = { id: generateId(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            // Setup timeout using AbortController
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds

            const response = await fetch('/api/chat', {
                signal: controller.signal,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                method: 'POST',
                body: JSON.stringify({ messages, input, contextData }),
            });
            clearTimeout(timeoutId);

            if (response.status === 429) {
                throw new Error(t('chatbotErrorApi') || 'Too many requests. Please wait a moment.');
            }
            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const botMessage: Message = { id: generateId(), text: data.text, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (err: any) {
            console.error("Gemini API error:", err);
            let errMsg = t('chatbotErrorApi');
            if (err.name === 'AbortError') errMsg = 'Request timed out. Please try again.';
            if (err.message) errMsg = err.message;
            setError(errMsg);
            const errorMessage: Message = { id: generateId(), text: errMsg, sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    
    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 w-[90vw] max-w-sm h-[70vh] max-h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="chatbot-title">
            <header className="flex items-center justify-between p-4 bg-slate-700 dark:bg-gray-900 text-white rounded-t-2xl flex-shrink-0">
                <div className="flex items-center gap-3">
                    <i className="fas fa-robot"></i>
                    <h2 id="chatbot-title" className="font-bold text-lg">{t('financialAssistant')}</h2>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="Close chat">
                    <i className="fas fa-times"></i>
                </button>
            </header>
            
            <main className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-slate-600 dark:bg-gray-700 flex items-center justify-center text-white flex-shrink-0"><i className="fas fa-robot"></i></div>}
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg'}`}>
                                <p className="text-sm">
                                    {msg.text.split('\n').map((line, i, arr) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i < arr.length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-600 dark:bg-gray-700 flex items-center justify-center text-white flex-shrink-0"><i className="fas fa-robot"></i></div>
                            <div className="max-w-[80%] p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-lg">
                                <div className="flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-0"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    {error && !isLoading && (
                        <div className="text-center p-2 bg-red-100 dark:bg-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={t('typeYourMessage')}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm bg-gray-50 dark:bg-gray-900/50 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-300 outline-none"
                        disabled={isLoading}
                        aria-label="Chat input"
                    />
                    <button type="submit" className="bg-slate-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors" disabled={isLoading || !input.trim()} aria-label="Send message">
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default Chatbot;