import apimock from './apimock.js'
import apiclient from './apiclientService.js'

const blueprintsService = import.meta.env.VITE_USE_MOCK === 'true' ? apimock : apiclient

export default blueprintsService
