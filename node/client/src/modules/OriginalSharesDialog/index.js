import { Module } from 'cerebral'
import {
  toggleSharesDialog,
} from './chains'

export default Module({

  state: {
    open: false,
  },

  signals: {
    originalSharesButtonClicked: toggleSharesDialog,
    closeDialogClicked: toggleSharesDialog,
  }

})
