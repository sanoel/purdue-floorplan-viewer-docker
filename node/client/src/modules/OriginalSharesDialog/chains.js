import { toggle } from 'cerebral/operators'
import { state } from 'cerebral/tags'

export var toggleSharesDialog = [
  toggle(state`originalsharesdialog.open`), 
]
