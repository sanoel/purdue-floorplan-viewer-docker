// SearchBar is the left panel used for searching. 
import React from 'react'
import {connect} from 'cerebral-view-react'
import SuggestionTable from '../SuggestionTable'
import styles from './styles.css'
import classNames from 'classnames/bind'
let cx = classNames.bind(styles)
import {MAX_NUM_SUGGESTIONS} from '../SuggestionTable'
import { FontIcon, Paper, TextField } from 'material-ui'

export default connect({
  app_ready: 'app.ready',
  hint: 'searchbar.hint',
  text: 'searchbar.text',
  error: 'sidebar.error',
}, {
  searchChanged: 'searchbar.searchBarInputChanged',
  searchSubmit: 'app.frontPageRequested',
  cardsPageRequested: 'viewer.searchResultClicked',
  frontPageRequested: 'app.frontPageRequested',
},
  class SearchBar extends React.Component {

    // Search bar confirmation.
    onSearchBarSubmit(evt) {
      evt.preventDefault()
      // Submit the result and update the URL using the signal defined for the
      // router.
      if (this.props.text){
        this.props.cardsPageRequested({type:'cards'})
      } else {
        this.props.searchSubmit();
      }
    }
 
    handleKeys(evt) {
      if (evt.key == 'Enter') return this.onSearchBarSubmit(evt);
      return this.props.searchChanged({text: evt.target.value});
    }

    render() {
      return (
        <div className={styles['sidebar']}>
          <div className={styles.hint}>
            <p>
              What / Who are you looking for?
              <br/>
              <small>(E.g. GRIS, or GRIS_1 to also specify which floor)</small>
            </p>
            {this.props.error ?
              <span style={{color: 'red', paddingLeft: '10px'}}>{this.props.error}</span>
            : null}
          </div>
          <div className={styles['searchbar-container']}>
            <Paper className={styles['searchbar']}>
              <TextField 
                className={styles['searchbar-input']}
                disabled={!this.props.app_ready}
                hintText='Search...'
                value={this.props.text}
                underlineShow={false}
                onChange={(evt) => this.handleKeys(evt)}
                onKeyPress={(evt) => this.handleKeys(evt)}
              />
              <FontIcon 
                className={this.props.text==='' ? styles.hidden : "fa fa-times"}
                onTouchTap={evt => { this.props.searchChanged({text: ''}); this.props.frontPageRequested(evt)}}
              />
            </Paper>
            <FontIcon
              className={`fa fa-search ${styles['search-button']}`}
              onTouchTap={(evt) => this.onSearchBarSubmit(evt)}
            />
          </div>
          <div className={styles.results}>
            <SuggestionTable />
          </div>
        </div>
      )
    }
  }
)
