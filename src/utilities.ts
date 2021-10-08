export const round = (value: number, decimals: number) => Math.round(value * 10 ** decimals) / 10 ** decimals

export const concat = (result: Array<string>, data: Array<string> | string) => {
	if (typeof data === 'string') result.push(data)
	else data.forEach(line => result.push(line))
}

export function clamp(min: number, max: number, value: number) {
	return value <= min ? min : value >= max ? max : value
}

export function toNumber(value: string | number, defaultValue = 0) {
	return typeof value === 'number' && !Number.isNaN(value)
		? value
		: typeof value === 'string'
		? parseFloat(value)
		: defaultValue
}
