import { Scene } from 'phaser';
import { getTournament, getTournamentBy, getParticipant } from '@/api/game/tournaments.ts';
import { store } from '../store';

const range = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const TVNoiseShader = `
precision mediump float;

uniform vec2 resolution;
uniform float time;

// Функция генерации псевдослучайных чисел
float random(vec2 pos) {
    return fract(sin(dot(pos.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    // 1. Генерируем базовый белый шум
    float noise = random(uv + fract(time));
    
    // 2. Создаем горизонтальные полосы развертки
    float scanline = sin(uv.y * 400.0 + time * 10.0) * 0.1;
    
    // Смешиваем шум и полосы
    float finalColor = noise - scanline;
    
    // ИСПРАВЛЕНО: Передаем 4 компонента (vec4), так как gl_FragColor требует RGBA
    gl_FragColor = vec4(finalColor, finalColor, finalColor, 1.0);
}
`;


export class LoaderScene extends Scene {
	tvShader: Phaser.GameObjects.Shader;
	constructor () {
		super('LoaderScene');
	}

	async preload () {
	
		this.load.image('arrow-up', 'assets/images/white-arrow-up.svg');
		this.load.image('arrow-down', 'assets/images/white-arrow-down.svg');
		this.load.image('arrow-left', 'assets/images/white-arrow-left.svg');
		this.load.image('arrow-right', 'assets/images/white-arrow-right.svg');
		this.load.image('pause', 'assets/images/white-pause-circle.svg');
		this.load.image('play', 'assets/images/white-play-circle.svg');
		this.load.image('settings', 'assets/images/white-settings.svg');
		//this.load.audio('dead-sound', 'assets/music/explode.mp3');
		this.load.spritesheet('player', 'assets/images/player.png', {
			frameWidth: 243, // <-- подставь реальную ширину одного кадра
			frameHeight: 360, // <-- подставь реальную высоту одного кадра
		});
	}

	create () {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;
		this.tvShader = this.add.shader(new Phaser.Display.BaseShader('TVNoise', TVNoiseShader), 0, 0, this.scale.width * 2, this.scale.height * 2);

		
		this.add.text(width / 2, height / 2, 'Loading level...', {
			fontSize: '24px',
			color: '#ffffff'
		}).setOrigin(0.5);

		this.startFlow();

		this.load.on('complete', () => {
			this.startFlow();
		});

		this.load.start();
	}

	update (time: number, delta: number) {
		// Обязательно передаем изменяющееся время, чтобы помехи "двигались"
		this.tvShader.setUniform('time.value', time * 0.001);
	}

	async startFlow () {
		try {
			const params = new URLSearchParams(window.location.search);

			const tourname_id = params.get('tourname_id');
			const tourname_type = params.get('tourname_type');
			const order_id = params.get('order_id');

			let tournament;
			if (tourname_type) tournament = await getTournamentBy(tourname_type);
			else if (tourname_id) tournament = await getTournament(tourname_id);

			if (tournament?.entry_mode === 'per_attempt') {
				const participant = await getParticipant(tourname_id);

				if (!participant.allow) {
					window.location.href = `/tournaments/${tourname_id}?error=payment_required`;
					return;
				}
			}
			if (tournament) {
				store.tournament = tournament;
			}
			this.scene.launch('Background');
			this.scene.start('Game', { tournament, order_id });
		} catch {
			this.scene.launch('Background');
			this.scene.start('Game');
		}
	}
}
