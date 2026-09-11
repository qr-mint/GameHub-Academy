import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void
    onGameState?: (data: any) => void;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(function PhaserGame ({ currentActiveScene, onGameState }, ref) {
	const navigate = useNavigate();
	const game = useRef<Phaser.Game | null>(null!);
	useLayoutEffect(() => {
		const loadData = async () => {
			if (game.current === null) {
	
				game.current = StartGame('game-container');
				if (typeof ref === 'function') {
					ref({ game: game.current, scene: null });
				} else if (ref) {
					ref.current = { game: game.current, scene: null };
				}
			}
		};
		loadData();
		return () => {
			if (game.current) {
				game.current.destroy(true);
				if (game.current !== null) {
					game.current = null;
				}
			}
		};
	}, [ref]);

	useEffect(() => {
		EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
			if (currentActiveScene && typeof currentActiveScene === 'function') {
				currentActiveScene(scene_instance);
			}
		});
		EventBus.on('exit-level', () => {
			navigate('/');
		});
		EventBus.on('game-state', (data: any) => {
			onGameState(data);
		});
		return () => {
			EventBus.removeListener('current-scene-ready');
		};
	}, [ currentActiveScene, onGameState, ref ]);

	return (
		<div id="game-container"></div>
	);
});
