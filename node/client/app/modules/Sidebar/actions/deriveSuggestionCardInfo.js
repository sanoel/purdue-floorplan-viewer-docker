export default function deriveSuggestionCardInfo({input, state, output, services}) {
// Do a fulltext search in the database. Each document has a fulltext string of its important searchable props.
  if (input.searchbar_input !== '') {
    services.http.get('/search?text='+ input.searchbar_input).then((results) => {
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
      state.set('sidebar.search_results',searchResults);
    }).catch((err) => {
      console.log(err);
    })
  } else return false
}
