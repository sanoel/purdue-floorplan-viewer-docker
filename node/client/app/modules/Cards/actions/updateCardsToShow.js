// Update cards.cards_to_show. If input.card_filters is specified, only cards
// with a type listed there will be shown.
export default function updateCardsToShow({input, state}) {
  let cardsToShowIndices = []
 // if (!input.card_force && state.get('viewer.state.query')){
    var cardsToShow = state.get('sidebar.search_results')
/*
  } else {
    // Use all search results
    var cardsToShow = state.get('sidebar.search_results')
  }

  if(input.card_filters.length>0) {
    cardsToShow = cardsToShow.filter((card)=>{
      console.log(input.card_filters, card.type);
      console.log(input.card_filters.indexOf(card.type) > -1);
      return input.card_filters.indexOf(card.type) > -1
    })
    // If current view is building view, will filter the cards to show according to
    // the building specified in the URL, too.
    //if(input.current_page && input.current_page == 'building') {
    if(input.current_page == 'building') {
      cardsToShow = cardsToShow.filter((card)=>{
        return card.name.indexOf(input.searchResult.name) > -1
      })
    }
  }
*/
  
  state.set('cards.cards_to_show', cardsToShow)
}
