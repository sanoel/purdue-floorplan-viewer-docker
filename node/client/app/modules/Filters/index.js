import {
  setUsingCheck,
	setAssignedCheck,
	setBuildingCheck,
	setAttributeCheck,
	setTypeCheck,
	setStationsMin,
	setStationsMax,
	setAreaMin,
	setAreaMax,
} from './chains'

export default module => {

  // Use lower case, with dash line to separate words, for naming the variables
  // in the cerebral state.
  module.addState({
		buildings: {},
		types: {},
		attributes: {},
		using: {},
		assigned: {},
		stations: {},
		area: {}
  })

  module.addSignals({
    usingFilterChecked: setUsingCheck,
		assignedFilterChecked: setAssignedCheck,
		buildingFilterChecked: setBuildingCheck,
		attributeFilterChecked: setAttributeCheck,
		typeFilterChecked: setTypeCheck,
		stationsMaxChanged: setStationsMax,
		stationsMinChanged: setStationsMin,
		areaMinChanged: setAreaMin,
		areaMaxChanged: setAreaMax,
  })
}
