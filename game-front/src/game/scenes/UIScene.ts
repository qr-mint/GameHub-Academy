import { EventBus } from '../EventBus.ts';
import { store } from '../store/index.ts';
import { useSettingsStore } from '@/store/settings/settings';

export default class UIScene extends Phaser.Scene {
	private hudText: Phaser.GameObjects.Text;
	private labelText: Phaser.GameObjects.Text;
	private panel: Phaser.GameObjects.Rectangle;
	private menuButton: Phaser.GameObjects.Text;
	private screenWidth: number;
	private screenHeight: number;
	private pauseBtn: Phaser.GameObjects.Image;
	private uiElements: Phaser.GameObjects.GameObject[] = [];
	private settingsBtn: Phaser.GameObjects.Image;
	private zoomMinusBtn: Phaser.GameObjects.Text;
	private zoomPlusBtn: Phaser.GameObjects.Text;

	constructor () {
		super('UIScene');
	}


	private destroyUI () {
		this.uiElements.forEach(el => el.destroy());
		this.uiElements = [];
		this.input.removeAllListeners();
	}

	private rebuildUI () {
		this.destroyUI();
		this.buildUI();
	}

	private buildUI () {
		const settings = useSettingsStore.getState();
		const isMobile = this.sys.game?.device.input.touch
      || this.sys.game?.device.os.android
      || this.sys.game?.device.os.iOS
      || window.innerWidth <= 768;

		const w = this.scale.width;
		const h = this.scale.height;
		const isHorizontal = this.scale.isLandscape;
		const panelHeight = isMobile ? 40 : 80;

		const panel = this.add.rectangle(0, 0, w * 2, panelHeight, 0x000000, 0.7).setScrollFactor(0);
		this.uiElements.push(panel);

		const labelText = this.add.text(10, isMobile ? 4 : 8, 'Game Scane', {
			fontSize: isMobile ? '12px' : '18px',
			color: '#ffffff', fontFamily: 'Arial'
		});
		this.uiElements.push(labelText);

		const hudText = this.add.text(150, isMobile ? 4 : 8, 'Time: 0:00 | Points: 0', {
			fontSize: isMobile ? '12px' : '18px',
			color: '#ffffff', fontFamily: 'Arial'
		});
		this.uiElements.push(hudText);
		this.hudText = hudText; // сохраняем ссылку для update()

		const menuButton = this.add.text(w - (isMobile ? 50 : 80), isMobile ? 4 : 8, '← Back', {
			fontSize: isMobile ? '12px' : '18px',
			color: '#ffffff', fontFamily: 'Arial'
		}).setInteractive({ useHandCursor: true }).setScrollFactor(0).setAlpha(0.9);
		menuButton.on('pointerdown', () => EventBus.emit('exit-level'));
		this.uiElements.push(menuButton);

		const pauseBtn = this.add.image(30, panelHeight + 20, store.pause ? 'play' : 'pause')
			.setInteractive({ useHandCursor: true })
			.setScrollFactor(0).setDisplaySize(48, 48).setAlpha(0.5).setDepth(1000);
		pauseBtn.on('pointerdown', () => {
			store.pause = !store.pause;
			if (store.pause) {
				pauseBtn.setTexture('play');
				this.scene.pause('Game');
			} else {
				pauseBtn.setTexture('pause');
				this.scene.resume('Game');
			}
		});
		this.uiElements.push(pauseBtn);

		if (settings.cameraMode === 'player') {
			this.createZoomUI(panelHeight);
		}
		this.settingsBtn = this.add.image(this.screenWidth - 40, panelHeight + 20, 'settings')
			.setInteractive({ useHandCursor: true })
			.setScrollFactor(0).setDisplaySize(48, 48).setAlpha(0.5).setDepth(1000);
		this.settingsBtn.on('pointerdown', () => {
			EventBus.emit('open-settings');
		});
		this.uiElements.push(this.settingsBtn);
		if (settings.controll === 'arrows') {
			this.createArrowButtons(w, h, isHorizontal);
		} else if (settings.controll === 'joystick') {
			this.createJoystick();
		}
	}

