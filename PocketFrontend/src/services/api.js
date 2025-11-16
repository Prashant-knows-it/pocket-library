const API_BASE = '/api/auth'
const FILES_API_BASE = '/api/files'

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('token')
}

// Helper to add auth headers
function getAuthHeaders(includeContentType = false) {
  const token = getAuthToken()
  const headers = {}
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }
  
  return headers
}

// Helper for file upload headers
function getFileUploadHeaders() {
  const token = getAuthToken()
  return {
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

async function post(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json()
}

async function get(path) {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated. Please login.')
  }

  // For GET requests, don't include Content-Type, only Authorization
  const headers = getAuthHeaders(false)
  
  if (!headers['Authorization']) {
    throw new Error('Not authenticated. Please login.')
  }
  
  const res = await fetch(FILES_API_BASE + path, {
    method: 'GET',
    headers: headers,
    credentials: 'include' // Include credentials for CORS
  })
  
  if (!res.ok) {
    // Clone response to read body without consuming it
    const clonedRes = res.clone()
    let errorMessage = res.statusText || 'Request failed'
    
    try {
      const text = await clonedRes.text()
      if (text && text.trim()) {
        // Try to parse as JSON first
        try {
          const json = JSON.parse(text)
          errorMessage = json.message || json.error || text
        } catch {
          // If not JSON, use text as error message
          errorMessage = text.trim()
        }
      }
    } catch (e) {
      console.error('Error reading response:', e)
      // Use status text if we can't read body
    }
    
    if (res.status === 401 || res.status === 403) {
      // Token expired, invalid, or access denied
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (res.status === 403) {
        throw new Error('Access denied. Please login again.')
      }
      throw new Error('Unauthorized. Please login again.')
    }
    
    throw new Error(errorMessage || 'Failed to fetch files')
  }
  
  // Parse successful response
  try {
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await res.json()
      return Array.isArray(data) ? data : []
    }
    
    // If not JSON, return empty array
    return []
  } catch (e) {
    console.error('Error parsing response:', e)
    return []
  }
}

async function del(path) {
  const res = await fetch(FILES_API_BASE + path, {
    method: 'DELETE',
    headers: getAuthHeaders(false),
    credentials: 'include'
  })
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw new Error('Unauthorized')
    }
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.text()
}

async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const token = getAuthToken()
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(FILES_API_BASE + '/upload', {
    method: 'POST',
    headers: headers,
    body: formData,
    credentials: 'include' // Include credentials for CORS
  })
  
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw new Error('Unauthorized')
    }
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json()
}

// Helper to get authenticated file URLs (for download/view)
function getFileUrl(path) {
  const token = getAuthToken()
  if (token) {
    // For browsers, we can use the URL directly and the Authorization header will be added via fetch
    // However, for direct links, we need to fetch with credentials
    return `${FILES_API_BASE}${path}`
  }
  return null
}

export default {
  login: (payload) => post('/login', payload),
  register: (payload) => post('/register', payload),
  getAllFiles: () => get(''),
  getFileById: (id) => get(`/${id}`),
  deleteFile: (id) => del(`/${id}`),
  uploadFile: (file) => uploadFile(file),
  downloadFile: (id) => getFileUrl(`/download/${id}`),
  viewFile: (id) => getFileUrl(`/view/${id}`),
  // Helper to get auth token for manual fetch requests
  getAuthToken: () => getAuthToken()
}
