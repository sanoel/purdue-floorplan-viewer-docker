/*
  This component renders information for a selected room. It
  shows up in the Viewer component when a room is selected.
  It also lists people that have been assigned to the room
  as clickable links to their respective PersonInfo pages.
*/
import React from 'react'
import {connect} from 'cerebral-view-react'
import styles from './share-dialog.css'
import classNames from 'classnames/bind'
import { IconButton, AutoComplete, Chip, Checkbox, Dialog, Popover, Paper, TextField, FontIcon, Divider, RaisedButton, DropDownMenu, MenuItem, FlatButton} from 'material-ui'

let roomOptions = ['208 V', '220 V', '480 V', 'Single Phase', 'Three Phase']

export default connect(props => ({
  share: `roominfo.share_dialog.share`,
  open: 'roominfo.share_dialog.open',
  departments: 'personinfo.departments',
  roomTypes: 'roominfo.room_types',
  newPersonText: 'roominfo.share_dialog.new_person.text',
  matches: `roominfo.share_dialog.new_person.matches`,
  match: `roominfo.share_dialog.new_person.selected_match`,
}), {
  roomTypeChanged: 'roominfo.roomTypeChanged',
  departmentUsingChanged: 'roominfo.departmentUsingChanged',
  departmentAssignedChanged: 'roominfo.departmentAssignedChanged',
  percentChanged: 'roominfo.percentChanged',
  stationsChanged: 'roominfo.stationsChanged',
  noteChanged: 'roominfo.noteChanged',
  addShareButtonClicked: 'roominfo.addShareButtonClicked',
  deleteShareButtonClicked: 'roominfo.deleteShareButtonClicked',
  roomOptionChanged: 'roominfo.roomOptionChanged',
  cancelDialogClicked: 'roominfo.cancelDialogClicked',
  submitDialogClicked: 'roominfo.submitDialogClicked',
  newPersonTextChanged: 'roominfo.newPersonTextChanged',
  removePersonButtonClicked: 'roominfo.removePersonButtonClicked',
  personMatchSelected: 'roominfo.personMatchSelected', 
  addPersonButtonClicked: 'roominfo.addPersonButtonClicked',
},

class ShareDialog extends React.Component {

  render() {
    let departmentMenuItems =this.props.departments.map((dept, i) => (
      <MenuItem key={'department-item-'+i} value={i} primaryText={dept} />
    ))
    let roomTypeMenuItems =this.props.roomTypes.map((type, i) => (
      <MenuItem key={'roomtype-item-'+i} value={i} primaryText={type} />
    ))

    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={()=>{this.props.cancelDialogClicked({share:this.props.share})}}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={()=>{this.props.submitDialogClicked({share:this.props.share})}}
      />
    ];

    return (
      <Dialog
        title={<div className={styles['title-container']}>
          <p className={styles.title}>Edit a room share</p>
          <div
            onTouchTap={()=>{this.props.deleteShareButtonClicked({ share: this.props.share })}}
            className={styles.delete}>
            <IconButton                                                                                
              iconClassName="material-icons">delete
            </IconButton>
            <p>Delete Share</p>
          </div>
        </div>}
        actions={actions}
        modal={false}
        open={this.props.open}
        className={styles['share-dialog']}
        onRequestClose={this.handleRequestClose}>
        <div className={styles.type}>
          Room Type  
          <DropDownMenu 
            className={styles.room_type_dropdown}
            value={this.props.roomTypes.findIndex(x => x === this.props.share.type)} 
            onChange={(evt, j, value)=>{this.props.roomTypeChanged({type:this.props.roomTypes[value], share: this.props.shareKey})}}>
            {roomTypeMenuItems}
          </DropDownMenu> 
        </div>
        <Divider />
        <div className={styles.share}>
          <p className={styles.share_title}>Share Percentage</p>
          <TextField
            id={'roominfo-percent-textfield'}
            style={{width: 'auto'}}
            hintText={`e.g., "25"`}
            value={this.props.share.percent}
            onChange={(evt, newValue)=>{this.props.percentChanged({percent:newValue, share: this.props.shareKey})}}
          />
          Area: {this.props.share.area} ft<sup>2</sup>
        </div>
        <Divider />
        <div className={styles.department_assigned}>
          Department Assigned
          <DropDownMenu 
            style={{width: 'auto'}}
            value={this.props.departments.findIndex(x => x === this.props.share.assigned)} 
            onChange={(evt, j, value)=>{this.props.departmentAssignedChanged({assigned:this.props.departments[value], share: this.props.shareKey})}}>
             {departmentMenuItems}
          </DropDownMenu>
        </div>
        <Divider />
        <div className={styles.department_using}>
          Department Using
          <DropDownMenu 
            style={{width: 'auto'}}
            value={this.props.departments.findIndex(x => x === this.props.share.using)} 
            onChange={(evt, j, value)=>{this.props.departmentUsingChanged({using:this.props.departments[value], share: this.props.shareKey})}}>
            {departmentMenuItems}
          </DropDownMenu>
        </div>
        <Divider />
        <div className={styles.stations}>
          <p className={styles.stations_title}>Number of Stations</p>
          <TextField
            style={{width: 'auto'}}
            hintText='e.g., 5' 
            value={this.props.share.stations}
            onChange={(evt, newValue)=>{this.props.stationsChanged({stations:newValue, share: this.props.shareKey})}}
          />
        </div>
        <Divider />
        <div className={styles.assigned_people}>
          <p className={styles.assigned_people_title}>Assign People:</p>
          <AutoComplete
            className={styles.assigned_people_textfield}
            searchText={this.props.newPersonText}
            hintText={`E.g. "John Smith"`}
            dataSource={this.props.matches.map((match) => (match.name))}
            onNewRequest={(text, idx)=>{this.props.personMatchSelected({fromType: this.props.fromType, prefix: this.props.prefix, idx, text, match:this.props.matches[idx]})}}
            onUpdateInput={(searchText)=>{this.props.newPersonTextChanged({fromType: this.props.fromType, prefix: this.props.prefix, text:searchText})}}
          />
          <IconButton                                                                                
            onTouchTap={()=>{this.props.addPersonButtonClicked({ share: this.props.share, text: this.props.newPersonText, match: this.props.match })}}
            disabled={/*this.props.newPersonText.length > 0 ? false : true*/ this.props.match._key ? false : true}
            iconClassName="material-icons">add_circle
          </IconButton>

          {Object.keys(this.props.share.persons).map((key, p) => (
            <Chip
              key={'person_chip_'+p}
              onRequestDelete={(evt)=>{this.props.removePersonButtonClicked({person:this.props.share.persons[key], share: this.props.share})}}>
              {this.props.share.persons[key].name}
            </Chip>
          ))}
          <p className={styles.description}>{this.props.share.description}</p>
        </div>
        <Divider />
      </Dialog>
    )
  }
})
