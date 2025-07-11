import { createRequestInstance } from './request'
import { API_CONFIG } from '../config/api'

const fileRequest = createRequestInstance(API_CONFIG.FILE_API)

export default fileRequest 