import { copy, set } from 'cerebral/operators'
import setFrontPage from '../../App/chains/setFrontPage'
import setBuildingPage from './setBuildingPage'
import setCardsPage from './setCardsPage'
import setFloorplanPage from './setFloorplanPage'
import setRoomPage from './setRoomPage'
import setPersonPage from './setPersonPage'
import setRoomsOnFloorplansPage from './setPersonPage'

export default [
  set('state:viewer.state.current_page', 'loadingpage'),
  getPageType, { 
    building: [
      copy('input:card.name', 'output:building'),
      ...setBuildingPage
    ],
    cards: [
      ...setCardsPage,
    ],
    floorplan: [
      copy('input:card.name', 'output:floorplan'),
      ...setFloorplanPage,
    ],
    rooms_on_floorplans: [
      ...setRoomsOnFloorplansPage,
    ],
    room: [
      copy('input:card.floor', 'output:floor'),
      copy('input:card.building', 'output:building'),
      copy('input:card.floorplan', 'output:floorplan'),
      copy('input:card.name', 'output:room'),
      ...setRoomPage,
    ],
    person: [
      copy('input:card.name', 'output:person'),
      ...setPersonPage,
    ],
    unknown: [

    ],
  },
]

function getPageType({input, state, output}) {
  switch(input.type) {
    case 'building':
      output.building({})
      break;

    case 'cards':
      output.cards()
      break;
    
    case 'floorplan':
      output.floorplan()
      break;

    case 'room_to_floorplan':
      output.room_to_floorplan()
      break;

    case 'room':
      output.room()
      break;

    case 'person':
      output.person()
      break;

    default:
      output.unknown()
      break;
  }
}
getPageType.outputs = ['building', 'cards', 'floorplan', 
  'rooms_on_floorplans', 'room', 'person', 'unknown'];
