//TODO: Use the database instead.
//export const PATH_TO_KEYS = 'data/roomsKeysPeople.json'
export const PATH_TO_KEYS = 'search/Noel'

export default function loadRoomsData({state, output, services}) {
  return services.http.get(PATH_TO_KEYS)
  .then((res) => {
     console.log(res);
     output.success
  }).catch( () => output.error(
    {'errorMsg': 'initiateApp: Unable to load the keys data!'}
  ))
}
loadRoomsData.outputs = ['success', 'error']
loadRoomsData.async = true
