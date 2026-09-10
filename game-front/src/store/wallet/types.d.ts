import { TonConnectUI } from '@tonconnect/ui-react';

type WalletState = {
  balance?: any;
  address?: string;
  access_token?: string;
  chain?: string,
  connector?: TonConnectUI;
};

type WalletActions = {
  connect: (chain: string, body: any) => Promise<string>;
  disconnect: () => Promise<void>;
  setTonConnector: (connector: TonConnectUI) => void;
}

export type WalletStore = WalletState & WalletActions;
