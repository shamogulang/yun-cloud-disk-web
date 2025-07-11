import { createRequestInstance } from './request'
import { API_CONFIG } from '../config/api'

const userRequest = createRequestInstance(API_CONFIG.USER_API)

export default userRequest 