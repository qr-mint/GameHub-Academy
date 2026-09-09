import { useEffect } from 'react';

interface LeaderboardPageProps {
  t: (key: string) => string;
}

export function LeaderboardPage ({ t }: LeaderboardPageProps) {

	useEffect(() => {
		const load = async () => {
			try {
			
			} catch {
				
			}
		}
		load();
	}, []);

	return (
		<div className="flex-1 max-w-2xl mx-auto w-full">

		</div>
	);
}