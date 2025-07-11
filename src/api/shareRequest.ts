import { createRequestInstance } from './request'
import { API_CONFIG } from '../config/api'

const shareRequest = createRequestInstance(API_CONFIG.SHARE_API)

export default shareRequest

export const cancelShareById = (linkId: string) => {
  return shareRequest.post(`/share/cancel/${linkId}`)
} 