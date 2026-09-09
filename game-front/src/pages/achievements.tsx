import { getAchievements } from '@/api/game/achievements';
import { AchievementModal } from '@/components/AchievementModal';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export function AchievementsPage ({ t }: { t: (any: string) => string }) {
	const [ achievements, setAchievements ] = useState<any>([]);
	const [ selectedAchievement, setSelectedAchievement ] = useState();
	useEffect(() => {
		const loadAchievements = async () => {
			try {
				const list = await getAchievements();
				setAchievements(list);
			} catch (err) {
				toast.error((err as any).message);
			}
		};
		loadAchievements();
	}, []);
  
	return (
		<div className="flex-1 max-w-2xl mx-auto w-full">
			<div className="text-center mb-6">
				<h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('achievements.title')}</h1>
				<p className="text-white-200">{t('achievements.subtitle')}</p>
			</div>

			<div className="grid grid-cols-3 gap-4">
				{achievements.map((achievement: any) => (
					<div
						onClick={() => setSelectedAchievement(achievement)}
						key={achievement.id}
						className={`relative overflow-hidden border-2 bg-white/10 backdrop-blur-md rounded-xl transition-all ${
							achievement.user_achs.length > 0
								? 'border-gray-400 hover:scale-105 cursor-pointer shadow-lg' 
								: 'border-white/10 opacity-50'
						}`}
					>
						<div className={'absolute inset-0 bg-gradient-to-br rom-gray-400 to-gray-600 opacity-20'} />
            
						<div className="relative p-3">
							{/* NFT Image */}
							<div className="relative mb-3 rounded-lg overflow-hidden bg-white/5">
								<img 
									src={achievement.image_url || '/placeholder.svg'} 
									alt={achievement.name_en}
									className={`w-full aspect-square object-cover ${
										achievement.user_achs.length > 0 ? 'opacity-100' : 'opacity-30 grayscale'
									}`}
								/>
								{achievement.user_achs.length === 0 && (
									<div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
										<div className="text-white text-4xl">🔒</div>
									</div>
								)}
							</div>
              
							<h3 className="text-white font-bold text-sm mb-1 text-center text-balance">{achievement.name_en}</h3>
							<p className="text-white-200 text-xs mb-2 text-center leading-relaxed text-balance">{achievement.description_en}</p>
						</div>
					</div>
				))}
			</div>
			{selectedAchievement && (
				<AchievementModal
					achievement={selectedAchievement}
					onClose={() => setSelectedAchievement(undefined)}
				/>
			)}
		</div>
	);
}