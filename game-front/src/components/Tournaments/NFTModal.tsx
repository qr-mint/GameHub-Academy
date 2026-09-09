
import { useForm } from 'react-hook-form';
import {
	X,
} from 'lucide-react';

interface NftPrize {
  name: string
  collection: string
  image: string
  description: string
}

export function NftModal ({
	isOpen,
	onClose,
	onSave,
	initial,
	t
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (nft: NftPrize) => void
  initial: NftPrize | null,
  t: (key: string) => string;
}) {
	const nftForm = useForm<NftPrize>({
		defaultValues: initial || { name: '', collection: '', image: '', description: '' },
	});

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
			<div className="relative w-full max-w-md bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-white/20 rounded-2xl p-5">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-xl font-bold text-white">{t('tournaments.add.prize.nftModal.title')}</h3>
					<button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center">
						<X className="w-4 h-4 text-white" />
					</button>
				</div>

				<form
					onSubmit={nftForm.handleSubmit((data) => {
						if (data.name.trim()) {
							onSave(data);
							onClose();
						}
					})}
					className="space-y-3"
				>
					<div>
						<label className="text-white text-sm font-semibold mb-1 block">{t('tournaments.add.prize.nftModal.name')}</label>
						<input
							{...nftForm.register('name', { required: true })}
							placeholder="Champion Trophy #1"
							className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-amber-300 outline-none focus:border-amber-400"
						/>
						{nftForm.formState.errors.name && (
							<p className="text-red-400 text-xs mt-1">{t('tournaments.add.prize.nftModal.subtitle.title')}</p>
						)}
					</div>
					<div>
						<label className="text-white text-sm font-semibold mb-1 block">{t('tournaments.add.prize.nftModal.collection')}</label>
						<input
							{...nftForm.register('collection')}
							placeholder="EQD..."
							className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-amber-300 outline-none focus:border-amber-400 font-mono text-sm"
						/>
					</div>
					<div>
						<label className="text-white text-sm font-semibold mb-1 block">{t('tournaments.add.prize.nftModal.url')}</label>
						<input
							{...nftForm.register('image')}
							placeholder="https://..."
							className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-amber-300 outline-none focus:border-amber-400 text-sm"
						/>
					</div>
					{nftForm.watch('image') && (
						<div className="rounded-xl overflow-hidden border border-white/20 bg-white/5">
							<img src={nftForm.watch('image')} alt="NFT preview" className="w-full h-32 object-cover" />
						</div>
					)}
					<div>
						<label className="text-white text-sm font-semibold mb-1 block">{t('tournaments.add.prize.nftModal.description.label')}</label>
						<textarea
							{...nftForm.register('description')}
							placeholder={t('tournaments.add.prize.nftModal.description.placeholder')}
							rows={2}
							className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-amber-300 outline-none focus:border-amber-400 resize-none text-sm"
						/>
					</div>

					<div className="flex gap-2 mt-4">
						<button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all">
							{t('tournaments.add.prize.nftModal.cancel')}
						</button>
						<button
							type="submit"
							className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-all"
						>
							{t('tournaments.add.prize.nftModal.save')}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}