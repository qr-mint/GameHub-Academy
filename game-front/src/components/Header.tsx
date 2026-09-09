export const Header = () => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                {commonUser.username.charAt(0)}
              </div>
              <div>
                <p className="text-white font-semibold">{commonUser.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowRefillModal(true)}
                className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 hover:bg-white/30 transition-colors"
              >
                <Ticket className="w-4 h-4 text-blue-300" />
                <span className="text-white font-bold">{data?.tickets}</span>
              </button>
              
              {!connectors.ton.connected ? (
                <button 
                  onClick={() => connectors.ton.connect()}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 backdrop-blur-sm rounded-xl px-3 py-1.5 transition-all hover:scale-105 active:scale-95"
                >
                  <Wallet className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-sm">{t('wallet')}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5">
                  <Coins className="w-4 h-4 text-yellow-300" />
                  <span className="text-white font-bold">{new BigNumber(wallet.balance || 0).div(10 ** 9).toFixed(2)} TON</span>
                </div>
              )}
              
              <button 
                onClick={() => setShowSettings(true)}
                className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Settings className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
  );
}