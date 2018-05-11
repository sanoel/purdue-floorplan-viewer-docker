import { set, when, equals, toggle, unset } from 'cerebral/operators'
import { http, path, state, props } from 'cerebral/tags'
import _ from 'lodash'

export let toggleCheckbox = [
	when(state`filters.query.${props`type`}.${props`key`}`), {
		true: [unset(state`filters.query.${props`type`}.${props`key`}`)],
		false: [ toggle(state`filters.query.${props`type`}.${props`key`}`)],
	},
	filter, {
		success: [
			filterComplete,
		],
		error: []
	},
]

export let inputChanged = [
	set(state`filters.query.${props`type`}`, props`val`),
	filter, {
		success: [
			filterComplete,
		],
		error: []
	},
]

export let showHideSection = [
	toggle(state`filters.headers.${props`header`}.visible`)
]

export let clearFilters = [
  set(state`filters.query.buildings`, {}),
  set(state`filters.query.types`, {}),
  set(state`filters.query.attributes`, {}),
  set(state`filters.query.using`, {}),
  set(state`filters.query.assigned`, {}),
  set(state`filters.query.minShareArea`, ''),
  set(state`filters.query.maxShareArea`, ''),
  set(state`filters.query.minRoomArea`, ''),
  set(state`filters.query.maxRoomArea`, ''),
  set(state`filters.query.minStations`, ''),
  set(state`filters.query.maxStations`, ''),
  set(state`filters.result`, {}),
]

export let filter = [
	filter, {
		success: [
			filterComplete
		],
		error: [],
	}
]

function filterComplete({state, props}) {
	let viewer = props.current_page || state.get('viewer.state.current_page');
	switch (viewer) {
		case 'campusmap':
			state.set(`filters.result.buildings`, {});
			props.results.forEach((item) => {
				state.set(`filters.result.buildings.${item.name}`, true);
			})
			break;
		case 'cards':
			break;
		case 'building':
			state.set(`filters.result.floorplans`, {});
			props.results.forEach((item) => {
				if (!item) return
				state.set(`filters.result.floorplans.${item.building+' '+item.floor}.rooms.${item.room}`, true)
			})
			break;
		case 'floorplan':
			state.set(`filters.result.rooms`, {});
			props.results.forEach((item) => {
				if (item)	state.set(`filters.result.rooms.${item.room}`, true);
			})
			break;
	}
}

function filter({state, props, path, http}) {
	let viewer = props.current_page || state.get('viewer.state.current_page');
	let level;
  let buildings = Object.keys(state.get(`filters.query.buildings`));
	switch (viewer) {
		case 'campusmap':
			level = 0;
			break;
		case 'cards':
			level = 1;
			break;
		case 'building':
			level = 2;
			let floorplans = state.get('cards.cards_to_show')
			buildings = _.uniqBy(state.get('cards.cards_to_show'), 'building').map((item) => item.building);
			break;
		case 'floorplan':
			level = 2;
			buildings = [state.get(`floorplans.floorplan_to_show.building`)];
			break;
	}
  let types = Object.keys(state.get(`filters.query.types`));
	let attributes = Object.keys(state.get(`filters.query.attributes`));
	let using = Object.keys(state.get(`filters.query.using`));
	let assigned = Object.keys(state.get(`filters.query.assigned`));
	let shareAreaMax = state.get(`filters.query.maxShareArea`);
	let shareAreaMin = state.get(`filters.query.minShareArea`);
	let roomAreaMax = state.get(`filters.query.maxRoomArea`);
	let roomAreaMin = state.get(`filters.query.minRoomArea`);
	let stationsMax = state.get(`filters.query.Maxtations`);
	let stationsMin = state.get(`filters.query.minStations`);

	let query = [];

	if (Number.isInteger(+shareAreaMax)) query.push('shareAreaMax='+shareAreaMax);
	if (Number.isInteger(+shareAreaMin)) query.push('shareAreaMin='+shareAreaMin);
	if (Number.isInteger(+roomAreaMax)) query.push('roomAreaMax='+roomAreaMax);
	if (Number.isInteger(+roomAreaMin)) query.push('roomAreaMin='+roomAreaMin);
	if (Number.isInteger(+stationsMax)) query.push('stationsMax='+stationsMax);
	if (Number.isInteger(+stationsMin)) query.push('stationsMin='+stationsMin);

	if (buildings.length > 0) query.push('buildings='+encodeURIComponent(buildings.join(',')))
	if (assigned. length > 0) query.push('assigned='+encodeURIComponent(assigned.join(',')))
	if (using.length > 0) query.push('using='+encodeURIComponent(using.join(',')))
	if (types.length > 0) query.push('types='+encodeURIComponent(types.join(',')))
	if (attributes.length > 0) query.push('attributes='+encodeURIComponent(attributes.join(',')))
	query.push(`level=${level ? level : 0}`);
	return http.get(`/filter?${query.join('&')}`).then((results) => {
		return path.success({level, results: results.result})
	}).catch((err) => {
		console.log(err)
		return path.error({})
	})
}

function setFilterResults({state, props}) {
	state.set('filters.filtered');
}
