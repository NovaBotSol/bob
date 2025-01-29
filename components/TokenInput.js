import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getTokenData } from '../lib/solana'; // Make sure this path is correct

export default function TokenInput({ onAddToken }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const { connected } = useWallet();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    
    try {
      setLoading(true);
      // Fetch token data before submission
      const tokenData = await getTokenData(address.trim());
      await onAddToken(tokenData);
      setAddress('');
    } catch (error) {
      console.error('Error adding token:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Enter token address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={!connected || loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Enter'}
        </button>
      </form>
    </div>
  );
}