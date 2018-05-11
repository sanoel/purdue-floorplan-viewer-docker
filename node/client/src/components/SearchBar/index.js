// SearchBar is the left panel used for searching. 
import React from 'react'
import {connect} from '@cerebral/react'
import SearchResultsTable from '../SearchResultsTable'
import styles from './styles.module.css'
import { FontIcon, Paper, TextField } from 'material-ui'
import {state, signal } from 'cerebral/tags'

export default connect({
  app_ready: state`app.ready`,
  hint: state`searchbar.hint`,
  text: state`searchbar.text`,
  error: state`sidebar.error`,
  searchChanged: signal`searchbar.searchBarInputChanged`,
  frontPageRequested: signal`app.frontPageRequested`,
	searchSubmitClicked: signal`searchbar.searchSubmitClicked`,
	clearClicked: signal`searchbar.clearClicked`,
},
  class SearchBar extends React.Component {

    // Search bar confirmation.
    onSearchBarSubmit(evt) {
      evt.preventDefault()
      // Submit the result and update the URL using the signal defined for the
      // router.
      if(this.props.text){
        this.props.searchSubmitClicked({text: this.props.text, type:'cards'})
      } else {
        this.props.frontPageRequested();
      }
    }
 
    handleKeys(evt) {
      if (evt.key === 'Enter') this.onSearchBarSubmit(evt)
    }

    render() {
      return (
        <div className={styles['sidebar']}>
          <div className={styles.hint}>
            <p>
              What / Who are you looking for?
              <br/>
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
                onChange={(evt) => this.props.searchChanged({text: evt.target.value})}
                onKeyPress={(evt) => this.handleKeys(evt)}
              />
							{this.props.text==='' ? null : <FontIcon 
                className={"fa fa-times"}
                onTouchTap={evt => this.props.clearClicked()}
              />}
            </Paper>
            <FontIcon
              className={`fa fa-search ${styles['search-button']}`}
              onTouchTap={(evt) => this.onSearchBarSubmit(evt)}
            />
          </div>
          <div className={styles.results}>
            <SearchResultsTable />
          </div>
        </div>
      )
    }
  }
)
