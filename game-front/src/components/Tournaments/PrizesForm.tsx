import type React from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import {
	Crown,
	Sparkles,
	Trophy,
	X,
	Zap,
	Image as ImageIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NftModal } from './NFTModal';
import { toast } from 'react-toastify';
import { getPoolPair } from '@/api/dex';

const COLORS = (t: (key: string) => string) => [
	{ name: t('tournaments.add.colors.blue'), value: 'from-blue-500 to-blue-700', bg: 'bg-blue-500' },
	{ name: t('tournaments.add.colors.violet'), value: 'from-amber-500 to-amber-700', bg: 'bg-amber-500' },
	{ name: t('tournaments.add.colors.green'), value: 'from-green-500 to-green-700', bg: 'bg-green-500' },
	{ name: t('tournaments.add.colors.red'), value: 'from-red-500 to-red-700', bg: 'bg-red-500' },
	{ name: t('tournaments.add.colors.orange'), value: 'from-yellow-500 to-orange-600', bg: 'bg-orange-500' },
	{ name: t('tournaments.add.colors.pink'), value: 'from-pink-500 to-amber-700', bg: 'bg-pink-500' },
];

function IconPreview ({ icon, size = 'w-6 h-6' }: { icon: string; size?: string }) {
	switch (icon) {
	case 'trophy': return <Trophy className={size} />;
	case 'zap': return <Zap className={size} />;
	case 'crown': return <Crown className={size} />;
	case 'star': return <Sparkles className={size} />;
	case 'sparkles': return <Sparkles className={size} />;
	case 'shield': return <Trophy className={size} />;
	default: return <Trophy className={size} />;
	}
}

interface PrizeFormProps {
  t: (e: string, params?: any) => string;
  watchAll: any;
  control: any;
  setValue: any;
  getValues: any;
	tokens: any[];
}

const DEX_LIST = [
	{ key: 'stonfi' as const, label: 'STON.fi', color: 'from-cyan-500 to-blue-600' },
	// { key: 'dedust' as const, label: 'DeDust', color: 'from-orange-500 to-red-600' },
];

