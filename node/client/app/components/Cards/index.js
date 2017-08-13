// Cards is the larger grid list of search results after a user performs a search and 
// and clicks the "More results" button or if a user clicks selects a building (the
// cards list will display all of the floorplans for that building).
import React from 'react'
import {connect} from 'cerebral-view-react'
import {GridList, GridTile} from 'material-ui/GridList'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import { FontIcon, FlatButton } from 'material-ui'
import styles from './styles.css'
import ResultCard from './ResultCard'
import _ from 'lodash'
import $ from 'jquery'
import {icons} from '../SuggestionTable/suggestionCard'

//material ui grid style
const gridStyles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
//    width: window.innerWidth,
    overflowY: 'visible'
  },
}
const cellMaxWidth = 250, padding = 7

export default connect({
  cards_to_show: 'cards.cards_to_show',
  searchbar_query: 'viewer.state.query',
  idx_selected_suggestion: 'viewer.state.idx'
}, {
  floorplanPageRequested: 'viewer.floorplanPageRequested',
  searchResultClicked: 'viewer.searchResultClicked',
},
  class Cards extends React.Component {

    constructor(props) {
      super(props)

      this.state = {
        cols : 0
      }
    }

    componentDidMount() {
      // Compute cols according to the available cards area width if the screen
      // is large enough, when the grid list is completely loaded.
      let updateCols = () => {
        if(window.innerWidth >= 768) {
          this.setState({cols: Math.ceil($('#cards').innerWidth()/cellMaxWidth)})
        } else {
          this.setState({cols: 3})
        }
      }
      updateCols()
      // Make sure cols is updated whenever the window is resized.
      window.onresize = updateCols
    }

    handleClick(card) {
      let type = card._type
      if (type === 'floorplan') {
        return this.props.floorplanPageRequested({floorplan:card.name})
      } else {
        return this.props.searchResultClicked({type, card})
      }
    }

    render() {
      let cardsTitle = this.props.cards_to_show.length>0 ?
        (<p> {this.props.cards_to_show.length} results found.</p>)
        : (<p>Nothing was found. </p>)
      let cardsToShow = this.props.cards_to_show.map((card, idx) => {
        let cardPreview = null, cardTitle = null, cardSubTitle = null, cardDetails = null
        let icon = icons[card._type]
        let doubleRows = false

        if (card._type==='floorplan') {
          doubleRows = true
          cardPreview = (
            <img
              className={styles['card-svg']}
              src={'/img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/'+card.filename} />
          )
        } else {
          cardPreview = (<FontIcon className="material-icons">{icon}</FontIcon>)
        }
        cardTitle = card.name;
        cardSubTitle = card._type;
        cardSubTitle = cardSubTitle.charAt(0).toUpperCase() + cardSubTitle.slice(1)
        cardDetails = 'Details to be added...'
        return <GridTile className={styles.gridtile}
          key={'card'+'_'+idx}
          onClick={() => {this.handleClick(card)}}
          rows={doubleRows ? 2 : 1}>
          <Card className={styles['card']}>
            <CardMedia className={styles['card-ele']}>
              {cardPreview}
            </CardMedia>
            <CardTitle className={styles['card-ele']}
              title={cardTitle} subtitle={cardSubTitle} />
            <CardText className={styles['card-ele']}>
              {cardDetails}
            </CardText>
          </Card>
        </GridTile>
      })

      return (
        <div className = {styles.wrapper}>
          <div className={styles.title}>
            Search Results
          </div>
          <div className={styles['cards-title']}>
            <br/>
              {cardsTitle}
            <br/>
          </div>
          <div className={styles['cards']}
            style={gridStyles.root}>
              <GridList id='cards'
                cols={this.state.cols}
                padding={padding}
                style={gridStyles.gridList}
              >
              {cardsToShow}
              </GridList>
            <br/>
          </div>
        </div>
      )
    }
  }
)
