import { set } from 'cerebral/operators'
import { state, props } from 'cerebral/tags'

export let setTab = [
	set(state`sidebar.tab`, props`tab`),
]
