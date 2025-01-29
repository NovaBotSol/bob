import { useState } from "react";
import TokenCard from "./TokenCard";
import { Search } from "lucide-react";
import { useRealtimeTokens } from "./useRealtimeTokens";

export default function TokenList() {
  const { tokens, loading, error } = useRealtimeTokens();
  const [currentFilter, setCurrentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const getFilteredTokens = () => {
    let filteredTokens = [...tokens];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTokens = filteredTokens.filter((token) => 
        token.address?.toLowerCase().includes(query) ||
        token.name?.toLowerCase().includes(query) ||
        token.symbol?.toLowerCase().includes(query)
      );
    }
    
    switch (currentFilter) {
      case "mostBuy":
        return filteredTokens.sort((a, b) => (b.buyVotes || 0) - (a.buyVotes || 0));
      case "mostBye":
        return filteredTokens.sort((a, b) => (b.byeVotes || 0) - (a.byeVotes || 0));
      default:
        return filteredTokens;
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setIsSearching(e.target.value !== "");
  };

  const filteredTokens = getFilteredTokens();

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="w-full">
      {/* Enhanced Search and Filter Bar */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Improved Search Input */}
          <div className="w-full sm:max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tokens by address, name, or symbol"
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
              />
            </div>
          </div>
          
          {/* Refined Filter Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCurrentFilter("mostBuy")}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                currentFilter === "mostBuy"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Most Bullish
            </button>
            <button
              onClick={() => setCurrentFilter("mostBye")}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                currentFilter === "mostBye"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Most Bearish
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {isSearching && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 font-medium">
            {filteredTokens.length} result{filteredTokens.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Original Token Card Layout (Unchanged) */}
      {loading && tokens.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTokens.length > 0 ? (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center'
        }}>
          {filteredTokens.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery 
              ? "No matching tokens found. Try a different search."
              : "No tokens available. Be the first to submit one!"}
          </p>
        </div>
      )}
    </div>
  );
}