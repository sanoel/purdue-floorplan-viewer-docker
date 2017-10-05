import {
	setTab,
} from './chains'

export default module => {

  module.addState({
		tab: 0,
    error: '',
  })

  module.addSignals({
		tabClicked: setTab,
  })
}
