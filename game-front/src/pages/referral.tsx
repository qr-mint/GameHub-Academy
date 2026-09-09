import { getPartners, partnerMint, getNFTsByNetwork } from '@/api/game/partners';
import { ConnectContext, ConnectInterface } from '@/components/Connect/provider';
import { PaymentProccesing } from '@/components/PaymentProccesing';
import { formatAddress } from '@/helpers/addressFormatter';
import { useOrderStatusPolling } from '@/hooks/useOrderStatusPolling';
import { useGameStore } from '@/store/game';
import { useSettingsStore } from '@/store/settings/settings';
import { useWalletStore } from '@/store/wallet';
import { copyToClipboard } from '@/utils/copyToClipboard';
import { Award, Crown, Sparkles, Star, Trophy, Users } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export function ReferralPage ({
	t,
}: {
  t: (key: string) => string,
}) {
	const { setConnectWallet } = useSettingsStore();
	const { chain } = useWalletStore();
	const [ order, setOrder ] = useState<any>({});
	const [ nfts, setNFTs ] = useState<any>([]);
	const connectors = useContext<ConnectInterface>(ConnectContext);
	const { data } = useGameStore();
	const [ copied, setCopied ] = useState(false);
	const [ referrals, setReferrals ] = useState(0);
  const isTMA = !!window.Telegram?.WebApp?.initDataUnsafe?.user;

	useEffect(() => {
		const loadData = async () => {
			try {
				const partners = await getPartners();
				setReferrals(partners);
				const nfts = await getNFTsByNetwork();
				if (nfts) {
					setNFTs(nfts);
				}
			} catch (err) {
				toast.error((err as any).message);
			}
		};
		loadData();
	}, []);
  let connectorKey = [ 'ancient', 'kaia', 'core', 'flow', 'sei', 'cosmos', 'botchain' ].includes(chain) ? 'evm' : (chain || 'ton');

	const handleOrderConfirmed = async () => {
		try {
			toast.success(t('nft.image.success'));
			await partnerMint(
				{ order_id: order.order_id, address: connectors[connectorKey].address, network: order.network },
				connectors[connectorKey].access_token
			);
			const nfts = await getNFTsByNetwork();
			setNFTs(nfts);
		} catch (err) {
			console.log(err);
			toast.error((err as any).message);
		} finally {
			setOrder({});
		}
	};
  
	const handleOrderError = async (error: any) => {
		toast.error((error as any).message);
	};
  
	useOrderStatusPolling(order.game_order_id,
		handleOrderConfirmed,
		handleOrderError,
	);

	const url = !window.Telegram?.WebApp?.initData ? `https://game.qr-mint.net?code=${data.code}` : `https://t.me/${import.meta.env.VITE_BOT_USERNAME}/app?startapp=${data.code}`;
	const handleCopy = async () => {
		try {
			await copyToClipboard(url);
			toast.success('Copied successfully');
			setCopied(true);
		} catch (err) {
			toast.error((err as any).message);
		}
	};

	const handleMint = async (network: string) => {
		if (!connectors[connectorKey].connected && !connectors[connectorKey].access_token) {
			if (network === "ton") {
				await connectors.ton.connect();
				return;
			} else {
				setConnectWallet(true);
				return;
			}
		}
		try {  
			
			const data = await connectors[connectorKey].sendTransaction({
				amount: import.meta.env.MODE === 'dev' ? 0.01 : 50,
				name: 'Partner NFT',
				token: network,
				type: 'mint_nft',
				network: network,
			});
      
			setOrder({ order_id: data.data.order_id, game_order_id: data.gameTransaction.id, network });
		} catch (err) {
			toast.error((err as any).message);
		}
	};

	const hasReferralNFT = nfts.some((nft: any) => nft.chain === "ton");
	const chainNFTs = [
    { id: "ton", name: "TON Network", symbol: "GRAM", price: 50, color: "cyan" },
    { id: "botchain", name: "BOTChain", symbol: "BOT", price: 5, color: "yellow" },
    // { id: "SOLANA", name: "Solana", symbol: "SOL", price: 3, income: "20% билетов + 5% турниров", color: "violet" },
	];

	const renderMintPartnerNFt = () => {
		if (isTMA) {
			return !hasReferralNFT ? (
						<div>
							<div className="bg-black/20 rounded-lg p-3 mb-3 space-y-2 text-sm">
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-yellow-400"></div>
									<p className="text-white">
										<span className="text-yellow-300 font-bold">0%</span>{t('partners.earn1')}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-yellow-400"></div>
									<p className="text-white">
										<span className="text-yellow-300 font-bold">5%</span>{t('partners.earn2')}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-2 h-2 rounded-full bg-yellow-400"></div>
									<p className="text-white">
										{t('partners.earnToNFT')} <span className="text-yellow-300 font-bold">NFT</span>
									</p>
								</div>
							</div>
							<button
								onClick={() => handleMint('ton')}
								className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
							>
								<Sparkles className="w-5 h-5" />
								{t('partners.mintButton')}
							</button>
						</div>
					) : (
						<div className="text-center">
							<div className="bg-green-500/20 border border-green-400/50 rounded-lg p-3 mb-2">
								<div className="flex items-center justify-center gap-2 text-green-300 font-bold">
									<Trophy className="w-5 h-5" />
									{t('partners.minted')}
								</div>
							</div>
							<div className="bg-black/20 rounded-lg p-3 space-y-2 text-sm">
								<p className="text-white/80 text-center">{t('partners.earnToNFT')}:</p>
								<div className="bg-amber-500/20 rounded px-3 py-2">
									<p className="text-white-300 font-mono text-xs break-all">
										{connectors[connectorKey].connected ? formatAddress(connectors[connectorKey].address) : 'Connect'}
									</p>
								</div>
							</div>
						</div>
			);
		}
		return (
			<div className="space-y-3">
        {chainNFTs.map((chain) => {
          const minted = nfts.find((nft: any) => nft.chain === chain.id)
          const loading = order.network === chain.id
          return (
            <div key={chain.id} className="rounded-xl border border-white/15 bg-white/5 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-black/30 flex items-center justify-center text-yellow-300 font-bold text-xs">
                    {chain.symbol}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold truncate">{chain.name}</p>
                    <p className="text-amber-200 text-xs">{t('partners.connectors.income')}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {minted ? (
                    <span className="text-green-300 font-bold text-sm">{t('partners.connectors.minted')}</span>
                  ) : (
                    <span className="text-yellow-300 font-bold text-sm">{chain.price} {chain.symbol}</span>
                  )}
                </div>
              </div>
              {minted ? (
                <div className="mt-3 rounded-lg bg-green-500/10 border border-green-400/30 px-3 py-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-green-300">{t('partners.connectors.description')}</span>
                    {/* <span className="text-white/60">Доход: 0.0 {chain.symbol}</span> */}
                  </div>
                  <p className="text-white/50 text-[11px] mt-1">{t('partners.connectors.wallet')}: {connectors[connectorKey].connected ? `${chain.symbol} wallet connected` : t('partners.connectors.connect')}</p>
                </div>
              ) : (
                <button
                  onClick={() => handleMint(chain.id)}
                  disabled={!!order.network}
                  className="mt-3 w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold py-2.5 px-4 rounded-lg hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  <Sparkles className="w-4 h-4" />
                  {loading ? t('partners.connectors.minting') : t('partners.connectors.mintButton', { coin: chain.symbol, price: chain.price })}
                </button>
              )}
            </div>
          )
        })}
      </div>
		);
	}
	return (
		<div className="flex-1 max-w-2xl mx-auto w-full">
			{order.game_order_id && <PaymentProccesing t={t} />}
			<div className="space-y-4 pb-24">
				<div className="text-center mb-6">
					<div className="flex items-center justify-center gap-2 mb-2">
						<Users className="w-6 h-6 text-white-400" />
						<h2 className="text-2xl font-bold text-white">{t('partners.title')}</h2>
					</div>
					<p className="text-white-300 text-sm">{t('partners.subtitle')}</p>
				</div>

				<div className="text-center bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-4">
					<div className="text-4xl font-bold text-white mb-1">{referrals}</div>
					<p className="text-white-300 text-sm mt-1">{t('partners.frindsInvited')}</p>
				</div>

				<div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 mb-4 border-2 border-yellow-400/50">
					<div className="flex items-start gap-3 mb-3">
						<div className="bg-yellow-400/20 rounded-lg p-2">
							<Award className="w-6 h-6 text-yellow-300" />
						</div>
						<div className="flex-1">
							<h3 className="text-yellow-300 font-bold text-lg mb-1">{t('partners.partnerNFT.title')}</h3>
							<p className="text-white/80 text-sm">{t('partners.partnerNFT.subtitle')}</p>
						</div>
					</div>

					<div className="rounded-xl p-6 my-4 border mx-auto">
						<p className="text-white font-semibold text-sm">{t('partners.yourReferralLink')}:</p>
						<div className="bg-white/5 border border-white/20 rounded-lg p-3 flex items-center justify-between gap-2 mt-2">
							<code className="text-white-200 text-xs flex-1 truncate">
								{url}
							</code>
							<button
								onClick={handleCopy}
								className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
							>
								{copied ? t('partners.copied') : t('partners.copy')}
							</button>
						</div>
					</div>

				{renderMintPartnerNFt()}
				</div>

				<div className="bg-gradient-to-br from-amber-500/20 to-amber-700/20 backdrop-blur-md rounded-xl p-6 border border-amber-400/30">
					<h3 className="text-white font-bold text-lg mb-4 text-center">{t('partners.rewardForInvited.title')}</h3>
					<div className="space-y-3">
						{/* 1-й реферал */}
						<div
							className={`bg-white/5 rounded-lg p-3 border ${referrals >= 1 ? 'border-green-400/50 bg-green-500/10' : 'border-white/10'}`}
						>
							<div className="flex items-center justify-between">
								<span className="text-amber-200 font-semibold">{t('partners.rewardForInvited.info1.need')}</span>
								<span className="text-yellow-300 font-bold text-sm">{t('partners.rewardForInvited.info1.reward')}</span>
							</div>
						</div>

						{/* 3-й реферал */}
						<div
							className={`bg-white/5 rounded-lg p-3 border ${referrals >= 3 ? 'border-green-400/50 bg-green-500/10' : 'border-white/10'}`}
						>
							<div className="flex items-center justify-between">
								<span className="text-amber-200 font-semibold">{t('partners.rewardForInvited.info2.need')}</span>
								<span className="text-yellow-300 font-bold text-sm">{t('partners.rewardForInvited.info2.reward')}</span>
							</div>
						</div>

						{/* 5-й реферал */}
						<div
							className={`bg-white/5 rounded-lg p-3 border ${referrals >= 5 ? 'border-green-400/50 bg-green-500/10' : 'border-white/10'}`}
						>
							<div className="flex items-center justify-between">
								<span className="text-amber-200 font-semibold">{t('partners.rewardForInvited.info3.need')}</span>
								<span className="text-yellow-300 font-bold text-sm">{t('partners.rewardForInvited.info3.reward')}</span>
							</div>
						</div>

						{/* 10-й реферал */}
						<div
							className={`bg-white/5 rounded-lg p-3 border ${referrals >= 10 ? 'border-blue-400/50 bg-blue-500/10' : 'border-white/10'}`}
						>
							<div className="flex flex-col gap-1">
								<div className="flex items-center justify-between">
									<span className="text-amber-200 font-semibold">{t('partners.rewardForInvited.info4.need')}</span>
									<span className="text-yellow-300 font-bold text-sm">{t('partners.rewardForInvited.info4.reward')}</span>
								</div>
								<div className="flex items-center gap-2">
									<Trophy className="w-4 h-4 text-blue-400" />
									<span className="text-blue-300 text-sm">{t('partners.rewardForInvited.info4.nft')}</span>
								</div>
							</div>
						</div>

						{/* 25-й реферал */}
						<div
							className={`bg-white/5 rounded-lg p-3 border ${referrals >= 25 ? 'border-amber-400/50 bg-amber-500/10' : 'border-white/10'}`}
						>
							<div className="flex flex-col gap-1">
								<div className="flex items-center justify-between">
									<span className="text-amber-200 font-semibold">{t('partners.rewardForInvited.info5.need')}</span>
									<span className="text-yellow-300 font-bold text-sm">{t('partners.rewardForInvited.info5.reward')}</span>
								</div>
								<div className="flex items-center gap-2">
									<Star className="w-4 h-4 text-white-400" />
									<span className="text-white-300 text-sm">{t('partners.rewardForInvited.info5.nft')}</span>
								</div>
							</div>
						</div>

						{/* 50-й реферал */}
						<div
							className={`bg-white/5 rounded-lg p-3 border ${referrals >= 50 ? 'border-yellow-400/50 bg-yellow-500/10' : 'border-white/10'}`}
						>
							<div className="flex flex-col gap-1">
								<div className="flex items-center justify-between">
									<span className="text-amber-200 font-semibold">{t('partners.rewardForInvited.info6.need')}</span>
									<span className="text-yellow-300 font-bold text-sm">{t('partners.rewardForInvited.info6.reward')}</span>
								</div>
								<div className="flex items-center gap-2">
									<Crown className="w-4 h-4 text-yellow-400" />
									<span className="text-yellow-300 text-sm">{t('partners.rewardForInvited.info6.nft')}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}