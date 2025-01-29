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
      {/* Enhanced Header Section */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-end items-center h-16">
            <WalletButton />
          </nav>
          
          {/* Improved Hero Section */}
          <div className="max-w-3xl mx-auto text-center py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              BOB - Bull or Bear?
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Welcome to the Solana token voting platform where the community decides! 
              Submit your favorite Solana tokens and users vote whether they are a "Bull" or "Bear". 
              Connect your wallet to upload or vote, and see what the community thinks about the latest tokens.
            </p>

            {/* Refined Token Input Container */}
            <div className="max-w-2xl mx-auto bg-gray-50 p-6 rounded-xl border border-gray-200">
              <TokenInput onAddToken={handleAddToken} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            )}
            
            {hasMore && !loading && (
              <div className="flex justify-center pt-8">
                <button 
                  onClick={loadMoreTokens}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                >
                  Load More Tokens
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}