const AUTH_STORAGE_KEYS = ['accessToken', 'token']

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)

  if (typeof atob === 'function') {
    return atob(padded)
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf8')
  }

  return ''
}

export const readStoredAuthToken = () => {
  try {
    for (const key of AUTH_STORAGE_KEYS) {
      const token = localStorage.getItem(key)
      if (token) {
        return token
      }
    }
  } catch (error) {}

  return null
}

export const clearStoredAuthToken = () => {
  try {
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
  } catch (error) {}
}

export const isJwtExpired = (token) => {
  if (!token || typeof token !== 'string') {
    return true
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return true
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]))
    if (!payload.exp) {
      return false
    }

    return Date.now() >= payload.exp * 1000
  } catch (error) {
    return true
  }
}

export const getValidStoredAuthToken = () => {
  const token = readStoredAuthToken()

  if (!token) {
    return null
  }

  if (isJwtExpired(token)) {
    clearStoredAuthToken()
    return null
  }

  return token
}
