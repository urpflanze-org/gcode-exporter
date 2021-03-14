export const round = (value: number, decimals: number) => Math.round(value * 10 ** decimals) / 10 ** decimals

export const concat = (result: Array<string>, data: Array<string> | string) => {
	if (typeof data === 'string') result.push(data)
	else data.forEach(line => result.push(line))
}
