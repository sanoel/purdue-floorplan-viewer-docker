import {
  setRoomType,
  setDepartmentUsing,
  setDepartmentAssigned,
  setNote,
  setDescription,
  setPercent,
  setStations,
  setRoomOption,
  toggleEditMode,
  setTextField,
  doneEditingRoom,
  cancelEditingRoom,
  startEditingRoom,
  addShare,
  removeShare,
  setNotePopover,
  submitDialog,
  cancelDialog,
  editShare,
  removePerson, 
  addPerson, 
  setPersonMatch,
  updateNewPersonText,
  openAttributeDialog,
  cancelAttributeDialog,
  submitAttributeDialog,
  toggleRoomAttribute,
} from './chains'
import room_types from './room-types.js'

export default module => {

  module.addState({
  
    room_types: room_types,

    room: {},

    room_edits: {},
  
    editing: false,
    
    share_dialog: {
      open: false,
      share: {},
      new_share: false,
      new_person: {
        text: '',
        matches: [],
        selected_match: {},
      },
    },

    attribute_dialog: { 
      open: false,
      attributes: {},
    },

  })

  module.addSignals({
    personMatchSelected: setPersonMatch,
    removePersonButtonClicked: removePerson,
    addPersonButtonClicked: addPerson,
    newPersonTextChanged: {
      chain: updateNewPersonText,
      immediate: true
    },

    attributeEditButtonClicked: openAttributeDialog,
    attributeDialogCancelled: cancelAttributeDialog,
    attributeDialogSubmitted: submitAttributeDialog,
    attributeChanged: toggleRoomAttribute,
    addShareButtonClicked: addShare,
    deleteShareButtonClicked: removeShare,
    cancelDialogClicked: cancelDialog,
    submitDialogClicked: submitDialog,
    editButtonClicked: [...toggleEditMode, ...startEditingRoom],
    doneButtonClicked: [...toggleEditMode, ...doneEditingRoom],
    cancelButtonClicked: [...toggleEditMode, ...cancelEditingRoom],
    roomTypeChanged: setRoomType,
    departmentAssignedChanged: setDepartmentAssigned,
    departmentUsingChanged: setDepartmentUsing,
    shareEditButtonClicked: editShare,
    noteChanged: {
      chain: setNote,
      immediate: true,
    },
    descriptionChanged: {
      chain: setDescription,
      immediate: true,
    },
    percentChanged: {
      chain: setPercent,
      immediate: true,
    },
    stationsChanged: { 
      chain: setStations,
      immediate: true,
    },
  })
}
