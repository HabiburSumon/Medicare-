'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  sender: { _id: string; name: string; avatar: string };
  receiver: { _id: string; name: string; avatar: string };
  content: string;
  messageType: 'text' | 'image' | 'file' | 'video';
  fileUrl?: string;
  createdAt: string;
}

interface Conversation {
  _id: { _id: string; name: string; avatar: string; email: string; role?: string };
  lastMessage: Message;
  unreadCount: number;
}

interface DoctorOption {
  _id: string;
  user: { _id: string; name: string; avatar: string; email: string };
  specialization: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoCallIncoming, setVideoCallIncoming] = useState(false);
  const [callerName, setCallerName] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Socket connection
  useEffect(() => {
    if (!user) return;
    fetchConversations();
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL, { query: { userId: user.id } });
    socketRef.current.emit('user:online', user.id);

    socketRef.current.on('users:online', (users: string[]) => setOnlineUsers(users));

    socketRef.current.on('message:receive', (msg: Message) => {
      if (msg.sender._id === activeChat || msg.receiver._id === activeChat) {
        setMessages((prev) => [...prev, msg]);
      }
      fetchConversations();
    });

    socketRef.current.on('message:sent', (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      fetchConversations();
    });

    socketRef.current.on('typing:start', ({ senderId }: { senderId: string }) => {
      if (senderId === activeChat) { setTypingUser(senderId); }
    });
    socketRef.current.on('typing:stop', ({ senderId }: { senderId: string }) => {
      if (senderId === activeChat) { setTypingUser(null); }
    });

    socketRef.current.on('video:incoming-call', ({ signal, callerId, callerName: name }: any) => {
      setVideoCallIncoming(true);
      setCallerName(name);
      setActiveChat(callerId);
    });

    socketRef.current.on('video:call-ended', () => {
      setShowVideoCall(false);
      setVideoCallIncoming(false);
    });

    return () => { socketRef.current?.disconnect(); };
  }, [user, activeChat]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const openChat = async (userId: string, name?: string) => {
    setActiveChat(userId);
    setActiveChatName(name || '');
    setShowNewChat(false);
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data.data || []);
    } catch { /* ignore */ }
  };

  const handleTyping = () => {
    if (!activeChat) return;
    socketRef.current?.emit('typing:start', { receiverId: activeChat });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing:stop', { receiverId: activeChat });
    }, 2000);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    const content = newMessage;
    setNewMessage('');
    handleTyping();
    try {
      socketRef.current?.emit('message:send', {
        senderId: user!.id, receiverId: activeChat, content, messageType: 'text',
      });
    } catch {
      await api.post('/messages', { receiverId: activeChat, content, messageType: 'text' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { fileUrl, messageType } = uploadRes.data.data;
      socketRef.current?.emit('message:send', {
        senderId: user!.id,
        receiverId: activeChat,
        content: messageType === 'image' ? '📷 Photo' : messageType === 'video' ? '🎥 Video' : '📎 File',
        messageType,
        fileUrl,
      });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startVideoCall = () => {
    if (!activeChat) return;
    setShowVideoCall(true);
    socketRef.current?.emit('video:call-user', {
      receiverId: activeChat,
      signal: {},
      callerName: user?.name || 'User',
    });
  };

  const endVideoCall = () => {
    setShowVideoCall(false);
    if (activeChat) {
      socketRef.current?.emit('video:end-call', { receiverId: activeChat });
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { if (showNewChat) fetchDoctors(); }, [showNewChat]);

  const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

  const renderMessageContent = (msg: Message) => {
    if (msg.messageType === 'image' && msg.fileUrl) {
      return (
        <div>
          <img src={msg.fileUrl} alt="Shared" className="rounded-lg max-w-[240px] max-h-[200px] object-cover cursor-pointer" onClick={() => window.open(msg.fileUrl, '_blank')} />
          {msg.content && msg.content !== '📷 Photo' && <p className="mt-1">{msg.content}</p>}
        </div>
      );
    }
    if (msg.messageType === 'video' && msg.fileUrl) {
      return (
        <div>
          <video src={msg.fileUrl} controls className="rounded-lg max-w-[280px] max-h-[200px]" />
          {msg.content && msg.content !== '🎥 Video' && <p className="mt-1">{msg.content}</p>}
        </div>
      );
    }
    if (msg.messageType === 'file' && msg.fileUrl) {
      return (
        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 underline">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          <span>{msg.content || '📎 Download File'}</span>
        </a>
      );
    }
    return <p>{msg.content}</p>;
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to access messages</h2>
        <a href="/login" className="btn-primary">Login Now</a>
      </div>
    );
  }

  const activeConvo = conversations.find((c) => c._id._id === activeChat);

  const filteredDoctors = doctors.filter((d) =>
    d.user.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialization.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: '650px' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50/50">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Chats</h2>
              <button onClick={() => setShowNewChat(true)} className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors" title="New conversation">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>

            {showNewChat && (
              <div className="p-3 border-b border-blue-100 bg-blue-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary-700">New Conversation</span>
                  <button onClick={() => setShowNewChat(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <input type="text" value={doctorSearch} onChange={(e) => setDoctorSearch(e.target.value)} placeholder="Search doctors..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                  {filteredDoctors.map((doc) => (
                    <button key={doc._id} onClick={() => openChat(doc.user._id, doc.user.name)}
                      className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-white text-left transition-colors">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-700 font-medium text-xs">{doc.user.name.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.user.name}</p>
                        <p className="text-xs text-gray-400">{doc.specialization}</p>
                      </div>
                    </button>
                  ))}
                  {filteredDoctors.length === 0 && <p className="text-xs text-gray-400 p-2">No doctors found</p>}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center"><div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div></div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-gray-400 text-sm">No conversations yet</p>
                  <button onClick={() => setShowNewChat(true)} className="text-primary-600 text-sm mt-1 hover:underline">Start a new chat</button>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button key={conv._id._id} onClick={() => openChat(conv._id._id, conv._id.name)}
                    className={`w-full flex items-center space-x-3 p-4 hover:bg-white transition-colors text-left border-b border-gray-100 ${activeChat === conv._id._id ? 'bg-white border-l-3 border-l-primary-600' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-sm">{conv._id.name?.charAt(0)}</span>
                      </div>
                      {onlineUsers.includes(conv._id._id) && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-gray-900 truncate">{conv._id.name}</p>
                        {conv.lastMessage && <span className="text-xs text-gray-400">{new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage?.content || 'No messages'}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{conv.unreadCount}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold">{(activeConvo?._id.name || activeChatName)?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{activeConvo?._id.name || activeChatName}</p>
                      <p className="text-xs text-gray-500">
                        {typingUser === activeChat ? (
                          <span className="text-primary-600">typing...</span>
                        ) : onlineUsers.includes(activeChat) ? (
                          <span className="text-green-600">● Online</span>
                        ) : (
                          <span className="text-gray-400">● Offline</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={startVideoCall} className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors" title="Video Call">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <a href={`/doctors/${activeChat}`} className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors" title="View Profile">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </a>
                  </div>
                </div>

                {/* Video Call Banner */}
                {showVideoCall && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-green-800">Video Call with {activeConvo?._id.name || activeChatName}</p>
                        <p className="text-sm text-green-600">Connected • In progress</p>
                      </div>
                    </div>
                    <button onClick={endVideoCall} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                      End Call
                    </button>
                  </div>
                )}

                {/* Incoming Call Banner */}
                {videoCallIncoming && !showVideoCall && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-800">Incoming Call from {callerName}</p>
                        <p className="text-sm text-blue-600">Wants to start a video call</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => { setShowVideoCall(true); setVideoCallIncoming(false); }} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600">Accept</button>
                      <button onClick={() => setVideoCallIncoming(false)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600">Decline</button>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">👋</span>
                      </div>
                      <p className="text-gray-500 text-sm">Start the conversation! Say hello.</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg._id} className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[300px] rounded-2xl text-sm overflow-hidden ${msg.sender._id === user.id ? 'bg-primary-600 text-white' : 'bg-white text-gray-900 border border-gray-100 shadow-sm'}`}>
                        {(msg.messageType === 'image' || msg.messageType === 'video' || msg.messageType === 'file') ? (
                          <div className="p-1">
                            {renderMessageContent(msg)}
                          </div>
                        ) : (
                          <div className="px-4 py-2.5">
                            {renderMessageContent(msg)}
                          </div>
                        )}
                        <div className={`px-4 pb-2 pt-0 ${msg.sender._id === user.id ? 'text-primary-200' : 'text-gray-400'}`}>
                          <p className="text-[10px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {typingUser === activeChat && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <form onSubmit={sendMessage} className="flex items-center space-x-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 flex-shrink-0" title="Attach file">
                      {uploading ? (
                        <div className="animate-spin w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      )}
                    </button>
                    <input type="text" value={newMessage} onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                      placeholder="Type a message..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm" />
                    <button type="submit" disabled={!newMessage.trim()}
                      className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50/30">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💬</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">Your Messages</h3>
                  <p className="text-gray-400 text-sm mb-4 max-w-xs mx-auto">Select a conversation or start a new chat with a doctor</p>
                  <button onClick={() => setShowNewChat(true)} className="btn-primary text-sm">
                    Start New Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}