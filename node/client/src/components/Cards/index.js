// Cards is the larger grid list of search results after a user performs a search and 
// and clicks the "More results" button or if a user clicks selects a building (the
// cards list will display all of the floorplans for that building).
import React from 'react'
import {connect} from '@cerebral/react'
import {GridList, GridTile} from 'material-ui/GridList'
import {Card, CardMedia, CardTitle} from 'material-ui/Card'
import { FontIcon } from 'material-ui'
import FloorPlan from '../FloorPlan'
import styles from './styles.module.css'
import $ from 'jquery'
import icons from '../SearchResultsTable/Icons.js'
import {state, signal } from 'cerebral/tags'

//material ui grid style
const gridStyles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
	gridList: {
    overflowY: 'visible'
  },
}
const cellMaxWidth = 250, padding = 7

export default connect({
  cards_to_show: state`cards.cards_to_show`,
	floorplans: state`filters.result.floorplans`,
  floorplanPageRequested: signal`viewer.floorplanPageRequested`,
	searchResultClicked: signal`viewer.searchResultClicked`,
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
          this.setState({cols: Math.ceil($('#gridlist-cards').innerWidth()/cellMaxWidth)})
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
      return (
        <div className = {styles.wrapper}>
          <div className={styles.title}>
            Search Results
          </div>
          <div className={styles['cards-title']}>
            <br/>
              {this.props.cards_to_show.length>0 ?
								<p> {this.props.cards_to_show.length} results found.</p>
			        : (<p>Nothing was found. </p>)}
            <br/>
          </div>
          <div className={styles['cards']}
            style={gridStyles.root}>
						<GridList id='gridlist-cards'
								cellHeight='auto'
                cols={this.state.cols}
                padding={padding}
                style={gridStyles.gridList}
              >
							{this.props.cards_to_show.map((card, idx) => 
								<GridTile className={styles.gridtile}
									key={'card_'+idx}
									onClick={() => {this.handleClick(card)}}>
									<Card className={styles['card']}>
										<CardMedia className={styles['card-preview']}>
											{card._type === 'floorplan' ?
												<FloorPlan 
													style={{cursor:'pointer'}}
													className={styles['floorplan']}
													id={card.name} 
													key={card.name} 
													building={card.building}
													filename={card.filename}
													floor={card.name}
												/>
												:
												<FontIcon 
													className="material-icons">{icons[card._type]}
												</FontIcon>
											}
										</CardMedia>
										<CardTitle className={styles['card-ele']}
											title={card.name.charAt(0).toUpperCase() + card.name.slice(1)} 
											subtitle={card._type} 
										/>
									</Card>
								</GridTile>
							)}
              </GridList>
            <br/>
          </div>
        </div>
      )
    }
  }
)
