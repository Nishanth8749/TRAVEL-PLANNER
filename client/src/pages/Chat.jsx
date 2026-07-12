import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { chatAPI, authAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  FaPaperPlane, FaSearch, FaChevronLeft, FaCircle,
  FaComments
} from 'react-icons/fa';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userId) {
      loadConversation(parseInt(userId));
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (id) => {
    try {
      const [messagesRes] = await Promise.all([
        chatAPI.getMessages(id),
      ]);
      setMessages(messagesRes.data);
      const conv = conversations.find(c => c.contact_id === id);
      if (conv) {
        setSelectedUser({ id: conv.contact_id, name: conv.contact_name, avatar: conv.contact_avatar });
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const response = await chatAPI.sendMessage({
        receiver_id: selectedUser.id,
        content: newMessage.trim()
      });
      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(c =>
    c.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container bg-gray-50 dark:bg-dark-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-8rem)]">
        <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-md overflow-hidden h-full flex">
          {/* Conversations Sidebar */}
          <div className={`w-full sm:w-80 border-r dark:border-gray-700 flex flex-col ${selectedUser ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Messages</h2>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-dark-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.contact_id}
                    onClick={() => {
                      navigate(`/chat/${conv.contact_id}`);
                      setSelectedUser({ id: conv.contact_id, name: conv.contact_name, avatar: conv.contact_avatar });
                    }}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors text-left ${
                      selectedUser?.id === conv.contact_id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={conv.contact_avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                        alt={conv.contact_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{conv.contact_name}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs truncate">{conv.last_message}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden sm:flex' : ''}`}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b dark:border-gray-700">
                  <button
                    onClick={() => {
                      navigate('/chat');
                      setSelectedUser(null);
                    }}
                    className="sm:hidden p-2 text-gray-500"
                  >
                    <FaChevronLeft />
                  </button>
                  <img
                    src={selectedUser.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</p>
                    <p className="text-xs text-green-500 flex items-center gap-1"><FaCircle className="text-[8px]" /> Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                          msg.sender_id === currentUser?.id
                            ? 'bg-primary-600 text-white rounded-br-md'
                            : 'bg-gray-100 dark:bg-dark-200 text-gray-900 dark:text-white rounded-bl-md'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.sender_id === currentUser?.id ? 'text-primary-200' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t dark:border-gray-700 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-5 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaComments className="text-3xl text-primary-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your Messages</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm">Select a conversation to start chatting with your travel guides and fellow travelers</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
