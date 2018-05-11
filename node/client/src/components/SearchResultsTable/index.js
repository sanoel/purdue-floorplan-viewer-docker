// SearchResultsTable is the list of search results showing up in the SearchBar.
import React from 'react'
import {connect} from '@cerebral/react'
import styles from './styles.module.css'
import ResultCard from './ResultCard';
import {state, signal } from 'cerebral/tags'
export const MAX_RESULTS = 5

export default connect({
  selected_idx: state`viewer.state.idx`,
  results: state`searchbar.results`,
  moreResultsClicked: signal`viewer.searchResultClicked`,
},
  class SearchResultsTable extends React.Component {

    render() {
      return (
        this.props.results.length>0 ? (
          <div className={['pure-menu', styles.wrapper, styles['search-results-table']].join(' ')}>
						<ul className={['pure-menu-list', styles.list].join(' ')}>
							{this.props.results.slice(0, this.props.results.length > MAX_RESULTS ? MAX_RESULTS : this.props.results.length).map((result, idx) => 
								<ResultCard idx={idx} key={'result-card-'+idx} />
							)}
              { this.props.results.length > MAX_RESULTS ? (
                <li key='more-card' className={'pure-menu-list'}
                  onClick={()=>{this.props.moreResultsClicked({type:'cards'})}}>
                  <a className={['pure-menu-link', styles.item].join(' ')}>
                    <h3 className={styles['query']}>
                      More results...
                    </h3>
                    <p className={styles['info']}>{this.props.results.length-MAX_RESULTS} more results</p>
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null
      )
    }
  }
)
