import resetApp from './chains'
import {
  toggleSharesDialog,
} from './chains'

export default module => {

  module.addState({
    open: false,
  })

  module.addSignals({
    originalSharesButtonClicked: toggleSharesDialog,
    closeDialogClicked: toggleSharesDialog,
  })

}
