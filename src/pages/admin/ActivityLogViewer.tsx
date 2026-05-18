import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { Clock, User, Info, AlertTriangle } from 'lucide-react';

export default function ActivityLogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'text-red-500';
    if (action.includes('UPDATE')) return 'text-blue-500';
    if (action.includes('RESET')) return 'text-orange-500';
    return 'text-teal';
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-light-gray overflow-hidden shadow-sm">
      <div className="p-8 border-b border-light-gray flex justify-between items-center bg-bg-gray/30">
        <h3 className="font-black text-navy tracking-tight">100 Aktivitas Terakhir</h3>
        <div className="flex items-center gap-2 text-blue-gray text-xs font-bold">
           <Clock className="h-4 w-4" /> Real-time
        </div>
      </div>
      
      <div className="divide-y divide-light-gray">
        {logs.map((log) => (
          <div key={log.id} className="p-6 hover:bg-bg-gray/30 transition-all flex items-start gap-4">
             <div className="bg-navy/5 p-3 rounded-2xl">
               <Info className={`h-5 w-5 ${getActionColor(log.action)}`} />
             </div>
             <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                   <p className="font-black text-navy text-sm uppercase tracking-widest">{log.action}</p>
                   <p className="text-[10px] font-black text-blue-gray">
                     {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString('id-ID') : 'Baru saja'}
                   </p>
                </div>
                <p className="text-blue-gray text-sm font-medium leading-relaxed">{log.details}</p>
                <div className="flex items-center gap-2 mt-2">
                   <div className="bg-bg-gray px-2 py-1 rounded-lg flex items-center gap-1">
                      <User className="h-3 w-3 text-blue-gray" />
                      <span className="text-[10px] font-bold text-navy">{log.userName}</span>
                   </div>
                   {log.targetId && (
                     <span className="text-[10px] text-blue-gray/50 font-mono">Target: {log.targetId}</span>
                   )}
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
