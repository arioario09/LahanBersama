import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { Bell, X, CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'fund_received' | 'project_update';
  isRead: boolean;
  createdAt: any;
}

export default function NotificationListener() {
  const { user } = useAuth();
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const notif = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Notification;
        setActiveNotification(notif);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async () => {
    if (!activeNotification) return;
    try {
      await updateDoc(doc(db, 'notifications', activeNotification.id), {
        isRead: true
      });
      setActiveNotification(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {activeNotification && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 20, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-4 right-4 z-[9999] max-w-sm mx-auto"
        >
          <div className="bg-navy text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-start gap-4">
            <div className={`p-2 rounded-xl ${activeNotification.type === 'fund_received' ? 'bg-mint text-navy' : 'bg-blue-500 text-white'}`}>
              {activeNotification.type === 'fund_received' ? <Bell className="h-5 w-5" /> : <Info className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
               <h4 className="font-black text-sm tracking-tight">{activeNotification.title}</h4>
               <p className="text-xs text-blue-gray mt-1 leading-relaxed">{activeNotification.message}</p>
            </div>
            <button onClick={markAsRead} className="text-white/40 hover:text-white">
               <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
