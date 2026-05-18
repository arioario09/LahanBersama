import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function logActivity(userId: string, userName: string, action: string, details: string, targetId?: string) {
  try {
    await addDoc(collection(db, 'activityLogs'), {
      userId,
      userName,
      action,
      details,
      targetId: targetId || null,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
