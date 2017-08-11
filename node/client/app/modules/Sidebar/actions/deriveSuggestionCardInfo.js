export default function deriveSuggestionCardInfo({input, state, output, services}) {
// Do a fulltext search in the database. Each document has a fulltext string of its important searchable props.
  if (input.searchbar_input !== '') {
    services.http.get('/search?text='+ input.searchbar_input).then((results) => {
      var searchResults = [];
      console.log(results.result)
      Object.keys(results.result).forEach((type) => {
        results.result[type].forEach((res) => {
          res.type = type;
          searchResults.push(res);
        })
      })
      state.set('sidebar.search_results',searchResults);
    }).catch((err) => {
      console.log(err);
    })
  }
}
