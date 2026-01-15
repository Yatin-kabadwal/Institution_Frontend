// Utility Functions

// Show loading indicator
function showLoading(message = 'Loading...') {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.textContent = message;
        loadingDiv.style.display = 'block';
    }
}

// Hide loading indicator
function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {
        alert('Error: ' + message);
    }
}

// Show success message
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    } else {
        alert('Success: ' + message);
    }
}

// Mask mobile number (show first 6 digits, hide last 4)
function maskMobile(mobile) {
    if (!mobile || mobile.length !== 10) return mobile;
    return mobile.substring(0, 6) + '****';
}

// Mask email (show first 3 chars and domain)
function maskEmail(email) {
    if (!email) return email;
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    return parts[0].substring(0, 3) + '***@' + parts[1];
}

// Validate mobile number
function validateMobile(mobile) {
    const regex = /^[0-9]{10}$/;
    return regex.test(mobile);
}

// Validate email
function validateEmail(email) {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(email);
}

// Format date to YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    return formatDate(new Date());
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('institutionCode');
    window.location.href = 'index.html';
}

// Check if user is authenticated
function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Populate dropdown options
function populateDropdown(selectElement, options, valueKey = null, textKey = null) {
    selectElement.innerHTML = '<option value="">-- Select --</option>';
    
    options.forEach(option => {
        const opt = document.createElement('option');
        
        if (typeof option === 'object') {
            opt.value = valueKey ? option[valueKey] : option._id;
            opt.textContent = textKey ? option[textKey] : option.name;
        } else {
            opt.value = option;
            opt.textContent = option;
        }
        
        selectElement.appendChild(opt);
    });
}

// Create table row
function createTableRow(data, columns, actions = []) {
    const row = document.createElement('tr');
    
    columns.forEach(col => {
        const td = document.createElement('td');
        if (typeof col === 'function') {
            td.textContent = col(data);
        } else {
            td.textContent = data[col] || '-';
        }
        row.appendChild(td);
    });
    
    if (actions.length > 0) {
        const actionTd = document.createElement('td');
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.textContent = action.label;
            btn.onclick = () => action.handler(data);
            actionTd.appendChild(btn);
        });
        row.appendChild(actionTd);
    }
    
    return row;
}