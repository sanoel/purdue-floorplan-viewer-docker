import { Module } from 'cerebral'
import authenticate from '../Login/authenticate.js'
import {
  setBuildingPage,
  setFloorplanPage,
  setRoomsOnFloorplansPage,
  setRoomPage,
  setPersonPage,
  setCardsPage,
  setLoadingPage,
	handleSearchResult,
	viewerReady,
} from './chains'

// Router takes care of this part now.
//
// The information for the room that the user is able to specify by clicking on
// the interactive components. e.g. on the campus map or the floorplans. It will
// be merged to viewer.state when it's updated.
//
// interactive_input_result: {
//   current_page: undefined,
//   building: undefined,
//   floor: undefined,
//   id: undefined // Room id.
// }
//
// Example:
//   {
//     building: 'GRIS',
//     floor: '1',
//     id: 'room1E01', // Labeled as room + the id shown on the floorplan.
//     page_to_set: 'roominfo'
//   }


export default Module({

  // Use lower case, with dash line to separate words, for naming the variables
  // in the cerebral state.
  state: {

    state: {
      // The state which actually drives what page to show in the main viewer
      // area. This will only be changed by signals triggered from the Cerebral
      // router.
      current_page: 'loadingpage',
      // Input from the interactive components or the state derived from the
      // sidebar. They can override each other, while only the latest version
      // will be kept here.
      building: undefined,
      floor: undefined,
      id: undefined, // Room id.
      person: undefined,
      key: undefined,
      // Essential input from the search bar.
      query: undefined,
      idx: undefined
    },

    // Shown in the drop zone for importing data.
    dropzone_hint: ''
  },

  signals: {
    viewerReadyUp: viewerReady,
    searchResultClicked: handleSearchResult,
    buildingPageRequested: authenticate(setBuildingPage),
    floorplanPageRequested: authenticate(setFloorplanPage),
    roomPageRequested: authenticate(setRoomPage),
    personPageRequested: authenticate(setPersonPage),
    loadingPageRequested: setLoadingPage,
  }

})