export const PrizesForm = ({ t, control, watchAll, setValue, getValues, tokens }: PrizeFormProps) => {
	const [ pairs, setPairs ] = useState([]); 
	const { replace } = useFieldArray({ control, name: 'winners' });
	const [ nftModalOpen, setNftModalOpen ] = useState(false);
	const [ editingNftIndex, setEditingNftIndex ] = useState<number | null>(null);
	const entryType = watchAll.entryType;
	const selectedIcon = watchAll.icon;
	const selectedColor = watchAll.color;
	const selectedLevels = watchAll.selected_levels;
	const winnersCount = watchAll.winners_count;
	const winners = watchAll.winners;
	const network = watchAll.prize_network;
	const tokenVal = watchAll.token;
	const type = watchAll.type;
	const rewardSource = watchAll.reward_source;
	const dex = watchAll.dex;
  
	const updateWinnersCount = (count: number) => {
		setValue('winners_count', count);
		const newWinners: any[] = [];
		const basePercent = Math.floor(100 / count);
		let remaining = 100;
		for (let i = 0; i < count; i++) {
			const percent = i === count - 1 ? remaining : basePercent;
			remaining -= percent;
			newWinners.push({ place: i + 1, percent, nft: null });
		}
		replace(newWinners);
	};
  
	const getTotalPercent = () => winners.reduce((sum: any, w: any) => sum + w.percent, 0);
  
	const handleDrag = (index: number, e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
		const bar = (e.target as HTMLElement).closest('[data-bar]') as HTMLElement;
		if (!bar) return;
		const rect = bar.getBoundingClientRect();
		const handleMove = (clientX: number) => {
			const x = clientX - rect.left;
			const percent = Math.max(1, Math.min(100, Math.round((x / rect.width) * 100)));
			const current = getValues('winners');
			const updated = [...current];
			updated[index] = { ...updated[index], percent };
			setValue('winners', updated);
		};
		if ('touches' in e) {
			const touchHandler = (te: TouchEvent) => handleMove(te.touches[0].clientX);
			const endHandler = () => {
				document.removeEventListener('touchmove', touchHandler); document.removeEventListener('touchend', endHandler); 
			};
			document.addEventListener('touchmove', touchHandler);
			document.addEventListener('touchend', endHandler);
		} else {
			const mouseHandler = (me: MouseEvent) => handleMove(me.clientX);
			const endHandler = () => {
				document.removeEventListener('mousemove', mouseHandler); document.removeEventListener('mouseup', endHandler); 
			};
			document.addEventListener('mousemove', mouseHandler);
			document.addEventListener('mouseup', endHandler);
		}
	};

	useEffect(() => {
		const loadPair = async () => {
			try {
				const pairs = await getPoolPair(network, dex);
				setPairs(pairs);
			} catch (err) {
				toast.error((err as any).message);
			}
		};
		if (dex) {
			loadPair();
		}
	}, [ dex, network ]);
	const limit = type === 'race' ? 1 : 100;
	return (
		<div className="space-y-4">
			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<label className="block text-white font-semibold mb-1">{t('tournaments.add.prize.rewardSource.label')}</label>
				<p className="text-white-300 text-xs mb-3">{t('tournaments.add.prize.rewardSource.description')}</p>
				<Controller
					control={control}
					name="reward_source"
					rules={{
						required: true,
					}}
					render={({ field }) => (
						<div className="space-y-2">
							{([
								{ key: 'pool' as const, networks: ["ton", "botchain"], label: t('tournaments.add.prize.rewardSource.pool.label'), icon: <Trophy className="w-5 h-5" />, desc: t('tournaments.add.prize.rewardSource.pool.info') },
								{ key: 'dex' as const, networks: ["ton"], label: t('tournaments.add.prize.rewardSource.dex.label'), icon: <Zap className="w-5 h-5" />, desc: t('tournaments.add.prize.rewardSource.pool.info') },
								// { key: 'stake' as const, label: 'Стейкинг', icon: <Sparkles className="w-5 h-5" />, desc: 'Доход от стейкинга' },
							])
							.filter((item) => item.networks.includes(network))
							.map((r) => (
								<button
									key={r.key}
									type="button"
									onClick={() => {
										field.onChange(r.key);

									}}
									className={`w-full px-4 py-3 rounded-xl transition-all flex items-start gap-3 text-left ${
										field.value === r.key
											? 'bg-amber-600 text-white shadow-lg border-2 border-amber-400'
											: 'bg-white/10 text-white-200 hover:bg-white/20 border-2 border-transparent'
									}`}
								>
									<div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${field.value === r.key ? 'bg-white/20' : 'bg-white/10'}`}>
										{r.icon}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-sm">{r.label}</p>
										<p className={`text-xs mt-0.5 ${field.value === r.key ? 'text-white/80' : 'text-white-300'}`}>{r.desc}</p>
									</div>
								</button>
							))}
						</div>
					)}
				/>
			</div>
			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<label className="block text-white font-semibold mb-3">{t('tournaments.add.entry.network.label')}</label>
				<Controller
					control={control}
					name="prize_network"
					render={({ field }) => (
						<div className="grid grid-cols-3 gap-2">
							{([
								{ key: 'ton', label: 'TON' },
								{ key: 'botchain', label: 'BOTCHAIN' },
							]).map((b) => (
								<button
									key={b.key}
									type="button"
									onClick={() => {
										field.onChange(b.key);
										setValue('reward_source', 'pool');
									}}
									className={`px-3 py-3 rounded-xl font-medium text-sm transition-all ${
										field.value === b.key
											? 'bg-blue-600 text-white shadow-lg border-2 border-blue-400'
											: 'bg-white/10 text-white-200 hover:bg-white/20 border-2 border-transparent'
									}`}
								>
									{b.label}
								</button>
							))}
						</div>
					)}
				/>
			</div>
			{rewardSource === 'dex' && (
				<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 space-y-4">
					<div>
						<label className="block text-white font-semibold mb-2">{t('tournaments.add.prize.dex.label')}</label>
						<Controller
							control={control}
							name="dex"
							render={({ field }) => (
								<div className="grid grid-cols-2 gap-2">
									{DEX_LIST.map((d) => (
										<button
											key={d.key}
											type="button"
											onClick={() => {
												field.onChange(d.key); 
												setValue('dexPool', ''); 
											}}
											className={`p-3 rounded-xl transition-all text-left border-2 ${
												field.value === d.key ? 'border-amber-400 bg-white/15' : 'border-transparent bg-white/10 hover:bg-white/15'
											}`}
										>
											<div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${d.color} flex items-center justify-center mb-2`}>
												<Zap className="w-5 h-5 text-white" />
											</div>
											<p className="text-white font-semibold text-sm">{d.label}</p>
										</button>
									))}
								</div>
							)}
						/>
					</div>

					<div>
						<label className="block text-white font-semibold mb-2">{t('tournaments.add.prize.pair.label')}</label>
						<Controller
							control={control}
							name="dex_pair_id"
							render={({ field }) => (
								<div className="space-y-2">
									{pairs.map((p: any) => (
										<button
											key={p.id}
											type="button"
											onClick={() => field.onChange(p.id)}
											className={`w-full px-4 py-3 rounded-xl transition-all flex items-center justify-between border-2 ${
												field.value === p.id ? 'border-amber-400 bg-amber-600/30' : 'border-transparent bg-white/10 hover:bg-white/15'
											}`}
										>
											<div className="flex items-center gap-2">
												<div className="flex -space-x-2">
													<div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-amber-900" />
													<div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 border-2 border-amber-900" />
												</div>
												<span className="text-white font-semibold text-sm">{p.name}</span>
											</div>
											<div className="text-right">
												<p className="text-white text-xs">TVL {p.tvl}</p>
												<p className="text-green-400 text-xs font-semibold">APR {p.apr}</p>
											</div>
										</button>
									))}
								</div>
							)}
						/>
					</div>
				</div>
			)}

			{/* Stake selection */}
			{/* {rewardSource === 'stake' && (
				<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
					<label className="block text-white font-semibold mb-2">Токен для стейкинга</label>
					<Controller
						control={control}
						name="stakeToken"
						render={({ field }) => (
							<div className="space-y-2">
								{STAKE_TOKENS.map((s) => (
									<button
										key={s.token}
										type="button"
										onClick={() => {
											field.onChange(s.token); setValue('stakeApy', s.apy); 
										}}
										className={`w-full px-4 py-3 rounded-xl transition-all flex items-center justify-between border-2 ${
											field.value === s.token ? 'border-amber-400 bg-amber-600/30' : 'border-transparent bg-white/10 hover:bg-white/15'
										}`}
									>
										<div className="flex items-center gap-2">
											<div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
												<span className="text-white text-xs font-bold">{s.token[0]}</span>
											</div>
											<span className="text-white font-semibold text-sm">{s.token}</span>
										</div>
										<span className="text-green-400 text-sm font-semibold">APY {s.apy}</span>
									</button>
								))}
							</div>
						)}
					/>
				</div>
			)} */}
			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<label className="block text-white font-semibold mb-3">{t('tournaments.add.entry.token.label')}</label>
				<Controller
					control={control}
					name="prize_token"
					render={({ field }) => (
						<div className="grid grid-cols-3 gap-2">
							{tokens?.filter(token => token.network === watchAll.network).map((token: any) => (
								<button
									key={token.id}
									type="button"
									onClick={() => field.onChange(token.currency)}
									className={`px-3 py-3 rounded-xl font-medium text-sm transition-all ${
										field.value === token.currency
											? 'bg-yellow-600 text-white shadow-lg border-2 border-yellow-400'
											: 'bg-white/10 text-white-200 hover:bg-white/20 border-2 border-transparent'
									}`}
								>
									{token.name}
								</button>
							))}
						</div>
					)}
				/>
			</div>
			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<label className="block text-white font-semibold mb-2">
					{t('tournaments.add.prize.winners_count.label')}: {winnersCount}
				</label>
				<input
					type="range" min={1} max={limit} step={1} value={winnersCount}
					onChange={(e) => updateWinnersCount(Number(e.target.value))}
					className="w-full accent-amber-500"
				/>
				<div className="flex justify-between text-white-300 text-xs mt-1">
					<span>1</span><span>{limit}</span>
				</div>
			</div>

			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<div className="flex items-center justify-between mb-4">
					<label className="text-white font-semibold">{t('tournaments.add.prize.list.label')}</label>
					<span className={`text-sm font-bold ${getTotalPercent() === 100 ? 'text-green-400' : getTotalPercent() > 100 ? 'text-red-400' : 'text-yellow-400'}`}>
						{getTotalPercent()}%
					</span>
				</div>

				<div className="space-y-3 max-h-80 overflow-y-auto pr-1">
					{winners.slice(0, Math.min(winners.length, 20)).map((w: any, i: any) => (
						<div key={i} className="bg-white/5 rounded-lg p-3">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
										i === 0 ? 'bg-yellow-400 text-yellow-900' :
											i === 1 ? 'bg-gray-300 text-gray-800' :
												i === 2 ? 'bg-orange-400 text-orange-900' :
													'bg-white/20 text-white'
									}`}>
										{w.place}
									</span>
									<span className="text-white text-sm font-medium">
										{i === 0 ? t('tournaments.add.prize.list.place', { value: 1 }) : i === 1 ? t('tournaments.add.prize.list.place', { value: 2 }) : i === 2 ? t('tournaments.add.prize.list.place', { value: 3 }) : t('tournaments.add.prize.list.place', { value: 4 })}
									</span>
								</div>
								<span className="text-yellow-300 font-bold text-sm">{w.percent}%</span>
							</div>
							<div
								data-bar
								className="relative w-full h-8 bg-white/10 rounded-lg cursor-pointer overflow-hidden"
								onMouseDown={(e) => handleDrag(i, e)}
								onTouchStart={(e) => handleDrag(i, e)}
							>
								<div
									className={`absolute inset-y-0 left-0 rounded-lg transition-[width] duration-75 ${
										i === 0 ? 'bg-yellow-500/60' : i === 1 ? 'bg-gray-400/60' : i === 2 ? 'bg-orange-500/60' : 'bg-amber-500/60'
									}`}
									style={{ width: `${w.percent}%` }}
								/>
								<div
									className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-amber-400"
									style={{ left: `calc(${w.percent}% - 10px)` }}
								/>
							</div>

							{/* NFT Prize */}
							<div className="mt-2">
								{w.nft ? (
									<div
										onClick={() => {
											setEditingNftIndex(i); setNftModalOpen(true); 
										}}
										className="flex items-center gap-2 bg-amber-600/30 border border-amber-400/50 rounded-lg p-2 cursor-pointer hover:bg-amber-600/50 transition-all"
									>
										{w.nft.image && (
											<img src={w.nft.image} alt={w.nft.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
										)}
										<div className="flex-1 min-w-0">
											<p className="text-white text-xs font-semibold truncate">{w.nft.name}</p>
											<p className="text-white-300 text-[10px] truncate">{w.nft.collection || t('tournaments.add.prize.list.noCollection')}</p>
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												const current = getValues('winners');
												const updated = [...current];
												updated[i] = { ...updated[i], nft: null };
												setValue('winners', updated);
											}}
											className="w-5 h-5 rounded bg-red-500/30 flex items-center justify-center flex-shrink-0 hover:bg-red-500/60"
										>
											<X className="w-3 h-3 text-red-300" />
										</button>
									</div>
								) : (
									<button
										type="button"
										onClick={() => {
											setEditingNftIndex(i); setNftModalOpen(true); 
										}}
										className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white-300 hover:bg-white/20 border border-transparent transition-all flex items-center gap-1"
									>
										<ImageIcon className="w-3 h-3" />
										{t('tournaments.add.prize.list.addNFTPrize')}
									</button>
								)}
							</div>
						</div>
					))}

					{winners.length > 20 && (
						<div className="text-center text-white-300 text-sm py-2">
							{t('tournaments.add.prize.list.more', { winners: winners.length - 20 })}
						</div>
					)}
				</div>
			</div>

			{/* Preview summary */}
			<div className={`bg-gradient-to-r ${COLORS(t)[selectedColor].value} rounded-xl p-4 border-2 border-white/20`}>
				<div className="flex items-center gap-3 mb-3">
					<div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
						<IconPreview icon={selectedIcon} />
					</div>
					<div>
						<h3 className="text-white font-bold text-lg">{watchAll.name}</h3>
						<p className="text-white/70 text-sm">{watchAll.start_at} - {watchAll.end_at}</p>
					</div>
				</div>
				<div className="grid grid-cols-4 gap-2 text-center">
					<div className="bg-white/10 rounded-lg p-2">
						<p className="text-white/60 text-xs">{t('tournaments.add.prize.info.players')}</p>
						<p className="text-white font-bold text-sm">{watchAll.players_limit}</p>
					</div>
					<div className="bg-white/10 rounded-lg p-2">
						<p className="text-white/60 text-xs">{t('tournaments.add.prize.info.entry')}</p>
						<p className="text-white font-bold text-sm">
							{entryType === 'token' ? `${watchAll.entry_amount} ${tokenVal}` : entryType === 'ticket' ? `${watchAll.ticket_amount}` : 'NFT'}
						</p>
					</div>
					<div className="bg-white/10 rounded-lg p-2">
						<p className="text-white/60 text-xs">{t('tournaments.add.prize.info.levels')}</p>
						<p className="text-white font-bold text-sm">{selectedLevels.length}</p>
					</div>
					<div className="bg-white/10 rounded-lg p-2">
						<p className="text-white/60 text-xs">{t('tournaments.add.prize.info.prize')}</p>
						<p className="text-white font-bold text-sm">{winnersCount}</p>
					</div>
				</div>
			</div>
			<NftModal
				t={t}
				isOpen={nftModalOpen}
				onClose={() => {
					setNftModalOpen(false);
					setEditingNftIndex(null);
				}}
				initial={editingNftIndex !== null ? winners[editingNftIndex]?.nft : null}
				onSave={(nft) => {
					if (editingNftIndex !== null) {
						const current = getValues('winners');
						const updated = [...current];
						updated[editingNftIndex] = { ...updated[editingNftIndex], nft };
						setValue('winners', updated);
					}
				}}
			/>
		</div>
	);
};