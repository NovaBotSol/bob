import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { collection, addDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function CommentsSection({ tokenAddress }) {
  const { publicKey } = useWallet();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  // Load comments
  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      orderBy('timestamp', 'desc'),
      where('tokenAddress', '==', tokenAddress)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return () => unsubscribe();
  }, [tokenAddress]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!publicKey || !newComment.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        tokenAddress,
        comment: newComment.trim(),
        author: publicKey.toString(),
        timestamp: new Date()
      });
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <form onSubmit={submitComment} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment..."
          className="w-full p-2 border rounded"
          rows="3"
          required
        />
        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Post Comment
        </button>
      </form>

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="p-3 bg-gray-50 rounded">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-mono text-gray-600">
                {comment.author.slice(0, 6)}...{comment.author.slice(-4)}
              </span>
              <span className="text-gray-500">
                {new Date(comment.timestamp?.toDate()).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-800">{comment.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}