import {
  Controller
} from 'cerebral'
import Model from 'cerebral/models/immutable'
import Router from 'cerebral-module-router';
import Devtools from 'cerebral-module-devtools'
import Http from 'cerebral-module-http'

import Login from './modules/Login'
import App from './modules/App'
import Header from './modules/Header'
import Viewer from './modules/Viewer'

import Sidebar from './modules/Sidebar'
import FilterGroup from './modules/FilterGroup'
import Cards from './modules/Cards'
import CampusMap from './modules/CampusMap'
import FloorPlans from './modules/FloorPlans'
import RoomInfo from './modules/RoomInfo'
import PersonInfo from './modules/PersonInfo'
import RoomTable from './modules/RoomTable'
import PersonTable from './modules/PersonTable'


const controller = Controller(Model({}))

/*
  App structure:
    - App
      - Header

      - Login
      - Viewer
        - SideBar

        - Cards

        - CampusMap
        - FloorPlans
        - RoomInfo

        - PersonInfo

        - NotFoundPage

      - Footer
 */

// Use all lower case without word separators for module name spacing in
// cerebral.
controller.addModules({
  app: App,
  header: Header,
  login: Login,
  viewer: Viewer,
  sidebar: Sidebar,
  // Filters already set. Built up by element component Filter.
  filtergroup: FilterGroup,
  cards: Cards,
  campusmap: CampusMap,

  floorplans: FloorPlans,
  roominfo: RoomInfo,
  personinfo: PersonInfo,

  roomtable: RoomTable,
  persontable: PersonTable,

  router: Router({
    '/': 'app.frontPageRequested',
    // The building page. Essentially a Cards page with a filter set to be
    // "floorplan" .
    '/building/:building': 'viewer.buildingPageRequested',
    '/floor/:floorplan': 'viewer.floorplanPageRequested',
//    '/building/:building/floor/:floor/room/:room': 'viewer.roomPageRequested',
    '/person/:person': 'viewer.personPageRequested',
    '/rooms': 'viewer.roomsOnFloorplansPageRequested',
    '/room/:room': 'viewer.roomPageRequested',
    '/query/:query': 'viewer.cardsPageRequested',
    '/settings': 'app.settingsPageRequested',
//    '/floorplan/:floor': 'viewer.floorplanPageRequested',
    '/*': 'app.notFoundPageOpened'
  }, {
    onlyHash: true, // use only hash part of url for matching
    // baseUrl: '/',           // base part, that ignored on route match. detected automatically if `onlyHash` option set to true
    // preventAutostart: true, // prevents automatic triggering after `modulesLoaded` event
    // allowEscape: true,      // do not prevent navigation for triggered urls if no routes was matched and catch all route wasn't provided
    query: true // option to enable query support in url-mapper
  }),

  http: Http({}),

  devtools: Devtools()
})

export default controller
