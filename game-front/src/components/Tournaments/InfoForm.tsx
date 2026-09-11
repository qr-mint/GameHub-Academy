import { Controller } from 'react-hook-form';
import {
	Calendar,
	Crown,
	Sparkles,
	Trophy,
	Zap,
} from 'lucide-react';

const ICONS = [ 'trophy', 'zap', 'crown', 'star', 'sparkles', 'shield' ];
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

interface InfoFormProps {
  t: (e: string) => string;
  watchAll: any;
  register: any;
  control: any;
  errors: any;
  setValue: any;
}

export const InfoForm = ({ t, watchAll, register, control, errors, setValue }: InfoFormProps) => {
	const selectedIcon = watchAll.icon;
	return (
		<div className="space-y-4">
			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<label className="block text-white font-semibold mb-2">{t('tournaments.add.info.name.label')}</label>
				<input
					{...register('name', { required: t('tournaments.add.info.name.required') })}
					placeholder={t('tournaments.add.info.name.placeholder')}
					className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-amber-300 outline-none focus:border-amber-400 transition-colors"
				/>
				{errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
			</div>

			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<label className="block text-white font-semibold mb-2">{t('tournaments.add.info.description.label')}</label>
				<textarea
					{...register('description')}
					placeholder={t('tournaments.add.info.description.placeholder')}
					rows={3}
					className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-amber-300 outline-none focus:border-amber-400 transition-colors resize-none"
				/>
			</div>

			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<Controller
					control={control}
					name="players_limit"
					render={({ field }) => (
						<>
							<label className="block text-white font-semibold mb-2">{t('tournaments.add.info.players_limit.label')}: {field.value}</label>
							<input
								type="range" min={2} max={10000} step={1}
								value={field.value}
								onChange={(e) => field.onChange(Number(e.target.value))}
								className="w-full accent-amber-500"
							/>
							<div className="flex justify-between text-white-300 text-xs mt-1">
								<span>2</span><span>10000</span>
							</div>
						</>
					)}
				/>
			</div>

			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<label className="block text-white font-semibold mb-3">{t('tournaments.add.info.schedule.label')}</label>
				<Controller
					control={control}
					name="schedule"
					render={({ field }) => (
						<div className="grid grid-cols-4 gap-2">
							{([
								{ key: 'daily' as const, label: t('tournaments.add.info.schedule.daily'), icon: <Zap className="w-5 h-5" /> },
								{ key: 'weekly' as const, label: t('tournaments.add.info.schedule.weekly'), icon: <Calendar className="w-5 h-5" /> },
								{ key: 'season' as const, label: t('tournaments.add.info.schedule.season'), icon: <Sparkles className="w-5 h-5" /> },
								{ key: 'special' as const, label: t('tournaments.add.info.schedule.special'), icon: <Sparkles className="w-5 h-5" /> },
							]).map((t) => (
								<button
									key={t.key}
									type="button"
									onClick={() => field.onChange(t.key)}
									className={`px-3 py-3 rounded-xl font-medium text-sm transition-all flex flex-col items-center gap-1 ${
										field.value === t.key
											? 'bg-amber-600 text-white shadow-lg border-2 border-amber-400'
											: 'bg-white/10 text-white-200 hover:bg-white/20 border-2 border-transparent'
									}`}
								>
									{t.icon}
									{t.label}
								</button>
							))}
						</div>
					)}
				/>
			</div>
			{[ 'season', 'special' ].includes(watchAll.schedule) && (
				<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
					<label className="block text-white font-semibold mb-3">{t('tournaments.add.info.date.label')}</label>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<p className="text-white-300 text-xs mb-1">{t('tournaments.add.date.start_at.label')}</p>
							<div className="relative">
								<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-300 pointer-events-none" />
								<input
									type="date"
									{...register('start_at', { required: t('tournaments.add.info.date.start_at.required') })}
									className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-3 py-3 text-white outline-none focus:border-amber-400 transition-colors text-sm [color-scheme:dark]"
								/>
							</div>
							{errors.start_at && <p className="text-red-400 text-xs mt-1">{errors.start_at.message}</p>}
						</div>
						<div>
							<p className="text-white-300 text-xs mb-1">{t('tournaments.add.info.date.end_at.label')}</p>
							<div className="relative">
								<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white-300 pointer-events-none" />
								<input
									type="date"
									{...register('end_at', { required: t('tournaments.add.info.date.end_at.required') })}
									className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-3 py-3 text-white outline-none focus:border-amber-400 transition-colors text-sm [color-scheme:dark]"
								/>
							</div>
							{errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.end_at.message}</p>}
						</div>
					</div>
				</div>
			)}
			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<label className="block text-white font-semibold mb-3">{t('tournaments.add.info.type.label')}</label>
				<Controller
					control={control}
					name="type"
					render={({ field }) => (
						<div className="space-y-2">
							{([
								{ 
									key: 'best_score' as const, 
									label: t('tournaments.types.best_score.label'), 
									icon: <Sparkles className="w-5 h-5" />,
									description: t('tournaments.types.best_score.info'), 
								},
								{ 
									key: 'best_time' as const, 
									label: t('tournaments.types.best_time.label'), 
									icon: <Sparkles className="w-5 h-5" />,
									description: t('tournaments.types.best_time.info'), 
								},
							]).map((t) => (
								<button
									key={t.key}
									type="button"
									onClick={() => {
										setValue('winners', [
											{ place: 1, percent: 50, nft: null },
											{ place: 2, percent: 30, nft: null },
											{ place: 3, percent: 20, nft: null },
										]);
										field.onChange(t.key);
									}}
									className={`w-full px-4 py-3 rounded-xl transition-all flex items-start gap-3 text-left ${
										field.value === t.key
											? 'bg-amber-600 text-white shadow-lg border-2 border-amber-400'
											: 'bg-white/10 text-white-200 hover:bg-white/20 border-2 border-transparent'
									}`}
								>
									<div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
										field.value === t.key ? 'bg-white/20' : 'bg-white/10'
									}`}>
										{t.icon}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-sm">{t.label}</p>
										<p className={`text-xs mt-0.5 ${field.value === t.key ? 'text-white/80' : 'text-white-300'}`}>
											{t.description}
										</p>
									</div>
								</button>
							))}
						</div>
					)}
				/>
			</div>
			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<label className="block text-white font-semibold mb-3">{t('tournaments.add.info.icon.label')}</label>
				<Controller
					control={control}
					name="icon"
					render={({ field }) => (
						<div className="grid grid-cols-6 gap-2">
							{ICONS.map((icon) => (
								<button
									key={icon}
									type="button"
									onClick={() => field.onChange(icon)}
									className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
										field.value === icon
											? 'bg-amber-600 text-white shadow-lg border-2 border-amber-400'
											: 'bg-white/10 text-white-200 hover:bg-white/20 border-2 border-transparent'
									}`}
								>
									<IconPreview icon={icon} />
								</button>
							))}
						</div>
					)}
				/>
			</div>

			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<label className="block text-white font-semibold mb-3">{t('tournaments.add.colors.label')}</label>
				<Controller
					control={control}
					name="color"
					render={({ field }) => (
						<>
							<div className="grid grid-cols-6 gap-2">
								{COLORS(t).map((color, i) => (
									<button
										key={i}
										type="button"
										onClick={() => field.onChange(i)}
										className={`w-full aspect-square rounded-xl ${color.bg} transition-all ${
											field.value === i ? 'ring-4 ring-white shadow-lg scale-110' : 'opacity-70 hover:opacity-100'
										}`}
									/>
								))}
							</div>
							<div className={`mt-4 bg-gradient-to-r ${COLORS(t)[field.value].value} rounded-xl p-4 flex items-center gap-3`}>
								<div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
									<IconPreview icon={selectedIcon} />
								</div>
								<div>
									<p className="text-white font-bold">{watchAll.name || t('tournaments.add.info.name.label')}</p>
									<p className="text-white/70 text-sm">
										{watchAll.startDate && watchAll.endDate ? `${watchAll.startDate} - ${watchAll.endDate}` : t('tournaments.add.info.date.errors')}
									</p>
								</div>
							</div>
						</>
					)}
				/>
			</div>
		</div>
	);
};