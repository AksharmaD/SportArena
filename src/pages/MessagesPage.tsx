import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate, useRoute } from '@/hooks/useRoute';
import { Button } from '@/components/ui/Button';
import { SPORT_EMOJIS, type Profile, type Message } from '@/types';

export function MessagesPage() {
  const { user } = useAuth();
  const route = useRoute();
  const navigate = useNavigate();

  const activeUserId = route.name === 'messages-with' ? route.userId : null;

  const [conversations, setConversations] = useState<{ profile: Profile; lastMessage: string; lastTime: string }[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations (people who have exchanged messages with current user)
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data: sent } = await supabase
      .from('messages')
      .select('receiver_id, content, created_at')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });

    const { data: received } = await supabase
      .from('messages')
      .select('sender_id, content, created_at')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    // Build a map of latest message per other user
    const convMap = new Map<string, { content: string; created_at: string }>();
    [...(sent || []).map((m) => ({ otherId: m.receiver_id, content: m.content, created_at: m.created_at })),
     ...(received || []).map((m) => ({ otherId: m.sender_id, content: m.content, created_at: m.created_at }))]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .forEach((m) => {
        if (!convMap.has(m.otherId)) convMap.set(m.otherId, { content: m.content, created_at: m.created_at });
      });

    if (convMap.size === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const profileIds = Array.from(convMap.keys());
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', profileIds);

    const convList = (profiles || []).map((p) => ({
      profile: p as Profile,
      lastMessage: convMap.get(p.id)?.content || '',
      lastTime: convMap.get(p.id)?.created_at || '',
    }));
    convList.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());
    setConversations(convList);
    setLoading(false);
  }, [user]);

  // Fetch messages with active user
  const fetchMessages = useCallback(async () => {
    if (!user || !activeUserId) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeUserId}),and(sender_id.eq.${activeUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setMessages((data as Message[]) || []);

    // Mark messages from the other user as read
    await supabase.from('messages').update({ read: true }).eq('sender_id', activeUserId).eq('receiver_id', user.id).eq('read', false);

    // Fetch the other user's profile
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', activeUserId).maybeSingle();
    setActiveProfile(prof as Profile);
  }, [user, activeUserId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Poll for new messages every 5 seconds when in a conversation
  useEffect(() => {
    if (!activeUserId) return;
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeUserId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeUserId || !newMessage.trim()) return;
    const content = newMessage.trim();
    setNewMessage('');
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: activeUserId,
      content,
    });
    fetchMessages();
    fetchConversations();
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen flex-col bg-ink-50/60 pt-16">
      <div className="container-px flex h-full max-w-5xl flex-col py-4">
        <h1 className="mb-4 font-display text-2xl font-extrabold text-ink-950">Messages</h1>

        <div className="flex flex-1 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
          {/* Conversation list */}
          <div className={`flex flex-col ${activeUserId ? 'hidden w-full md:flex md:w-72 md:border-r md:border-ink-100' : 'w-full md:w-72 md:border-r md:border-ink-100'}`}>
            {loading ? (
              <div className="flex flex-1 items-center justify-center text-sm text-ink-400">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                <MessageSquare className="h-8 w-8 text-ink-300" />
                <p className="mt-2 text-sm font-medium text-ink-500">No conversations yet</p>
                <p className="text-xs text-ink-400">Connect with athletes and start chatting!</p>
                <Button variant="secondary" size="sm" className="mt-3" onClick={() => navigate('/discover')}>
                  Find athletes
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.profile.id}
                    onClick={() => navigate(`/messages/${conv.profile.id}`)}
                    className={`flex w-full items-center gap-3 border-b border-ink-50 px-4 py-3 text-left transition-colors hover:bg-ink-50 ${
                      activeUserId === conv.profile.id ? 'bg-brand-50' : ''
                    }`}
                  >
                    {conv.profile.avatar_url ? (
                      <img src={conv.profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                        {conv.profile.full_name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-bold text-ink-900">{conv.profile.full_name}</p>
                      <p className="truncate text-xs text-ink-400">{conv.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat area */}
          {activeUserId ? (
            <div className="flex flex-1 flex-col">
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3">
                <button onClick={() => navigate('/messages')} className="text-ink-400 hover:text-ink-900 md:hidden">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                {activeProfile?.avatar_url ? (
                  <img src={activeProfile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                    {activeProfile?.full_name?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
                <div>
                  <p className="text-sm font-bold text-ink-900">{activeProfile?.full_name || 'Loading...'}</p>
                  {activeProfile?.sports && activeProfile.sports.length > 0 && (
                    <p className="text-xs text-ink-400">
                      {activeProfile.sports.map((s) => `${SPORT_EMOJIS[s] || ''} ${s}`).join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-ink-400">
                    No messages yet. Say hello!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg) => {
                      const isMine = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                              isMine
                                ? 'rounded-br-md bg-brand-600 text-white'
                                : 'rounded-bl-md bg-ink-100 text-ink-800'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`mt-1 text-[10px] ${isMine ? 'text-brand-100' : 'text-ink-400'}`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-ink-100 px-4 py-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden flex-1 flex-col items-center justify-center text-center md:flex">
              <MessageSquare className="h-12 w-12 text-ink-200" />
              <p className="mt-3 text-sm font-medium text-ink-500">Select a conversation to start chatting</p>
              <p className="text-xs text-ink-400">Or discover athletes to connect with.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
