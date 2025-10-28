import * as THREE from "three";

const fields_translation = {
	"confidences": "semantic_pred_confs",
	"semantic_gt": "semantic_gt",
	"semantic_pred": "instance_pred_label",
	"instance_gt": "instance_labels",
	"instance_pred": "instance_pred"
}

/**
 * Faz o parse de um arquivo PCD ASCII.
 * Retorna uma BufferGeometry com todos os atributos possíveis:
 * position, normal, intensity, label, rgb, etc.
 */
export async function parsePCD(url) {
	const response = await fetch(url);
	const text = await response.text();

	const lines = text.split("\n");
	const headerEnd = lines.findIndex(l => l.startsWith("DATA"));
	const header = lines.slice(0, headerEnd);
	const dataLines = lines.slice(headerEnd + 1).filter(l => l.trim().length);

	const fields = header.find(l => l.startsWith("FIELDS")).split(" ").slice(1);
	const fieldIndices = Object.fromEntries(fields.map((f, i) => [f, i]));

	const geometry = new THREE.BufferGeometry();
	const positions = [];
	const normals = [];
	const confidences = [];
	const semantic_pred = [];
	const semantic_gt = [];
	const instance_pred = [];
	const instance_gt = [];
	const rgbs = [];

	for (const line of dataLines) {
		const v = line.trim().split(/\s+/).map(Number);

		// positions
		positions.push(v[fieldIndices.x], v[fieldIndices.y], v[fieldIndices.z]);

		// Normals
		if ("normal_x" in fieldIndices)
			normals.push(v[fieldIndices.normal_x], v[fieldIndices.normal_y], v[fieldIndices.normal_z]);

		// Confidences
		if (fields_translation["confideces"] in fieldIndices)
			confidences.push(v[fieldIndices.confidences]);

		// Semantic GT
		if (fields_translation["semantic_gt"] in fieldIndices)
			semantic_gt.push(v[fieldIndices.semantic_gt]);

		// Semantic Predictions
		if (fields_translation["semantic_pred"] in fieldIndices)
			semantic_pred.push(v[fieldIndices.semantic_pred]);

		// Instance GT
		if (fields_translation["instance_gt"] in fieldIndices)
			instance_gt.push(v[fieldIndices.instance_gt]);

		// Instance Predictions
		if (fields_translation["instance_pred"] in fieldIndices)
			instance_pred.push(v[fieldIndices.instance_pred]);

		// RGB coded as uint32
		if ("rgb" in fieldIndices) {
			const rgbUint = v[fieldIndices.rgb];
			const r = (rgbUint >> 16) & 0xff;
			const g = (rgbUint >> 8) & 0xff;
			const b = rgbUint & 0xff;
			rgbs.push(r / 255, g / 255, b / 255);
		}
	}

	// Uses the geometry to hold the data
	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	if (normals.length) geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
	if (rgbs.length) geometry.setAttribute("rgb", new THREE.Float32BufferAttribute(rgbs, 3));
	if (confidences.length) geometry.setAttribute("confidences", new THREE.Float32BufferAttribute(confidences, 1));
	if (semantic_gt.length) geometry.setAttribute("semantic_gt", new THREE.Float32BufferAttribute(semantic_gt, 1));
	if (semantic_pred.length) geometry.setAttribute("semantic_pred", new THREE.Float32BufferAttribute(semantic_pred, 1));
	if (instance_gt.length) geometry.setAttribute("instance_gt", new THREE.Float32BufferAttribute(instance_gt, 1));
	if (instance_pred.length) geometry.setAttribute("instance_pred", new THREE.Float32BufferAttribute(instance_pred, 1));

	// guardamos arrays crus pra futuros recálculos de cor
	geometry.userData.raw = {
		positions,
		rgbs,
		normals,
		confidences,
		semantic_gt,
		semantic_pred,
		instance_gt,
		instance_pred,
	};

	return geometry;
}
