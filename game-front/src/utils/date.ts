function pad (d) {
	return (d < 10) ? '0' + d.toString() : d.toString();
}

export const onlyDate = (date) => {
	if (typeof date === 'string') date = date.trim();

	date = new Date(date);
	return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};

const monthLabel = {
	en: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
	ru: [ 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь' ]
};

export const formatWithMonthLabel = (date, lang = 'ru', isTime = false) => {
	if (typeof date === 'string') date = date.trim();
	date = new Date(date);
	const time = isTime ? ` ${pad(date.getHours())}:${pad(date.getMinutes())}` : '';
	return `${monthLabel[lang][date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}` + time;
};

export const getTypeByDate = (startet_at, ended_at) => {
	if (typeof startet_at === 'string') startet_at = startet_at.trim();
	if (typeof ended_at === 'string') ended_at = ended_at.trim();
	startet_at = new Date(startet_at);
	ended_at = new Date(ended_at);
	const now = Date.now();
	if (now > startet_at.getTime() && now < ended_at.getTime()) return 'ongoing';
	else if (now < startet_at.getTime() && now < ended_at.getTime()) return 'upcoming';
	else return 'finished';
};

export function formatTime (seconds: number): string {
	const mins = Math.floor(seconds / 1000 / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
}