import path from 'path'

import {
  PATH_TO_SVG
} from './loadSvgFileNames'

// Save the floor plan names to the state tree.
function initiateSupportedFloorPlans({input, state}) {
  input.result.forEach((filename) => {
    // Note that the .svg files on the server are named like GRIS_1.svg and
    // GRIS_b.svg, so we can get the capitalized building names (and lower case
    // floors, if there is any letter in them) directly from the file names.
    var floorplan = {
      filename: filename,
      building: filename.match('^(.+)_.+.svg$')[1],
      floor: filename.match('^.+_(.+).svg$')[1],
      svg: undefined,
    }
    state.set(`app.floorplans.${floorplan.building}.${floorplan.floor}`, floorplan)
  })
}
