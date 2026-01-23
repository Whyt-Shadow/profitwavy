class APIService {
  constructor() {
    // Auto-detect environment
    this.BASE_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000/api'
      : 'mongodb+srv://armbhixion1_db_user:Arm1bhixion@cluster0.pvyd5lr.mongodb.net/?appName=Cluster0';
    
    this.token = localStorage.getItem('authToken');
  }

  // Enhanced error handling for production
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
      
      // Handle different response types
      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error('Session expired. Please login again.');
      }

      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }

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
