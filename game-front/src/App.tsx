import { useEffect, useState, useCallback } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';

import { AppRouter } from './routes';
import { useAuthStore } from './store/auth';
import { useWalletStore } from './store/wallet';
import { TicketProvider } from './providers/tickets/provider';

import { Onboarding } from './components/Onboarding';

import './app.css';
import './i18n';

import { AuthModal } from './components/Connect/AuthModal';
import { TelegramModal } from './components/Connect/TelegramModal';
import { useSettingsStore } from './store/settings/settings';

function sleep (ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const TMA_CHECK_TIMEOUT = 3000;
const TMA_CHECK_INTERVAL = 200;

async function detectTMA (): Promise<boolean> {
	const start = Date.now();

	while (Date.now() - start < TMA_CHECK_TIMEOUT) {
		if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
			return true;
		}
		await sleep(TMA_CHECK_INTERVAL);
	}

	return Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user);
}

function App () {
	const { connecWallet, setConnectWallet } = useSettingsStore();
	const [ loading, setLoading ] = useState(true);
	const [ isTMA, setIsTMA ] = useState<boolean | null>(null); // null = ещё не определили
	const [connector] = useTonConnectUI();
	const { auth, getMe, access_token, user } = useAuthStore();
	const { setTonConnector } = useWalletStore();

	useEffect(() => {
		if (connector) setTonConnector(connector);
	}, [ connector, setTonConnector ]);

	// Определяем isTMA один раз при монтировании, с ожиданием
	useEffect(() => {
		let cancelled = false;

		detectTMA().then((result) => {
			if (!cancelled) setIsTMA(result);
		});

		return () => {
			cancelled = true; 
		};
	}, []);

	const fetchUser = useCallback(async () => {
		try {
			await getMe();
		} catch (e) {
			console.error('Auth error:', e);
		} finally {
			setLoading(false);
		}
	}, [getMe]);

	useEffect(() => {
		if (isTMA === null) return; // ждём пока определится
		if (!loading) return;

		const fetchAuth = async () => {
			try {
				await auth();
				await getMe();
			} catch (e) {
				console.error('Auth error:', e);
			} finally {
				setLoading(false);
			}
		};

		if (isTMA) {
			fetchAuth();
		} else {
			fetchUser();
		}
	}, [ isTMA, access_token, auth, getMe, loading, fetchUser ]);

	if (isTMA === null) {
		return <Onboarding />; // или свой спиннер/сплэш-скрин
	}

	if (loading || (!user)) {
		if (isTMA) {
			return <Onboarding />;
		} else {
			return (
				<>
					<div className="fixed inset-0 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900">
						<div style={{ background: 'url(/assets/images/bg-menu.png) no-repeat', backgroundSize: '100% 100%' }} className="absolute inset-0">		
						</div>
					</div>
					<TelegramModal onLoad={fetchUser} />
				</>
			);
		}
	}

	return (
		<TicketProvider>
			{connecWallet && <AuthModal onClose={() => setConnectWallet(false)} />}
			<AppRouter />
		</TicketProvider>
	);
}

export default App;