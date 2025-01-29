import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { recordVote } from "../lib/firebase";

export default function TokenCard({ token }) {
  const { name, symbol, image, address } = token;
  const [votes, setVotes] = useState({
    buyVotes: token.buyVotes || 0,
    byeVotes: token.byeVotes || 0
  });
  const [isVoting, setIsVoting] = useState(false);
  const { connected, publicKey } = useWallet();

  // Real-time vote updates
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "tokens", address), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setVotes({
          buyVotes: data.buyVotes || 0,
          byeVotes: data.byeVotes || 0
        });
      }
    }, (error) => {
      console.error("Error in vote listener:", error);
      toast.error("Error updating votes");
    });

    return () => unsubscribe();
  }, [address]);

  const handleVote = async (voteType) => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet to vote");
      return;
    }

    setIsVoting(true);
    try {
      await recordVote(address, voteType, publicKey.toString());
      toast.success("Vote recorded successfully!");
    } catch (error) {
      console.error("Error voting:", error);
      toast.error(error.message || "Failed to record vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div 
      style={{
        width: '180px',
        height: '220px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        border: '2px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        margin: '8px'
      }}
    >
      {/* Image Container */}
      <div style={{
        width: '48px',
        height: '48px',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
          src={image || "/placeholder.png"}
          alt={`${name || "Unknown Token"} logo`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Token Name - Fixed height with ellipsis */}
      <div style={{
        width: '100%',
        height: '40px',
        overflow: 'hidden',
        textAlign: 'center',
        marginBottom: '4px'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {name || "Unknown Token"}
        </h3>
        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {symbol || "???"}
        </p>
      </div>

      {/* Vote Counts */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: '12px',
        padding: '0 8px',
        fontSize: '12px'
      }}>
        <span style={{ color: '#22c55e', fontWeight: '600' }}>Buy: {votes.buyVotes}</span>
        <span style={{ color: '#ef4444', fontWeight: '600' }}>Bye: {votes.byeVotes}</span>
      </div>

      {/* Buttons Container */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: 'auto'
      }}>
        <button
          onClick={() => handleVote("buy")}
          disabled={isVoting || !connected}
          style={{
            backgroundColor: connected ? '#22c55e' : '#d1d5db',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: connected ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (connected) e.currentTarget.style.backgroundColor = '#16a34a'
          }}
          onMouseOut={(e) => {
            if (connected) e.currentTarget.style.backgroundColor = '#22c55e'
          }}
        >
          {isVoting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ThumbsUp className="w-3 h-3" />
          )}
          Bullish
        </button>
        <button
          onClick={() => handleVote("bye")}
          disabled={isVoting || !connected}
          style={{
            backgroundColor: connected ? '#ef4444' : '#d1d5db',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: connected ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (connected) e.currentTarget.style.backgroundColor = '#dc2626'
          }}
          onMouseOut={(e) => {
            if (connected) e.currentTarget.style.backgroundColor = '#ef4444'
          }}
        >
          {isVoting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ThumbsDown className="w-3 h-3" />
          )}
          Bearish
        </button>
      </div>
    </div>
  );
}