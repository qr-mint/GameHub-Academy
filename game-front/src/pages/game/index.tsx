import { useRef, useState, useEffect } from 'react';
import { IRefPhaserGame, PhaserGame } from '../../game/PhaserGame';
import { WinModal } from '@/components/GameModal/WinModal';
import { NoTicketsModal } from '@/components/GameModal/NoTicketModal';
import { TournamentLoseModal } from '@/components/GameModal/TournamentLoseModal';
import { TournamentWinModal } from '@/components/GameModal/TournamentWinModal';
import { SettingsModal } from '@/components/SettingsModal';
import { EventBus } from '@/game/EventBus';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../node_modules/react-i18next';

export function Game () {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [ gameState, setGameState ] = useState({});
	const [ showSettings, setShowSettings ] = useState(false);
	const phaserRef = useRef<IRefPhaserGame | null>(null);

	useEffect(() => {
		const handleOpenSettings = () => {
			setShowSettings(true);
		};
        
		EventBus.on('open-settings', handleOpenSettings);
        
		return () => {
			EventBus.off('open-settings', handleOpenSettings);
		};
	}, []);

	const currentScene = (scene: Phaser.Scene) => {
		console.log('currenScene');     
	};
    
	const onGameState = (data: any) => {
		// Handle payment required - redirect to tournament
		if (data.status === 'tournament_payment_required') {
			navigate(`/tournaments/${data.tournament_id}?error=payment_required`);
			return;
		}
		setGameState(data);
	};

	const onClose = () => {
		setGameState({});
	};
	const handleOnBack = () => {
		navigate('/');
	};

	const renderModal = (gameState: any) => {
		switch (gameState.status) {
		case 'win':
			return <WinModal data={gameState} onClose={onClose} onBackMenu={handleOnBack} t={t} />;
		case 'no_tickets':
			return <NoTicketsModal data={gameState} onClose={onClose} onBackMenu={handleOnBack} t={t} />;
		case 'tournament_lose':
			return <TournamentLoseModal data={gameState} onClose={onClose} onBackMenu={handleOnBack} t={t} />;
		case 'tournament_win':
			return <TournamentWinModal data={gameState} onClose={onClose} onBackMenu={handleOnBack} t={t} />;
		default:
			return <></>;
		}
	};

	return (
		<div id="app">
			<PhaserGame isEditor={false} ref={phaserRef} currentActiveScene={currentScene} onGameState={onGameState} />
			{renderModal(gameState)}
			<SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
		</div>
	);
}
