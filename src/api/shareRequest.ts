import { createRequestInstance } from './request'

const shareRequest = createRequestInstance('http://127.0.0.1:8083')

export default shareRequest

export const cancelShareById = (linkId: string) => {
  return shareRequest.post(`/share/cancel/${linkId}`)
} 