import type { Scene, ShapePrimitive } from '@urpflanze/core'
import { clamp } from '@urpflanze/core/dist/cjs/Utilities'
import * as simplify from 'simplify-js'

import type { IGCODEExporterSettings } from './types'
import { round, concat } from './utilities'

class GCODEExporter {
	static defaults: Required<IGCODEExporterSettings> = {
		minX: 0,
		minY: 0,
		maxX: 297,
		maxY: 210,
		unit: 'millimeters',
		velocity: 1500,
		penUpCommand: 'M3 S30',
		penDownCommand: 'M3 S0',
		decimals: 2,
	}

	static parse(scene: Scene, settings: IGCODEExporterSettings): string {
		const bindedSettings: Required<IGCODEExporterSettings> = {
			...GCODEExporter.defaults,
			...settings,
		}

		return GCODEExporter.generate(scene, bindedSettings).join('\n')
	}

	/**
	 * Set units to inches or millimeters.
	 * When unit is set, all positions, offsets, rates, accelerations, etc., specified in G-code parameters are interpreted in that unit.
	 *
	 * @param unit 'millimeters' | 'inches'
	 * @returns
	 */
	static setUnit(unit: 'millimeters' | 'inches'): string {
		return unit === 'inches' ? 'G20' : 'G21'
	}

	/**
	 * In this mode all coordinates are interpreted as relative to the last position.
	 *
	 * @returns
	 */
	static useRelativePosition(): string {
		return 'G91'
	}

	/**
	 * All coordinates given in G-code are interpreted as positions in the logical coordinate space
	 *
	 * @returns
	 */
	static useAbsolutePosition(): string {
		return 'G90'
	}

	/**
	 * Up pen and go home
	 *
	 * @param penUpCommand
	 * @returns
	 */
	static goHome(penUpCommand: string): Array<string> {
		return [penUpCommand, 'G28 X0 Y0']
	}

	/**
	 * Store the origin position that the machine goes to when the {G28} command is issued
	 *
	 * @param x
	 * @param y
	 * @param decimals
	 * @returns
	 */
	static setCurrentMachinePosition(x: number, y: number, decimals: number) {
		return `G28.1 X${round(x, decimals)} Y${round(y, decimals)}`
	}

	/**
	 * Set the current position to the values specified.
	 *
	 * @param x
	 * @param y
	 * @param decimals
	 * @returns
	 */
	static setCurrentWorkspacePosition(x: number, y: number, decimals: number) {
		return `G92 X${round(x, decimals)} Y${round(y, decimals)}`
	}

	/**
	 * Linear move.
	 * G0 is a rapid moviment (max speed)
	 * G1 moviment of setted velocity
	 *
	 * @param x
	 * @param y
	 * @param decimals
	 * @param velocity
	 * @returns
	 */
	static goTo(x: number, y: number, decimals: number, velocity?: number): string {
		return typeof velocity !== 'undefined'
			? `G1 X${round(x, decimals)} Y${round(y, decimals)} F${velocity}`
			: `G0 X${round(x, decimals)} Y${round(y, decimals)}`
	}

	/**
	 * Up the pen, move and down
	 *
	 * @param penUpCommand
	 * @param penDownCommand
	 * @param x
	 * @param y
	 * @param round
	 * @returns
	 */
	static moveTo(penUpCommand: string, penDownCommand: string, x: number, y: number, round: number) {
		return [penUpCommand, this.goTo(x, y, round), penDownCommand]
	}

	/**
	 * goTo alias
	 *
	 * @param x
	 * @param y
	 * @param velocity
	 * @param round
	 * @returns
	 */
	static lineTo(x: number, y: number, velocity: number, round: number) {
		return this.goTo(x, y, round, velocity)
	}

