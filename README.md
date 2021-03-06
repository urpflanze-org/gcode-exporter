# GCODE-Exporter

This is a tool to export the [urpflanze scene](https://github.com/urpflanze-org/core) to GCODE

Install with npm

```shell
npm i -S @urpflanze/gcode-exporter
```

Import GCODEExporter:

```javascript
import { Scene } from '@urpflanze/core'
import { GCODEExporter } from '@urpflanze/gcode-exporter'
// or const { GCODEExporter } = require('@urpflanze/gcode-exporter')

const scene = new Urpflanze.Scene()

// creating a scene

scene.update()

const gcode = GCODEExporter.parse(scene /*, config*/)
```

You can pass machine configuration with the second argument of `parse`

```javascript
{
	// Draw Area
	unit: 'millimeters' | 'inches'
	minX: number
	minY: number
	maxX: number
	maxY: number

	// feedrate mm/m
	velocity: number

	// Pen
	penUpCommand: string
	penDownCommand: string

	// Rounding off values
	decimals: number
}
```

Default values A4 (horizontal):

```javascript
{
    unit: 'millimeters',
    minX: 0,
    minY: 0,
    maxX: 297,
    maxY: 210,
    velocity: 1500,
    penUpCommand: 'M3 S30',
    penDownCommand: 'M3 S0',
    decimals: 2,
}
```
