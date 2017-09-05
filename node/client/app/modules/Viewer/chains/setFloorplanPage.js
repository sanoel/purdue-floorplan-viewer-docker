import {set, copy} from 'cerebral/operators'
import setFrontPage from '../../App/chains/setFrontPage'

export default [
  set('output:current_page', 'floorplan'),
  getFloorplan, {
    success: [
      copy('input:floorplan', 'state:floorplans.floorplan_to_show'), 
      getRoomsFromFloorplan, {
        success: [
          copy('input:rooms', 'state:floorplans.rooms'),
          ...setFrontPage,
        ],
        error: [],
      },
    ],
    error: [],
  },
]

// Update floorplans.floorplan_to_show. 
export function getFloorplan({input, state, services, output}) {
  services.http.get('/nodes?type=floorplan&name='+input.floorplan).then((results) => {
    output.success({floorplan:results.result[0]})
  }).catch((err) => {
    output.error({message:err})
  })
}
getFloorplan.outputs=['success', 'error']
getFloorplan.async = true;

export function getRoomsFromFloorplan({input, state, services, output}) {
  services.http.get('/edges?type=room&from='+input.floorplan._id).then((results) => {
    var rooms = {}; 
    results.result.forEach((res) => {
      rooms[res.name] = res;
    })
    output.success({rooms})
  }).catch((err) => {
    output.error({message:err})
  })
}
getRoomsFromFloorplan.outputs=['success', 'error']
getRoomsFromFloorplan.async = true;
