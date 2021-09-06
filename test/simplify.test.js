const tap = require('tap')

const Urpflanze = require('@urpflanze/core')

const GCODEExporter = require('../dist/cjs/index').GCODEExporter

const scene = new Urpflanze.Scene()

scene.add(
	new Urpflanze.ShapeBuffer({
		// shape: [1, 1, -1, 1, -1, -1, 1, -1],
		shape: [1, 1, -1, 1, -1, -1, 0, -1, 1, -1], // Add middle point
		sideLength: scene.center,
	})
)

const gcode = GCODEExporter.parse(scene, { maxX: scene.width, maxY: scene.height })
tap.equal(
	gcode,
	`
M3 S30
G21
G90
G28.1 X0 Y0
G92 X0 Y0
M3 S30
G0 X400 Y400
M3 S0
G1 X400 Y400 F1500
G1 X0 Y400 F1500
G1 X0 Y0 F1500
G1 X400 Y0 F1500
G1 X400 Y400 F1500
M3 S30
G28 X0 Y0
`.trim()
)
