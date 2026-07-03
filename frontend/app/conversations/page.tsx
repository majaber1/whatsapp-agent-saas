'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ConversationsPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) { router.push('/login'); return }
    fetchConversations(token)
  }, [])

  const fetchConversations = async (token: string) => {
    try {
      const res = await axios.get(`${API_URL}/conversations/`, { headers: { Authorization: `Bearer ${token}` } })
      setConversations(res.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const selectConversation = async (conv: any) => {
    setSelected(conv)
    const token = Cookies.get('token')
    try {
      const res = await axios.get(`${API_URL}/conversations/${conv.id}/messages`, { headers: { Authorization: `Bearer ${token}` } })
      setMessages(res.data)
    } catch(e) { setMessages([]) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Nav */}
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-xl">💬</div>
            <div className="font-bold text-gray-800 text-sm">WhatsApp Agent</div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{label:'Dashboard',href:'/dashboard',icon:'📊'},{label:'Conversations',href:'/conversations',icon:'💬',active:true},{label:'Knowledge Base',href:'/knowledge-base',icon:'📚'},{label:'Leads',href:'/leads',icon:'👥'},{label:'Simulator',href:'/simulator',icon:'🧪'}].map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${(item as any).active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Conversation List */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-800">All Conversations</h2>
        </div>
        {loading ? <div className="p-4 text-gray-400 text-sm">Loading...</div> :
         conversations.length === 0 ? <div className="p-4 text-gray-400 text-sm">No conversations yet. <Link href="/simulator" className="text-green-600">Try simulator →</Link></div> :
         conversations.map(conv => (
          <div key={conv.id} onClick={() => selectConversation(conv)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === conv.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                {conv.phone_number?.slice(-2) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 text-sm">{conv.phone_number}</div>
                <div className="text-xs text-gray-400 truncate">{conv.status}</div>
              </div>
              {conv.needs_human && <span className="text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded">!</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="p-4 bg-white border-b">
              <h3 className="font-semibold text-gray-800">{selected.phone_number}</h3>
              <p className="text-xs text-gray-400">Status: {selected.status}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm mt-8">No messages in this conversation</div>
              ) : messages.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${msg.direction === 'outgoing' ? 'bg-green-500 text-white rounded-br-sm' : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'}`}>
                    {msg.content}
                    <div className={`text-xs mt-1 ${msg.direction === 'outgoing' ? 'text-green-100' : 'text-gray-400'}`}>
                      {msg.is_ai ? '🤖 AI' : '👤 Human'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-5xl mb-4">💬</div>
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
