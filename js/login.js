// Login.js - Login Logic

document.addEventListener('DOMContentLoaded', function() {
    // Show institution login by default
    showInstitutionLogin();
    
    // Handle institution login form
    const instForm = document.getElementById('institution-form');
    instForm.addEventListener('submit', handleInstitutionLogin);
    
    // Handle staff login form
    const staffForm = document.getElementById('staff-form');
    staffForm.addEventListener('submit', handleStaffLogin);
});

function showInstitutionLogin() {
    document.getElementById('institution-login-form').style.display = 'block';
    document.getElementById('staff-login-form').style.display = 'none';
    document.getElementById('institution-btn').disabled = true;
    document.getElementById('staff-btn').disabled = false;
}

function showStaffLogin() {
    document.getElementById('institution-login-form').style.display = 'none';
    document.getElementById('staff-login-form').style.display = 'block';
    document.getElementById('institution-btn').disabled = false;
    document.getElementById('staff-btn').disabled = true;
}

async function handleInstitutionLogin(e) {
    e.preventDefault();
    
    const institutionCode = document.getElementById('inst-code').value.trim();
    const password = document.getElementById('inst-password').value;
    
    if (!institutionCode || !password) {
        showError('Please enter both institution code and password');
        return;
    }
    
    try {
        showLoading('Logging in...');
        
        const response = await apiPost(API_ENDPOINTS.INSTITUTION_LOGIN, {
            institutionCode: institutionCode,
            password: password
        }, false);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            
            // Store token and user type
            localStorage.setItem('token', response.token);
            localStorage.setItem('userType', 'institution');
            localStorage.setItem('institutionCode', institutionCode);
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
        
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function handleStaffLogin(e) {
    e.preventDefault();
    
    const loginId = document.getElementById('staff-loginid').value.trim();
    const password = document.getElementById('staff-password').value;
    
    if (!loginId || !password) {
        showError('Please enter both login ID and password');
        return;
    }
    
    if (!validateMobile(loginId)) {
        showError('Login ID must be a 10-digit mobile number');
        return;
    }
    
    try {
        showLoading('Logging in...');
        
        const response = await apiPost(API_ENDPOINTS.STAFF_LOGIN, {
            loginId: loginId,
            password: password
        }, false);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            
            // Store token and user type
            localStorage.setItem('token', response.token);
            localStorage.setItem('userType', 'staff');
            localStorage.setItem('loginId', loginId);
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
        
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}