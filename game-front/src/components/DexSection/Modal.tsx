import { useContext, useState } from 'react';
import { ArrowDownUp, Droplets, Flame, Info } from 'lucide-react';
import { ModalShell } from './ModalShell';
import { DexInfo } from './types';

import { burnLp, addLiquidity, swap } from '@/api/game/tournaments';
import { toast } from 'react-toastify';
import { ConnectContext } from '../Connect/provider';
import { useOrderStatusPolling } from '@/hooks/useOrderStatusPolling';

function formatNum (n: number, digits = 2) {
	return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

interface BurnLpProps {
	tournamentId: number,
	isOpen: boolean;
	onClose: () => void;
	dex: DexInfo,
	t: (key: string, options?: any) => string;
	onDone: (params: any) => void;
}

export function BurnLpModal ({ tournamentId, isOpen, onClose, dex, t, onDone }: BurnLpProps) {
	const [ amount, setAmount ] = useState('');
	const [ submitting, setSubmitting ] = useState(false);
	const [ done, setDone ] = useState(false);
	const [ order, setOrder ] = useState<any>({});

	const connectors = useContext(ConnectContext);

	const burnAmount = Number.parseFloat(amount) || 0;
	const lpAfter = Math.max(0, dex.lpBalance - burnAmount);

	// примерно сколько вернётся при сжигании (пропорционально доле в пуле)
	const share = dex.lpBalance > 0 ? burnAmount / dex.lpBalance : 0;
	const tonBack = share * dex.tonInLiquidity;
	const jettonBack = share * dex.jettonInLiquidity;
	const invalid = burnAmount <= 0 || burnAmount > dex.lpBalance;
	
	const handleOrderError = async (error: any) => {
		toast.error((error as any).message);
		setOrder({});
		setSubmitting(false);
	};
	
	const handleOrderConfirmed = async () => {
		try {
			const result = await burnLp(tournamentId, { amount: burnAmount, order_id: order.id }, connectors.ton.access_token);
			setDone(true);
			onDone(result);
		} catch (err) {
			toast.error((err as any).message);
		} finally {
			setSubmitting(false);
			setOrder({});
		}
	};
	useOrderStatusPolling(order.gameId as any,
		handleOrderConfirmed,
		handleOrderError,
	);

	const handleSubmit = async () => {
		if (!connectors.ton.connected) {
			await connectors.ton.connect();
			return;
		}
		if (invalid) return;
		setSubmitting(true);
		try {
			const result = await connectors.ton.sendTransaction({
				token: 'ton',
				type: 'burn_lp',
				network: 'ton',
			});
			setOrder({ id: result.data.order_id, gameId: result.gameTransaction.id });
		} catch (err) {
			toast.error((err as any).message);
		}
	};

	const handleClose = () => {
		if (order.id) return;
		setAmount('');
		onClose();
	};

	return (
		<ModalShell isOpen={isOpen} onClose={handleClose} title={t('tournaments.view.dexSection.burnLpModal.title')} icon={<Flame className="w-5 h-5" />}>
			<div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-3 mb-4 flex gap-2">
				<Info className="w-4 h-4 text-orange-300 flex-shrink-0 mt-0.5" />
				<p className="text-orange-100 text-xs leading-relaxed">

					{t('tournaments.view.dexSection.burnLpModal.description', { jettonSymbol: dex.jettonSymbol })}
				</p>
			</div>

			{/* Баланс LP: сколько было / сколько стало */}
			<div className="grid grid-cols-2 gap-3 mb-4">
				<div className="bg-white/10 rounded-xl p-3 text-center">
					<p className="text-white-300 text-xs mb-1">{t('tournaments.view.dexSection.burnLpModal.lpBalance')}</p>
					<p className="text-white font-bold text-lg">{formatNum(dex.lpBalance, 4)}</p>
				</div>
				<div className="bg-white/10 rounded-xl p-3 text-center">
					<p className="text-white-300 text-xs mb-1">{t('tournaments.view.dexSection.burnLpModal.becomeLp')}</p>
					<p className={`font-bold text-lg ${burnAmount > 0 ? 'text-orange-300' : 'text-white'}`}>
						{formatNum(lpAfter, 4)}
					</p>
				</div>
			</div>

			{done ? (
				<div className="bg-green-500/15 border border-green-400/30 rounded-xl p-4 text-center mb-4">
					<p className="text-green-300 font-semibold">{t('tournaments.view.dexSection.burnLpModal.successTitle')}</p>
					<p className="text-green-100 text-xs mt-1">
						{t('tournaments.view.dexSection.burnLpModal.successDescription', {
							burnAmount: formatNum(burnAmount, 4),
							tonBack: formatNum(tonBack, 4),
							jettonBack: formatNum(jettonBack, 2),
							jettonSymbol: dex.jettonSymbol
						})}
					</p>
				</div>
			) : (
				<>
					<label className="block text-white-200 text-sm font-semibold mb-2">
						{t('tournaments.view.dexSection.burnLpModal.howMuchBurnLp')}
					</label>
					<div className="relative mb-2">
						<input
							type="number"
							inputMode="decimal"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder:text-white-400/60 focus:outline-none focus:border-amber-400"
						/>
						<button
							onClick={() => setAmount(String(dex.lpBalance))}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white-300 hover:text-white bg-white/10 px-2 py-1 rounded-lg"
						>
              MAX
						</button>
					</div>
					{burnAmount > 0 && !invalid && (
						<p className="text-white-300 text-xs mb-3">
							{t('tournaments.view.dexSection.burnLpModal.refund')} ≈ {formatNum(tonBack, 4)} TON + {formatNum(jettonBack, 2)} {dex.jettonSymbol}
						</p>
					)}
					{invalid && burnAmount > 0 && (
						<p className="text-red-300 text-xs mb-3">{t('tournaments.view.dexSection.burnLpModal.enoughLPBalance')}</p>
					)}
					<button
						onClick={handleSubmit}
						disabled={order.id || invalid || submitting}
						className="w-full mt-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
					>
						<Flame className="w-5 h-5" />
						{submitting ? t('tournaments.view.dexSection.burnLpModal.sendRequest') : t('tournaments.view.dexSection.burnLpModal.burnLPTo')}
					</button>
				</>
			)}
		</ModalShell>
	);
}

interface SwapProps {
	tournamentId: number;
	balance: string;
	isOpen: boolean;
	onClose: () => void;
	dex: DexInfo;
	t: (key: string, options?: any) => string;
	onDone: (params: any) => void;
}

export function SwapModal ({ t, tournamentId, balance, isOpen, onClose, dex, onDone }: SwapProps) {
	const [ direction, setDirection ] = useState<'ton_to_jetton' | 'jetton_to_ton'>('ton_to_jetton');
	const [ amount, setAmount ] = useState('0');
	const [ submitting, setSubmitting ] = useState(false);
	const [ done, setDone ] = useState(false);
	const [ order, setOrder ] = useState<any>({});
	const connectors = useContext(ConnectContext);
	// курс по балансам пула (упрощённо, x*y=k не учитываем для демо)
	const rate = dex.tonInLiquidity > 0 ? dex.jettonInLiquidity / dex.tonInLiquidity : 0;
	const inAmount = Number.parseFloat(amount) || 0;
	const outAmount = direction === 'ton_to_jetton' ? inAmount * rate : rate > 0 ? inAmount / rate : 0;

	const fromLabel = direction === 'ton_to_jetton' ? 'TON' : dex.jettonSymbol;
	const toLabel = direction === 'ton_to_jetton' ? dex.jettonSymbol : 'TON';

	const handleOrderError = async (error: any) => {
		toast.error((error as any).message);
		setOrder({});
		setSubmitting(false);
	};
	
	const handleOrderConfirmed = async () => {
		try {
			const result = await swap(tournamentId, { order_id: order.id, amount: inAmount, from: fromLabel.toLowerCase(), to: toLabel.toLocaleLowerCase() }, connectors.ton.access_token);
			setDone(true);
			onDone(result);
		} catch (err) {
			toast.error((err as any).message);
		} finally {
			setSubmitting(false);
			setOrder({});
		}
	};
	useOrderStatusPolling(order.gameId as any,
		handleOrderConfirmed,
		handleOrderError,
	);

	const handleSubmit = async () => {
		if (!connectors.ton.connected) {
			await connectors.ton.connect();
			return;
		}
		if (inAmount <= 0) return;
		setSubmitting(true);
		try {
			const result = await connectors.ton.sendTransaction({
				token: 'ton',
				type: 'swap',
				network: 'ton',
			});
			setOrder({ id: result.data.order_id, gameId: result.gameTransaction.id });
		} catch (err) {
			toast.error((err as any).message);
		}
	};

	const handleClose = () => {
		if (order.id) return;
		setAmount('');
		setDone(false);
		onClose();
	};

	const flip = () => {
		setDirection((d) => (d === 'ton_to_jetton' ? 'jetton_to_ton' : 'ton_to_jetton'));
		setAmount('');
		setDone(false);
	};

	return (
		<ModalShell
			isOpen={isOpen}
			onClose={handleClose}
			title={t('tournaments.view.dexSection.swapModal.title')}
			icon={<ArrowDownUp className="w-5 h-5" />}>
			<div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-3 mb-4 flex gap-2">
				<Info className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
				<p
					className="text-blue-100 text-xs leading-relaxed"
					dangerouslySetInnerHTML={{
						__html: t('tournaments.view.dexSection.swapModal.description', {
							dexName: dex.dexName, jettonSymbol: dex.jettonSymbol,
						})
					}}
				/>
			</div>

			{done ? (
				<div className="bg-green-500/15 border border-green-400/30 rounded-xl p-4 text-center">
					<p className="text-green-300 font-semibold">{t('tournaments.view.dexSection.swapModal.sendSwapToPool')}</p>
					<p className="text-green-100 text-xs mt-1">
						{formatNum(inAmount, 4)} {fromLabel} → ≈ {formatNum(outAmount, 4)} {toLabel}
					</p>
				</div>
			) : (
				<>
					{/* Отдаёте */}
					<div className="bg-white/10 rounded-xl p-3 mb-2">
						<p className="text-white-300 text-xs mb-1">{t('tournaments.view.dexSection.swapModal.giveAway')}</p>
						<div className="flex items-center gap-2">
							<input
								type="number"
								inputMode="decimal"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="0.00"
								className="flex-1 bg-transparent text-white text-xl font-bold placeholder:text-white-400/60 focus:outline-none"
							/>
							<span className="px-3 py-1.5 rounded-lg bg-white/15 text-white font-bold text-sm">{fromLabel}</span>
						</div>
					</div>

					{/* Кнопка смены направления */}
					<div className="flex justify-center -my-1 relative z-10">
						<button
							onClick={flip}
							className="w-9 h-9 rounded-full bg-amber-600 border-4 border-amber-900 flex items-center justify-center hover:bg-amber-500 transition-colors"
						>
							<ArrowDownUp className="w-4 h-4 text-white" />
						</button>
					</div>

					{/* Получаете */}
					<div className="bg-white/10 rounded-xl p-3 mt-2 mb-3">
						<p className="text-white-300 text-xs mb-1">{t('tournaments.view.dexSection.swapModal.received')}</p>
						<div className="flex items-center gap-2">
							<span className="flex-1 text-white text-xl font-bold">{formatNum(outAmount, 4)}</span>
							<span className="px-3 py-1.5 rounded-lg bg-white/15 text-white font-bold text-sm">{toLabel}</span>
						</div>
					</div>

					<div className="flex items-center justify-between text-xs text-white-300 mb-4 px-1">
						<span>{t('tournaments.view.dexSection.swapModal.coursePool')}</span>
						<span className="text-white">
              1 TON ≈ {formatNum(rate, 4)} {dex.jettonSymbol}
						</span>
					</div>

					<button
						onClick={handleSubmit}
						disabled={order.id || inAmount <= 0 || submitting}
						className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
					>
						<ArrowDownUp className="w-5 h-5" />
						{submitting ? t('tournaments.view.dexSection.swapModal.swapToPool') : t('tournaments.view.dexSection.swapModal.doSwap') }
					</button>
				</>
			)}
		</ModalShell>
	);
}

interface AddLiquidityProps {
	balance: string;
	tournamentId: number;
	isOpen: boolean;
	onClose: () => void;
	dex: DexInfo;
	t: (key: string, options?: any) => string,
	onDone: (params: any) => void;
}

export function AddLiquidityModal ({ balance, tournamentId, isOpen, onClose, t, dex, onDone }: AddLiquidityProps) {
	const [ amount, setAmount ] = useState(balance);
	const [ submitting, setSubmitting ] = useState(false);
	const [ done, setDone ] = useState(false);
	const [ order, setOrder ] = useState<any>({});
	const connectors = useContext(ConnectContext);

	const tonAmount = Number.parseFloat(amount) || 0;
	// LP получают пропорционально вкладу в существующую ликвидность
	const lpPerTon = dex.tonInLiquidity > 0 ? dex.lpBalance / dex.tonInLiquidity : 1;
	const lpToReceive = tonAmount * lpPerTon;
	const jettonNeeded = dex.tonInLiquidity > 0 ? (tonAmount / dex.tonInLiquidity) * dex.jettonInLiquidity : 0;

	const handleOrderError = async (error: any) => {
		toast.error((error as any).message);
		setOrder({});
		setSubmitting(false);
	};
	
	const handleOrderConfirmed = async () => {
		try {
			const result = await addLiquidity(tournamentId, order.id, connectors.ton.access_token);
			setDone(true);
			onDone(result);
		} catch (err) {
			toast.error((err as any).message);
		} finally {
			setSubmitting(false);
			setOrder({});
		}
	};
	useOrderStatusPolling(order.gameId as any,
		handleOrderConfirmed,
		handleOrderError,
	);

	const handleSubmit = async () => {
		if (!connectors.ton.connected) {
			await connectors.ton.connect();
			return;
		}
		
		if (tonAmount <= 0) return;
		setSubmitting(true);
		try {
			const result = await connectors.ton.sendTransaction({
				token: 'ton',
				type: 'provide_lp',
				network: 'ton',
			});
			setOrder({ id: result.data.order_id, gameId: result.gameTransaction.id });
		} catch (err) {
			console.log(err);
			toast.error((err as any).message);
		}
	};

	const handleClose = () => {
		if (order.id) return;
		setDone(false);
		onClose();
	};

	return (
		<ModalShell
			isOpen={isOpen}
			onClose={handleClose}
			title={t('tournaments.view.dexSection.addLiquidityModal.title')}
			icon={<Droplets className="w-5 h-5" />}
		>
			{/* Текущая ликвидность + APR */}
			<div className="grid grid-cols-2 gap-3 mb-4">
				<div className="bg-white/10 rounded-xl p-3">
					<p className="text-white-300 text-xs mb-1">{t('tournaments.view.dexSection.addLiquidityModal.tonInLiquidity')}</p>
					<p className="text-white font-bold text-lg">{formatNum(dex.tonInLiquidity, 2)}</p>
				</div>
				<div className="bg-green-500/10 border border-green-400/30 rounded-xl p-3">
					<p className="text-green-300 text-xs mb-1">{t('tournaments.view.dexSection.addLiquidityModal.currentApr')}</p>
					<p className="text-green-300 font-bold text-lg">{formatNum(dex.apr, 1)}%</p>
				</div>
			</div>

			{done ? (
				<div className="bg-green-500/15 border border-green-400/30 rounded-xl p-4 text-center">
					<p className="text-green-300 font-semibold">{t('tournaments.view.dexSection.addLiquidityModal.lpAdded')}</p>
					<p className="text-green-100 text-xs mt-1">
						{t('tournaments.view.dexSection.addLiquidityModal.successDescription', {
							tonAmount: formatNum(tonAmount, 4),
							lpToReceive: formatNum(lpToReceive, 4)
						})}
					</p>
				</div>
			) : (
				<>
					<label className="block text-white-200 text-sm font-semibold mb-2">{t('tournaments.view.dexSection.addLiquidityModal.howManyTonToPut')}</label>
					<div className="relative mb-3">
						<input
							type="number"
							inputMode="decimal"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-lg font-semibold placeholder:text-white-400/60 focus:outline-none focus:border-amber-400"
						/>
						<span className="absolute right-4 top-1/2 -translate-y-1/2 text-white-300 font-bold text-sm">TON</span>
					</div>

					{tonAmount > 0 && (
						<div className="bg-white/5 rounded-xl p-3 mb-4 space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-white-300">{t('tournaments.view.dexSection.addLiquidityModal.itWillBeRequired', { jettonSymbol: dex.jettonSymbol })}</span>
								<span className="text-white font-semibold">
                  ≈ {formatNum(jettonNeeded, 2)} {dex.jettonSymbol}
								</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-white-300">{t('tournaments.view.dexSection.addLiquidityModal.receive')}</span>
								<span className="text-white-100 font-bold">≈ {formatNum(lpToReceive, 4)} LP Token</span>
							</div>
						</div>
					)}

					<button
						onClick={handleSubmit}
						disabled={order.id || tonAmount <= 0 || submitting}
						className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
					>
						<Droplets className="w-5 h-5" />
						{submitting ? t('tournaments.view.dexSection.addLiquidityModal.adding') : t('tournaments.view.dexSection.addLiquidityModal.putIntoLiquidity')}
					</button>
				</>
			)}
		</ModalShell>
	);
}