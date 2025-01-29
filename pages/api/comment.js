import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { tokenAddress, content, walletAddress } = req.body;
      
      const docRef = await addDoc(collection(db, 'comments'), {
        tokenAddress,
        content,
        walletAddress,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({ id: docRef.id });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  } else if (req.method === 'GET') {
    try {
      const { tokenAddress } = req.query;
      
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('tokenAddress', '==', tokenAddress),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const comments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.status(200).json(comments);
    } catch (error) {
      console.error('Error getting comments:', error);
      res.status(500).json({ error: 'Failed to get comments' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
