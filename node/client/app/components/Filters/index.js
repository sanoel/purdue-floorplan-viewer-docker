/*
	The side panel displaying filters that may be applied to a search.
*/
import React from 'react'
import {connect} from 'cerebral-view-react'
import stylesLogin from '../Login/styles.css'
import styles from './styles.css'
import classNames from 'classnames/bind'
import { List, ListItem, Checkbox, Subheader, } from 'material-ui'

export default connect({
	all_departments: `personinfo.departments`,
	all_buildings: `app.buildings`,
	all_attributes: `roominfo.attribute_dialog.attributes`,
  all_types: `roominfo.room_types`,
	types: `filters.types`,
	using: `filters.using`,
	assigned: `filters.assigned`,
	buildings: `filters.buildings`,
	attributes: `filters.attributes`,
}, {
	buildingFilterChecked: `filters.buildingFilterChecked`,
	usingFilterChecked: `filters.usingFilterChecked`,
	assignedFilterChecked: `filters.assignedFilterChecked`,
	typeFilterChecked: `filters.typeFilterChecked`,
},
  class RoomInfo extends React.Component {

    render() {
      return (
        <div className={styles['filters']}>
					<List> 
					  <Subheader>Building</Subheader>
						{Object.keys(this.props.all_buildings).map(key =>
							<ListItem
								leftCheckbox={<Checkbox 
									key={'filter-building-'+key}
									checked={this.props.buildings[key] ? true : false}
									onCheck={() => {this.props.buildingFilterChecked({key})}}
								/>}
								primaryText={this.props.all_buildings[key]}
							/>
						)}
					</List>
					<List> 
					  <Subheader>Department Using</Subheader>
						{Object.keys(this.props.all_departments).map(key =>
							<ListItem
								leftCheckbox={<Checkbox 
									key={'filter-using-'+key}
									checked={this.props.using[key] ? true : false}
									onCheck={() => {this.props.usingFilterChecked({key})}}
								/>}
								primaryText={this.props.all_departments[key]}
							/>
						)}
					</List>
					<List> 
					  <Subheader>Department Assigned</Subheader>
						{Object.keys(this.props.all_departments).map(key =>
							<ListItem
								leftCheckbox={<Checkbox 
									key={'filter-assigned-'+key}
									checked={this.props.using[key] ? true : false}
									onCheck={() => {this.props.assignedFilterChecked({key})}}
								/>}
								primaryText={this.props.all_departments[key]}
							/>
						)}
					</List>
					<List> 
					  <Subheader>Room Types</Subheader>
						{Object.keys(this.props.all_types).map(key =>
							<ListItem
								leftCheckbox={<Checkbox 
									key={'filter-type-'+key}
									checked={this.props.types[key] ? true : false}
									onCheck={() => {this.props.typeFilterChecked({key})}}
								/>}
								primaryText={this.props.all_types[key]}
							/>
						)}
					</List>
					<List> 
					  <Subheader>Room Attributes</Subheader>
						{Object.keys(this.props.all_attributes).map(key =>
							<ListItem
								leftCheckbox={<Checkbox 
									key={'filter-type-'+key}
									checked={this.props.attributes[key] ? true : false}
									onCheck={() => {this.props.attributeFilterChecked({type})}}
								/>}
								primaryText={this.props.all_attributes[key]}
							/>
						)}
					</List>
        </div>
      )
    }
  }
)
