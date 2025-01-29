import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRealtimeTokens } from '../components/useRealtimeTokens';
import TokenList from '../components/TokenList';
import TokenInput from '../components/TokenInput';
import WalletButton from '../components/WalletButton';
import { addToken } from '../lib/firebase';
import toast from 'react-hot-toast';

export default function Home() {
  const { tokens, loading, error, hasMore, loadMoreTokens } = useRealtimeTokens(12);
  const [submitting, setSubmitting] = useState(false);
  const { connected, publicKey } = useWallet();

  async function handleAddToken(tokenData) {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet to add a token');
      return;
    }

    if (tokens.some(token => token.address === tokenData.address)) {
      toast.error('Token already exists in the list.');
      return;
    }

    setSubmitting(true);
    try {
      await addToken(tokenData, publicKey.toString());
      toast.success('Token added successfully!');
    } catch (error) {
      console.error('Error saving token:', error);
      toast.error(error.message || 'Error saving token');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-8 relative">
          {/* Wallet Button */}
          <div className="absolute right-8 top-6">
            <WalletButton />
          </div>
          
          {/* Title and Description */}
          <div className="max-w-4xl mx-auto pt-20 pb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
              BOB - Bull or Bear?
            </h1>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Welcome to the Solana token voting platform where the community decides! 
              Submit your favorite Solana tokens and users vote whether they are a "Bull" or "Bear". 
              Connect your wallet to upload or vote, and see what the community thinks about the latest tokens.
            </p>

            {/* Token Input Section */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                <TokenInput onAddToken={handleAddToken} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-8">
        {error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : (
          <>
            <TokenList 
              tokens={tokens} 
              loading={loading}
              hasMore={hasMore}
              onLoadMore={loadMoreTokens}
            />
            
            {loading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {hasMore && !loading && (
              <div className="flex justify-center py-4">
                <button 
                  onClick={loadMoreTokens}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}