import shareRequest from './shareRequest'
import axios from 'axios'

export function createShare(data: {
  encrypt: number,
  coIDLst: number[],
  caIDLst: number[],
  pubType: number,
  period: number,
  periodUnit: number
}) {
  return shareRequest({
    url: '/share/create',
    method: 'post',
    data
  })
}

export function getShareDetail(linkId: string) {
  return shareRequest({
    url: `/share/detail/${linkId}`,
    method: 'get'
  })
}

export function verifyShare(data: { linkId: string, passwd: string }) {
  return shareRequest({
    url: '/share/verify',
    method: 'post',
    data
  })
}

export function getShareCount() {
  return shareRequest({
    url: '/share/count',
    method: 'get'
  })
} 