# GCODE-Exporter

This is a tool to export the [urpflanze scene](https://github.com/urpflanze-org/core) in GCODE

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

To configure the machine you can as the second argument of `parse`

```javascript
{
	// Draw Area
	minX: number
	minY: number
	maxX: number
	maxY: number

	// feedrate mm/m
	velocity: number

	unit: 'millimeters' | 'inches'

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
    minX: 0,
    minY: 0,
    maxX: 297,
    maxY: 210,
    velocity: 1500,
    unit: 'millimeters',
    penUpCommand: 'M3 S30',
    penDownCommand: 'M3 S0',
    decimals: 3,
}
```
