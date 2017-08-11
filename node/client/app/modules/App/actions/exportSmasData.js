import fildDownload from 'react-file-download'
import csvjson from 'csvjson'

function exportSmasData({input, state, output, services}) {
  var options = {
    delimiter: ",",
    wrap: false
  }
  console.log(state.get('app.rooms_meta_data.rooms'));
  var smasData = csvjson.toCSV(state.get('app.rooms_meta_data.rooms'), options);
  console.log(smasData);
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
//  fildDownload(smasData, 'Room_List_View-'+ date + '.csv')
}

export default exportSmasData
