export var computeSmasDiffs = [
  set('state:app.generating_smas_report', true),
	getSmasData, {
//  parseSmasFiles, {
    success: [
			forwardConvertSmasFiles, {
				success: [
		      getCurrentShares, {
						success: [
							set('state:app.generating_smas_report', false),
						],
						error: [
							copy('input:error', 'state:settings.error'),
						],
						unauthorized: [...failedAuth],
					},
				],
				error: [
					copy('input:error', 'state:settings.error'),
				],
			},
    ],
    error: [
			copy('input:error', 'state:settings.error'),
		],
  },
]

// Convert the SQL results into the SMAS output format
function forwardConvertSmasFiles({input, state, output, services}) {
  let all_rows = [];
  let newShares = {} 
  return Promise.map(input.rows, (row) => {
		let room = row.BUILDING_ABBREVIATION+' '+row.ROOM_NUMBER;
		let share = row.SHARE_NUMBER;
//		let share = row.SHARE_ID;
		newShares[room] = newShares[room] || {};
		newShares[room][share] = {};

		newShares[room][share]['Internal Note'] = ''; 
		newShares[room][share]['DESCRIPTION'] = row.DESCRIPTION; 
		if (!row.DESCRIPTION) {
			newShares[room][share].DESCRIPTION = '';
		} else if (row['DESCRIPTION'].indexOf('On Loan') > -1) {
			newShares[room][share]['Internal Note'] = row.DESCRIPTION;
   		newShares[room][share].DESCRIPTION = ''; //row['Internal Note']
		}
		if (!newShares[room][share].DESCRIPTION) {
			newShares[room][share].DESCRIPTION = '';
		}
    newShares[room][share]['BUILDING_ABBREVIATION'] = row.BUILDING_ABBREVIATION;
    newShares[room][share]['USING_DEPT_ABBREVIATION'] = row.USING_DEPT_ABBREVIATION;
    newShares[room][share]['ASSIGNED_DEPT_ABBREVIATION'] = row.ASSIGNED_DEPT_ABBREVIATION;
    newShares[room][share]['ROOM_NUMBER'] = row['ROOM_NUMBER'];
    newShares[room][share]['ROOM_CLASSIFICATION'] = row.ROOM_CLASSIFICATION.trim()
    newShares[room][share]['TOTAL_AREA'] = row['TOTAL_AREA'].toString()
//    newShares[room][share]['ROOM_ID'] = row['ROOM_ID'].toString()
    newShares[room][share]['SHARE_ID'] = row['SHARE_ID'].toString()
    newShares[room][share]['SHARE_PERCENT'] = row['SHARE_PERCENT'].toString()
    newShares[room][share]['SHARE_AREA'] = row['SHARE_AREA'].toString()
    newShares[room][share]['STATIONS'] = row['STATIONS'] ? row['STATIONS'].toString() : '0';
		let persons;
    if (coeLib.smasRoomTypesWithPeople.indexOf(row['ROOM_CLASSIFICATION']) !== -1) {
     	persons = coeLib.parsePersonsFromSmasDescription(newShares[room][share]['DESCRIPTION'])
     	newShares[room][share].DESCRIPTION = persons.map(name => name.trim()).sort().join(';')
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
   	fd(csvjson.toCSV(all_rows, options), 'SMAS-'+dateStr+'.csv')
// Now put it into an object for comparison using something like _.isEqual
  }).then(() => {
    return output.success({newShares});
  })
}
forwardConvertSmasFiles.async = true;
forwardConvertSmasFiles.outputs = ['success', 'error']


// Gets the corresponding shares in our DB to those provided in the "new" SMAS file.
// Spits out a csv file representing this "current" state of the DB as well as csv
// of the differences between new and current.
function getCurrentShares({input, state, output, services}) {
	let diffs = [];
  let currentShares = {};
  let all_rows = [];
	// Loop over rooms. Every existing room should occur once.
  return Promise.each(Object.keys(input.newShares), (room) => {
		currentShares[room] = {};
	// Loop over shares.  This may need to be moved elsewhere.
//  	return Promise.each(Object.keys(input.newShares[room]), (shareid) => {
   	return services.http.get('/nodes?name='+room+'&type=room').then((response) => {
     	return services.http.get('/edges?from='+response._id+'&type=share').then((result) => {
       	return Promise.map(result.result, (share) => {
         	let dbShare = {
           	'BUILDING_ABBREVIATION': share.building,
           	'ROOM_NUMBER': share.room.split(' ')[1],
//           	'SHARE_ID': share.share || share.name.split('-')[1].trim(),
           	'SHARE_ID': share.name.split('-')[1].trim(),
           	'SHARE_PERCENT':share.percent,
           	'SHARE_AREA': share.area,
           	'USING_DEPT_ABBREVIATION': share.using,
           	'ASSIGNED_DEPT_ABBREVIATION': share.assigned,
           	'STATIONS': share.stations,
           	'ROOM_CLASSIFICATION': share.type,
						'TOTAL_AREA': response.area,
//						'ROOM_ID': response.roomid,
         	}
// Get linked people from the db, concatenate them in alphabetical order into the Description column
         	if (coeLib.smasRoomTypesWithPeople.indexOf(dbShare['ROOM_CLASSIFICATION']) !== -1) {
           	return services.http.get('/edges?from='+share._id+'&type=person').then((res) => { 
           	 	return Promise.map(res.result, person => person.name).then(x => x.sort().join(';'))
            }).then((desc) => {
             	dbShare.DESCRIPTION = desc;
						//TODO: note probably shouldn't be indexed here
             	dbShare['Internal Note'] = share.note[0];
             	if (dbShare['DESCRIPTION'].indexOf(',') > -1) {
								console.log('comma present in ', dbShare)
               	dbShare['DESCRIPTION'] = `"${dbShare['DESCRIPTION']}"`
             	}
							currentShares[room][dbShare.SHARE_ID] = dbShare;
							all_rows.push(dbShare);
             	return 
           	})
         	} else {
           	dbShare['DESCRIPTION'] = share.description;
						//TODO: note probably shouldn't be indexed here
           	dbShare['Internal Note'] = share.note[0];
           	if (dbShare['DESCRIPTION'].indexOf(',') > -1) {
             	dbShare['DESCRIPTION'] = `"${dbShare['DESCRIPTION']}"`
         	 	}
						currentShares[room][dbShare.SHARE_ID] = dbShare;
						all_rows.push(dbShare);
           	return
         	}
       	})
     	})
//			})
    }).then(() => {
/*
     	let sorted = _.sortBy(roomShares, 'Share Number')
     	sorted.forEach((share, i) => {
     	share['Share Number'] = i.toString();
     	sorted[i]['Share Number'] = i.toString();
     	currentShares[filename].push(share);
    })
*/
// Compare by room.  If the entire room doesn't match, add it to diffs; 
     	if (!_.isEqual(currentShares[room], input.newShares[room])) {
				console.log(currentShares[room], input.newShares[room])
				Object.keys(currentShares[room]).forEach((key) => {
        	diffs.push(currentShares[room][key])
        })
      }
			return;
		})
  }).then(()=>{
    let options = {
     	delimiter: ',',
     	wrap: false,
   	}
		let date = new Date()
		let dateStr = (date.getMonth()+1).toString() +'-'+date.getDate().toString()+'-'+date.getFullYear().toString();
   	fd(csvjson.toCSV(all_rows, options), 'FPV-'+dateStr+'.csv')
   	fd(csvjson.toCSV(diffs, options), 'SmasChanges-'+dateStr+'.csv')
		return output.success({currentShares})
  }).catch((error) => {
		console.log(error)
		if (error.status === 401) {
			return output.unauthorized({})
		}
		return output.error({error})
	})
}
getCurrentShares.async = true
getCurrentShares.outputs = ['success', 'error', 'unauthorized']

function getSmasData({input, state, output, services}) {
  return services.http.get('/smas').then((result) => {
		console.log(result)
    return output.success({rows: result.result.rows})
  }).catch(() => output.error(
    {'errorMsg': 'initiateApp: Unable to load svg floor plan file names!'}
  )) 
}
getSmasData.async = true;
getSmasData.outputs = ['success', 'error'];
