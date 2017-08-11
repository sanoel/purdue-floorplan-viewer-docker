// Used for setFloorplanPage.
export default function updateFloorplanToShow({state}) {
  let viewerState = state.get('viewer.state')

  // Clear all rooms to highlight just in case.
  state.set('floorplans.rooms_to_highlight', [])
  state.set('floorplans.floorplans_to_show',
    getFloorPlansToShow(viewerState.building + '_' + viewerState.floor, state.get('app.floorplans'))
  )
}

export function getFloorPlansToShow(query, floorplans) {
  // The current query. We are expecting building, e.g. "GRIS", or building + floor,
  // e.g. "GRIS_1" or "GRIS 1" (case insensitive, and with or without white
  // spaces or either side of the string).
  let formattedQuest = query.toUpperCase().trim().replace(/[^a-zA-Z0-9]/g, '_')

  // Search this building in the building object if the query isn't
  // empty.
  let validIndicesForCurBldg = formattedQuest ? 
    filterStrArrCaseIns(floorplans.filename,formattedQuest)
    : []

  // Discard past info stored.
  let floorPlansToShow = []

  if (validIndicesForCurBldg.length>0) {
    let buildingRef = floorplans.building[validIndicesForCurBldg[0]]

    // Supported. Set floorPlansToShow accordingly.
    for(var idx=0; idx < validIndicesForCurBldg.length; idx++) {
      let validIdxForCurBldg = validIndicesForCurBldg[idx]
      let newValidFloorPlan = {}
      // Get the information for the corresponding floor plans from the state tree.
      newValidFloorPlan.idx = validIdxForCurBldg
      newValidFloorPlan.href = floorplans.href[validIdxForCurBldg]
      newValidFloorPlan.fileName = floorplans.filename[validIdxForCurBldg]
      newValidFloorPlan.building = floorplans.building[validIdxForCurBldg]
      newValidFloorPlan.floor = floorplans.floor[validIdxForCurBldg]
      newValidFloorPlan.key = 'floorplan_' + newValidFloorPlan.building + '_' + newValidFloorPlan.floor
      newValidFloorPlan.svg = floorplans.svg[validIdxForCurBldg]
      floorPlansToShow.push(newValidFloorPlan)
    }
  }

  return floorPlansToShow
}

// Get all indices of strArr's elements which contain subStr.
// Note: case sensitive.
function filterStrArr(strArr, subStr){
   var indices = []
    // idxSA: index for the String Array.
    for (var idxSA = 0; idxSA < strArr.length; ++idxSA) {
        let idx = strArr[idxSA].indexOf(subStr)
        if (idx > -1) {
            // This string element contains subStr
            indices.push(idxSA)
        }
    }
    return indices
}

// Get all indices of strArr's elements which contain subStr.
// Note: case insensitive.
function filterStrArrCaseIns(strArr, subStr){
  // Change to upper case.
  let strArrCap = strArr.map(
      function (obj) {
          return obj.toUpperCase()
      }
  )
  let subStrCap = subStr.toUpperCase()

  return filterStrArr(strArrCap, subStrCap)
}

