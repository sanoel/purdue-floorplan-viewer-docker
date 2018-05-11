// SearchResultsTable is the list of search results showing up in the SearchBar.
import React from 'react'
import {connect} from '@cerebral/react'
import styles from './styles.module.css'
import { FontIcon } from 'material-ui'
import {state, signal} from 'cerebral/tags'
import icons from './Icons'

export default connect({
  selected_idx: state`viewer.state.idx`,
  cards: state`searchbar.results`,
  searchResultClicked: signal`viewer.searchResultClicked`,
},
  class ResultCard extends React.Component {

		render() {
      return (
        <li key={'result-card'+this.props.cards[this.props.idx]._key}
          className={['pure-menu-list', styles['result-card']].join(' ')}
					onClick={()=>{this.props.searchResultClicked({
						type: this.props.cards[this.props.idx]._type, 
						card:this.props.cards[this.props.idx]
					})}}>
          <a className={['pure-menu-link', styles['item'], {'item-selected': this.props.idx===this.props.selected_idx}].join(' ')}>
            <h3 className={styles['query']}>
              <FontIcon style={{color:'#FFFFFF'}} className="material-icons">{icons[this.props.cards[this.props.idx]._type]}</FontIcon>
              {this.props.cards[this.props.idx].name}
            </h3>
            <p className={styles['info']}>Details to be added...</p>
          </a>
        </li>
      )
    }
  }
)
