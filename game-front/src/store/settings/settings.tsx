import i18n from '@/i18n';
import { create } from 'zustand';
import { VERSION } from '@/store/config';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { SettingsState, SettingsStore } from './types';

const initialState: SettingsState = {
	language: null,
	fiatCurrency: 'usd',
	cryptoCurrency: 'ton_ton',
	network: 'ton',
	controll: 'joystick',
	cameraMode: 'player',
	zoomLevel: 1.2,
	connecWallet: false
};

export const useSettingsStore = create<SettingsStore>()(
	persist(
		(set) => ({
			...initialState,
			setConnectWallet: (connecWallet: boolean) => {
				set({ connecWallet });
			},
			setLanguage: (language) => {
				i18n.changeLanguage(language);
				set({ language });
			},
			setFiatCurrency: (fiatCurrency: string) => {
				set({ fiatCurrency });
			},
			setCryptoCurrency: (cryptoCurrency: string) => {
				set({ cryptoCurrency });	
			},
			setNetwork: (network: 'ton' | 'kaia') => {
				set({ network });
			},
			setControll: (controll: 'joystick' | 'arrows') => {
				set({ controll });
			},
			setCameraMode: (cameraMode: 'full' | 'player') => {
				set({ cameraMode });
			},
			setZoomLevel: (zoomLevel: number) => {
				set({ zoomLevel });
			}
		}),
		{
			name: 'settings',
			version: VERSION,
			// storage: createJSONStorage(() => localStorage),
		}
	)
);
