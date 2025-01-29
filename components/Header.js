import dynamic from 'next/dynamic';

const WalletButton = dynamic(() => import('./WalletButton'), {
  ssr: false,
  loading: () => <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
});

export default function Header() {
  return (
    <header className="bg-gray-50 border-b border-gray-200 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-2">
            <span className="text-gray-800 font-semibold text-lg">
              Join the BOB Community
            </span>
            <a
              href="https://x.com/vote_bob_sol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-500 transition-colors flex items-center"
            >
              <svg 
                className="w-5 h-5 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}