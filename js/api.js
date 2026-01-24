class APIService {
  constructor() {
    // Detect production environment (your live website)
    const isProduction = window.location.hostname === 'www.profitwavy.com' || 
                        window.location.hostname.includes('profitwavy.com');
    
    // Set correct API endpoints
    this.BASE_URL = isProduction 
      ? 'https://profitwavy.onrender.com'  // Your Render backend
      : 'http://localhost:5000';           // Local development
    
    this.token = localStorage.getItem('authToken');
  }

  // Handle unauthorized access
  handleUnauthorized() {
    // Clear authentication data
    localStorage.removeItem('authToken');
    this.token = null;
    
    // Redirect to login page
    window.location.href = '/login';
  }

  async request(endpoint, options = {}) {
    const url = `${this.BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token) {
      config.headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle specific HTTP status codes
      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error('Session expired. Please login again.');
      }

      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }

      // Parse response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;

    } catch (error) {
      // Production error logging
      if (window.console && window.console.error) {
        console.error('API Error:', {
          endpoint,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
      
      throw error;
    }
  }
}
