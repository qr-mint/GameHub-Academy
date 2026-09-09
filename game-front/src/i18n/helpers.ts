export const determineLanguage = () => {
	const savedSettings = JSON.parse(localStorage.getItem('settings') || '{}');
	const savedLanguage = savedSettings.state?.language;
	const browserLanguage = navigator.language.split('-')[0]; // Get the browser's language, e.g., 'en-US' -> 'en'

	return savedLanguage || browserLanguage || 'en';
};
