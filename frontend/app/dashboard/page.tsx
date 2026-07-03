'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ total_messages: 0, new_leads: 0, active_conversations: 0, manual_takeover: 0 })
  const [recentConversations, setRecentConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }
    const userData = Cookies.get('user')
    if (userData) setUser(JSON.parse(userData))
    fetchData(token)
  }, [])

  const fetchData = async (token: string) => {
    try {
      const [convsRes, leadsRes] = await Promise.all([
        axios.get(`${API_URL}/conversations/`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/leads/`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      setRecentConversations(convsRes.data.slice(0, 5))
      setStats({
        total_messages: convsRes.data.reduce((sum: number, c: any) => sum + (c.message_count || 0), 0),
        new_leads: leadsRes.data.filter((l: any) => l.status === 'new').length,
        active_conversations: convsRes.data.filter((c: any) => c.status === 'active').length,
        manual_takeover: convsRes.data.filter((c: any) => c.needs_human).length
      })
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleLogout = () => { Cookies.remove('token'); Cookies.remove('user'); router.push('/login') }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊', active: true },
    { label: 'Conversations', href: '/conversations', icon: '💬', active: false },
    { label: 'Knowledge Base', href: '/knowledge-base', icon: '📚', active: false },
    { label: 'Leads', href: '/leads', icon: '👥', active: false },
    { label: 'Simulator', href: '/simulator', icon: '🧪', active: false },
  ]

  const statCards = [
    { label: 'Total Messages', value: stats.total_messages, icon: '💬', color: 'green' },
    { label: 'New Leads', value: stats.new_leads, icon: '🎯', color: 'blue' },
    { label: 'Active Conversations', value: stats.active_conversations, icon: '🔥', color: 'orange' },
    { label: 'Manual Takeover Needed', value: stats.manual_takeover, icon: '🚨', color: 'red' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-xl">💬</div>
            <div>
              <div className="font-bold text-gray-800 text-sm">WhatsApp Agent</div>
              <div className="text-xs text-gray-500">AI Assistant</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <div className="text-xs text-gray-500 mb-2">{user?.email}</div>
          <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-700 transition-colors">Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your AI WhatsApp assistant</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map(card => (
            <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="text-2xl mb-3">{card.icon}</div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Conversations</h2>
            <Link href="/conversations" className="text-sm text-green-600 hover:text-green-700">View all →</Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : recentConversations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">No conversations yet</p>
              <Link href="/simulator" className="text-green-600 text-sm font-medium">Try the WhatsApp Simulator →</Link>
            </div>
          ) : (
            <div className="divide-y">
              {recentConversations.map((conv: any) => (
                <div key={conv.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                      {conv.phone_number?.slice(-2) || '??'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">{conv.phone_number}</div>
                      <div className="text-xs text-gray-400">{conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : 'No messages'}</div>
                    </div>
                  </div>
                  {conv.needs_human && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Needs attention</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
