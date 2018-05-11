import React from 'react'
import {connect} from '@cerebral/react'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import { Paper, AutoComplete, IconButton } from 'material-ui';
import styles from './styles.module.css'
import {state, signal, props } from 'cerebral/tags'

let cellStyle = {
  'paddingLeft': '12px',
  'paddingRight': '12px',
}

export default connect({
  editing: state`${props`prefix`}.editing`,
  persons: state`${props`prefix`}.${props`fromType`}.${props`edgeType`}_persons`,
  personsEditing: state`${props`prefix`}.${props`fromType`}_edits.${props`edgeType`}_persons`,
  newPersonText: state`${props`prefix`}.${props`fromType`}_edits.new_person.text`,
  matches: state`${props`prefix`}.${props`fromType`}_edits.new_person.matches`,
  match: state`${props`prefix`}.${props`fromType`}_edits.selected_match`,
  personPageRequested: signal`viewer.personPageRequested`,
  addPersonButtonClicked: signal`persontable.addPersonButtonClicked`,
  newPersonTextChanged: signal`persontable.newPersonTextChanged`,
  removePersonButtonClicked: signal`persontable.removePersonButtonClicked`,
  personMatchSelected: signal`persontable.personMatchSelected`,
},
  class PersonTable extends React.Component {

    render() {
      return (
        <Paper className={styles['table-container']}>
          <span className={styles['table-title']}>
            People Assigned
          </span>
        <Table 
          style={{width: 'auto'}} 
          fixedHeader={false} 
          selectable={false}>
          <TableHeader 
            style={{width:'auto'}}
            displaySelectAll={false}
            adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn style={cellStyle}>Person Name</TableHeaderColumn>
              {this.props.editing ?
                <TableHeaderColumn style={cellStyle}>Unassign Person</TableHeaderColumn>
                : null
              }
            </TableRow>
          </TableHeader>
          {this.props.editing ? <TableBody 
            style={{width:'auto'}}
            stripedRows={true}
            displaySelectAll={false}
            displayRowCheckbox={false}>
              {this.props.personsEditing.map((person, index) => (
                <TableRow 
                  key={index}>
                  <TableRowColumn style={cellStyle}>
                    {person.name}
                  </TableRowColumn>
                  <TableRowColumn style={cellStyle}>
                    <IconButton                                                                                
                      onTouchTap={(evt)=>{evt.stopPropagation(); this.props.removePersonButtonClicked({edgeCollection: this.props.edgeCollection, edgeType: this.props.edgeType, prefix: this.props.prefix, person, from: this.props.from, index, to:person._id})}}
                      iconClassName="material-icons">delete
                    </IconButton>
                  </TableRowColumn>
                </TableRow>
              ))}
              <TableRow>
                <TableRowColumn style={cellStyle}>
                  <AutoComplete
                    searchText={this.props.newPersonText}
                    hintText={`Assign a new person, e.g. "John Smith"`}
                    dataSource={this.props.matches.map((match) => (match.name))}
                    onNewRequest={(text, idx)=>{this.props.personMatchSelected({edgeCollection: this.props.edgeCollection, edgeType: this.props.edgeType, prefix: this.props.prefix, idx, text, match:this.props.matches[idx]})}}
                    onUpdateInput={(searchText)=>{this.props.newPersonTextChanged({edgeCollection: this.props.edgeCollection, edgeType: this.props.edgeType, prefix: this.props.prefix, text:searchText})}}
                  />
                </TableRowColumn>
                <TableRowColumn style={cellStyle}>
                  <IconButton                                                                                
                    onTouchTap={()=>{this.props.addPersonButtonClicked({edgeCollection: this.props.edgeCollection, edgeType: this.props.edgeType, prefix: this.props.prefix, text: this.props.newPersonText, match: this.props.match, from: this.props.from})}}
                    disabled={this.props.newPersonText.length > 0 ? false : true}
                    iconClassName="material-icons">add_circle
                  </IconButton>
                </TableRowColumn>
              </TableRow>
            </TableBody>
            :
            <TableBody 
              style={{width:'auto'}}
              stripedRows={true}
              displaySelectAll={false}
              displayRowCheckbox={false}>
              {this.props.persons.map((person, index) => (
                <TableRow 
                  key={index}
                  onTouchTap={()=>{this.props.personPageRequested({person:person.name})}}>
                  <TableRowColumn style={cellStyle}>
                    {person.name}
                  </TableRowColumn>
                </TableRow>
              ))}
            </TableBody>
          }
        </Table>
        </Paper>
      )
    }
  }
)
