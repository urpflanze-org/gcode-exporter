import type { IDrawerProps, IPropArguments } from '@urpflanze/core'

/**
 * @category Types
 */
export interface IGCODEExporterSettings {
	// Draw Area
	minX?: number
	minY?: number
	maxX?: number
	maxY?: number

	comments?: boolean

	// feedrate mm/m
	velocity?: number

	unit?: 'millimeters' | 'inches'

	// Pen
	penUpCommand: string
	penDownCommand: string

	// Rounding off values
	decimals?: number
}

/**
 * @category Types
 */
export interface IGCODEPropArguments extends IPropArguments {}

/**
 * @category Types
 */
export type TGCODEProp<T> = T | { (propArguments: IGCODEPropArguments): T }

/**
 * @category Types
 */
export interface IGCODEStreamProps extends IDrawerProps {
	velocity?: TGCODEProp<string | number>
}
