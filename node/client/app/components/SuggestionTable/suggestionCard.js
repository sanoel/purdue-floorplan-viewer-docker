// SuggestionTable is the list of search results showing up in the SearchBar.
import React from 'react'
import {connect} from 'cerebral-view-react'
import styles from './styles.css'
import classNames from 'classnames/bind'
import { FontIcon } from 'material-ui'
let cx = classNames.bind(styles)
export const icons = {
  unknown: <i title="Unknown" className="fa fa-question-circle" aria-hidden="true"></i>,
  building: 'account_balance',
  floorplan: 'dashboard',
  room: 'vpn_key', 
  person: 'person',
}
export const MAX_NUM_SUGGESTIONS = 5

export default connect(props => ({
  idx_selected_suggestion: 'viewer.state.idx',
  card: `searchbar.results.${props.idx}`,
}), {
  searchResultClicked: 'viewer.searchResultClicked',
},
  class SuggestionCard extends React.Component {

    render() {
      return (
        <li key={'suggestion-card'+this.props.card._key}
          className={cx('pure-menu-list', 'suggestion-card')}
          onClick={()=>{this.props.searchResultClicked({type: this.props.card._type, card:this.props.card})}}>
          <a className={cx('pure-menu-link', 'item', {'item-selected': this.props.idx===this.props.idx_selected_suggestion})}>
            <h3 className={cx('query')}>
              <FontIcon style={{color:'#FFFFFF'}} className="material-icons">{icons[this.props.card._type]}</FontIcon>
              {this.props.card.name}
            </h3>
            <p className={cx('info')}>Details to be added...</p>
          </a>
        </li>
      )
    }
  }
)
