'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function KnowledgeBasePage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [category, setCategory] = useState('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [message, setMessage] = useState('')

  const token = () => Cookies.get('token') || ''

  useEffect(() => {
    const t = Cookies.get('token')
    if (!t) { router.push('/login'); return }
    fetchItems(t)
  }, [])

  const fetchItems = async (t: string) => {
    try {
      const res = await axios.get(`${API_URL}/knowledge/`, { headers: { Authorization: `Bearer ${t}` } })
      setItems(res.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const addItem = async () => {
    if (!question || !answer) return setMessage('Please fill in both question and answer')
    setSaving(true)
    try {
      await axios.post(`${API_URL}/knowledge/`, { question, answer, category }, { headers: { Authorization: `Bearer ${token()}` } })
      setQuestion(''); setAnswer(''); setMessage('Added successfully!')
      fetchItems(token())
    } catch { setMessage('Failed to add') }
    finally { setSaving(false) }
  }

  const seedDemo = async () => {
    setSeeding(true)
    try {
      await axios.post(`${API_URL}/knowledge/seed`, {}, { headers: { Authorization: `Bearer ${token()}` } })
      setMessage('Demo FAQ loaded!')
      fetchItems(token())
    } catch { setMessage('Seed failed') }
    finally { setSeeding(false) }
  }

  const deleteItem = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/knowledge/${id}`, { headers: { Authorization: `Bearer ${token()}` } })
      fetchItems(token())
    } catch { setMessage('Delete failed') }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-xl">💬</div>
            <div className="font-bold text-gray-800 text-sm">WhatsApp Agent</div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{label:'Dashboard',href:'/dashboard',icon:'📊'},{label:'Conversations',href:'/conversations',icon:'💬'},{label:'Knowledge Base',href:'/knowledge-base',icon:'📚',active:true},{label:'Leads',href:'/leads',icon:'👥'},{label:'Simulator',href:'/simulator',icon:'🧪'}].map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${(item as any).active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Knowledge Base</h1>
            <p className="text-gray-500 mt-1">Manage your business FAQ and AI training data</p>
          </div>
          <button onClick={seedDemo} disabled={seeding}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            {seeding ? 'Loading...' : '🌱 Load Demo FAQ'}
          </button>
        </div>

        {message && <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{message}</div>}

        {/* Add new */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="font-semibold text-gray-800 mb-4">Add New FAQ Entry</h2>
          <div className="space-y-4">
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="general">General</option>
              <option value="pricing">Pricing</option>
              <option value="booking">Booking</option>
              <option value="products">Products</option>
              <option value="hours">Hours & Location</option>
            </select>
            <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Question e.g., What are your opening hours?"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={3} placeholder="Answer..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
            <button onClick={addItem} disabled={saving}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              {saving ? 'Saving...' : '+ Add Entry'}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-800">FAQ Entries ({items.length})</h2>
          </div>
          {loading ? <div className="p-6 text-gray-400 text-sm">Loading...</div> :
           items.length === 0 ? <div className="p-6 text-gray-400 text-sm">No entries yet. Add some or click Load Demo FAQ.</div> :
           <div className="divide-y">
             {items.map((item: any) => (
               <div key={item.id} className="px-6 py-4">
                 <div className="flex items-start justify-between gap-4">
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                       <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{item.category}</span>
                     </div>
                     <p className="font-medium text-gray-800 text-sm">Q: {item.question}</p>
                     <p className="text-gray-500 text-sm mt-1">A: {item.answer}</p>
                   </div>
                   <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600 text-sm transition-colors flex-shrink-0">✕</button>
                 </div>
               </div>
             ))}
           </div>
          }
        </div>
      </main>
    </div>
  )
}
