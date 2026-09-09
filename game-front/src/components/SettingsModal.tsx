import { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Globe, Gamepad2, ZoomIn, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/store/settings/settings';
import { EventBus } from '@/game/EventBus';
import { useLocation } from 'react-router-dom';

import { Modal } from './modal';
import { toggleMuteBackgroundMusic } from '@/audio/backgroundMusic';

enum controllTypes {
  joystick = 'joystick',
  arrows = 'arrows'
}

enum cameraMode {
  full = 'full',
  player = 'player'
}

export function SettingsModal ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  
	const [ soundEnabled, setSoundEnabled ] = useState(true);
	const settings = useSettingsStore();
	const { t, i18n } = useTranslation();
	const location = useLocation();
	const isGamePage = location.pathname === '/game';
	console.log(isGamePage);
	useEffect(() => {
		if (!isGamePage) return;
    
		if (isOpen) {
			EventBus.emit('settings:controll-change', settings.controll);
			EventBus.emit('settings:zoom-change', settings.zoomLevel);
			EventBus.emit('settings:camera-mode-change', settings.cameraMode);
		}
	}, [ isOpen, isGamePage ]);

	const handleLanguage = (key: string) => {
		settings.setLanguage(key);
		i18n.changeLanguage(key);
	};

	const handleControllChange = (value: 'joystick' | 'arrows') => {
		settings.setControll(value);
		if (isGamePage) {
			EventBus.emit('settings:controll-change', value);
		}
	};

	const handleZoomChange = (value: number) => {
		settings.setZoomLevel(value);
		if (isGamePage) {
			EventBus.emit('settings:zoom-change', value);
		}
	};

	const handleCameraModeChange = (value: 'full' | 'player') => {
		settings.setCameraMode(value);
		if (isGamePage) {
			EventBus.emit('settings:camera-mode-change', value);
		}
	};


	const handleToggleAudio = () => {
		toggleMuteBackgroundMusic();
		setSoundEnabled(!soundEnabled);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="bg-white/95 backdrop-blur-xl border-2 border-amber-300 shadow-2xl rounded-2xl">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-bold text-amber-900">{t('settings.title')}</h2>
						<button
							onClick={onClose}
							className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition-colors"
						>
							<X className="w-5 h-5 text-amber-700" />
						</button>
					</div>

					<div className="space-y-4">
						<div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
							<div className="flex items-center gap-3 mb-3">
								<Gamepad2 className="w-5 h-5 text-amber-600" />
								<p className="font-semibold text-amber-900">{t('settings.cameraMode.title')}</p>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<button
									onClick={() => handleCameraModeChange(cameraMode.full)}
									className={`px-4 py-3 rounded-lg font-medium transition-all flex flex-col items-center gap-1 ${
										settings.cameraMode === cameraMode.full
											? 'bg-amber-600 text-white shadow-lg'
											: 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
									}`}
								>
									<span className="text-sm">{t('settings.cameraMode.full')}</span>
								</button>
								<button
									onClick={() => handleCameraModeChange(cameraMode.player)}
									className={`px-4 py-3 rounded-lg font-medium transition-all flex flex-col items-center gap-1 ${
										settings.cameraMode === cameraMode.player
											? 'bg-amber-600 text-white shadow-lg'
											: 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
									}`}
								>
									<span className="text-sm">{t('settings.cameraMode.player')}</span>
								</button>
							</div>
						</div>

						<div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
							<div className="flex items-center gap-3 mb-3">
								<Gamepad2 className="w-5 h-5 text-amber-600" />
								<p className="font-semibold text-amber-900">{t('settings.controll.title')}</p>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<button
									onClick={() => handleControllChange(controllTypes.joystick)}
									className={`px-4 py-3 rounded-lg font-medium transition-all flex flex-col items-center gap-1 ${
										settings.controll === controllTypes.joystick
											? 'bg-amber-600 text-white shadow-lg'
											: 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
									}`}
								>
									<span className="text-sm">{t('settings.controll.joystick')}</span>
								</button>
								<button
									onClick={() => handleControllChange(controllTypes.arrows)}
									className={`px-4 py-3 rounded-lg font-medium transition-all flex flex-col items-center gap-1 ${
										settings.controll === controllTypes.arrows
											? 'bg-amber-600 text-white shadow-lg'
											: 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
									}`}
								>
									<span className="text-sm">{t('settings.controll.arrows')}</span>
								</button>
							</div>
						</div>

						{/* {settings.cameraMode === 'player' && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-3 mb-3">
                  <ZoomIn className="w-5 h-5 text-amber-600" />
                  <p className="font-semibold text-amber-900">{t('settings.zoom.title') || 'Zoom'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleZoomChange(Math.max(0.5, settings.zoomLevel - 0.2))}
                    className="flex-1 px-4 py-2 rounded-lg bg-white text-amber-700 hover:bg-amber-100 border border-amber-200 font-medium transition-all"
                  >
                    <ArrowDown className="w-4 h-4 mx-auto" />
                  </button>
                  <div className="flex-1 px-4 py-2 rounded-lg bg-amber-600 text-white font-bold text-center">
                    {Math.round(settings.zoomLevel * 100)}%
                  </div>
                  <button
                    onClick={() => handleZoomChange(Math.min(3, settings.zoomLevel + 0.2))}
                    className="flex-1 px-4 py-2 rounded-lg bg-white text-amber-700 hover:bg-amber-100 border border-amber-200 font-medium transition-all"
                  >
                    <ArrowUp className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            )} */}

						<div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
							<div className="flex items-center gap-3">
								{soundEnabled ? (
									<Volume2 className="w-5 h-5 text-amber-600" />
								) : (
									<VolumeX className="w-5 h-5 text-amber-600" />
								)}
								<div>
									<p className="font-semibold text-amber-900">{t('settings.sound.title')}</p>
									<p className="text-sm text-amber-600">
										{soundEnabled ? t('settings.sound.turnOn') : t('settings.sound.turnOff')}
									</p>
								</div>
							</div>
							<button
								onClick={handleToggleAudio}
								className={`relative w-14 h-8 rounded-full transition-colors ${
									soundEnabled ? 'bg-amber-600' : 'bg-gray-300'
								}`}
							>
								<div
									className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
										soundEnabled ? 'translate-x-7' : 'translate-x-1'
									}`}
								/>
							</button>
						</div>

						<div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
							<div className="flex items-center gap-3 mb-3">
								<Globe className="w-5 h-5 text-amber-600" />
								<p className="font-semibold text-amber-900">{t('settings.language')}</p>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<button
									onClick={() => handleLanguage('ru')}
									className={`px-4 py-2 rounded-lg font-medium transition-all ${
										settings.language === 'ru'
											? 'bg-amber-600 text-white shadow-lg'
											: 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
									}`}
								>
                  Русский
								</button>
								<button
									onClick={() => handleLanguage('en')}
									className={`px-4 py-2 rounded-lg font-medium transition-all ${
										settings.language === 'en'
											? 'bg-amber-600 text-white shadow-lg'
											: 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
									}`}
								>
                  English
								</button>
							</div>
						</div>
					</div>

					<button
						onClick={onClose}
						className="w-full mt-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 rounded-xl shadow-lg transition-all"
					>
						{t('settings.save')}
					</button>
				</div>
			</div>
		</Modal>
	);
}