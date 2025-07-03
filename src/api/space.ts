import  spaceRequest from './spaceRequest'


interface StatisticsResponse {
  code: number
  msg: string
  data: {
    usedSpace: number,
    totalSpace: number
  }
}


export function getSpaceInfo() {
  return spaceRequest({
    url: '/space/info',
    method: 'get'
  })
}

export function getSpaceStatistics() {
  return spaceRequest<StatisticsResponse>({
    url: '/space/statistics',
    method: 'post',
    headers: { 'Content-Type': 'application/json' }
  })
}

export function getShareCount() {
  return spaceRequest({
    url: '/share/count',
    method: 'get'
  })
} 
