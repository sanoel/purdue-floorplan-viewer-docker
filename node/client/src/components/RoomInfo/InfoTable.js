/*
  This component renders information for a selected room. It
  shows up in the Viewer component when a room is selected.
  It lists all shares on each room in a table. It also lists 
  people that have been assigned to the room as clickable 
  links to their respective PersonInfo pages.
  
*/
import React from 'react'
import {connect} from '@cerebral/react'
import styles from './styles.module.css'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import { Chip, IconButton, Paper, } from 'material-ui'
import {state, signal } from 'cerebral/tags'
import AttributeDialog from './AttributeDialog'
import OriginalSharesDialog from '../OriginalSharesDialog'

let cellStyle = {
  paddingLeft: '12px',
  paddingRight: '12px',
}

export default connect({
  attributeDialog: state`roominfo.attribute_dialog.open`,
  room: state`roominfo.room`,
  saving_rooms: state`app.saving_rooms`,
  app_ready: state`app.ready`,
  originalSharesDialog: state`originalsharesdialog.open`,
  buildingPageRequested: signal`viewer.buildingPageRequested`,
  floorplanPageRequested: signal`viewer.floorplanPageRequested`,
  attributeEditButtonClicked: signal`roominfo.attributeEditButtonClicked`,
  originalSharesButtonClicked: signal`originalsharesdialog.originalSharesButtonClicked`,
},
  class InfoTable extends React.Component {

    render() {
			return (
				<Paper className={this.props.saving_rooms ? styles.disabled : styles['table-container']}>
					<span className={styles['table-title']}>
						Room Information
					</span>
					<Table
						style={{width: 'auto'}}
						className={styles['roominfo-table']}
						fixedHeader={false}
						selectable={false}>
						<TableHeader
							style={{width:'auto'}}
							displaySelectAll={false}
							adjustForCheckbox={false}>
							<TableRow>
								<TableHeaderColumn style={cellStyle}>Building</TableHeaderColumn>
								<TableHeaderColumn style={cellStyle}>Floor</TableHeaderColumn>
								<TableHeaderColumn style={cellStyle}>Room</TableHeaderColumn>
								<TableHeaderColumn style={cellStyle}>Total Area (ft<sup>2</sup>)</TableHeaderColumn>
								<TableHeaderColumn style={cellStyle}>Attributes</TableHeaderColumn>
								<TableHeaderColumn style={cellStyle}>View Original SMAS Shares</TableHeaderColumn>
							</TableRow>
						</TableHeader>
						<TableBody 
							style={{width:'auto'}}
							stripedRows={true}
							displayRowCheckbox={false}>
							<TableRow>
								<TableRowColumn
									style={cellStyle}
									onTouchTap={()=>{this.props.buildingPageRequested({building:this.props.room.building})}}>
									<a>{this.props.room.building}</a>
								</TableRowColumn>
								<TableRowColumn
									style={cellStyle}
									onTouchTap={()=>{ this.props.floorplanPageRequested({floorplan:this.props.room.building+' '+this.props.room.floor})}}>
									<a>{this.props.room.floor}</a>
								</TableRowColumn>
								<TableRowColumn
									style={cellStyle}>
									{this.props.room.name}
								</TableRowColumn>
								<TableRowColumn
									style={cellStyle}>
									{this.props.room.area}
								</TableRowColumn>
								<TableRowColumn style={cellStyle}>
									{this.props.attributeDialog ? <AttributeDialog /> : null }
									{Object.keys(this.props.room.attributes).map((key, i) => (
										this.props.room.attributes[key] ? <Chip
											key={'attribute_'+i}>
											{key}
										</Chip> : null
									))}
									<IconButton
										onTouchTap={()=>{this.props.attributeEditButtonClicked({})}}
										iconClassName="material-icons">edit
									 </IconButton>
								</TableRowColumn>
								<TableRowColumn style={cellStyle}>
									{this.props.originalSharesDialog ? <OriginalSharesDialog /> : null }
									<IconButton
										onTouchTap={()=>{this.props.originalSharesButtonClicked({})}}
										iconClassName="material-icons">description
									 </IconButton>
								</TableRowColumn>
							</TableRow>
						</TableBody>
					</Table>
				</Paper>
      )
    }
  }
)
