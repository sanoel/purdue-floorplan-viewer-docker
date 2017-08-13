import React from 'react'
import {connect} from 'cerebral-view-react'
import styles from './attribute-dialog.css'
import classNames from 'classnames/bind'
import { IconButton, AutoComplete, Chip, Checkbox, Dialog, Popover, Paper, TextField, FontIcon, Divider, RaisedButton, DropDownMenu, MenuItem, FlatButton} from 'material-ui'

let roomAttributes = ['208 V', '220 V', '480 V', 'Single Phase', 'Three Phase']

export default connect(props => ({
  attributes: `roominfo.attribute_dialog.attributes`,
  open: 'roominfo.attribute_dialog.open',
}), {
  attributeChanged: 'roominfo.attributeChanged',
  cancelDialogClicked: 'roominfo.attributeDialogCancelled',
  submitDialogClicked: 'roominfo.attributeDialogSubmitted',
},

class AttributeDialog extends React.Component {

  render() {

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
        title={'Edit room attributes'}
        actions={actions}
        modal={false}
        open={this.props.open}
        className={styles['share-dialog']}
        onRequestClose={this.handleRequestClose}>
        <div className={styles['checkbox-container']}>
          {roomAttributes.map((attribute, i) => (
            <Checkbox
              key={'attribute-checkbox-'+i}
              onCheck={() => { this.props.attributeChanged({attribute})}}
              checked={this.props.attributes[attribute]}
              label={attribute}
            />
          ))}
        </div>
      </Dialog>
    )
  }
})
