
import BigNumber from 'bignumber.js';

const cutNumber = (number: number, digits = 0) =>
	Math.floor(
		BigNumber(number)
			.multipliedBy(10 ** digits)
			.toNumber()
	) /
  10 ** digits;

const formatValue = (value: any) => value.toString().trim().replaceAll(',', '');

export const prettyNumber = (value: any) => {
	if (!value) {
		return 0;
	}

	// for string with range (iost APY "4.8-36.13" etc)
	if (Number.isNaN(+value)) {
		return value;
	}
	const formatedValue = formatValue(value);
	const maxDecimals = 9;
	const prefix = +formatedValue < 0 ? '-' : '';
	const absoluteValue = Math.abs(formatedValue);

	// |value| < 1
	if (absoluteValue && cutNumber(absoluteValue, maxDecimals) === 0) {
		return '~0';
	}

	return `${prefix}${cutNumber(absoluteValue, maxDecimals)}`;
};

export const prettyNumberTooltip = (value: any) => {
	if (!value) {
		return '0';
	}

	if (Number.isNaN(+value)) {
		return value;
	}

	const formatedValue = formatValue(value);
	const maxDecimals = 8;

	return cutNumber(formatedValue, maxDecimals).toLocaleString('en', {
		maximumFractionDigits: maxDecimals,
	});
};

export const formatByDecimals = (num: number, decimal = 6) => {
	if (+num > 0) {
		const arr = num.toString().split('.');
		if (arr.length > 1) {
			const drob = arr[1].substr(0,decimal);
			if (decimal === 0) {
				return arr[0];
			}
			return arr[0] + '.' + drob;
		}
	}
	return num;
};

export function numberWithCommas (x: any, decimals: any) {
	if (x) {
		if (+x === 0) {
			return x;
		}

		const numFixed = decimals ? x?.toFixed(decimals) : x;

		const str = numFixed?.toString().split('.');
		str[0] = str[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

		return str.join('.');
	}
	return '0.00';
}
