import {set} from 'cerebral/operators'
import setFrontPage from '../../App/chains/setFrontPage'
import updateCardsToShow from '../../Cards/actions/updateCardsToShow'

// Set input.force to be true to use all queries supported as the start point
// generating the cards.
//
export default [
  // Set the page requested.
  set('output:current_page', 'cards'),
  // Start the app with an updated state.
  ...setFrontPage,
  // Update cards_to_show.
  updateCardsToShow
]
