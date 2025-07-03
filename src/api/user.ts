import userRequest from './userRequest'

interface LoginData {
  username: string
  password: string
}

interface LoginResponse {
  code: number
  msg: string
  data: {
    token: string
    username: string
    userId: number
  }
}


interface RegisterResponse {
  code: number
  msg: string
}

export const login = (data: LoginData) => {
  return userRequest<LoginResponse>({
    url: '/user/login',
    method: 'post',
    data
  })
}

export const getUsername = () => {
  return userRequest({
    url: '/user/info',
    method: 'get'
  })
}

export const logout = () => {
  return userRequest({
    url: '/user/logout',
    method: 'post'
  })
}

export const register = (data: { username: string; password: string }) => {
  return userRequest<RegisterResponse>({
    url: '/user/register',
    method: 'post',
    data
  })
}