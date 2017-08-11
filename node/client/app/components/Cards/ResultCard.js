// Cards is the larger grid list of search results after a user performs a search and clicks the "More results" button.
import React from 'react'
import {connect} from 'cerebral-view-react'
import {GridList, GridTile} from 'material-ui/GridList'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import styles from './styles.css'
import classNames from 'classnames/bind'
let cx = classNames.bind(styles)
import {icons} from '../SuggestionTable/suggestionCard'
import _ from 'lodash'
import $ from 'jquery'

const cellMaxWidth = 250, padding = 7

export default connect(props=>({
  floorplans: 'app.floorplans',
  searchbar_query: 'viewer.state.query',
  idx_selected_suggestion: 'viewer.state.idx',
  card: `cards.cards_to_show.${props.idx}`,
  type: `cards.cards_to_show.${props.idx}._type`
}), {
   searchResultClicked: 'viewer.searchResultClicked',
},
class ResultCard extends React.Component {

  render() {
    let cardPreview = null, cardTitle = null, cardSubTitle = null, cardDetails = null
    let icon = icons[this.props.type]
    let doubleRows = false

    if (this.props.type==='floorplan') {
      doubleRows = true
      cardPreview = (
        <img
          className={cx('card-svg')}
          src={'/img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/'+this.props.card.filename} />
      )
    } else {
      cardPreview = icon
    }
    cardTitle = this.props.card.name;
    cardSubTitle = this.props.type;
    cardSubTitle = cardSubTitle.charAt(0).toUpperCase() + cardSubTitle.slice(1)
    cardDetails = 'Details to be added...'

    return (
      <GridTile className={styles.gridtile}
        key={'card'+'_'+this.props.idx}
        onClick={()=>{this.props.searchResultClicked({type:this.props.type, card:this.props.card})}}
        rows={doubleRows ? 2 : 1}>
        <Card className={cx('card')}>
          <CardMedia className={cx('card-ele')}>
            {cardPreview}
          </CardMedia>
          <CardTitle className={cx('card-ele')}
            title={cardTitle} subtitle={cardSubTitle} />
          <CardText className={cx('card-ele')}>
            {cardDetails}
          </CardText>
        </Card>
      </GridTile>
    )
  }
})
