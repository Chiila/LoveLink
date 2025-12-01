const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { token, ...fetchOptions } = options;
    const authToken = token || this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async uploadFile(
    endpoint: string,
    file: File,
    fieldName: string = 'photo'
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const token = this.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    name: string;
    age: number;
    bio?: string;
    gender?: string;
    interestedIn?: string;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  me: () => api.get('/auth/me'),
};

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  uploadPhoto: (file: File) => api.uploadFile('/users/upload-photo', file),
  getUserById: (id: string) => api.get(`/users/${id}`),
};

// Discovery API
export const discoveryApi = {
  getProfiles: (filters?: {
    minAge?: number;
    maxAge?: number;
    maxDistance?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return api.get(`/discovery?${params.toString()}`);
  },
  swipe: (targetUserId: string, direction: 'left' | 'right') =>
    api.post('/discovery/swipe', { targetUserId, direction }),
  getStats: () => api.get('/discovery/stats'),
};

// Matches API
export const matchesApi = {
  getMatches: () => api.get('/matches'),
  getMatch: (id: string) => api.get(`/matches/${id}`),
  unmatch: (id: string) => api.delete(`/matches/${id}`),
};

// Chat API
export const chatApi = {
  getMessages: (matchId: string, limit?: number, offset?: number, markAsRead: boolean = true) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());
    params.append('markAsRead', markAsRead.toString());
    return api.get(`/chat/${matchId}?${params.toString()}`);
  },
  sendMessage: (matchId: string, content: string) =>
    api.post(`/chat/${matchId}`, { content }),
};

