import { Module } from 'cerebral'
import {
  setRoomType,
  setDepartmentUsing,
  setDepartmentAssigned,
  setNote,
  setDescription,
  setPercent,
  setStations,
  toggleEditMode,
  doneEditingRoom,
  cancelEditingRoom,
  startEditingRoom,
  addShare,
  removeShare,
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

export default Module({

  state: {
  
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
			all_attributes: [
				'Fume hood', 
				'208 V', 
				'220 V', 
				'480 V', 
				'Single Phase', 
				'Three Phase'
			],
      open: false,
      attributes: {},
    },

  },

  signals: {
    personMatchSelected: setPersonMatch,
    removePersonButtonClicked: removePerson,
    addPersonButtonClicked: addPerson,
    newPersonTextChanged: updateNewPersonText,

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
    noteChanged: setNote,
    descriptionChanged: setDescription,
    percentChanged: setPercent,
    stationsChanged: setStations,
  }
})
