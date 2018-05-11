import { set } from 'cerebral/operators'
import { state, props } from 'cerebral/tags'
import { failedAuth } from '../Login/chains';

export let clearSearchBarClicked = [
	set(state`searchbar.results`, []),
  set(state`searchbar.text`, ''),
]

export let updateSearchBarInput = [
  set(state`searchbar.text`, props`text`),
  deriveResultCardInfo, {
    success: [
      set(state`searchbar.results`, props`results`),
    ],
    error: [],
    unauthorized: [...failedAuth],
  }
]

export function deriveResultCardInfo({props, state, path, http}) {
// Do a fulltext search in the database. Each document has a fulltext string of its important searchable props.
  if (props.text !== '') {
    return http.get('/search?text='+ props.text).then((results) => {
      var queryResults = {};
      Object.keys(results.result).forEach((res) => {
        queryResults[results.result[res]._type] = queryResults[results.result[res]._type] || [];
        queryResults[results.result[res]._type].push(results.result[res]);
      })
      let searchResults = []
      searchResults.push.apply(searchResults, queryResults.building)
      searchResults.push.apply(searchResults, queryResults.floorplan)
      searchResults.push.apply(searchResults, queryResults.person)
			searchResults.push.apply(searchResults, queryResults.room)
      return path.success({results: searchResults})
    }).catch((error) => {
      console.log(error);
      if (error.status === 401) {
        return path.unauthorized({})
      }
      return path.error({error})
    })
  } else {
    return path.success({results: []});
  }
}


