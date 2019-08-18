function exportPreset() {
	let xml2js = require('xml2js');
	let result;

	let builder = new xml2js.Builder({rootName : 'room', headless : true});

	result = builder.buildObject({walls : walls, exits : exits});

	// for (let i = 0; i < walls.length; i ++) {
	// 	result += '\t<wall ';

	// 	for (let _param in walls[i]) {
	// 		let _value = walls[i][_param];

	// 		result += `${_param}="${_value}" `;
	// 	}

	// 	result += '/>\n';
	// }

	// result += '\n';

	// for (let i = 0; i < exits.length; i ++) {
	// 	result += '\t<exit ';

	// 	for (let _param in exits[i]) {
	// 		let _value = exits[i][_param];

	// 		result += `${_param}="${_value}" `;		
	// 	}

	// 	result += '/>\n';
	// }

	return result;
}