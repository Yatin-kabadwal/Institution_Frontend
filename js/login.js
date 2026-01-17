// login.js - ENHANCED LOGIN LOGIC WITH IMPROVED UI

// ===============================
// ENHANCED MESSAGE FUNCTIONS
// ===============================

function showLoading(message = 'Loading...') {
    hideAllMessages();
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.textContent = '⏳ ' + message;
        loadingDiv.classList.add('show');
    }
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.classList.remove('show');
    }
}

function showError(message) {
    hideAllMessages();
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = '❌ ' + message;
        errorDiv.classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

function showSuccess(message) {
    hideAllMessages();
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = '✅ ' + message;
        successDiv.classList.add('show');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 3000);
    }
}

function hideAllMessages() {
    const messages = ['loading', 'error-message', 'success-message'];
    messages.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('show');
        }
    });
}

// ===============================
// LOGIN TYPE TOGGLE
// ===============================

function showInstitutionLogin() {
    // Hide staff form, show institution form
    const instForm = document.getElementById('institution-login-form');
    const staffForm = document.getElementById('staff-login-form');
    const instBtn = document.getElementById('institution-btn');
    const staffBtn = document.getElementById('staff-btn');
    
    if (instForm) {
        instForm.classList.add('active');
        instForm.style.display = 'block';
    }
    
    if (staffForm) {
        staffForm.classList.remove('active');
        staffForm.style.display = 'none';
    }
    
    if (instBtn) {
        instBtn.classList.add('active');
    }
    
    if (staffBtn) {
        staffBtn.classList.remove('active');
    }
    
    // Clear any error messages
    hideAllMessages();
}

function showStaffLogin() {
    // Hide institution form, show staff form
    const instForm = document.getElementById('institution-login-form');
    const staffForm = document.getElementById('staff-login-form');
    const instBtn = document.getElementById('institution-btn');
    const staffBtn = document.getElementById('staff-btn');
    
    if (instForm) {
        instForm.classList.remove('active');
        instForm.style.display = 'none';
    }
    
    if (staffForm) {
        staffForm.classList.add('active');
        staffForm.style.display = 'block';
    }
    
    if (instBtn) {
        instBtn.classList.remove('active');
    }
    
    if (staffBtn) {
        staffBtn.classList.add('active');
    }
    
    // Clear any error messages
    hideAllMessages();
}

// ===============================
// INSTITUTION LOGIN HANDLER
// ===============================

async function handleInstitutionLogin(e) {
    e.preventDefault();
    
    const institutionCode = document.getElementById('inst-code').value.trim();
    const password = document.getElementById('inst-password').value;
    
    // Validation
    if (!institutionCode || !password) {
        showError('Please enter both institution code and password');
        return;
    }
    
    if (institutionCode.length < 6) {
        showError('Institution code must be at least 6 characters');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    try {
        showLoading('Signing in...');
        
        const response = await apiPost(API_ENDPOINTS.INSTITUTION_LOGIN, {
            institutionCode: institutionCode,
            password: password
        }, false);
        
        hideLoading();
        
        if (response.success) {
            showSuccess('Login successful! Redirecting...');
            
            // Store authentication data
            localStorage.setItem('token', response.token);
            localStorage.setItem('userType', 'institution');
            localStorage.setItem('institutionCode', institutionCode);
            
            // Add slight delay for better UX
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
        
    } catch (error) {
        hideLoading();
        console.error('Institution login error:', error);
        showError(error.message || 'Login failed. Please try again.');
    }
}

// ===============================
// STAFF LOGIN HANDLER
// ===============================

async function handleStaffLogin(e) {
    e.preventDefault();
    
    const loginId = document.getElementById('staff-loginid').value.trim();
    const password = document.getElementById('staff-password').value;
    
    // Validation
    if (!loginId || !password) {
        showError('Please enter both login ID and password');
        return;
    }
    
    // Validate mobile number format
    if (!validateMobile(loginId)) {
        showError('Login ID must be a valid 10-digit mobile number');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    try {
        showLoading('Signing in...');
        
        const response = await apiPost(API_ENDPOINTS.STAFF_LOGIN, {
            loginId: loginId,
            password: password
        }, false);
        
        hideLoading();
        
        if (response.success) {
            showSuccess('Login successful! Redirecting...');
            
            // Store authentication data
            localStorage.setItem('token', response.token);
            localStorage.setItem('userType', 'staff');
            localStorage.setItem('loginId', loginId);
            
            // Add slight delay for better UX
            setTimeout(() => {
                window.location.href = 'staff-dashboard.html';
            }, 1000);
        }
        
    } catch (error) {
        hideLoading();
        console.error('Staff login error:', error);
        showError(error.message || 'Login failed. Please try again.');
    }
}

// ===============================
// AUTO-FORMAT MOBILE NUMBER INPUT
// ===============================

function setupMobileAutoFormat() {
    const mobileInput = document.getElementById('staff-loginid');
    
    if (mobileInput) {
        mobileInput.addEventListener('input', function(e) {
            // Remove all non-digits
            let value = this.value.replace(/\D/g, '');
            
            // Limit to 10 digits
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            
            // Update input value
            this.value = value;
            
            // Visual feedback for valid number
            if (value.length === 10) {
                this.style.borderColor = 'var(--success-500)';
                this.style.backgroundColor = 'var(--success-50)';
            } else if (value.length > 0) {
                this.style.borderColor = 'var(--warning-500)';
                this.style.backgroundColor = 'var(--warning-50)';
            } else {
                this.style.borderColor = '';
                this.style.backgroundColor = '';
            }
        });
    }
}

// ===============================
// CHECK IF ALREADY LOGGED IN
// ===============================

function checkExistingAuth() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    console.log('Checking existing authentication...', { token: !!token, userType });
    
    if (token) {
        // User is already logged in, redirect to appropriate dashboard
        if (userType === 'institution') {
            console.log('Redirecting to institution dashboard...');
            window.location.href = 'dashboard.html';
        } else if (userType === 'staff') {
            console.log('Redirecting to staff dashboard...');
            window.location.href = 'staff-dashboard.html';
        }
    } else {
        console.log('No existing authentication found');
    }
}

// ===============================
// KEYBOARD SHORTCUTS
// ===============================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Alt + I = Institution Login
        if (e.altKey && e.key === 'i') {
            e.preventDefault();
            showInstitutionLogin();
            document.getElementById('inst-code')?.focus();
        }
        
        // Alt + S = Staff Login
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            showStaffLogin();
            document.getElementById('staff-loginid')?.focus();
        }
    });
}

