import {set, copy} from 'cerebral/operators'
import setFrontPage from '../../App/chains/setFrontPage'

export default [
  set('output:current_page', 'building'),
  getBuilding, {
    success: [
      getFloorplansFromBuilding, {
        success: [
          copy('input:floorplans', 'state:cards.cards_to_show'),
          ...setFrontPage
        ],
        error: [],
      }
    ],
    error: [],
  },
]

function getBuilding({input, services, output}) {
  services.http.get('/nodes?type=building&name='+input.building).then((results) => {
    output.success({building:results.result[0]})
  }).catch((err) => {
    console.log(err);
    output.error({message:err})
  })
}
getBuilding.outputs=['success', 'error']
getBuilding.async = true;

function getFloorplansFromBuilding({input, services, output}) {
  services.http.get('/edges?type=floorplan&from='+input.building._id).then((results) => {
    output.success({floorplans:results.result})
  }).catch((err) => {
    console.log(err);
    output.error({message:err})
  })
}
getFloorplansFromBuilding.outputs=['success', 'error']
getFloorplansFromBuilding.async = true;
