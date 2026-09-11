import { AUTO, Game, WEBGL } from 'phaser';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

import { Game as MainGame } from './scenes/Game';
import { LoaderScene } from './scenes/Loader';
import UIScene from './scenes/UIScene';
import { Background } from './scenes/Background';

const width = window.innerWidth;
const height = window.innerHeight;

const config: Phaser.Types.Core.GameConfig = {
	type: AUTO,
	width: width,
	height: height,
	scene: [ LoaderScene, Background, MainGame, UIScene ],
	// images: [{[]}],
	
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0, x: 0 },
			debug: import.meta.env.VITE_MODE === 'dev',
		},
	},
	plugins: {
		scene: [{
			key: 'rexVirtualJoystick', // ключ для сцены
			plugin: VirtualJoystickPlugin, // сам плагин
			mapping: 'rexVirtualJoystick', // делаем доступным через this.rexVirtualJoystick
			start: true
		}]
	},
	scale: {
		mode: Phaser.Scale.EXPAND,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		zoom: 1,
		min: {
			width: 200,
			height: 150
		},
		max: {
			width,
			height
		},
	},

	autoRound: true
};

const StartGame = (parent: string) => {
	config.parent = parent;
	const game = new Game(config);
	return game;
};

export default StartGame;