// ===============================
// PASSWORD VISIBILITY TOGGLE
// ===============================

function setupPasswordToggle() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    passwordInputs.forEach(input => {
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.innerHTML = '👁️';
        toggleBtn.style.position = 'absolute';
        toggleBtn.style.right = '12px';
        toggleBtn.style.top = '50%';
        toggleBtn.style.transform = 'translateY(-50%)';
        toggleBtn.style.background = 'none';
        toggleBtn.style.border = 'none';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.fontSize = '1.25rem';
        toggleBtn.style.padding = '4px';
        toggleBtn.style.zIndex = '10';
        
        // Add to parent if it has position relative
        const parent = input.closest('.input-with-icon');
        if (parent) {
            parent.style.position = 'relative';
            parent.appendChild(toggleBtn);
            
            toggleBtn.addEventListener('click', function() {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggleBtn.innerHTML = '🙈';
                } else {
                    input.type = 'password';
                    toggleBtn.innerHTML = '👁️';
                }
            });
        }
    });
}

// ===============================
// REMEMBER ME FUNCTIONALITY (OPTIONAL)
// ===============================

function setupRememberMe() {
    // Check if there's a remembered institution code
    const rememberedCode = localStorage.getItem('rememberedInstitutionCode');
    
    if (rememberedCode) {
        const instCodeInput = document.getElementById('inst-code');
        if (instCodeInput) {
            instCodeInput.value = rememberedCode;
        }
    }
}

function rememberInstitutionCode(code) {
    if (code && code.length >= 6) {
        localStorage.setItem('rememberedInstitutionCode', code);
    }
}

// ===============================
// INITIALIZATION
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page initialized');
    
    // Check if user is already logged in
    checkExistingAuth();
    
    // Show institution login by default
    showInstitutionLogin();
    
    // Setup mobile number auto-formatting
    setupMobileAutoFormat();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Setup password visibility toggle
    setTimeout(() => {
        setupPasswordToggle();
    }, 100);
    
    // Setup remember me
    setupRememberMe();
    
    // Handle institution login form submission
    const instForm = document.getElementById('institution-login-form');
    if (instForm) {
        instForm.addEventListener('submit', handleInstitutionLogin);
    } else {
        console.error('Institution login form not found!');
    }
    
    // Handle staff login form submission
    const staffForm = document.getElementById('staff-login-form');
    if (staffForm) {
        staffForm.addEventListener('submit', handleStaffLogin);
    } else {
        console.error('Staff login form not found!');
    }
    
    console.log('All login handlers attached successfully');
});

// ===============================
// UTILITY: VALIDATE MOBILE NUMBER
// ===============================

function validateMobile(mobile) {
    if (!mobile) return false;
    
    // Remove all non-digits
    const cleaned = String(mobile).replace(/\D/g, '');
    
    // Check if it's exactly 10 digits and starts with 6-9 (Indian mobile format)
    return /^[6-9][0-9]{9}$/.test(cleaned);
}

// ===============================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ===============================

// Make functions available globally
window.showInstitutionLogin = showInstitutionLogin;
window.showStaffLogin = showStaffLogin;
window.showError = showError;
window.showSuccess = showSuccess;
window.showLoading = showLoading;
window.hideLoading = hideLoading;

console.log('✅ Login.js loaded successfully');