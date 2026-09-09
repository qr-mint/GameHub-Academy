import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
	ArrowLeft,
	ArrowRight,
	Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import { InfoForm } from '@/components/Tournaments/InfoForm';
import { EntryForm } from '@/components/Tournaments/EntryForm';
import { PrizesForm } from '@/components/Tournaments/PrizesForm';
import { useWizardContext, WizardStages } from '../Wizard';
import { createTournament } from '@/api/game/tournaments';

import { SocialForm } from './SocialForm';
import { ConnectContext } from '../Connect/provider';
import { PaymentProccesing } from '../PaymentProccesing';
import { useOrderStatusPolling } from '@/hooks/useOrderStatusPolling';
import { getTokens } from '@/api/tokens';
import { useSettingsStore } from '@/store/settings/settings';

type EntryType = 'token' | 'ticket' | 'nft';
type Blockchain = 'ton' | 'botchain';
type Token = 'TON' | 'USDT' | 'NOT' | 'BOT';
type TournamentType = 'leaderboard' | 'single_attempt' | 'survival';
type Schedule = 'daily' | 'weekend' | 'special' | 'season';

interface NftPrize {
  name: string
  collection: string
  image: string
  description: string
}

interface WinnerField {
  place: number
  percent: number
  nft: NftPrize | null
}

interface SocialTask {
  type: 'telegram' | 'twitter' | 'discord' | 'youtube';
  value?: string;
}

interface TournamentFormData {
  name: string
  description: string
  players_limit: number
  type: TournamentType
  schedule: Schedule
  icon: string
  color: number
  start_at: string
  end_at: string
  entryType: EntryType
  network: Blockchain
  token: Token
  entry_mode: string
  entry_amount: string
  entry_tickets: string
  nftRequired: boolean
  collection_address: string
  winners_count: number
  winners: WinnerField[]
  social_tasks?: SocialTask[],
	reward_source: string,
	dex: string,
	dex_pair_id: string,
	prize_network: string,
	prize_token: string,
}

const TOTAL_STEPS = 5;

