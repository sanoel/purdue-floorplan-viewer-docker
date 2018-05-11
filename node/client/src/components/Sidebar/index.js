// Sidebar is the left panel used for searching. 
import React from 'react'
import { connect } from '@cerebral/react'
import styles from './styles.module.css'
import SearchBar from '../SearchBar'
import {state, signal } from 'cerebral/tags'
import Filters from '../Filters'
import { Tabs, Tab, FontIcon } from 'material-ui'
import _ from 'lodash'

export default connect({
  tab: state`sidebar.tab`,
	query: state`filters.query`,
	tabClicked: signal`sidebar.tabClicked`,
},
  class Sidebar extends React.Component {

     render() {
      return (
        <div className={styles['sidebar']}>
					<Tabs
						onChange={(tab) => this.props.tabClicked({tab})}
						value={this.props.tab}>
						<Tab 
							icon={<FontIcon className="material-icons">search</FontIcon>}
							label="Search" 
							value={0}>
							<SearchBar />
						</Tab>
						<Tab 
							icon={
								<div>
									<FontIcon 
										style={{color: '#fff'}}
										className="material-icons">filter_list
									</FontIcon>
									{Object.keys(this.props.query).every(key => _.isEmpty(this.props.query[key])) ? 
										null : 
										<FontIcon 
											style={{color: '#fff'}}
											className="material-icons">error_outline
										</FontIcon>
									}
								</div>
							}
							label="Filter" 
							value={1}>
							<Filters />
						</Tab>
					</Tabs>
        </div>
      )
    }
  }
)



