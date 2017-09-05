import { copy, set, unset, toggle, when } from 'cerebral/operators'
import Promise from 'bluebird'

export var toggleSharesDialog = [
  toggle('state:originalsharesdialog.open'), 
]
