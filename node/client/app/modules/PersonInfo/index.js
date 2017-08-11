import {
  setStatus,
  setDepartment,
  toggleEditMode,
  startEditingPerson,
  doneEditingPerson
} from './chains'
import statuses from './person-statuses.js'
import departments from '../RoomInfo/departments.json'

export default module => {

  module.addState({
    
    statuses: statuses,
    departments:departments,
    // The database entry for a particular person to display in the PersonInfo
    // page.
    person: {},

    // Rooms and persons linked to this person in the database. This is an array of room
    // objects as they appear in the database.
    rooms: [],
    persons: [],

    //Status for whether the PersonInfo page is being edited.
    editing: false,

  })

  module.addSignals({
    departmentChanged: setDepartment,
    statusChanged: setStatus,
    editButtonClicked: [...toggleEditMode, ...startEditingPerson],
    doneButtonClicked: [...toggleEditMode, ...doneEditingPerson]
  })
}
