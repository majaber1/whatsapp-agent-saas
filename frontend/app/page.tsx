import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-600 to-emerald-500">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-700 font-bold text-xs">WA</span>
          </div>
          <span className="text-white font-bold text-xl">WhatsApp Agent SaaS</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-white hover:text-green-200">Login</Link>
          <Link href="/simulator" className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition text-sm">
            Try Simulator
          </Link>
        </div>
      </nav>
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center bg-green-600 rounded-full px-4 py-2 mb-6">
          <span className="text-green-100 text-sm">Powered by Ollama (Local AI) + Evolution API</span>
        </div>
        <h1 className="text-5xl font-bold text-white mb-6">
          AI WhatsApp Assistant<br />
          <span className="text-yellow-300">For Your Business</span>
        </h1>
        <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
          Automate customer replies, capture leads, and manage conversations with AI.
          No paid APIs. Runs 100% locally with Ollama.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link href="/simulator" className="bg-yellow-400 text-green-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition">
            🧪 Try Mock Simulator
          </Link>
          <Link href="/login" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-green-700 transition">
            Get Started
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🤖", title: "AI Auto-Reply", desc: "Answer customer questions instantly 24/7 using your FAQ knowledge base" },
            { icon: "👥", title: "Lead Capture", desc: "Automatically identify and capture potential customers from conversations" },
            { icon: "📊", title: "Admin Dashboard", desc: "Monitor all conversations, take manual control, export leads to CSV" },
            { icon: "🧪", title: "Mock Simulator", desc: "Test your AI setup without connecting real WhatsApp" },
            { icon: "📋", title: "Knowledge Base", desc: "Train AI with your business FAQ, hours, policies, and services" },
            { icon: "✋", title: "Manual Takeover", desc: "Flag conversations that need human attention with one click" },
          ].map((f, i) => (
            <div key={i} className="bg-white bg-opacity-15 rounded-xl p-5 text-white">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-green-100 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="container mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Simple Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { name: "Small Business", price: "SAR 199", period: "/month", features: ["1 WhatsApp number", "500 messages/month", "AI auto-replies", "Lead capture", "Basic analytics"] },
            { name: "Pro", price: "SAR 499", period: "/month", features: ["3 WhatsApp numbers", "Unlimited messages", "Priority support", "CSV export", "Custom AI training"], popular: true },
            { name: "Setup Package", price: "SAR 1,500", period: "one-time", features: ["Full customization", "Training session", "Custom FAQ setup", "1 month support", "Integration help"] },
          ].map((p, i) => (
            <div key={i} className={`rounded-xl p-5 ${p.popular ? 'bg-yellow-400 text-green-900' : 'bg-white bg-opacity-15 text-white'}`}>
              <h3 className="font-bold text-lg">{p.name}</h3>
              <div className="text-2xl font-bold my-2">{p.price}<span className="text-sm font-normal">{p.period}</span></div>
              <ul className="space-y-1 text-sm mb-4">
                {p.features.map((f, j) => <li key={j}>✓ {f}</li>)}
              </ul>
              <Link href="/login" className={`block text-center py-2 rounded-lg text-sm font-semibold ${p.popular ? 'bg-green-700 text-white' : 'bg-white text-green-700'} hover:opacity-90 transition`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
      <footer className="text-center text-green-100 text-sm py-6">
        WhatsApp Agent SaaS — MIT License | Local AI, No paid APIs | Use in compliance with WhatsApp/Meta policies
      </footer>
    </div>
  );
}
