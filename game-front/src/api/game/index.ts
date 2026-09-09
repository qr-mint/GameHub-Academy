import { apiClient } from '../request';
import { getQueryParams } from '../../utils/getQueryParams';

export const getGameUser = async () => {
	const code = getQueryParams('tgWebAppStartParam');
	let paramQuery = '';
	if (code?.includes('invite_')) {
		paramQuery = `&invite_code=${code}`;
	} else {
		const code = getQueryParams('code');
		paramQuery = `?invite_code=${code}`;
	}
	const res = await apiClient.get(`/game/telegram${paramQuery}`);
	return res.data.data;
};

export const walletConnect = async (token: string) => {
	const res = await apiClient.post('/game/wallet', { token });
	return res.data.data;
};
