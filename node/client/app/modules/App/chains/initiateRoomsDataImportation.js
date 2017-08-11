import {when, set} from 'cerebral/operators'

export default [
  when('state:viewer.dropzone_hint'), {
    true: [],
    false: [set('state:viewer.dropzone_hint', 'Drop the JSON file here, or click to select the file to upload.')]
  },
  set('state:app.importing_rooms', true)
]
