import {copy} from 'cerebral/operators'
import deriveSuggestionCardInfo from '../actions/deriveSuggestionCardInfo'

export default [
  copy('input:searchbar_input', 'state:sidebar.searchbar.text'),
  deriveSuggestionCardInfo
]
