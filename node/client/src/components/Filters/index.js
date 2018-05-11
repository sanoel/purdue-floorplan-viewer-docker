/*
	The side panel displaying filters that may be applied to a search.
*/
import React from 'react'
import {connect} from '@cerebral/react'
//import stylesLogin from '../Login/styles.module.css'
import styles from './styles.module.css'
import { TextField, Divider, List, ListItem, Checkbox, FontIcon, Subheader, } from 'material-ui'
import {state, signal } from 'cerebral/tags'

let labelStyle = {
	paddingRight: '0px',
	paddingBottom: '0px'
}

let subheaderStyle = {
	color: '#fff',
	display: 'flex'
}

export default connect({
	all_departments: state`personinfo.departments`,
	all_buildings: state`app.buildings`,
	all_attributes: state`roominfo.attribute_dialog.all_attributes`,
  all_types: state`roominfo.room_types`,
	types: state`filters.query.types`,
	using: state`filters.query.using`,
	assigned: state`filters.query.assigned`,
	buildings: state`filters.query.buildings`,
	attributes: state`filters.query.attributes`,
	minStations: state`filters.query.minStations`,
	maxStations: state`filters.query.maxStations`,
	minRoomArea: state`filters.query.minRoomArea`,
	maxRoomArea: state`filters.query.maxRoomArea`,
	minShareArea: state`filters.query.minShareArea`,
	maxShareArea: state`filters.query.maxShareArea`,

	buildingsVisible: state`filters.headers.buildings.visible`,
	usingVisible: state`filters.headers.using.visible`,
	typesVisible: state`filters.headers.types.visible`,
	assignedVisible: state`filters.headers.assigned.visible`,
	attributesVisible: state`filters.headers.attributes.visible`,
	stationsVisible: state`filters.headers.stations.visible`,
	shareAreaVisible: state`filters.headers.shareArea.visible`,
	roomAreaVisible: state`filters.headers.roomArea.visible`,

	boxChecked: signal`filters.boxChecked`,
	headerClicked: signal`filters.headerClicked`,
	clearFiltersClicked: signal`filters.clearFiltersClicked`,
	inputChanged: signal`filters.inputChanged`,
},
	class RoomInfo extends React.Component {

    render() {
      return (
				<div className={styles['filters']}>
					<div 
						onClick={()=>{this.props.clearFiltersClicked({})}}
						className={styles['clear_filters']}>
						Clear Filters
						<FontIcon 
							className="material-icons">clear
						</FontIcon>
					</div>
					<Divider />
					<List> 
						<Subheader 
							onClick={() => {this.props.headerClicked({header: 'buildings'})}}
							style={subheaderStyle}>
							Building
							{Object.keys(this.props.buildings).length > 0 ? <div className={styles.filtersAppliedIcon}>
								<FontIcon 
									style={{color: '#fff'}}
									className="material-icons">error_outline
								</FontIcon>
							</div>: null}
						</Subheader>
						{this.props.buildingsVisible ? this.props.all_buildings.map(key =>
							<ListItem
								style={labelStyle}
								key={'filter-building-'+key}
								leftCheckbox={<Checkbox 
									iconStyle={{fill:'#000'}}
									checked={this.props.buildings[key] ? true : false}
									onCheck={() => {this.props.boxChecked({type:'buildings', key})}}
								/>}
								primaryText={key}
							/>
						) : null}
					</List>
					<Divider />
					<List> 
						<Subheader 
							className={styles.subheader}
							onClick={() => {this.props.headerClicked({header: 'using'})}}
							style={subheaderStyle}>
							Department Using
							{Object.keys(this.props.using).length > 0 ? <div className={styles.filtersAppliedIcon}>
								<FontIcon 
									style={{color: '#fff'}}
									className="material-icons">error_outline
								</FontIcon>
							</div>: null}
						</Subheader>
						{this.props.usingVisible ? this.props.all_departments.map(key =>
							<ListItem
								style={labelStyle}
								key={'filter-using-'+key}
								leftCheckbox={<Checkbox 
									iconStyle={{fill:'#000'}}
									checked={this.props.using[key] ? true : false}
									onCheck={() => {this.props.boxChecked({type: 'using', key})}}
								/>}
								primaryText={key}
							/>
						) : null}
					</List>
					<Divider />
					<List> 
						<Subheader 
							onClick={() => {this.props.headerClicked({header: 'assigned'})}}
							style={subheaderStyle}>
							Department Assigned
							{Object.keys(this.props.assigned).length > 0 ? <div className={styles.filtersAppliedIcon}>
								<FontIcon 
									style={{color: '#fff'}}
									className="material-icons">error_outline
								</FontIcon>
							</div>: null}
						</Subheader>
						{this.props.assignedVisible ? this.props.all_departments.map(key =>
							<ListItem
								style={labelStyle}
								key={'filter-assigned-'+key}
								leftCheckbox={<Checkbox 
									iconStyle={{fill:'#000'}}
									checked={this.props.assigned[key] ? true : false}
									onCheck={() => {this.props.boxChecked({type: 'assigned', key})}}
								/>}
								primaryText={key}
							/>
						): null}
					</List>
					<Divider />
					<List> 
						<Subheader 
							onClick={() => {this.props.headerClicked({header: 'types'})}}
							style={subheaderStyle}>
							Room Types
							{Object.keys(this.props.types).length > 0 ? <div className={styles.filtersAppliedIcon}>
								<FontIcon 
									style={{color: '#fff'}}
									className="material-icons">error_outline
								</FontIcon>
							</div>: null}
						</Subheader>
						{this.props.typesVisible ? this.props.all_types.map(key =>
							<ListItem
								style={labelStyle}
								key={'filter-type-'+key}
								leftCheckbox={<Checkbox 
									iconStyle={{fill:'#000'}}
									checked={this.props.types[key] ? true : false}
									onCheck={() => {this.props.boxChecked({type: 'types', key})}}
								/>}
								primaryText={key}
							/>
						): null}
					</List>
					<Divider />
					<List> 
						<Subheader 
							onClick={() => {this.props.headerClicked({header: 'attributes'})}}
							style={subheaderStyle}>
							Room Features
							{Object.keys(this.props.attributes).length > 0 ? <div className={styles.filtersAppliedIcon}>
								<FontIcon 
									style={{color: '#fff'}}
									className="material-icons">error_outline
								</FontIcon>
							</div>: null}
						</Subheader>
						{this.props.attributesVisible ? this.props.all_attributes.map(key =>
							<ListItem
								style={labelStyle}
								key={'filter-type-'+key}
								leftCheckbox={<Checkbox 
									iconStyle={{fill:'#000'}}
									checked={this.props.attributes[key] ? true : false}
									onCheck={() => {this.props.boxChecked({type: 'attributes', key})}}
								/>}
								primaryText={key}
							/>
						): null}
					</List>
					<Divider />
					<List> 
						<Subheader 
							onClick={() => {this.props.headerClicked({header: 'stations'})}}
							style={subheaderStyle}>
							Room Stations
							{(this.props.minStations !== '' || this.props.maxStations !== '') ? 
								<div className={styles.filtersAppliedIcon}>
									<FontIcon 
										style={{color: '#fff'}}
										className="material-icons">error_outline
									</FontIcon>
								</div> : null}
						</Subheader>
						{this.props.stationsVisible ?
							<div
								className={styles.minMaxDiv}>
								<TextField
									hintText="Min"
									style={{width: '100px', backgroundColor: '#fff'}}
									className={styles.minMaxText}
									errorText={Number.isInteger(+this.props.minStations) ? null: "Must be a number"}
									underlineStyle={{width: '100px'}}
									key='minStations'
									value={this.props.minStations}
									onChange={(evt, val) => {this.props.inputChanged({type: 'minStations', val})}}
								/>
								<TextField
									hintText="Max"
									style={{width: '100px', backgroundColor: '#fff'}}
									errorText={Number.isInteger(+this.props.maxStations) ? null: "Must be a number"}
									className={styles.minMaxText}
									underlineStyle={{width: '100px'}}
									key='maxStations'
									value={this.props.maxStations}
									onChange={(evt, val) => {this.props.inputChanged({type: 'maxStations', val})}}
								/>
							</div>
							: null}
					</List>
					<Divider />
					<List> 
						<Subheader 
							onClick={() => {this.props.headerClicked({header: 'roomArea'})}}
							style={subheaderStyle}>
							Room Area
							{(this.props.minRoomArea !== '' || this.props.maxRoomArea !== '') ? 
								<div className={styles.filtersAppliedIcon}>
									<FontIcon 
										style={{color: '#fff'}}
										className="material-icons">error_outline
									</FontIcon>
								</div> : null}
						</Subheader>
						{this.props.roomAreaVisible ?
							<div 
									className={styles.minMaxDiv}>
								<TextField
									hintText="Min"
									style={{width: '100px', backgroundColor: '#fff'}}
									errorText={Number.isInteger(+this.props.minRoomArea) ? null: "Must be a number"}
									key='minRoomArea'
									underlineStyle={{width: '100px'}}
									className={styles.minMaxText}
									value={this.props.minRoomArea}
									onChange={(evt, val) => {this.props.inputChanged({type: 'minRoomArea', val})}}
								/>
								<TextField
									hintText="Max"
									style={{width: '100px', backgroundColor: '#fff'}}
									errorText={Number.isInteger(+this.props.maxRoomArea) ? null: "Must be a number"}
									className={styles.minMaxText}
									underlineStyle={{width: '100px'}}
									key='maxRoomArea'
									value={this.props.maxRoomArea}
									onChange={(evt, val) => {this.props.inputChanged({type: 'maxRoomArea', val})}}
								/>
							</div>
							: null}
					</List>
					<Divider />
					<List> 
						<Subheader 
							onClick={() => {this.props.headerClicked({header: 'shareArea'})}}
							style={subheaderStyle}>
							Share Area
							{(this.props.minShareArea !== '' || this.props.maxShareArea !== '') ? 
								<div className={styles.filtersAppliedIcon}>
									<FontIcon 
										style={{color: '#fff'}}
										className="material-icons">error_outline
									</FontIcon>
								</div> : null}
						</Subheader>
						{this.props.shareAreaVisible ?
							<div
								className={styles.minMaxDiv}>
								<TextField
									hintText="Min"
									errorText={Number.isInteger(+this.props.minShareArea) ? null : "Must be a number"}
									style={{width: '100px', backgroundColor: '#fff'}}
									className={styles.minMaxText}
									key='minShareArea'
									underlineStyle={{width: '100px'}}
									value={this.props.minShareArea}
									onChange={(evt, val) => {this.props.inputChanged({type: 'minShareArea', val})}}
								/>
								<TextField
									hintText="Max"
									style={{width: '100px', backgroundColor: '#fff'}}
									errorText={Number.isInteger(+this.props.maxShareArea) ? null: "Must be a number"}
									underlineStyle={{width: '100px'}}
									className={styles.minMaxText}
									key='maxShareArea'
									value={this.props.maxShareArea}
									onChange={(evt, val) => {this.props.inputChanged({type: 'maxShareArea', val})}}
								/>
							</div>
							: null}
					</List>
					<Divider />
        </div>
      )
    }
  }
)
