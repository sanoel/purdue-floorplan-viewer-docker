import { Module } from 'cerebral'
import StorageModule from '@cerebral/storage'
import HttpProvider from '@cerebral/http'
import Router from '@cerebral/router'
import App from './App'
import Login from './Login'
import Header from './Header'
import Viewer from './Viewer'
import Sidebar from './Sidebar'
import SearchBar from './SearchBar'
import Filters from './Filters'
import Cards from './Cards'
import CampusMap from './CampusMap'
import FloorPlans from './FloorPlans'
import PersonInfo from './PersonInfo'
import RoomInfo from './RoomInfo'
import PersonTable from './PersonTable'
import OriginalSharesDialog from './OriginalSharesDialog'
import Settings from './Settings'
import { props } from 'cerebral/tags'

const router = Router({
			
			routes: [{
				path: '/',
				signal: 'app.frontPageRequested',
			}, {
				path: '/building/:building',
				signal: 'viewer.buildingPageRequested',
			}, {
				path: '/floor/:floorplan',
				signal: 'viewer.floorplanPageRequested',
		//    '/building/:building/floor/:floor/room/:room': 'viewer.roomPageRequested',
			}, {
				path: '/person/:person',
				signal: 'viewer.personPageRequested',
			}, {
				path: '/room/:room',
				signal: 'viewer.roomPageRequested',
			}, {
				path: '/search',
				signal: 'searchbar.searchSubmitClicked',
				map: {
					q: props`text`,
				}
			}, {
				path: '/settings',
				signal: 'app.settingsPageRequested',
			}, {
				path: '/*',
				signal: 'app.notFoundPageOpened'
			}],
			onlyHash: true, // use only hash part of url for matching
			// baseUrl: '/',           // base part, that ignored on route match. detected automatically if `onlyHash` option set to true
			// preventAutostart: true, // prevents automatic triggering after `modulesLoaded` event
			// allowEscape: true,      // do not prevent navigation for triggered urls if no routes was matched and catch all route wasn't provided
			query: true // option to enable query support in url-mapper
		})

export default Module({

	modules: {
		app: App,
	  header: Header,
    login: Login,
    viewer: Viewer,
    sidebar: Sidebar,
    searchbar: SearchBar,
    filters: Filters,
    cards: Cards,
    campusmap: CampusMap,
		settings: Settings,

    floorplans: FloorPlans,
    roominfo: RoomInfo,
    personinfo: PersonInfo,

    persontable: PersonTable,
		originalsharesdialog: OriginalSharesDialog,

		router,

		storage: StorageModule({
			target: localStorage,
			json: true,
			sync: {
				login: 'login',
				filters: 'filters'
			},
		})
	},

	providers: {
		http: HttpProvider({
			baseUrl: 'http://floorplans.ecn.purdue.edu',
			withCredentials: false,
			headers: {
				'Content-Type': 'text/plain'
			}
		}),
	},

})
