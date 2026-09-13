import {
	SendIcon
} from 'lucide-react';
import { LoginButton } from '@telegram-auth/react';

import { Modal } from '../modal';
import { toast } from 'react-toastify';
import { generateKey } from '@/api/app';
import { useAuthStore } from '@/store/auth';
import { useTranslation } from '../../../node_modules/react-i18next';

async function generateTelegramHash (data: any, botToken: string) {
	const { hash, ...fields } = data; // удаляем существующий hash, если есть

	// 1. Формируем data_check_string
	const sortedKeys = Object.keys(fields).sort();
	const dataCheckString = sortedKeys.map(key => `${key}=${fields[key]}`).join('\n');

	// 2. SHA256 от botToken → используется как секретный ключ
	const enc = new TextEncoder();
	const keyData = await crypto.subtle.digest('SHA-256', enc.encode(botToken));

	// 3. Импортируем ключ для HMAC
	const cryptoKey = await crypto.subtle.importKey(
		'raw',
		keyData,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);

	// 4. Вычисляем подпись
	const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(dataCheckString));

	// 5. Переводим в hex-строку
	const hexHash = Array.from(new Uint8Array(signature))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');

	return hexHash;
}

interface TelegramModalI {
	onLoad: () => void;
}

export const TelegramModal = ({ onLoad }: TelegramModalI) => {
	const { t } = useTranslation();
	const { authWeb } = useAuthStore();
	const handleTelegramAuth = async (data: any) => {
		try {
			if (import.meta.env.VITE_MODE === 'dev' && import.meta.env.VITE_BOT_TOKEN) {
				const hash = await generateTelegramHash(data, import.meta.env.VITE_BOT_TOKEN);
				data.hash = hash;
			}
			const key = await generateKey(import.meta.env.VITE_PUBLIC_KEY);
			await authWeb(data, key);
			onLoad();
		} catch (err) {
			toast.error((err as any).message);
		}
	};

	const renderButton = () => {
		if (import.meta.env.VITE_MODE === 'dev') {
			return (
				<button
					className="btn flex text-center justify-center items-center appearance-none py-1 focus:outline-none cursor-pointer select-none overflow-hidden z-10 w-full relative uppercase duration-100 font-semibold px-2 rounded dark:text-white h-11"
					onClick={() => handleTelegramAuth({
						'id': 406497473,
						'first_name': 'Victor',
						'username': 'dao0dev',
						'photo_url': 'https://t.me/i/userpic/320/pVipE6yAYDfeg0yAsQXVU6gUnq1NEoi01LWqzhRT7x4.jpg',
						'auth_date': Date.now(),
					})}
				>
					Authorizate
				</button>
			);
		} else {
			return (
				<LoginButton
					botUsername={import.meta.env.VITE_BOT_USERNAME}
					buttonSize="large" // "large" | "medium" | "small"
					cornerRadius={5} // 0 - 20
					showAvatar={true} // true | false
					lang="en"
					onAuthCallback={handleTelegramAuth}
				/>
			);
		}
	};
  
	return (
		<Modal onClose={() => null} isOpen={true}>
			<div className="relative w-full max-w-md bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-white/20 rounded-2xl p-6">
				<div className="text-center mb-6">
					<div className="w-16 h-16 rounded-2xl bg-white/20 mx-auto mb-4 flex items-center justify-center">
						<SendIcon className="w-8 h-8 text-white" />
					</div>
					<h2 className="text-2xl font-bold text-white">{t('telegram.connect')}</h2>
				</div>
				<div className="flex justify-center">
					{renderButton()}
				</div>
			</div>
		</Modal>
	);
};