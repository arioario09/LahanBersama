import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, User, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt: any;
  participantNames?: { [uid: string]: string };
}

export default function ChatList() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      setChats(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-bg-gray pb-24">
      <header className="p-6 bg-white border-b border-light-gray sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-black text-navy tracking-tight">Pesan</h1>
        <div className="mt-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-gray" />
          <input 
            type="text" 
            placeholder="Cari percakapan..." 
            className="w-full bg-bg-gray rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
        </div>
      </header>

      <div className="p-4 space-y-2">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="h-8 w-8 border-4 border-t-[#00B0A0] border-gray-100 rounded-full animate-spin"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-12 text-center text-blue-gray">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="font-bold text-navy">Belum ada pesan</p>
            <p className="text-sm mt-1">Mulailah bertanya pada petani untuk informasi lebih lanjut.</p>
          </div>
        ) : (
          chats.map((chat) => {
            const otherParticipantUid = chat.participants.find(p => p !== user?.uid);
            return (
              <motion.div 
                key={chat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="bg-white p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors border border-light-gray/50 shadow-sm group"
              >
                <div className="h-14 w-14 bg-bg-gray rounded-full flex items-center justify-center shrink-0 border border-light-gray">
                   <User className="h-6 w-6 text-blue-gray" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-navy truncate group-hover:text-teal transition-colors">
                      {otherParticipantUid === `demo-petani` ? 'Petani Demo' : otherParticipantUid === `demo-investor` ? 'Investor Demo' : 'Pengguna LahanBersama'}
                    </h4>
                    <span className="text-[10px] text-blue-gray font-medium">
                      {chat.updatedAt?.toDate ? chat.updatedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-blue-gray truncate font-medium">
                    {chat.lastMessage || 'Mulai percakapan...'}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-light-gray group-hover:text-teal transition-all" />
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
