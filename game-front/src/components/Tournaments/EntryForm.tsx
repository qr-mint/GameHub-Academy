import { Controller } from 'react-hook-form';

interface EntryFormProps {
  t: (e: string) => string;
  watchAll: any;
  register: any;
  control: any;
  setValue: any;
	tokens: any[];
}

export const EntryForm = ({ t, watchAll, control, register, setValue, tokens }: EntryFormProps) => {  
	const entryType = watchAll.entryType;
	const tokenVal = watchAll.token;
	
	return (
		<div className="space-y-4">
			<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
				<label className="block text-white font-semibold mb-3">{t('tournaments.add.entry.entryType.label')}</label>
				<Controller
					control={control}
					name="entryType"
					render={({ field }) => (
						<div className="grid grid-cols-3 gap-2">
							{([
								{ key: 'token', label: t('tournaments.add.entry.entryType.token'), desc: 'TON / USDT' },
								{ key: 'ticket', label: t('tournaments.add.entry.entryType.tickets'), desc: t('tournaments.add.entry.entryType.ticketDesc') },
								{ key: 'nft', label: t('tournaments.add.entry.entryType.nft'), desc: t('tournaments.add.entry.entryType.nftDesc') },
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
									<span className="font-bold">{t.label}</span>
									<span className="text-xs opacity-70">{t.desc}</span>
								</button>
							))}
						</div>
					)}
				/>
			</div>
 
			{entryType === 'token' && (
				<>
					<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
						<label className="block text-white font-semibold mb-3">{t('tournaments.add.info.type.label')}</label>
						<Controller
							control={control}
							name="entry_mode"
							render={({ field }) => (
								<div className="grid grid-cols-3 gap-2">
									{([
										{ key: 'one_time' as const, label: t('tournaments.add.entry.modes.oneTime') },
										{ key: 'per_attempt' as const, label: t('tournaments.add.entry.modes.perAttempt') },
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
                
											{t.label}
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
							name="network"
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
												setValue('prize_network', b.key);
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

					<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
						<label className="block text-white font-semibold mb-3">{t('tournaments.add.entry.token.label')}</label>
						<Controller
							control={control}
							name="token"
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
						<label className="block text-white font-semibold mb-2">{t('tournaments.add.entry.amount.label')} ({tokenVal})</label>
						<input
							{...register('entry_amount', { required: entryType === 'token' })}
							type="number" placeholder="0.1" step="0.01" min="0"
							className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-amber-300 outline-none focus:border-amber-400 transition-colors"
						/>
					</div>
				</>
			)}

			{entryType === 'ticket' && (
				<>
					<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
						<label className="block text-white font-semibold mb-3">{t('tournaments.add.info.type.label')}</label>
						<Controller
							control={control}
							name="entry_mode"
							render={({ field }) => (
								<div className="grid grid-cols-3 gap-2">
									{([
										{ key: 'one_time' as const, label: t('tournaments.add.entry.modes.oneTime') },
										{ key: 'per_attempt' as const, label: t('tournaments.add.entry.modes.perAttempt') },
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
                      
											{t.label}
										</button>
									))}
								</div>
							)}
						/>
					</div>
					<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
						<label className="block text-white font-semibold mb-2">{t('tournaments.add.entry.tickets.label')}</label>
						<input
							{...register('entry_tickets', { required: entryType === 'ticket' })}
							type="number" placeholder="5" min="1"
							className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-amber-300 outline-none focus:border-amber-400 transition-colors"
						/>
					</div>
				</>
			)}

			{entryType === 'nft' && (
				<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
					<label className="block text-white font-semibold mb-2">{t('tournaments.add.entry.collection.label')}</label>
					<input
						{...register('collection_address', { required: entryType === 'nft' })}
						placeholder="EQD..."
						className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-amber-300 outline-none focus:border-amber-400 transition-colors font-mono text-sm"
					/>
					<p className="text-white-300 text-xs mt-2">{t('tournaments.add.entry.collection.description')}</p>
				</div>
			)}

			{entryType !== 'nft' && (
				<Controller
					control={control}
					name="nftRequired"
					render={({ field: nftField }) => (
						<div className={`backdrop-blur-md rounded-xl border p-4 transition-all ${nftField.value ? 'bg-amber-600/15 border-amber-400/40' : 'bg-white/10 border-white/20'}`}>
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<p className="text-white font-semibold">{t('tournaments.add.entry.collection.verifyNFT')}</p>
										<span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white-300 uppercase">{t('tournaments.add.entry.collection.optional')}</span>
									</div>
									<p className="text-white-300 text-xs mt-0.5">{t('tournaments.add.entry.collection.rules')}</p>
								</div>
								<button
									type="button"
									onClick={() => {
										nftField.onChange(!nftField.value);
										if (nftField.value) setValue('collection_address', '');
									}}
									className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${nftField.value ? 'bg-amber-600' : 'bg-white/20'}`}
								>
									<div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${nftField.value ? 'translate-x-7' : 'translate-x-1'}`} />
								</button>
							</div>
							{nftField.value && (
								<div className="mt-3 space-y-2">
									<input
										{...register('collection_address')}
										placeholder={t('tournaments.add.entry.collection.placeholder')}
										className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-amber-300 outline-none focus:border-amber-400 transition-colors font-mono text-sm"
									/>
									<p className="text-white-400 text-xs">{t('tournaments.add.entry.collection.warning')}</p>
								</div>
							)}
						</div>
					)}
				/>
			)}
		</div>
	);
};