// Sidebar is the left panel used for searching. 
import React from 'react'
import { connect } from 'cerebral-view-react'
import styles from './styles.css'
import SearchBar from '../SearchBar'
import Filters from '../Filters'
import classNames from 'classnames/bind'
import { Tabs, Tab, FontIcon } from 'material-ui'
export default connect({
  tab: 'sidebar.tab',
}, {
	tabClicked: 'sidebar.tabClicked',
},
  class Sidebar extends React.Component {

     render() {
      return (
        <div className={styles['sidebar']}>
					<SearchBar />
					{/*
					<Tabs
						onChange={(tab) => this.props.tabClicked({tab})}
						value={this.props.tab}>
						<Tab 
							icon={<FontIcon className="material-icons">search</FontIcon>}
							label="Search" 
							value={0} 
						/>
						<Tab 
							icon={<FontIcon className="material-icons">filter</FontIcon>}
							label="Filter" 
							value={1} 
						/>
					</Tabs>
					{this.props.tab === 0 ? <SearchBar /> : <Filters />}
					*/}
        </div>
      )
    }
  }
)
