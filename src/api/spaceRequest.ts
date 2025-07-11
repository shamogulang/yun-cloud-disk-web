import { createRequestInstance } from './request'
import { API_CONFIG } from '../config/api'

const spaceRequest = createRequestInstance(API_CONFIG.SPACE_API)

export default spaceRequest 