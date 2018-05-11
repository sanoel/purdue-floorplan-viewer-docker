import { set, unset, } from 'cerebral/operators'
import { state, props, } from 'cerebral/tags'
import coeLib from 'coeLib'
import csvjson from 'csvjson'
import fd from 'react-file-download'
import _ from 'lodash'
import { failedAuth } from '../Login/chains'
import Promise from 'bluebird'

export var computeSmasDiffs = [
  set(state`app.generating_smas_report`, true),
  getSmasData, {
//  parseSmasFiles, {
    success: [
      forwardConvertSmasFiles, {
        success: [
          getCurrentShares, {
            success: [
              set(state`app.generating_smas_report`, false),
            ],
            error: [
              set(state`settings.error`, props`error`),
            ],
            unauthorized: [...failedAuth],
          },
        ],
        error: [
          set(state`settings.error`, props`error`),
        ],
      },
    ],
    error: [
      set(state`settings.error`, props`error`),
    ],
  },
]

function getSmasData({props, state, path, http}) {
  return http.get('/smas').then((result) => {
    return path.success({rows: result.result.rows})
  }).catch(() => path.error(
    {'errorMsg': 'initiateFloorplans: Unable to load svg floor plan file names!'}
  )) 
}

function forwardConvertSmasFiles({props, state, path, http}) {
	console.log('forward converting')
  let all_rows = [];
	let newShares = {} 
	let i = 0;
	return Promise.map(props.rows, (row) => {
		console.log(i++)
    let room = row.BUILDING_ABBREVIATION+' '+row.ROOM_NUMBER;
//    let share = row.SHARE_NUMBER;
    let share = row.SHARE_ID;
    newShares[room] = newShares[room] || {};
    newShares[room][share] = {
      'Bldg': row.BUILDING_ABBREVIATION,
      'Room': row['ROOM_NUMBER'],
      '%': row['SHARE_PERCENT'].toString(),
      'Area': row['SHARE_AREA'].toString(),
      'Department Using': row.USING_DEPT_ABBREVIATION,
      'Department Assigned': row.ASSIGNED_DEPT_ABBREVIATION,
      'Sta': row['STATIONS'] ? row['STATIONS'].toString() : '0',
      'Room Type': row.ROOM_CLASSIFICATION.trim(),
      'Description': row.DESCRIPTION || '',
			'Internal Note': row.SHARE_INTERNAL_NOTE || '',
    };
    if (newShares[room][share]['Description'].indexOf('On Loan') > -1) {
      newShares[room][share]['Internal Note'] = newShares[room][share].Description;
      newShares[room][share]['Description'] = row['SHARE_INTERNAL_NOTE'] || '';
    }
    if (coeLib.smasRoomTypesWithPeople.indexOf(row['ROOM_CLASSIFICATION']) !== -1) {
      let persons = coeLib.parsePersonsFromSmasDescription(newShares[room][share]['Description'])
      newShares[room][share]['Description'] = persons.map(name => name.trim()).filter(name => name.split(' ').length < 3).sort().join(';')
    }
    all_rows.push(newShares[room][share])
     return false
  }).then(() => {
// Print out a CSV file for diff checker utility usage.
     let options = {
       delimiter: ',',
       wrap: false,
     }
    let date = new Date()
    let dateStr = (date.getMonth()+1).toString() +'-'+date.getDate().toString()+'-'+date.getFullYear().toString();
		//     fd(csvjson.toCSV(all_rows, options), 'SMAS-'+dateStr+'.csv')
		return;
// Now put it into an object for comparison using something like _.isEqual
  }).then(() => {
    return path.success({newShares});
  })
}

// Gets the corresponding shares in our DB to those provided in the "new" SMAS file.
// Spits out a csv file representing this "current" state of the DB as well as csv
// of the differences between new and current.
function getCurrentShares({props, state, path, http}) {
	console.log('getting current shares')
	let diffs = {
		smas: [],
		fpv: []
	};
  let currentShares = {};
	let all_rows = [];
	let i = 0;
  // Loop over rooms. Every existing room should occur once.
	return Promise.each(Object.keys(props.newShares), (room) => {
		console.log(i++);
    currentShares[room] = {};
    return http.get('/nodes?name='+room+'&_type=room').then((response) => {
      return http.get('/edges?_from='+response.result[0]._id+'&_type=share').then((result) => {
        return Promise.map(result.result, (share) => {
          let dbShare = {
            'Bldg': share.building,
            'Room': share.room,
            '%':share.percent,
            'Area': share.area,
            'Department Using': share.using,
            'Department Assigned': share.assigned,
            'Sta': share.stations,
            'Room Type': share.type,
            'Description': share.description,
            'Internal Note': share.note,
          }
// TODO: This will ignore changes to share.note!!!! Probably need to resolve this!
          if (share.loans) { dbShare['Internal Note'] = share.loans; }
//TODO: This will ignore changes to share.description (but I think this is uneditable anyways);
// Get linked people from the db, concatenate them in alphabetical order into the Description column
          if (coeLib.smasRoomTypesWithPeople.indexOf(dbShare['Room Type']) > -1) {
            return http.get('/edges?_from='+share._id+'&_type=person').then((res) => {
              return dbShare['Description'] = res.result.map(person => person.name.trim()).sort().join(';')
            }).then((desc) => {
              dbShare.Description = desc;
              currentShares[room][share.share] = dbShare;
              all_rows.push(dbShare);
              return
            })
          } else {
            currentShares[room][share.share] = dbShare;
            all_rows.push(dbShare);
            return 
					}
					if (!_.isEqual(dbShare, props.newShares[room][share.share])) {
						console.log('changes detected')
						console.log(dbShare, props.newShares[room][share.share])
						diffs.smas.push(props.newShares[room][share.share])
						diffs.fpv.push(dbShare)
					}
					return;
        })
      })
    }).catch((error) => {
			//likely errored because the room is new in SMAS and doesn't exist in our db.
			console.log(error)
			console.log('room doesnt exist in our system')
			console.log(props.newShares[room])
			Object.keys(props.newShares[room]).forEach((share) => {
				diffs.smas.push(props.newShares[room][share])
				diffs.fpv.push({
          'Bldg': '',
          'Room': '', 
          '%': '',
          'Area': '',
          'Department Using': '',
          'Department Assigned': '',
          'Sta': '',
          'Room Type': '',
          'Description': '',
					'Internal Note': '',
				})
			})
		})
		return
  }).then(()=>{
    let options = {
       delimiter: ',',
       wrap: false,
     }
    let date = new Date()
    let dateStr = (date.getMonth()+1).toString() +'-'+date.getDate().toString()+'-'+date.getFullYear().toString();
		//     fd(csvjson.toCSV(all_rows, options), 'FPV-'+dateStr+'.csv')
		//     fd(csvjson.toCSV(diffs, options), 'SmasChanges-'+dateStr+'.csv')
		fd(csvjson.toCSV(diffs.smas, options), 'SmasDiffs-'+dateStr+'.csv')
		fd(csvjson.toCSV(diffs.fpv, options), 'FpvDiffs-'+dateStr+'.csv')
    return path.success({currentShares})
  }).catch((error) => {
    console.log(error)
    if (error.status === 401) {
      return path.unauthorized({})
    }
    return path.error({error})
  })
}

