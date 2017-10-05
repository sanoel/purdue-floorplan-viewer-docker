import { set, copy } from 'cerebral/operators'
import { failedAuth } from '../Login/chains';

export let updateSearchBarInput = [
  copy('input:text', 'state:searchbar.text'),
  deriveSuggestionCardInfo, {
		success: [
			set('state:searchbar.results', 'input:results'),
			copy('input:results', 'state:searchbar.results'),
		],
		error: [],
		unauthorized: [...failedAuth],
	}
]

export function deriveSuggestionCardInfo({input, state, output, services}) {
// Do a fulltext search in the database. Each document has a fulltext string of its important searchable props.
  if (input.text !== '') {
    return services.http.get('/search?text='+ input.text).then((results) => {
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
			output.success({results: searchResults})
    }).catch((error) => {
      console.log(error);
			if (error.status === 401) {
				return output.unauthorized({})
			}
			return output.error({error})
    })
  } else return false
}
deriveSuggestionCardInfo.async = true;
deriveSuggestionCardInfo.outputs = ['success', 'error', 'unauthorized'];

