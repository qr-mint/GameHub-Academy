import { Scene } from 'phaser';

import { EventBus } from '../EventBus.ts';

import { getParticipant } from '@/api/game/tournaments.ts';
import { useGameStore } from '@/store/game/index.ts';
import { store } from '../store/index.ts';
import { useSettingsStore } from '@/store/settings/settings.tsx';
import { startBackgroundMusic, stopBackgroundMusic } from '../../audio/backgroundMusic.ts';

export class Game extends Scene {
	private tournamentID: number;
	private mapWidth: number;
	private mapHeight: number;
	bg: Phaser.GameObjects.TileSprite;

	constructor () {
		super('Game');
	}

	async init (data: any) {
		store.reset();
		const styles = this.registry.get('styles');
		if (data.tournament) {
			this.tournamentID = data.tournament.id;
        
			// Check payment for per_attempt mode before starting
			if (data.tournament.entry_mode === 'per_attempt') {
				try {
					const participant = await getParticipant(this.tournamentID);
					if (!participant.allow) {
						EventBus.emit('game-state', {
							status: 'tournament_payment_required',
							tournament_id: this.tournamentID,
							tournament: data.tournament
						});
						return;
					}
				} catch (err) {
					console.error('Failed to check participant:', err);
				}
			}
		} else {
			//
		}

		const gameState = useGameStore.getState();
		// this.tickets = gameState.data.tickets;
		// if (this.tickets === 0 && !this.tournamentID) {
		// 	EventBus.emit('exit-level');
		// }
		if (!this.scene.isActive('UIScene')) {
			this.scene.launch('UIScene');
		}
	}

	create () {
		void startBackgroundMusic('assets/music/game/manifest.json');
		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			stopBackgroundMusic();
		});

		const cameraMode = useSettingsStore.getState().cameraMode;
		// Размер карты в пикселях
		this.mapWidth = 1 * 32;
		this.mapHeight = 1 * 32;

		const screenWidth = this.scale.width;
		const screenHeight = this.scale.height;
		if (cameraMode === 'full') {
			const zoomX = screenWidth / this.mapWidth;
			const zoomY = screenHeight / this.mapHeight;

			const zoom = Math.min(zoomX, zoomY);
      
			this.cameras.main.setZoom(zoom);
			this.cameras.main.centerOn(this.mapWidth / 2, this.mapHeight / 2);
		}

      
		if (cameraMode === 'player') {
			EventBus.on('zoom:change', () => {
				this.cameras?.main?.setZoom(store.currentZoom);
			});
		}

		EventBus.on('level:replay', () => {
			this.scene.restart();
		});

		EventBus.on('level:next', () => {
			this.scene.start('LoaderScene');
		});

		EventBus.on('settings:zoom-change', (zoom: number) => {
			store.currentZoom = zoom;
			this.cameras.main.setZoom(zoom);
		});

		EventBus.on('settings:camera-mode-change', (mode: string) => {
			if (mode === 'player' && this.player) {
				this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
			} else {
				this.cameras.main.stopFollow();
				this.cameras.main.setZoom(1);
				this.cameras.main.centerOn(this.mapWidth / 2, this.mapHeight / 2);
			}
		});
      
		this.scale.on('resize', this.onResize, this);
		this.scale.on('orientationchange', this.onResize, this);

		this.events.once('shutdown', () => {
			this.scale.off('resize', this.onResize, this);
			this.scale.off('orientationchange', this.onResize, this);
		});
     
		EventBus.emit('current-scene-ready', this);
	}

	onResize = () => {
	
		const cameraMode = useSettingsStore.getState().cameraMode;

		this.mapWidth = this.map.grid.length * TILE_SIZE;
		this.mapHeight = this.map.grid[0].length * TILE_SIZE;
	
		if (cameraMode === 'full') {
			console.log('onResize called', window.innerWidth, window.innerHeight);
			// Размер карты в пикселях
			const screenWidth = window.innerWidth;
			const screenHeight = window.innerHeight;

			const zoomX = screenWidth / this.mapWidth;
			const zoomY = screenHeight / this.mapHeight;

			const zoom = Math.min(zoomX, zoomY);

			this.cameras.main.setZoom(zoom);
			this.cameras.main.centerOn(this.mapWidth / 2, this.mapHeight / 2);
			
      
		} else if (cameraMode === 'player' && this.player) {
			// Камера должна снова начать следить за игроком после resize
			this.cameras.main.setZoom(store.currentZoom);
			this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
		}

		// Уведомляем UIScene чтобы она перестроила кнопки
		EventBus.emit('scene:resize');
	};

	async handleDead () {

	}

	async handleSuccess (player: any, checkpoint: any) {

	}
  
	update (time: number, delta: number) {
		
	}
}
