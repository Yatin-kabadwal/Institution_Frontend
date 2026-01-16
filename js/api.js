// api.js - SECURE API HELPER WITH BETTER ERROR HANDLING

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
}

// Check if token is expired (basic check)
function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        // Decode JWT token (basic implementation)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        return Date.now() >= expiryTime;
    } catch (error) {
        console.error('Error checking token expiry:', error);
        return true; // Assume expired if error
    }
}

// Handle authentication errors
function handleAuthError(error) {
    if (error.message.includes('Unauthorized') || 
        error.message.includes('401') || 
        error.message.includes('Token expired')) {
        
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('institutionCode');
        localStorage.removeItem('loginId');
        
        // Show error message
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = 'Session expired. Please login again.';
            errorDiv.style.display = 'block';
        }
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
        return true;
    }
    return false;
}

// ===============================
// GET REQUEST - IMPROVED
// ===============================
async function apiGet(endpoint, requiresAuth = false) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (requiresAuth) {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }
            
            // Check if token is expired
            if (isTokenExpired(token)) {
                throw new Error('Token expired. Please login again.');
            }
            
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Ensure endpoint starts with /
        const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        const url = API_BASE_URL + path;
        
        console.log('🔵 API GET:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            credentials: 'include' // Include cookies for future CSRF implementation
        });
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                const error = new Error(data.message || 'Unauthorized. Please login again.');
                handleAuthError(error);
                throw error;
            }
            if (response.status === 403) {
                throw new Error(data.message || 'Access denied');
            }
            if (response.status === 404) {
                throw new Error(data.message || 'Resource not found');
            }
            if (response.status === 429) {
                throw new Error('Too many requests. Please try again later.');
            }
            if (response.status >= 500) {
                throw new Error('Server error. Please try again later.');
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
        
    } catch (error) {
        console.error('❌ API GET Error:', error);
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your internet connection.');
        }
        
        throw error;
    }
}

// ===============================
// POST REQUEST - IMPROVED
// ===============================
async function apiPost(endpoint, body, requiresAuth = false) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (requiresAuth) {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }
            
            if (isTokenExpired(token)) {
                throw new Error('Token expired. Please login again.');
            }
            
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Ensure endpoint starts with /
        const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        const url = API_BASE_URL + path;
        
        console.log('🟢 API POST:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            credentials: 'include'
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                const error = new Error(data.message || 'Unauthorized. Please login again.');
                handleAuthError(error);
                throw error;
            }
            if (response.status === 400) {
                throw new Error(data.message || 'Invalid request data');
            }
            if (response.status === 429) {
                throw new Error('Too many requests. Please try again later.');
            }
            if (response.status >= 500) {
                throw new Error('Server error. Please try again later.');
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
        
    } catch (error) {
        console.error('❌ API POST Error:', error);
        
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your internet connection.');
        }
        
        throw error;
    }
}

// ===============================
// PUT REQUEST - IMPROVED
// ===============================
async function apiPut(endpoint, body, requiresAuth = false) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (requiresAuth) {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }
            
            if (isTokenExpired(token)) {
                throw new Error('Token expired. Please login again.');
            }
            
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        const url = API_BASE_URL + path;
        
        console.log('🟡 API PUT:', url);
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(body),
            credentials: 'include'
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                const error = new Error(data.message || 'Unauthorized. Please login again.');
                handleAuthError(error);
                throw error;
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
        
    } catch (error) {
        console.error('❌ API PUT Error:', error);
        
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your internet connection.');
        }
        
        throw error;
    }
}

// ===============================
// DELETE REQUEST - IMPROVED
// ===============================
async function apiDelete(endpoint, requiresAuth = false) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (requiresAuth) {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }
            
            if (isTokenExpired(token)) {
                throw new Error('Token expired. Please login again.');
            }
            
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        const url = API_BASE_URL + path;
        
        console.log('🔴 API DELETE:', url);
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: headers,
            credentials: 'include'
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                const error = new Error(data.message || 'Unauthorized. Please login again.');
                handleAuthError(error);
                throw error;
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
        
    } catch (error) {
        console.error('❌ API DELETE Error:', error);
        
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your internet connection.');
        }
        
        throw error;
    }
}

// ===============================
// POST WITH FORMDATA - IMPROVED
// ===============================
async function apiPostFormData(endpoint, formData, requiresAuth = false) {
    try {
        const headers = {};
        
        if (requiresAuth) {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }
            
            if (isTokenExpired(token)) {
                throw new Error('Token expired. Please login again.');
            }
            
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Don't set Content-Type for FormData - browser will set it with boundary
        
        const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        const url = API_BASE_URL + path;
        
        console.log('🟣 API POST FormData:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: formData,
            credentials: 'include'
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                const error = new Error(data.message || 'Unauthorized. Please login again.');
                handleAuthError(error);
                throw error;
            }
            if (response.status === 413) {
                throw new Error('File too large. Please upload a smaller file.');
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
        
    } catch (error) {
        console.error('❌ API POST FormData Error:', error);
        
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your internet connection.');
        }
        
        throw error;
    }
}