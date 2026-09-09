import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { determineLanguage } from './helpers';

import russianTranslation from './translations/russian.json';
import englishTranslation from './translations/english.json';

i18next
	.use(initReactI18next) // Passes i18n down to react-i18next
	.init({
		resources: {
			ru: { translation: russianTranslation },
			en: { translation: englishTranslation },
		},
		lng: determineLanguage(),
		fallbackLng: 'en',
		debug: true, // Enable debug mode for development

		interpolation: {
			escapeValue: false, // React already protects from XSS
		},
	});

export default i18next;
