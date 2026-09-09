import { useContext, useEffect, useState } from 'react';
import { ArrowDownUp, Coins, Droplets, ExternalLink, Flame, Layers, Percent, TrendingUp, Wallet } from 'lucide-react';
import { AddLiquidityModal, BurnLpModal, SwapModal } from './Modal';
import { toast } from 'react-toastify';
import { DexInfo } from './types';
import { getDexPool, refund } from '@/api/game/tournaments';
import { ConnectContext } from '../Connect/provider';
import { useAuthStore } from '@/store/auth';
import { useOrderStatusPolling } from '@/hooks/useOrderStatusPolling';
import { PaymentProccesing } from '../PaymentProccesing';

function formatNum (n: number, digits = 2) {
	return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

export function DexSection ({ tournament, manage = false, t }: { tournament: any; manage?: boolean, t: (key: string) => string }) {
	const { access_token } = useAuthStore();
	const connectors = useContext(ConnectContext);
	const [ pool, setPool ] = useState<any>();
	const [ burnOpen, setBurnOpen ] = useState(false);
	const [ swapOpen, setSwapOpen ] = useState(false);
	const [ addOpen, setAddOpen ] = useState(false);
	const [ orderId, setOrderId ] = useState<any>();
	const loadPool = async () => {
		try {
			const data = await getDexPool(tournament.id, access_token as string);
			setPool(data);
		} catch (err) {
			toast.error((err as any).message);
		}
	};
	useEffect(() => {
		loadPool();
	}, []);

	const handleOrderError = async (error: any) => {
		toast.error((error as any).message);
		setOrderId(null);
	};
		
	const handleOrderConfirmed = async () => {
		try {
			await refund(tournament.id, orderId, connectors.ton.access_token);
			setOrderId(null);
		} catch (err) {
			toast.error((err as any).message);
		} finally {
			setOrderId(null);
		}
	};
	useOrderStatusPolling(orderId as any,
		handleOrderConfirmed,
		handleOrderError,
	);

	const handleRefund = async () => {
		if (!connectors.ton.connected) {
			await connectors.ton.connect();
			return;
		}
		try {
			const result = await connectors.ton.sendTransaction({
				token: 'ton',
				type: 'refund',
				network: 'ton',
			});
			setOrderId(result.data.order_id);		
		} catch (err) {
			toast.error((err as any).message);
		}
	};
	
	const dex: DexInfo = {
		lpBalance: pool?.lp_balance,
		dexName: pool?.dex.dex, // какой это DEX, напр. "STON.fi"
		pair: pool?.dex.name, // пара, напр. "TON / WHG"
		jettonSymbol: pool?.token.currency.toUpperCase(), // символ джеттона, напр. "WHG"
		lpInitial: pool?.add_liquidity?.data.lp_balance || 0, 
		tonInLiquidity: pool?.add_liquidity?.amount || 0, // сколько TON положено в ликвидность
		jettonInLiquidity: 0, // сколько джеттона в ликвидности
		apr: 0, // годовой процент (APR), %
		tvl: 0, // TVL пула в TON
	};

	const renderLink = () => {
		if (pool?.dex.dex === 'stonfi') {
			return (
				<a
					href={'https://ston.fi/'}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center justify-center gap-2 w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 font-semibold py-2.5 rounded-lg transition-all text-sm"
				>
					<ExternalLink className="w-4 h-4" />
					STON.fi
				</a>
			);
		}
	};

	
	return (
		<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 mb-4">
			{/* Заголовок */}
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
						<Layers className="w-5 h-5 text-white" />
					</div>
					<div>
						<p className="text-white font-bold text-sm">{t('tournaments.view.dexSection.title')}</p>
						<p className="text-white-300 text-xs">
							{pool?.dex.dex} · {pool?.dex.name}
						</p>
					</div>
				</div>
				<span className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold">
					{pool?.dex.dex}
				</span>
			</div>

			{/* Статы */}
			<div className="grid grid-cols-2 gap-3 mb-3">
				<div className="bg-white/5 rounded-xl p-3">
					<div className="flex items-center gap-1.5 mb-1">
						<Wallet className="w-3.5 h-3.5 text-white-300" />
						<p className="text-white-300 text-xs">{t('tournaments.view.dexSection.lpBalance')}</p>
					</div>
					<p className="text-white font-bold text-lg">{formatNum(pool?.lp_balance || 0, 4)}</p>
					<p className="text-white-400 text-xs mt-0.5">{t('tournaments.view.dexSection.lpInitial')} {formatNum(0, 4)}</p>
				</div>

				<div className="bg-white/5 rounded-xl p-3">
					<div className="flex items-center gap-1.5 mb-1">
						<Coins className="w-3.5 h-3.5 text-yellow-300" />
						<p className="text-white-300 text-xs">{t('tournaments.view.dexSection.tonInLiquidity')}</p>
					</div>
					<p className="text-white font-bold text-lg">{dex.tonInLiquidity}</p>
				</div>

				<div className="bg-green-500/10 border border-green-400/30 rounded-xl p-3">
					<div className="flex items-center gap-1.5 mb-1">
						<Percent className="w-3.5 h-3.5 text-green-300" />
						<p className="text-green-300 text-xs">{t('tournaments.view.dexSection.apr')}</p>
					</div>
					<p className="text-green-300 font-bold text-lg">{formatNum(pool?.dex.apr || 0, 1)}%</p>
				</div>

				<div className="bg-white/5 rounded-xl p-3">
					<div className="flex items-center gap-1.5 mb-1">
						<TrendingUp className="w-3.5 h-3.5 text-blue-300" />
						<p className="text-white-300 text-xs">{t('tournaments.view.dexSection.tvl')}</p>
					</div>
					<p className="text-white font-bold text-lg">{formatNum(pool?.dex.tvl || 0, 0)}</p>
					<p className="text-white-400 text-xs mt-0.5">TON</p>
				</div>
			</div>

			{/* Текущий счёт LP Token */}
			<div className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5 mb-3">
				<span className="text-white-300 text-xs">{t('tournaments.view.dexSection.currentLpBalance')}</span>
				<span className="text-white font-bold">{formatNum(pool?.lp_balance || 0, 4)} LP</span>
			</div>


			<div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2.5 mb-3">
				<div className="flex items-center gap-2">
					<span className="text-white-200 text-xs">Токен пары DEX</span>
					<span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-white-200 text-xs font-bold">
						{dex.jettonSymbol}
					</span>
				</div>
				<span className="text-white font-bold text-sm">
					{pool?.token.balance.human}
				</span>
			</div>

			{/* Кнопки управления — только для организатора */}
			
			{manage && (
				<>
					<div className="grid grid-cols-3 gap-2">
						<button
							onClick={() => setBurnOpen(true)}
							className="flex flex-col items-center gap-1 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-400/30 text-orange-200 font-semibold py-2.5 rounded-xl transition-all text-xs"
						>
							<Flame className="w-4 h-4" />
							{t('tournaments.view.dexSection.buttons.burnLP')}
						</button>
						<button
							onClick={() => setSwapOpen(true)}
							className="flex flex-col items-center gap-1 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/30 text-blue-200 font-semibold py-2.5 rounded-xl transition-all text-xs"
						>
							<ArrowDownUp className="w-4 h-4" />
            Swap
						</button>
						<button
							onClick={() => setAddOpen(true)}
							className="flex flex-col items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-white-100 font-semibold py-2.5 rounded-xl transition-all text-xs"
						>
							<Droplets className="w-4 h-4" />
							{t('tournaments.view.dexSection.buttons.inLuquidity')}
						</button>
					</div>	
					<div className="grid grid-cols-1 gap-2 mt-2">
						<button
							onClick={handleRefund}
							className="flex flex-col items-center w100 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-white-100 font-semibold py-2.5 rounded-xl transition-all text-xs"
						>
							{/* <Droplets className="w-4 h-4" /> */}
							{t('tournaments.view.dexSection.buttons.refund')}
						</button>
					</div>
				</>
			)}
			
			{pool && manage && (
				<>
					<BurnLpModal onDone={loadPool} t={t} tournamentId={tournament.id} isOpen={burnOpen} onClose={() => setBurnOpen(false)} dex={dex} />
					<SwapModal onDone={loadPool} t={t} balance={tournament.accounts.ton.balance} tournamentId={tournament.id} isOpen={swapOpen} onClose={() => setSwapOpen(false)} dex={dex} />
					<AddLiquidityModal onDone={loadPool} t={t} balance={tournament.accounts.ton.balance} tournamentId={tournament.id} isOpen={addOpen} onClose={() => setAddOpen(false)} dex={dex} />
				</>
			)}
			{renderLink()}
			{orderId && <PaymentProccesing t={t} />}
		</div>
	);
}
