import initiateApp from './chains/initiateApp'
import wait from './actions/wait'
import resetApp from './chains/resetApp'

import setFrontPage from './chains/setFrontPage'
import setNotFoundPage from './chains/setNotFoundPage'
import setSettingsPage from './chains/setSettingsPage'

import updateRoomsData from './chains/updateRoomsData'
import exportRoomsData from './chains/exportRoomsData'
import exportSmasData from './chains/exportSmasData'
import initiateRoomsDataImportation from './chains/initiateRoomsDataImportation'
import cancelRoomsDataImportation from './chains/cancelRoomsDataImportation'
import importRoomsData from './chains/importRoomsData'
import { computeSmasDiffs } from './chains/index.js'

export default module => {

  module.addState({
    // TODO: use a database instead.
    /*
    After initiation, floorplans it will be an object of floor plan svg files, with
    the keys being the meta data names and the values being undefined if not
    available.

    Svg files will be loaded on demand into floorplans by the FloorPlans component.

    E.g.:
      floorplans: {
        href: ['/img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/GRIS_1.svg'],
        filename: ['GRIS_1.svg'], // File name with the extension.
        building: ['GRIS'],
        floor: ['1'],
        svg:['<svg/>'] // Reserved: The actual content of the file.
      }
    */
    floorplans: {},
    // All the room information we have.
    rooms_meta_data: {},
    // Whether the app is saving (currently using HTTP POST method) the data for
    // rooms.
    saving_rooms: false,

    // Login management.
    permission_granted: false,

    // To indicate whether an initiation for the app has been done / scheduled.
    // Used to avoid redundant floorplan / room information downloading
    // attempts.
    initialized: false,

    // To indicate whether the app is ready for new query, i.e. whether all the
    // necessary information has been loaded for new queries..
    ready: false,

    // Used to indicate whether the app is currently importing / exporting the
    // data for rooms.
    importing_rooms: false,
    exporting_rooms: false,
    generating_smas_report: false,
  })

  module.addSignals({
    frontPageRequested: setFrontPage,
    settingsPageRequested: setSettingsPage,
    notFoundPageOpened: setNotFoundPage,
//    roomsDataUpdateRequested: updateRoomsData,
    roomsDataExportationRequested: exportRoomsData,
    smasDataExportRequested: exportSmasData,
    roomsDataImportationRequested: initiateRoomsDataImportation,
    roomsDataImportationAborted: cancelRoomsDataImportation,
    roomsDataFileReceived: importRoomsData,
    smasFileDropped: computeSmasDiffs,
  })

}