export const TournamentForm = () => {
	const { setConnectWallet } = useSettingsStore();
	const { t } = useTranslation();
	const connectors = useContext(ConnectContext);
	const [ data, setData ] = useState<any>({});
	const [ tokens, setTokens ] = useState([{
		name: 'TON',
		currency: 'ton',
		network: 'ton'
	}, {
		name: 'BOTCHain',
		currency: 'bot',
		network: 'botchain'
	}]);
	const { currentStage, handlePrev, handleNext } = useWizardContext();
	const navigate = useNavigate();
	const {
		register,
		control,
		watch,
		setValue,
		getValues,
		formState: { errors, isValid },
	} = useForm<TournamentFormData>({
		defaultValues: {
			name: '',
			description: '',
			players_limit: 100,
			type: 'leaderboard',
			schedule: 'daily',
			icon: 'trophy',
			color: 0,
			start_at: '',
			end_at: '',
			entryType: 'token',
			network: 'ton',
			token: 'TON',
			entry_amount: '0.1',
			entry_tickets: '5',
			nftRequired: false,
			collection_address: '',
			entry_mode: 'one_time',
			winners_count: 3,
			reward_source: 'pool',
			dex: 'stonfi',
			dex_pair_id: '',
			prize_network: 'ton',
			prize_token: 'ton',
			winners: [
				{ place: 1, percent: 50, nft: null },
				{ place: 2, percent: 30, nft: null },
				{ place: 3, percent: 20, nft: null },
			],
			social_tasks: []
		},
		mode: 'onChange',
	});

	const isTMA = !!window.Telegram?.WebApp?.initDataUnsafe?.user;

	const handleOrderError = async (error: any) => {
		toast.error((error as any).message);
		setData({});
	};
    
	const handleOrderConfirmed = async () => {
		try {
			const result = await createTournament({ ...data.data, order_id: data.order_id }, connectors.ton.access_token);
			if (result.ok) {
				onBack();
			} else {
				toast.error(result.error);
			}
			setData({});
		} catch (err) {
			toast.error((err as any).message);
		}
	};
	useOrderStatusPolling(data?.game_order_id,
		handleOrderConfirmed,
		handleOrderError,
	);

	useEffect(() => {
		const loadTokens = async () => {
			try {
				const list = await getTokens();
				setTokens(tokens.concat(list));
			} catch (err) {
				toast.error((err as any).message);
			}
		};
		if (tokens.length === 1) {
			loadTokens();
		}
	}, []);
    
	const watchAll = watch();
	const winners = watchAll.winners;
  
  
	const getTotalPercent = () => winners.reduce((sum, w) => sum + w.percent, 0);
  
	const onBack = () => {
		navigate(-1);
	};
  
	const canProceed = () => {
		const v = getValues();
		if (currentStage === 1) {
			if (v.name.trim().length > 0) {
				return true;
			} else if (v.start_at && v.end_at && [ 'season', 'special' ].includes(v.schedule)) {
				return true;
			} else {
				return false;
			}
		}
		if (currentStage === 2) {
			if (v.entryType === 'token') return Number(v.entry_amount) > 0;
			if (v.entryType === 'ticket') return Number(v.entry_tickets) > 0;
			if (v.entryType === 'nft') return v.collection_address.trim().length > 0;
			return true;
		}
		if (currentStage === 3) return true; // socialTasks optional
		if (currentStage === 4) {
			if (v.reward_source && v.prize_network) {
				return true;
			}


			if (v.reward_source && v.prize_network && v.prize_token && getTotalPercent() <= 100 && isValid) {
				if (v.reward_source === "dex" && (!v.dex || !v.dex_pair_id)) return false;
				return true;
			};
		}
		return true;
	};
  
	const handleSubmit = async () => {
		try {
			if (canProceed()) {
				const data = getValues();
				let network = [ 'ancient', 'kaia', 'core', 'flow', 'sei', 'cosmos', 'botchain' ].includes(data.network) ? 'evm' : data.network;
				const connector = connectors[network];
				if (!connector?.connected || !connector.access_token) {
					if (isTMA) {
						connectors.ton.open();
					} else {
						setConnectWallet(true);
					}
					return;
				}

				const prizes = data.winners.reduce<any>((acc, curr) => {
					const foundIndex = acc.findIndex((prize: any) => prize.percent === curr.percent);
					if (foundIndex > -1) {
						acc[foundIndex].place_to += 1;
						return acc;
					}
					return acc.concat({
						nft: curr.nft,
						percent: curr.percent,
						place_from: curr.place,
						place_to: curr.place
					});
				}, []);
				let start_at, end_at;
				if ([ 'season', 'special' ].includes(data.schedule)) {
					start_at = new Date(data.start_at).toISOString();
					end_at = new Date(data.end_at).toISOString();
				}
				
				const telegram_tasks = data.social_tasks?.filter((task) => task.type === 'telegram');
				const entry: any = {};
				if (data.entryType === 'token') {
					entry.entry_amount = data.entry_amount;
				} else if (data.entryType === 'ticket') {
					entry.entry_tickets = data.entry_tickets;
				}
				
				const tournamentData = {
					owner_address: connector.address,
					name: data.name,
					description: data.description,
					type: data.type, schedule: data.schedule,
					start_at, end_at,
					color: data.color, icon: data.icon,
					collection_address: data.collection_address,
					network: data.network, currency_token: data.token, token: data.token,
					player_limit: data.players_limit,
					prizes, winners_count: data.winners_count, telegram_tasks,
					entry_mode: data.entry_mode,
					reward_source: data.reward_source, dex_pair_id: data.dex_pair_id,
					prize_network: data.prize_network, prize_token: data.prize_token,
					...entry,
				};
				const result = await connector.sendTransaction({
					token: data.token,
					type: 'create_tournament',
					network: data.network,
				});
        
				setData({
					game_order_id: result.gameTransaction.id,
					order_id: result.data.order_id,
					data: tournamentData
				});
			}
		} catch (err) {
			console.log(err);
			toast.error((err as any).message);
		}
	};

	return (
		<div className="flex-1 max-w-2xl mx-auto w-full">
			{data.game_order_id && <PaymentProccesing t={t} />}
			{/* Header */}
			<div className="flex items-center gap-3 mb-6">
				<button
					onClick={currentStage > 1 ? handlePrev : onBack}
					className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
				>
					<ArrowLeft className="w-5 h-5 text-white" />
				</button>
				<div className="flex-1">
					<h1 className="text-2xl font-bold text-white">
						{t('tournaments.add.createTournament')}
					</h1>
					<p className="text-white-200 text-sm">
						{t('tournaments.add.subtitle', { currentStage, totalSteps: TOTAL_STEPS })}
					</p>
				</div>
			</div>
    
			{/* Progress */}
			<div className="flex gap-2 mb-6">
				{Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
					<div
						key={s}
						className={`flex-1 h-2 rounded-full transition-all ${s <= currentStage ? 'bg-amber-400' : 'bg-white/20'}`}
					/>
				))}
			</div>
			<WizardStages>
				<InfoForm setValue={setValue} t={t} register={register} errors={errors} control={control} watchAll={watchAll} />
				<EntryForm tokens={tokens} t={t} register={register} setValue={setValue} control={control} watchAll={watchAll} />
				<SocialForm t={t} register={register} watchAll={watchAll} control={control} />
				<PrizesForm tokens={tokens} t={t} watchAll={watchAll} control={control} setValue={setValue} getValues={getValues} />
			</WizardStages>
			{/* Navigation buttons */}
			<div className="flex gap-3 mt-6 pb-24">
				{currentStage > 1 && (
					<button
						type="button"
						onClick={handlePrev}
						className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/20"
					>
						<ArrowLeft className="w-5 h-5" />  
						{t('tournaments.add.back')}
					</button>
				)}
				{currentStage < TOTAL_STEPS ? (
					<button
						type="button"
						onClick={() => canProceed() && handleNext()}
						className={`flex-1 font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
							canProceed()
								? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg'
								: 'bg-white/10 text-white/40 cursor-not-allowed'
						}`}
					>
						{t('tournaments.add.next')}
						<ArrowRight className="w-5 h-5" />
					</button>
				) : (
					<button
						type="button"
						onClick={handleSubmit}
						className={`flex-1 font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
							canProceed()
								? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
								: 'bg-white/10 text-white/40 cursor-not-allowed'
						}`}
					>
						<Check className="w-5 h-5" />
						{t('tournaments.add.createTournament')}
					</button>
				)}
			</div>
		</div>
	);
};