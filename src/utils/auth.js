import Cookies from 'js-cookie'

const TokenKey = 'login_token'
const test_TokenKey = 'test_login_token'

export function getToken() {
  if (process.env.NODE_ENV === 'production') {
    return Cookies.get(TokenKey)
  } else {
    return Cookies.get(test_TokenKey)
  }
}

export function setToken(token) {
  if (process.env.NODE_ENV === 'production') {
    return Cookies.set(TokenKey, token)
  } else {
    return Cookies.set(test_TokenKey, token)
  }
}

export function removeToken() {
  if (process.env.NODE_ENV === 'production') {
    return Cookies.remove(TokenKey)
  } else {
    return Cookies.remove(test_TokenKey)
  }
}
