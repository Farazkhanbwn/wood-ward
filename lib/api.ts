const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const VOICE_API_URL = process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://172.184.104.225:5000';

// Global fetch wrapper to handle 401 responses
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, options);
  
  if (res.status === 401 && typeof window !== 'undefined') {
    // User deleted or token invalid, redirect to login
    window.location.href = '/login';
    return res;
  }
  
  return res;
};

export const api = {
  async signup(data: {
    fullName?: string;
    email?: string;
    password: string;
    role: string;
    companyName?: string;
    ownerName?: string;
    ownerEmail?: string;
  }) {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Signup failed');
    }
    return json;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    
    // Handle rate limiting
    if (res.status === 429) {
      const text = await res.text();
      throw new Error(text || 'Too many login attempts');
    }
    
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Login failed');
    }
    return json;
  },

  async logout() {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.json();
  },

  async verifyAuth() {
    const res = await fetchWithAuth(`${API_URL}/auth/verify`, {
      credentials: 'include',
    });
    return res.json();
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword(token: string, password: string) {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, password }),
    });
    return res.json();
  },

  async verifyEmail(token: string) {
    const res = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token }),
    });
    return res.json();
  },

  async resendVerification(email: string) {
    const res = await fetch(`${API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  // Playbook APIs
  async createPlaybook(data: any) {
    const res = await fetch(`${API_URL}/playbooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getPlaybooks() {
    const res = await fetchWithAuth(`${API_URL}/playbooks`, {
      credentials: 'include',
    });
    return res.json();
  },

  async getPlaybookById(id: string) {
    const res = await fetch(`${API_URL}/playbooks/${id}`, {
      credentials: 'include',
    });
    return res.json();
  },

  async updatePlaybook(id: string, data: any) {
    const res = await fetch(`${API_URL}/playbooks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deletePlaybook(id: string) {
    const res = await fetch(`${API_URL}/playbooks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  },

  // Coach APIs
  async addRep(data: { name: string; email: string; phone: string }) {
    const res = await fetch(`${API_URL}/coach/add-rep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to add rep');
    }
    return json;
  },

  async getTeamMembers() {
    const res = await fetchWithAuth(`${API_URL}/coach/team-members`, {
      credentials: 'include',
    });
    return res.json();
  },

  async removeRep(repId: string) {
    const res = await fetch(`${API_URL}/coach/remove-rep/${repId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  },

  async setupRepAccount(token: string, password: string) {
    const res = await fetch(`${API_URL}/auth/setup-rep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, password }),
    });
    return res.json();
  },

  async setupCoachAccount(token: string, password: string) {
    const res = await fetch(`${API_URL}/auth/setup-coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, password }),
    });
    return res.json();
  },

  // Admin APIs
  async addCompany(data: { name: string; ownerName: string; ownerEmail: string; status: string }) {
    const res = await fetch(`${API_URL}/admin/add-company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to add company');
    }
    return json;
  },

  async getCompanies() {
    const res = await fetch(`${API_URL}/admin/companies`, {
      credentials: 'include',
    });
    return res.json();
  },

  async updateCompany(companyId: string, data: { name: string; ownerName: string; ownerEmail: string; status: string }) {
    const res = await fetch(`${API_URL}/admin/update-company/${companyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to update company');
    }
    return json;
  },

  async deleteCompany(companyId: string) {
    const res = await fetch(`${API_URL}/admin/delete-company/${companyId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to delete company');
    }
    return json;
  },

  async getAllUsers() {
    const res = await fetch(`${API_URL}/admin/users`, {
      credentials: 'include',
    });
    return res.json();
  },

  async createUser(data: { name: string; email: string; userType: string; companyId?: string; role: string; status: string }) {
    const res = await fetch(`${API_URL}/admin/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to create user');
    }
    return json;
  },

  async updateUser(userId: string, data: { name: string; email: string; role: string; status: string }) {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to update user');
    }
    return json;
  },

  async deleteUser(userId: string) {
    const res = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to delete user');
    }
    return json;
  },

  async sendUpgradeLink(userId: string, data: { plan: string; billingCycle: string }) {
    const res = await fetch(`${API_URL}/admin/users/${userId}/send-upgrade-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateUserSubscription(userId: string, data: { plan: string; status: string; billingCycle: string; nextBillingDate?: string }) {
    const res = await fetch(`${API_URL}/admin/users/${userId}/subscription`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async createPaymentSession(priceId: string) {
    const res = await fetch(`${API_URL}/payment/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ priceId }),
    });
    return res.json();
  },

  async verifyPaymentSession(sessionId: string) {
    const res = await fetch(`${API_URL}/payment/verify-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ sessionId }),
    });
    return res.json();
  },

  async getUserSessions(userId: string) {
    const res = await fetch(`${API_URL}/admin/users/${userId}/sessions`, {
      credentials: 'include',
    });
    return res.json();
  },

  // Voice Tutor APIs
  async createVoiceSession(data: { topic: string; voice?: string; top_k?: number }) {
    const res = await fetch(`${VOICE_API_URL}/api/voice-tutor/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to create voice session');
    }
    return json;
  },

  getVoiceWebSocketUrl(sessionId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:5000';
    
    const url = new URL(baseUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = `/api/voice-tutor/ws/${sessionId}`;
    return url.toString();
  },

  // Call Session APIs
  async saveCallSession(data: any) {
    const res = await fetch(`${API_URL}/call-sessions/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getCallSessions(limit = 10, skip = 0) {
    const res = await fetch(`${API_URL}/call-sessions/sessions?limit=${limit}&skip=${skip}`, {
      credentials: 'include',
    });
    return res.json();
  },

  async getDashboardStats() {
    const res = await fetch(`${API_URL}/call-sessions/stats`, {
      credentials: 'include',
    });
    return res.json();
  },

  async getCallSessionById(id: string) {
    const res = await fetch(`${API_URL}/call-sessions/sessions/${id}`, {
      credentials: 'include',
    });
    return res.json();
  },

  async deleteCallSession(id: string) {
    const res = await fetch(`${API_URL}/call-sessions/sessions/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.json();
  },

  async getTeamCallSessions(filters?: {
    dateFrom?: string;
    dateTo?: string;
    member?: string;
    scenario?: string;
    minScore?: string;
    maxScore?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.member) params.append('member', filters.member);
    if (filters?.scenario) params.append('scenario', filters.scenario);
    if (filters?.minScore) params.append('minScore', filters.minScore);
    if (filters?.maxScore) params.append('maxScore', filters.maxScore);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const res = await fetch(`${API_URL}/coach/team-sessions?${params.toString()}`, {
      credentials: 'include',
    });
    return res.json();
  },

  async getTeamAnalytics() {
    const res = await fetch(`${API_URL}/coach/team-analytics`, {
      credentials: 'include',
    });
    return res.json();
  },

  async generatePlaybookContent(formData: any) {
    const res = await fetch(`${VOICE_API_URL}/api/sales-playbook/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to generate playbook');
    }
    return json;
  },

  // Admin Analytics APIs
  async getPlatformStats() {
    const res = await fetch(`${API_URL}/admin/platform-stats`, {
      credentials: 'include',
    });
    return res.json();
  },

  async getCompanyStats() {
    const res = await fetch(`${API_URL}/admin/company-stats`, {
      credentials: 'include',
    });
    return res.json();
  },

  async getUserCallSessions(userId: string, limit = 10, skip = 0) {
    const res = await fetch(`${API_URL}/admin/users/${userId}/call-sessions?limit=${limit}&skip=${skip}`, {
      credentials: 'include',
    });
    return res.json();
  },

  async getUserPlaybooks(userId: string) {
    const res = await fetch(`${API_URL}/playbooks/user/${userId}`, {
      credentials: 'include',
    });
    return res.json();
  },
};