	private createArrowButtons (w: number, h: number, isHorizontal: boolean) {
		const btnSize = 60;
		const makeBtn = (x: number, y: number, key: string, controlKey: string) => {
			const btn = this.add.image(x, y, key)
				.setInteractive().setScrollFactor(0)
				.setDisplaySize(btnSize, btnSize).setAlpha(0.5);
			btn.on('pointerdown', () => store.controls[controlKey] = true);
			btn.on('pointerup', () => store.controls[controlKey] = false);
			btn.on('pointerout', () => store.controls[controlKey] = false);
			this.uiElements.push(btn);
		};

		if (isHorizontal) {
			makeBtn(100, h - 50, 'arrow-left', 'left');
			makeBtn(180, h - 50, 'arrow-right', 'right');
			makeBtn(w - 100, h - 50, 'arrow-up', 'up');
			makeBtn(w - 180, h - 50, 'arrow-down', 'down');
		} else {
			makeBtn(40, h - 50, 'arrow-left', 'left');
			makeBtn(120, h - 50, 'arrow-right', 'right');
			makeBtn(w - 40, h - 50, 'arrow-up', 'up');
			makeBtn(w - 120, h - 50, 'arrow-down', 'down');
		}
	}
  
	create () {
		this.screenWidth = this.scale.width;
		this.screenHeight = this.scale.height;
		this.buildUI();

		EventBus.on('settings:controll-change', this.rebuildUI, this);
		EventBus.on('settings:camera-mode-change', this.rebuildUI, this);
		EventBus.on('scene:resize', this.onResize, this);

		EventBus.on('game-state', (data: any) => {
			if ([ 'tournament_lose', 'lose', 'win', 'tournament_win' ].includes(data.status)) {
				if (store.joystick) {
					store.joystick.setVisible(false);
				}
			}
		}, this);
		
		this.events.once('shutdown', () => {
			EventBus.off('settings:controll-change', this.rebuildUI, this);
			EventBus.off('settings:camera-mode-change', this.rebuildUI, this);
			EventBus.off('scene:resize', this.onResize, this);
		}, this);
	}

	private createJoystick () {
		if (store.joystick) {
			store.joystick.joystickBase?.destroy();
			store.joystick.joystickThumb?.destroy();
			store.joystick.destroy();
			store.joystick = null;
			store.joystick = null;
		}

		const base = this.add.circle(0, 0, 60, 0x888888, 0.3)
			.setScrollFactor(0)
			.setDisplaySize(100, 100);

		const thumb = this.add.circle(0, 0, 30, 0xffffff, 0.6)
			.setScrollFactor(0)
			.setDisplaySize(50, 50);

		store.joystick = (this as any).rexVirtualJoystick.add(this, {
			x: 0, y: 0,
			radius: 60,
			base: base,
			thumb: thumb,
			dir: '8dir',
			fixed: true,
		});
		store.joystick.setVisible(false);

		this.input.off('pointerdown');
		this.input.off('pointerup');

		this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
			store.joystick.setVisible(true);
			store.joystick.base.setPosition(pointer.x, pointer.y);
			store.joystick.thumb.setPosition(pointer.x, pointer.y);
		});

		this.input.on('pointerup', () => {
			if (store.joystick) store.joystick.setVisible(false);
		});
	}

	createZoomUI (panelHeight: number) {
		const plusBtn = this.add.text(this.screenWidth - 100, panelHeight + 5, '+', { fontSize: '32px', color: '#000' })
			.setAlpha(0.5)
			.setInteractive()
			.on('pointerdown', () => {
				store.currentZoom = Math.min(store.currentZoom + 0.1, 2);
				EventBus.emit('zoom:change');
			});
		this.uiElements.push(plusBtn);
		const minusBtn = this.add.text(this.screenWidth - 150, panelHeight + 5, '-', { fontSize: '32px', color: '#000' })
			.setAlpha(0.5)
			.setInteractive()
			.on('pointerdown', () => {
				store.currentZoom = Math.max(store.currentZoom - 0.1, 0);
				EventBus.emit('zoom:change');
			});
		this.uiElements.push(minusBtn);
	}

	onResize () {
		this.screenWidth = this.scale.width;
		this.rebuildUI();
	}

	update (time: number, delta: number): void {
		const elapsedMs = Date.now() - store.timer;
		const elapsedSec = Math.floor(elapsedMs / 1000);
		const minutes = Math.floor(elapsedSec / 60);
		const seconds = elapsedSec % 60;
		this.hudText.setText(
			`Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds} | Points: ${store.score}`
		);
	}
}