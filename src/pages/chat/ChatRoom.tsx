import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ChevronLeft, Send, MoreVertical, Sprout, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  readStatus: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  projectId?: string;
  projectTitle?: string;
}

export default function ChatRoom() {
  const { chatId } = useParams();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [inputText, setInputText] = useState('');
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!chatId || !user) return;

    // Fetch Chat Meta
    const fetchChat = async () => {
      const chatSnap = await getDoc(doc(db, 'chats', chatId));
      if (chatSnap.exists()) {
        const chatData = chatSnap.data() as Chat;
        setChat({ id: chatSnap.id, ...chatData });
        
        if (chatData.projectId) {
          const projectSnap = await getDoc(doc(db, 'projects', chatData.projectId));
          if (projectSnap.exists()) {
            setProjectInfo(projectSnap.data());
          }
        }
      }
    };
    fetchChat();

    // Fetch Messages
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(docs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [chatId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !chatId || !user) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text,
        senderId: user.uid,
        timestamp: serverTimestamp(),
        readStatus: false
      });

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#DCDDDE]">
      {/* Header */}
      <header className="bg-[#122B4F] text-white p-4 flex items-center gap-4 sticky top-0 z-10 shadow-lg">
        <button onClick={() => navigate('/chat')} className="p-1 hover:bg-white/10 rounded-full">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-sm tracking-tight truncate uppercase">
            {chat?.participants.find(p => p !== user?.uid) === 'demo-petani' ? 'Petani Demo' : 'Investor Demo'}
          </h3>
          <p className="text-[9px] text-[#00B0A0] font-black uppercase tracking-widest">Online</p>
        </div>
        <button className="p-1 hover:bg-white/10 rounded-full">
          <MoreVertical className="h-5 w-5" />
        </button>
      </header>

      {/* Project Context Context */}
      <AnimatePresence>
        {projectInfo && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white px-4 py-2 flex items-center gap-3 border-b border-light-gray/50 shadow-sm relative z-0"
          >
            <div className="bg-mint/10 p-2 rounded-lg">
              <Sprout className="h-4 w-4 text-teal" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[8px] font-black text-blue-gray uppercase tracking-widest">Membahas tentang</p>
               <p className="text-xs font-bold text-navy truncate">{projectInfo.title}</p>
            </div>
            <div className="bg-bg-gray p-1.5 rounded-full text-blue-gray">
               <Info className="h-3 w-3" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.uid;
          const isPetani = profile?.role === 'petani';
          
          let bubbleBg = '';
          let textColor = '';
          
          if (isMe) {
            if (isPetani) {
              bubbleBg = 'bg-[#122B4F]';
              textColor = 'text-white';
            } else {
              bubbleBg = 'bg-[#DCDDDE]';
              textColor = 'text-navy';
            }
          } else {
            if (isPetani) {
              bubbleBg = 'bg-[#DCDDDE]';
              textColor = 'text-navy';
            } else {
              bubbleBg = 'bg-[#122B4F]';
              textColor = 'text-white';
            }
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`max-w-[75%] p-3 rounded-2xl shadow-sm relative ${bubbleBg} ${textColor} ${
                  isMe ? 'rounded-tr-none' : 'rounded-tl-none'
                }`}
              >
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                   <span className="text-[9px] font-bold">
                    {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                   </span>
                </div>
                {/* Bubble Tip */}
                <div className={`absolute top-0 w-2 h-2 ${
                  isMe ? `-right-1 ${bubbleBg}` : `-left-1 ${bubbleBg}`
                }`} style={{ clipPath: isMe ? 'polygon(0 0, 100% 0, 0 100%)' : 'polygon(0 0, 100% 100%, 100% 0)' }}></div>
              </motion.div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-bg-gray">
        <form 
          onSubmit={handleSendMessage}
          className="bg-white rounded-2xl flex items-center p-1.5 shadow-xl border border-light-gray"
        >
          <input 
            type="text" 
            placeholder="Tulis pesan..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2 text-sm font-medium focus:outline-none"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="bg-[#122B4F] text-white p-3 rounded-xl hover:bg-[#00B0A0] transition-all disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
