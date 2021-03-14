/**
 * @category Services.Export/Import
 */
export interface IGCODEExporterSettings {
	// Draw Area
	minX?: number
	minY?: number
	maxX?: number
	maxY?: number

	// feedrate mm/m
	velocity?: number

	unit?: 'millimeters' | 'inches'

	// Pen
	penUpCommand: string
	penDownCommand: string

	// Rounding off values
	decimals?: number
}
