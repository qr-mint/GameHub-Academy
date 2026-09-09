import { Scene } from 'phaser';

export class Background extends Scene {
	bg: Phaser.GameObjects.TileSprite;

	constructor () {
		super('Background');
	}

	create () {
		const { width, height } = this.cameras.main;

		this.bg = this.add.tileSprite(0, 0, width, height, 'bg')
			.setOrigin(0, 0);

		this.textures.get('bg').setFilter(Phaser.Textures.FilterMode.NEAREST);
		this.cameras.main.setPostPipeline('ContrastPipeline');

		this.applyScale(width, height);

		// Слушаем ресайз от Phaser (срабатывает при повороте тоже)
		this.scale.on('resize', this.onResize, this);
	}

	private applyScale (width: number, height: number) {
		const texture = this.textures.get('bg').getSourceImage() as HTMLImageElement;
		const scale = height / texture.height;

		this.bg.setSize(width, height);
		this.bg.tileScaleX = scale;
		this.bg.tileScaleY = scale;
	}

	onResize (gameSize: Phaser.Structs.Size) {
		const { width, height } = gameSize;

		const bw = Math.max(1, width);
		const bh = Math.max(1, height);

		this.bg.setPosition(0, 0);
		this.applyScale(bw, bh);
	}

	shutdown () {
		this.scale.off('resize', this.onResize, this);
	}
}