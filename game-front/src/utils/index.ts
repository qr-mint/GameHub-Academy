export function isMobile () {
	return window.innerWidth <= 500;
}

export function isDesktop () {
	return window.innerWidth >= 1050;
}

export function openLink (href: string, target = '_self') {
	window.open(href, target, 'noreferrer noopener');
}

export function addReturnStrategy (url: string, returnStrategy: string) {
	const link = new URL(url);
	link.searchParams.append('ret', returnStrategy);
	return link.toString();
}