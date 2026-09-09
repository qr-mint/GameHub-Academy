import {
	X,
} from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

interface AchievementModalProps {
	achievement: any;
	onClose: () => void;	
}

export const AchievementModal = ({ achievement, onClose }: AchievementModalProps) => {
	const [ minting, setMinting ] = useState(false);
	const handleMint = () => {
		setMinting(true);
		setTimeout(() => {
			setMinting(false);

		}, 2000);
	};
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
			<div className="relative w-full max-w-md bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-white/20 rounded-2xl overflow-hidden">
				{/* Header image */}
				<div className="relative h-48">
					<img
						src={achievement.image_url || '/placeholder.svg'}
						alt={achievement.name_en}
						className="w-full h-full object-cover"
					/>
					<div className={'absolute inset-0 bg-gradient-to-t from-gray-400 to-gray-600 opacity-40'} />
					<button
						onClick={onClose}
						className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
					>
						<X className="w-5 h-5 text-white" />
					</button>
				</div>

				<div className="p-6">
					<h2 className="text-2xl font-bold text-white mb-2">{achievement.name_en}</h2>
					<p className="text-white-200 text-sm mb-4 leading-relaxed">{achievement.description_en}</p>

					<div className="bg-white/10 rounded-xl p-4 mb-4">
						<p className="text-white-300 text-xs font-semibold mb-1">Награда</p>
						<p className="text-white font-semibold">{JSON.stringify(achievement.reward)}</p>
					</div>

					{/* {achievement.minted ? (
						<div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 text-center">
							<div className="flex items-center justify-center gap-2 text-green-300 font-semibold">
								<Sparkles className="w-5 h-5" />
                    NFT заминчен в блокчейн
							</div>
							<p className="text-green-200 text-xs mt-1">Токен в вашем кошельке</p>
						</div>
					) : (
						<button
							onClick={handleMint}
							disabled={minting}
							className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-yellow-500/50 disabled:to-orange-500/50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
						>
							{minting ? (
								'Минтинг...'
							) : (
								<>
									<Sparkles className="w-5 h-5" />
                  Заминтить NFT (0.1 TON)
								</>
							)}
						</button>
					)} */}
				</div>
			</div>
		</div>
	);
};
