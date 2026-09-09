import { useNavigate, useLocation } from 'react-router-dom';

const key = 'previous_url';

export const useStorageNavigate = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const push = (path: string) => {
		localStorage.setItem(key, location.pathname);
		navigate(path);
	};

	const back = () => {
		const prevUrl = localStorage.getItem(key);
		if (prevUrl) {
			navigate(prevUrl);
			localStorage.removeItem(key);
		} else {
			navigate(-1);
		}
	};
  
	return { push, back };
};