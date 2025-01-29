import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useWalletAuth() {
  const { connected, publicKey, connecting } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleWalletConnection() {
      if (!connected || !publicKey) {
        setIsAuthenticated(false);
        setUserDoc(null);
        setLoading(false);
        return;
      }

      try {
        const walletAddress = publicKey.toString();
        const userRef = doc(db, 'users', walletAddress);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Create new user document if first time connecting
          await setDoc(userRef, {
            address: walletAddress,
            lastLogin: new Date(),
            tokenSubmitted: false,
            submissions: {},
            votes: {}
          });
        } else {
          // Update last login time
          await setDoc(userRef, {
            lastLogin: new Date()
          }, { merge: true });
        }

        setUserDoc(userSnap.exists() ? userSnap.data() : null);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error handling wallet authentication:', error);
        setIsAuthenticated(false);
      }

      setLoading(false);
    }

    handleWalletConnection();
  }, [connected, publicKey]);

  const checkCanSubmitToken = async () => {
    if (!isAuthenticated || !publicKey) return false;
    const walletAddress = publicKey.toString();
    const userRef = doc(db, 'users', walletAddress);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? !userSnap.data().tokenSubmitted : true;
  };

  const checkCanVote = async (tokenAddress) => {
    if (!isAuthenticated || !publicKey) return false;
    const walletAddress = publicKey.toString();
    const userRef = doc(db, 'users', walletAddress);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return true;
    const votes = userSnap.data().votes || {};
    return !votes[tokenAddress];
  };

  return {
    isAuthenticated,
    loading,
    userDoc,
    checkCanSubmitToken,
    checkCanVote,
    walletAddress: publicKey?.toString()
  };
}