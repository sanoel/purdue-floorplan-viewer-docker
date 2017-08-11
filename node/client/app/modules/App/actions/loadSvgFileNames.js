export const PATH_TO_SVG = 'img/svgFloorPlans/svgFloorPlansSim/svgoManSvgo/'

function loadSvgFileNames({state, output, services}) {

  return services.http.get(PATH_TO_SVG)
    .then(output.success)
    .catch( () => output.error(
      {'errorMsg': 'initiateApp: Unable to load svg floor plan file names!'}
    ))
}

loadSvgFileNames.async = true

export default loadSvgFileNames
