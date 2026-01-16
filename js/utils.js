// utils.js - WITH INPUT SANITIZATION & SECURITY

// ===============================
// INPUT SANITIZATION
// ===============================

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
function sanitizeHTML(html) {
    if (!html) return '';
    
    const div = document.createElement('div');
    div.textContent = html; // This escapes HTML entities
    return div.innerHTML;
}

/**
 * Sanitize and validate input text
 * @param {string} input - Input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input, maxLength = 1000) {
    if (!input) return '';
    
    // Convert to string and trim
    let sanitized = String(input).trim();
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // Limit length
    if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHTML(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    
    return String(text).replace(/[&<>"'\/]/g, char => map[char]);
}

// ===============================
// LOADING & MESSAGE FUNCTIONS
// ===============================

function showLoading(message = 'Loading...') {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.textContent = escapeHTML(message);
        loadingDiv.style.display = 'block';
    }
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = escapeHTML(message);
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {
        // Fallback to alert if error div not found
        alert('Error: ' + message);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = escapeHTML(message);
        successDiv.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    } else {
        // Fallback to alert if success div not found
        alert('Success: ' + message);
    }
}

// ===============================
// VALIDATION FUNCTIONS
// ===============================

/**
 * Validate mobile number (10 digits, Indian format)
 * @param {string} mobile - Mobile number to validate
 * @returns {boolean} - True if valid
 */
function validateMobile(mobile) {
    if (!mobile) return false;
    const cleaned = String(mobile).replace(/\D/g, '');
    return /^[6-9][0-9]{9}$/.test(cleaned); // Indian mobile format
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function validateEmail(email) {
    if (!email) return false;
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(String(email).toLowerCase());
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - {valid: boolean, message: string}
 */
function validatePassword(password) {
    if (!password) {
        return { valid: false, message: 'Password is required' };
    }
    
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (password.length > 128) {
        return { valid: false, message: 'Password is too long' };
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
        return { 
            valid: false, 
            message: 'Password must contain uppercase, lowercase, and numbers' 
        };
    }
    
    return { valid: true, message: 'Password is strong' };
}

/**
 * Validate OTP (6 digits)
 * @param {string} otp - OTP to validate
 * @returns {boolean} - True if valid
 */
function validateOTP(otp) {
    if (!otp) return false;
    return /^\d{6}$/.test(String(otp).trim());
}

// ===============================
// DATA MASKING
// ===============================

function maskMobile(mobile) {
    if (!mobile || mobile.length !== 10) return mobile || '-';
    return mobile.substring(0, 6) + '****';
}

function maskEmail(email) {
    if (!email) return '-';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const username = parts[0];
    const masked = username.substring(0, Math.min(3, username.length)) + '***';
    return masked + '@' + parts[1];
}

// ===============================
// DATE & TIME FUNCTIONS
// ===============================

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDate(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} - Today's date
 */
function getTodayDate() {
    return formatDate(new Date());
}

/**
 * Format date to human-readable format
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDateHuman(date) {
    if (!date) return '-';
    
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid date';
        
        return d.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid date';
    }
}

// ===============================
// AUTHENTICATION
// ===============================

/**
 * Logout user and redirect to home
 */
function logout() {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('institutionCode');
    localStorage.removeItem('loginId');
    
    // Redirect to landing page
    window.location.href = 'index.html';
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated
 */
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ===============================
// DROPDOWN FUNCTIONS
// ===============================

/**
 * Populate dropdown with options
 * @param {HTMLSelectElement} selectElement - Select element
 * @param {Array} options - Array of options
 * @param {string|Function} valueKey - Key for value or function
 * @param {string|Function} textKey - Key for text or function
 */
function populateDropdown(selectElement, options, valueKey = null, textKey = null) {
    if (!selectElement) {
        console.error('Select element not found');
        return;
    }
    
    selectElement.innerHTML = '<option value="">-- Select --</option>';
    
    if (!Array.isArray(options)) {
        console.error('Options must be an array');
        return;
    }
    
    options.forEach(option => {
        const opt = document.createElement('option');
        
        if (typeof option === 'object' && option !== null) {
            // Handle object options
            if (typeof valueKey === 'function') {
                opt.value = valueKey(option);
            } else {
                opt.value = valueKey ? option[valueKey] : option._id || option.id || '';
            }
            
            if (typeof textKey === 'function') {
                opt.textContent = escapeHTML(textKey(option));
            } else {
                opt.textContent = escapeHTML(textKey ? option[textKey] : option.name || option.label || '');
            }
        } else {
            // Handle primitive options
            opt.value = sanitizeInput(String(option));
            opt.textContent = escapeHTML(String(option));
        }
        
        selectElement.appendChild(opt);
    });
}

// ===============================
// TABLE FUNCTIONS
// ===============================

/**
 * Create table row safely
 * @param {object} data - Row data
 * @param {Array} columns - Column definitions
 * @param {Array} actions - Action button definitions
 * @returns {HTMLTableRowElement} - Table row
 */
function createTableRow(data, columns, actions = []) {
    const row = document.createElement('tr');
    
    columns.forEach(col => {
        const td = document.createElement('td');
        
        if (typeof col === 'function') {
            const value = col(data);
            td.textContent = escapeHTML(String(value || '-'));
        } else if (typeof col === 'string') {
            const value = data[col];
            td.textContent = escapeHTML(String(value || '-'));
        }
        
        row.appendChild(td);
    });
    
    if (actions.length > 0) {
        const actionTd = document.createElement('td');
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.textContent = escapeHTML(action.label);
            btn.className = action.className || 'btn-sm';
            btn.onclick = () => action.handler(data);
            actionTd.appendChild(btn);
        });
        row.appendChild(actionTd);
    }
    
    return row;
}

// ===============================
// CONFIRMATION DIALOGS
// ===============================

/**
 * Show confirmation dialog with custom message
 * @param {string} message - Confirmation message
 * @returns {boolean} - True if confirmed
 */
function confirmAction(message) {
    return confirm(escapeHTML(message));
}

/**
 * Show delete confirmation
 * @param {string} itemName - Name of item to delete
 * @returns {boolean} - True if confirmed
 */
function confirmDelete(itemName = 'this item') {
    return confirm(`Are you sure you want to delete ${escapeHTML(itemName)}? This action cannot be undone.`);
}

// ===============================
// FILE VALIDATION
// ===============================

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Max size in bytes
 * @returns {object} - {valid: boolean, message: string}
 */
function validateFile(file, allowedTypes = [], maxSize = 10 * 1024 * 1024) {
    if (!file) {
        return { valid: false, message: 'No file selected' };
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return { valid: false, message: 'Invalid file type' };
    }
    
    if (file.size > maxSize) {
        const maxMB = (maxSize / (1024 * 1024)).toFixed(2);
        return { valid: false, message: `File too large. Maximum size: ${maxMB}MB` };
    }
    
    return { valid: true, message: 'File is valid' };
}

// ===============================
// NUMBER FORMATTING
// ===============================

/**
 * Format number with commas (Indian format)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
    if (isNaN(num)) return '0';
    return Number(num).toLocaleString('en-IN');
}

// ===============================
// DEBOUNCE FOR SEARCH
// ===============================

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}