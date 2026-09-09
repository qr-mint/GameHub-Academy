type SettingsState = {
  language: string | null;
  fiatCurrency: string;
  cryptoCurrency: string;
  controll: 'joystick' | 'arrows';
  network: 'ton' | 'kaia' | undefined;
  cameraMode: 'full' | 'player';
  zoomLevel: number;
  connecWallet: boolean;
};

type SettingsActions = {
  setConnectWallet: (is: boolean) => void;
  setLanguage: (language: string) => void;
  setFiatCurrency: (value: string) => void;
  setCryptoCurrency: (value: string) => void;
  setNetwork: (value: 'ton' | 'kaia') => void;
  setControll: (value: 'joystick' | 'arrows') => void;
  setCameraMode: (value: 'full' | 'player') => void;
  setZoomLevel: (value: number) => void;
};

export type SettingsStore = SettingsState & SettingsActions;
