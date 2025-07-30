const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed')
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    })
  }

  async getCurrentUser() {
    return this.request('/api/auth/me')
  }

  // Bus endpoints
  async getBuses(params?: { routeId?: string; isActive?: boolean }) {
    const searchParams = new URLSearchParams()
    if (params?.routeId) searchParams.append('routeId', params.routeId)
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString())
    
    const query = searchParams.toString()
    return this.request(`/api/buses${query ? `?${query}` : ''}`)
  }

  async getBus(id: string) {
    return this.request(`/api/buses/${id}`)
  }

  async updateBusOccupancy(busId: string, count: number, source: string) {
    return this.request(`/api/buses/${busId}/occupancy`, {
      method: 'PUT',
      body: JSON.stringify({ count, source }),
    })
  }

  async getBusHistory(busId: string, params?: { start?: string; end?: string; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params?.start) searchParams.append('start', params.start)
    if (params?.end) searchParams.append('end', params.end)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    const query = searchParams.toString()
    return this.request(`/api/buses/${busId}/history${query ? `?${query}` : ''}`)
  }

  async updateBusLocation(busId: string, latitude: number, longitude: number) {
    return this.request(`/api/buses/${busId}/location`, {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    })
  }

  // Route endpoints
  async getRoutes(params?: { isActive?: boolean }) {
    const searchParams = new URLSearchParams()
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString())
    
    const query = searchParams.toString()
    return this.request(`/api/routes${query ? `?${query}` : ''}`)
  }

  async getRoute(id: string) {
    return this.request(`/api/routes/${id}`)
  }

  async getRouteBuses(routeId: string) {
    return this.request(`/api/routes/${routeId}/buses`)
  }

  // Station endpoints
  async getStations(params?: { isActive?: boolean }) {
    const searchParams = new URLSearchParams()
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString())
    
    const query = searchParams.toString()
    return this.request(`/api/stations${query ? `?${query}` : ''}`)
  }

  async getStation(id: string) {
    return this.request(`/api/stations/${id}`)
  }

  // Analytics endpoints
  async getAnalyticsOverview(params?: { start?: string; end?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.start) searchParams.append('start', params.start)
    if (params?.end) searchParams.append('end', params.end)
    
    const query = searchParams.toString()
    return this.request(`/api/analytics/overview${query ? `?${query}` : ''}`)
  }

  async getRouteAnalytics(params?: { start?: string; end?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.start) searchParams.append('start', params.start)
    if (params?.end) searchParams.append('end', params.end)
    
    const query = searchParams.toString()
    return this.request(`/api/analytics/routes${query ? `?${query}` : ''}`)
  }

  async getStationAnalytics() {
    return this.request('/api/analytics/stations')
  }

  // Alert endpoints
  async getAlerts(params?: { 
    type?: string; 
    severity?: string; 
    isActive?: boolean; 
    limit?: number 
  }) {
    const searchParams = new URLSearchParams()
    if (params?.type) searchParams.append('type', params.type)
    if (params?.severity) searchParams.append('severity', params.severity)
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    const query = searchParams.toString()
    return this.request(`/api/alerts${query ? `?${query}` : ''}`)
  }

  async getAlert(id: string) {
    return this.request(`/api/alerts/${id}`)
  }

  async resolveAlert(id: string) {
    return this.request(`/api/alerts/${id}/resolve`, {
      method: 'PUT',
    })
  }

  async getAlertStats(params?: { start?: string; end?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.start) searchParams.append('start', params.start)
    if (params?.end) searchParams.append('end', params.end)
    
    const query = searchParams.toString()
    return this.request(`/api/alerts/stats/overview${query ? `?${query}` : ''}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL) 