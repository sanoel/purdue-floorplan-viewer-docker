var fs = require('fs');
var polygonize = require('polygonize');
//var svgtogeojson = require('svg-to-geojson');
var geoFromSVGFile = require('svg2geojson').geoFromSVGFile;
var svgson = require('svgson');
var pathologize = require('./svg-to-geojson/src/pathologize2');
var pathToCoords = require('./svg-to-geojson/src/path-to-coordinates2');
var jsdom = require('jsdom');
var JSDOM = jsdom.JSDOM;
const { document } = (new JSDOM(`...`)).window;

var FileReader = require('filereader');
var DOMParser = require('xmldom').DOMParser;

var file = fs.readFileSync('./HAMP_G.svg', 'utf8')
var parser = new DOMParser();
var doc = parser.parseFromString(file, "image/svg+xml");

calculateCoords = svg => {
	const x = 0;
	const y = 0;
	console.log(svg)
	// Attempt a couple methods to get width/height values on the SVG element
	// to return reasonable x/y coordinates on the map.
	let { width, height } = svg.getBBox();

	if (width === 0 && svg.getAttribute('width')) {
		width = parseInt(svg.getAttribute('width'), 10);
	}

	if (height === 0 && svg.getAttribute('height')) {
		height = parseInt(svg.getAttribute('height'), 10);
	}

	return {
		x: x - (width / 2),
		y: y - (height / 2)
	}
};

buildFeature = coords => {
	// If the first and last coords match it should be drawn as a polygon
	if (coords[0][0] === coords[coords.length - 1][0] &&
			coords[0][1] === coords[coords.length - 1][1]) {

		return {
			type: 'Polygon',
			coordinates: [
				coords.map(d => {
					const c = this.map.unproject(d);
					return [c.lng, c.lat];
				})
			]
		};
	} else {
		return {
			type: 'LineString',
			coordinates: coords.map(d => {
				const c = this.map.unproject(d);
				return [c.lng, c.lat];
			})
		};
	}
};


svgToGeoJSON = svg => {
	return pathologize(svg).then((svgString) => {
		const empty = document.createElement('div');
		empty.innerHTML = svgString;
		console.log(empty.querySelector('svg'))
		const coordinates = calculateCoords(empty.querySelector('svg'));
		const paths = empty.querySelectorAll('path');
	  console.log(paths)
	
		Array
			.from(paths)
			.map(path => pathToCoords(
				path,
				SCALE,
				NUM_POINTS,
				coordinates.x,
				coordinates.y
			))
			.map(buildFeature)
			/*
			.forEach(this.draw.add);
			*/

	  console.log(paths)
	})
};

svgToGeoJSON(file).then((result) => {
	console.log(result)
})

/*
var gj = svgtogeojson.svgToGeoJson(
	  [[51.60351870425863, 0.207366943359375], [51.342623007528246, -0.46829223632812494]],
		doc.getElementById('HAMPG'),
		3
);
console.log(gj)
*/

/*
fs.readFile('HAMP_G2.svg', 'utf-8', function(err, data) {
  svgson(
    data,
    {
      svgo: true,
      title: 'myFile',
      pathsKey: 'myPaths',
      customAttrs: {
        foo: true,
      },
    },
    function(result) {
      console.log(JSON.stringify(result))
    }
  )
})
*/

// Step 1.  Merge all SVG Paths





// Step 2. Convert to GeoJSON
/*
geoFromSVGFile( './HAMP_G.svg', layers => {
	layers.forEach( layer => {
		let json = JSON.stringify(layer.geo); // Turn JS object into JSON string
		let poly = turf.polygon(layer.geo);
		let line = turf.polygonToLine(layer.geo);
		console.log(JSON.stringify(turf.polygonize(line)));
		
    });
}, {layers:true, tolerance:0.5} );
*/
// Step 3. Polygonize




// Step 4. Find text elements, get their containing path, and reID those paths




// Step 5. 
