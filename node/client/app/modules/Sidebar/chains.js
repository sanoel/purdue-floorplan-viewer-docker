import { set, copy } from 'cerebral/operators'

export let setTab = [
	copy('input:tab', 'state:sidebar.tab'),
]
