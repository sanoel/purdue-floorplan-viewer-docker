// SuggestionTable is the list of search results showing up in the Sidebar.
import React from 'react'
import {connect} from 'cerebral-view-react'
import styles from './styles.css'
import classNames from 'classnames/bind'
let cx = classNames.bind(styles)
import SuggestionCard from './suggestionCard';
export const MAX_NUM_SUGGESTIONS = 5

export default connect({
  idx_selected_suggestion: 'viewer.state.idx',
  searchResults: 'sidebar.search_results'
}, {
  moreResultsClicked: 'viewer.searchResultClicked',
},
  class SuggestionTable extends React.Component {

    render() {
      // Generate the "more results" card if necessary.
      let numSuggestions = Object.keys(this.props.searchResults).length
      let moreResultsCard = numSuggestions>MAX_NUM_SUGGESTIONS ? (
        <li key='more-card' className={cx('pure-menu-list')}
          onClick={()=>{this.props.moreResultsClicked({type:'cards'})}}>
            <a className={cx('pure-menu-link', 'item', {'item-selected': this.props.idx_selected_suggestion===-1})}>
              <h3 className={cx('query')}>
              More results...
              </h3>
              <p className={cx('info')}>{numSuggestions-MAX_NUM_SUGGESTIONS} more suggestions</p>
            </a>
        </li>
      ) : null

      var resultsCards = this.props.searchResults.slice(0, MAX_NUM_SUGGESTIONS).map((result, idx) => {
        return <SuggestionCard idx={idx} key={'suggestion-card-'+idx}/>
      })

      return (
        this.props.searchResults.length>0 ? (
          <div className={cx('pure-menu', 'wrapper', 'suggestion-table')}>
            <ul className={cx('pure-menu-list', 'list')}>
              {resultsCards}
              {moreResultsCard}
            </ul>
          </div>
        ) : null
      )
    }
  }
)
