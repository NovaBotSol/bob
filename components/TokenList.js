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
    
    // Apply search filter first
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTokens = filteredTokens.filter((token) => 
        token.address?.toLowerCase().includes(query) ||
        token.name?.toLowerCase().includes(query) ||
        token.symbol?.toLowerCase().includes(query)
      );
    }
    
    // Then apply sort filter
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
      {/* Search and Filter Controls */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search CA or name"
              value={searchQuery}
              onChange={handleSearch}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentFilter("mostBuy")}
              className={`px-4 py-2 rounded-lg ${
                currentFilter === "mostBuy"
                  ? "bg-green-500 text-white"
                  : "bg-white border-2 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Most Buy Votes
            </button>
            <button
              onClick={() => setCurrentFilter("mostBye")}
              className={`px-4 py-2 rounded-lg ${
                currentFilter === "mostBye"
                  ? "bg-red-500 text-white"
                  : "bg-white border-2 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Most Bye Votes
            </button>
          </div>
        </div>
      </div>

      {/* Results info */}
      {isSearching && (
        <p className="text-gray-600 mb-4">
          Found {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''} 
          {searchQuery ? ` matching "${searchQuery}"` : ''}
        </p>
      )}

      {/* Token Grid */}
      {loading && tokens.length === 0 ? (
        <div className="flex justify-center py-4">
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
        <div className="text-center py-8">
          <p className="text-gray-500">
            {searchQuery 
              ? "No tokens found matching your search. Try a different search term."
              : "No tokens available."}
          </p>
        </div>
      )}
    </div>
  );
}