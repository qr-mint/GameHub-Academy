import Phaser from 'phaser';

/**
 * Класс игрока на Phaser с анимацией бега на основе спрайт-листа.
 *
 * ВАЖНО: используем только ВЕРХНИЙ ряд картинки — все 3 кадра
 * (1-й, 2-й и 3-й слева-направо).
 *
 * Перед использованием подготовь картинку так, чтобы в спрайт-листе
 * 'player' был только этот верхний ряд из 3 кадров подряд:
 *   кадр 0 = 1-й кадр верхнего ряда
 *   кадр 1 = 2-й кадр верхнего ряда
 *   кадр 2 = 3-й кадр верхнего ряда
 * (просто вырежи верхний ряд исходной картинки и сохрани как новый файл,
 * шириной frameWidth*3 и высотой frameHeight, т.е. примерно 729x360).
 *
 * Подставь реальную ширину/высоту одного кадра ниже в preload(),
 * если твои кадры отличаются от 243x360.
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
	private speed: number = 160;

	constructor (scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y, 'player');

		scene.add.existing(this);
		scene.physics.add.existing(this);

		this.setCollideWorldBounds(true);
		this.setOrigin(0.5, 1);

		this.createAnimations();
		this.play('idle');
	}

	private createAnimations (): void {
		const anims = this.scene.anims;

		// Анимация бега — верхний ряд, все 3 кадра (0, 1, 2)
		if (!anims.exists('run')) {
			anims.create({
				key: 'run',
				frames: anims.generateFrameNumbers('player', { start: 6, end: 8 }),
				frameRate: 6,
				repeat: -1,
			});
		}

		if (!anims.exists('idle')) {
			anims.create({
				key: 'idle',
				frames: [{ key: 'player', frame: 6 }],
				frameRate: 1,
			});
		}
	}

	/**
   * Вызывать в update() сцены, передавая cursors из
   * this.input.keyboard.createCursorKeys()
   */
	update (cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
		let moving = false;

		if (cursors.left?.isDown) {
			this.setVelocityX(-this.speed);
			this.setFlipX(true); // спрайт смотрит вправо по умолчанию -> отражаем для движения влево
			moving = true;
		} else if (cursors.right?.isDown) {
			this.setVelocityX(this.speed);
			this.setFlipX(false);
			moving = true;
		} else {
			this.setVelocityX(0);
		}

		if (cursors.up?.isDown) {
			this.setVelocityY(-this.speed);
			moving = true;
		} else if (cursors.down?.isDown) {
			this.setVelocityY(this.speed);
			moving = true;
		} else {
			this.setVelocityY(0);
		}

		if (moving) {
			if (this.anims.currentAnim?.key !== 'run') {
				this.play('run', true);
			}
		} else {
			if (this.anims.currentAnim?.key !== 'idle') {
				this.play('idle', true);
			}
		}
	}
}