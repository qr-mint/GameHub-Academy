import ReactDOM from 'react-dom/client';
import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { WagmiProvider } from 'wagmi';
import { configEvm } from './components/Connect/hooks/config/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
import App from './App';
import { ConnectProvider } from './components/Connect/provider';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<WagmiProvider config={configEvm}>
		<QueryClientProvider client={queryClient}>
		<BrowserRouter>
			<TonConnectUIProvider manifestUrl={`${import.meta.env.VITE_CONNECT_URL}/tonconnect-manifest.json`}>
				<ConnectProvider>
					<I18nextProvider i18n={i18next}> 
						<App />
						<ToastContainer />
					</I18nextProvider>
				</ConnectProvider>
			</TonConnectUIProvider>
		</BrowserRouter>
		</QueryClientProvider>
	</WagmiProvider>
	,
);