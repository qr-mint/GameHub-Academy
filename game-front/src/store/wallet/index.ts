import { create } from 'zustand';
import { VERSION } from '@/store/config';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { WalletState, WalletStore } from './types';
import { connect, getBalance } from '../../api/wallet';
import { TonConnectUI } from '@tonconnect/ui-react';
import { generateKey } from '../../api/app';

const initialState: WalletState = {
	balance: undefined,
	address: undefined,
	access_token: undefined,
	chain: undefined,
};

export const useWalletStore = create<WalletStore>()(
	persist(
		(set) => ({
			...initialState,
			connect: async (chain: string, body: any): Promise<string> => {
				const key = await generateKey(import.meta.env.VITE_PUBLIC_KEY);
				const res = await connect(chain, body, key);
				const balance = await getBalance(chain, res.wallet.address);
				set({
					address: res.wallet.address,
					access_token: res.access_token,
					balance,
					chain
				});
				return res.access_token;
			},

			disconnect: async () => {
				const state = useWalletStore.getState();
				if (state.connector) {
					await state.connector.disconnect(); // Call the TonConnect disconnect function
				}
				set({ address: undefined, access_token: '' });
			},
			setTonConnector: (connector: TonConnectUI) => {
				set({ connector });
			},
		}),
		{
			name: 'wallet',
			version: VERSION,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				balance: state.balance,
				address: state.address
			}),
		}
	)
);
