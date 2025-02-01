import { useState } from 'react';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRealtimeTokens } from '../components/useRealtimeTokens';
import TokenList from '../components/TokenList';
import TokenInput from '../components/TokenInput';
import WalletButton from '../components/WalletButton';
import { addToken } from '../lib/firebase';
import toast from 'react-hot-toast';

function Home() {
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
      <Head>
        <title>BOB - Bullish or Bearish?</title>
        <link rel="shortcut icon" href="boblogo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="boblogo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="boblogo.png" />
        <link rel="apple-touch-icon" href="boblogo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="boblogo.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <header className="bg-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center h-16 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-gray-900 font-medium">Join the community</span>
              <a href="https://x.com/vote_bob_sol" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
            <WalletButton />
          </nav>
          
          <div className="max-w-3xl mx-auto text-center py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              BOB - <span className="text-green-600">Bullish</span> or <span className="text-red-600">Bearish</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Welcome to the first decentralized token voting platform where the community decides! 
              Submit your favorite Solana tokens and users vote whether they are "Bullish" or "Bearish". 
              Connect your wallet to upload or vote, and see what the community thinks about the latest tokens.
            </p>

            <div className="max-w-2xl mx-auto bg-gray-50 p-6 rounded-xl border border-gray-200">
              <TokenInput onAddToken={handleAddToken} />
            </div>
          </div>
        </div>
      </header>

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

export default Home;