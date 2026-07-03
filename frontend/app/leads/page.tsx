'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const token = () => Cookies.get('token') || ''

  useEffect(() => {
    if (!Cookies.get('token')) { router.push('/login'); return }
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${API_URL}/leads/`, { headers: { Authorization: `Bearer ${token()}` } })
      setLeads(res.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const exportCSV = () => {
    window.open(`${API_URL}/leads/export/csv`, '_blank')
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await axios.patch(`${API_URL}/leads/${id}`, { status }, { headers: { Authorization: `Bearer ${token()}` } })
      fetchLeads()
    } catch { console.error('Update failed') }
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      qualified: 'bg-green-100 text-green-700',
      lost: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
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
          {[{label:'Dashboard',href:'/dashboard',icon:'📊'},{label:'Conversations',href:'/conversations',icon:'💬'},{label:'Knowledge Base',href:'/knowledge-base',icon:'📚'},{label:'Leads',href:'/leads',icon:'👥',active:true},{label:'Simulator',href:'/simulator',icon:'🧪'}].map(item => (
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
            <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
            <p className="text-gray-500 mt-1">Customers captured by your AI assistant</p>
          </div>
          <button onClick={exportCSV} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            📥 Export CSV
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">All Leads ({leads.length})</h2>
          </div>
          {loading ? <div className="p-6 text-gray-400 text-sm">Loading...</div> :
           leads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-2">No leads captured yet</p>
              <Link href="/simulator" className="text-green-600 text-sm font-medium">Test with simulator →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{lead.phone_number}</td>
                      <td className="px-6 py-4 text-gray-600">{lead.name || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{lead.interest || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(lead.status)}`}>{lead.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
