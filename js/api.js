// API Helper Functions - FIXED VERSION

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
}

// GET request
// GET request
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
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Ensure endpoint starts with /
        const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        const url = API_BASE_URL + path;
        
        console.log('API GET:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Please login again.');
            }
            if (response.status === 404) {
                throw new Error(data.message || 'Resource not found');
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API GET Error:', error);
        throw error;
    }
}

// POST request
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
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Ensure endpoint starts with /
        const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        const url = API_BASE_URL + path;
        
        console.log('API POST:', url); // Debug log
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Please login again.');
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API POST Error:', error);
        throw error;
    }
}

// PUT request
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
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Ensure endpoint starts with /
        const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        const url = API_BASE_URL + path;
        
        console.log('API PUT:', url); // Debug log
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Please login again.');
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API PUT Error:', error);
        throw error;
    }
}

// DELETE request
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
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Ensure endpoint starts with /
        const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        const url = API_BASE_URL + path;
        
        console.log('API DELETE:', url); // Debug log
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Please login again.');
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API DELETE Error:', error);
        throw error;
    }
}

// POST with FormData (for file uploads)
async function apiPostFormData(endpoint, formData, requiresAuth = false) {
    try {
        const headers = {};
        
        if (requiresAuth) {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Don't set Content-Type for FormData - browser will set it with boundary
        
        // Ensure endpoint starts with /
        const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        const url = API_BASE_URL + path;
        
        console.log('API POST FormData:', url); // Debug log
        
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Please login again.');
            }
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API POST FormData Error:', error);
        throw error;
    }
}