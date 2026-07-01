'use client';

import { useState, useRef, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SimulatorPage() {
  const [messages, setMessages] = useState([
    { id: '1', dir: 'out', content: 'Hello! Welcome to our WhatsApp support. How can I help you today?', time: '09:00', isAI: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [phone] = useState('+966500000001');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const now = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    setMessages(p => [...p, { id: Date.now().toString(), dir: 'in', content: input, time: now, isAI: false }]);
    const msg = input;
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(API_URL + '/api/webhook/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, message: msg, customer_name: 'Test Customer' })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(p => [...p, { id: (Date.now()+1).toString(), dir: 'out', content: data.reply, time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }), isAI: true }]);
      }
    } catch {
      setMessages(p => [...p, { id: (Date.now()+1).toString(), dir: 'out', content: 'Connection error. Is the backend running?', time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }), isAI: false }]);
    } finally {
      setLoading(false);
    }
  };

  const quick = ["What are your hours?", "How to order?", "Return policy?", "Talk to human", "Do you deliver?", "Payment methods?"];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-green-600 text-white p-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold">Mock WhatsApp Simulator</h1>
          <p className="text-xs text-green-200">Test AI replies without real WhatsApp connection</p>
        </div>
        <a href="/dashboard" className="text-green-200 text-sm">Dashboard</a>
      </div>
      <div className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-lg shadow">
          <div className="h-80 overflow-y-auto p-3 space-y-2 bg-slate-50">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.dir === 'out' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs rounded-lg px-3 py-2 text-sm ${m.dir === 'out' ? 'bg-white' : 'bg-green-500 text-white'}`}>
                  {m.content} {m.isAI && '🤖'}
                  <div className="text-xs opacity-60 mt-1">{m.time}</div>
                </div>
              </div>
            ))}
            {loading && <div className="flex"><div className="bg-white rounded px-3 py-2 text-gray-400 text-sm">typing...</div></div>}
            <div ref={endRef} />
          </div>
          <div className="p-2 flex gap-2 border-t">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} className="flex-1 px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Type message..." />
            <button onClick={send} disabled={loading} className="bg-green-500 text-white w-9 h-9 rounded-full hover:bg-green-600 disabled:opacity-50">➤</button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quick.map((q, i) => <button key={i} onClick={() => setInput(q)} className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-1 hover:bg-green-100">{q}</button>)}
        </div>
        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-700">
          Seed FAQ first: POST /api/knowledge/seed | Then test messages above
        </div>
      </div>
    </div>
  );
}
