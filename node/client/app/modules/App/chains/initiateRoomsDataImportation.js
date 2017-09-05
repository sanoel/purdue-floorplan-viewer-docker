import {when, set} from 'cerebral/operators'

export default [
  when('state:viewer.dropzone_hint'), {
    true: [],
    false: [set('state:viewer.dropzone_hint', 'Drop a SMAS .csv file here or click to browse and select a file.')]
  },
  set('state:app.importing_rooms', true)
]
