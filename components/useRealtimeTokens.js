import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useRealtimeTokens() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // First, let's check what's in the collection directly
    async function checkCollection() {
      const querySnapshot = await getDocs(collection(db, "tokens"));
      console.log("Direct collection check:", querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    }
    checkCollection();

    try {
      const q = query(
        collection(db, 'tokens')
      );

      console.log("Setting up listener");
      const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          try {
            console.log("Snapshot received:", snapshot.docs.length, "documents");
            const updatedTokens = snapshot.docs.map(doc => {
              console.log("Processing doc:", doc.id);
              return {
                id: doc.id,
                ...doc.data(),
                address: doc.id
              };
            });
            console.log("Updated tokens:", updatedTokens);
            setTokens(updatedTokens);
            setError(null);
          } catch (err) {
            console.error("Error in snapshot processing:", err);
            setError('Error processing token data');
          }
          setLoading(false);
        },
        (err) => {
          console.error("Snapshot error:", err);
          setError('Error connecting to database');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Setup error:", err);
      setError('Failed to set up database connection');
      setLoading(false);
    }
  }, []);

  return { tokens, loading, error };
}