	/**
	 * Generate gcode frm scene
	 *
	 * @param scene
	 * @param settings
	 * @returns
	 */
	static generate(scene: Scene, settings: Required<IGCODEExporterSettings>) {
		// Calculate workspace area
		const workspaceWidth = settings.maxX - settings.minX
		const workspaceHeight = settings.maxY - settings.minY

		const workspaceRatio = workspaceWidth / workspaceHeight

		// Calculate drawArea from scene

		const sceneRatio = scene.width / scene.height

		const drawArea = [
			workspaceRatio > sceneRatio ? (scene.width * workspaceHeight) / scene.height : workspaceWidth,
			workspaceRatio > sceneRatio ? workspaceHeight : (scene.height * workspaceWidth) / scene.width,
		]

		const drawAreaSceneOffset = [(workspaceWidth - drawArea[0]) / 2, (workspaceHeight - drawArea[1]) / 2]

		// Adapt drawArea to workspace

		const scale = workspaceRatio > sceneRatio ? scene.width / drawArea[0] : scene.height / drawArea[1]

		// const machineCenterPosition = [(settings.maxX + settings.minX) / 2, (settings.maxY + settings.minY) / 2]

		const gcode: Array<string> = []

		concat(gcode, settings.penUpCommand)
		concat(gcode, this.setUnit(settings.unit))
		concat(gcode, this.useAbsolutePosition())
		concat(gcode, this.setCurrentMachinePosition(settings.minX, settings.minY, settings.decimals))
		concat(gcode, this.setCurrentWorkspacePosition(settings.minX, settings.minY, settings.decimals))

		const sceneChilds = scene.getChildren()
		for (let i = 0, len = sceneChilds.length; i < len; i++) {
			sceneChilds[i].generate(0, true)

			const childBuffer = sceneChilds[i].getBuffer() || []
			const childIndexedBuffer = sceneChilds[i].getIndexedBuffer() || []
			let childVertexIndex = 0

			for (
				let currentBufferIndex = 0, len = childIndexedBuffer.length;
				currentBufferIndex < len;
				currentBufferIndex++
			) {
				const currentIndexing = childIndexedBuffer[currentBufferIndex]
				const initialPointX = clamp(
					settings.minX,
					settings.maxX,
					settings.minX + childBuffer[childVertexIndex] / scale + drawAreaSceneOffset[0]
				)

				const initialPointY = clamp(
					settings.minY,
					settings.maxY,
					settings.minY + childBuffer[childVertexIndex + 1] / scale + drawAreaSceneOffset[1]
				)

				concat(
					gcode,
					this.moveTo(settings.penUpCommand, settings.penDownCommand, initialPointX, initialPointY, settings.decimals)
				)

				const simplifiedBuffer = GCODEExporter.pointsToBuffer(
					simplify(
						GCODEExporter.bufferToPoints(
							childBuffer.slice(childVertexIndex, childVertexIndex + currentIndexing.frameLength)
						),
						1 / 10 ** settings.decimals,
						true
					)
				)

				for (let i = 0, len = simplifiedBuffer.length; i < len; i += 2) {
					const currentX = clamp(
						settings.minX,
						settings.maxX,
						settings.minX + simplifiedBuffer[i] / scale + drawAreaSceneOffset[0]
					)
					const currentY = clamp(
						settings.minY,
						settings.maxY,
						settings.minY + simplifiedBuffer[i + 1] / scale + drawAreaSceneOffset[1]
					)
					concat(gcode, this.lineTo(currentX, currentY, settings.velocity, settings.decimals))
				}

				if ((currentIndexing.shape as ShapePrimitive).isClosed())
					concat(gcode, this.lineTo(initialPointX, initialPointY, settings.velocity, settings.decimals))

				childVertexIndex += currentIndexing.frameLength
			}
		}
		/**
		 *
		 * @param penUpCommand
		 * @returns
		 */
		concat(gcode, this.goHome(settings.penUpCommand))

		return gcode
	}

	static bufferToPoints(buffer: Array<number> | Float32Array): Array<{ x: number; y: number }> {
		const result: Array<{ x: number; y: number }> = []

		for (let i = 0, len = buffer.length; i < len; i += 2) result.push({ x: buffer[i], y: buffer[i + 1] })

		return result
	}

	static pointsToBuffer(points: Array<{ x: number; y: number }>): Float32Array {
		const result: Array<number> = []

		for (let i = 0, len = points.length; i < len; i++) {
			result.push(points[i].x)
			result.push(points[i].y)
		}

		return Float32Array.from(result)
	}
}

export { GCODEExporter }
