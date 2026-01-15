// credentials.js - Part 3: Create Login Credentials Logic

let staffData = [];
let classesData = [];
let credentialsData = [];

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    // Load data
    loadCredentialsData();
    
    // Setup form handlers
    document.getElementById('create-credential-form').addEventListener('submit', handleCreateCredentials);
    
    // Setup staff selection to show mobile number
    document.getElementById('cred-staff').addEventListener('change', handleStaffSelection);
});

async function loadCredentialsData() {
    try {
        showLoading('Loading data...');
        
        // Load staff, classes, and existing credentials
        const [staff, classes, credentials] = await Promise.all([
            apiGet(API_ENDPOINTS.STAFF, true),
            apiGet(API_ENDPOINTS.CLASSES, true),
            apiGet(API_ENDPOINTS.CREDENTIALS, true)
        ]);
        
        staffData = staff.data;
        classesData = classes.data;
        credentialsData = credentials.data;
        
        hideLoading();
        
        // Setup dropdowns and display
        setupCredentialForm();
        displayCredentials();
        
    } catch (error) {
        hideLoading();
        showError('Failed to load data: ' + error.message);
    }
}

function setupCredentialForm() {
    // Populate staff dropdown
    const staffSelect = document.getElementById('cred-staff');
    populateDropdown(staffSelect, staffData, '_id', 'name');
    
    // Create class checkboxes
    const classesContainer = document.getElementById('cred-classes-checkboxes');
    classesContainer.innerHTML = '';
    
    classesData.forEach(cls => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="cred-class" value="${cls._id}">
            ${cls.nickname || cls.className}
        `;
        classesContainer.appendChild(label);
        classesContainer.appendChild(document.createElement('br'));
    });
}

function handleStaffSelection() {
    const staffId = document.getElementById('cred-staff').value;
    
    if (!staffId) {
        document.getElementById('mobile-display-container').style.display = 'none';
        return;
    }
    
    // Find selected staff
    const staff = staffData.find(s => s._id === staffId);
    
    if (staff) {
        document.getElementById('staff-mobile-display').textContent = staff.mobileNo;
        document.getElementById('mobile-display-container').style.display = 'block';
    }
}

function toggleCredAllClasses(checkbox) {
    const classCheckboxes = document.querySelectorAll('input[name="cred-class"]');
    classCheckboxes.forEach(cb => cb.checked = checkbox.checked);
}

async function handleCreateCredentials(e) {
    e.preventDefault();
    
    const staffId = document.getElementById('cred-staff').value;
    const password = document.getElementById('cred-password').value;
    const retypePassword = document.getElementById('cred-retype-password').value;
    const accessLevel = document.getElementById('cred-access-level').value;
    const allClasses = document.getElementById('cred-all-classes').checked;
    
    // Get selected classes
    const selectedClasses = Array.from(document.querySelectorAll('input[name="cred-class"]:checked'))
        .map(cb => cb.value);
    
    // Validate passwords
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== retypePassword) {
        showError('Passwords do not match');
        return;
    }
    
    // Check if credentials already exist for this staff
    const existingCred = credentialsData.find(c => c.staff._id === staffId);
    if (existingCred) {
        showError('Credentials already exist for this staff member. Please update or delete existing credentials first.');
        return;
    }
    
    try {
        showLoading('Creating credentials...');
        
        const response = await apiPost(API_ENDPOINTS.CREDENTIALS, {
            staffId: staffId,
            password: password,
            accessLevel: accessLevel,
            additionalAccess: {
                canAccessAllClasses: allClasses,
                specificClasses: allClasses ? [] : selectedClasses
            }
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            document.getElementById('create-credential-form').reset();
            document.getElementById('mobile-display-container').style.display = 'none';
            document.getElementById('cred-all-classes').checked = false;
            loadCredentialsData();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

function displayCredentials() {
    const tbody = document.querySelector('#credentials-table tbody');
    tbody.innerHTML = '';
    
    if (credentialsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No credentials created yet</td></tr>';
        return;
    }
    
    credentialsData.forEach(cred => {
        const row = tbody.insertRow();
        
        // Access info
        let accessInfo = '';
        if (cred.additionalAccess?.canAccessAllClasses) {
            accessInfo = 'All Classes';
        } else if (cred.additionalAccess?.specificClasses && cred.additionalAccess.specificClasses.length > 0) {
            accessInfo = cred.additionalAccess.specificClasses.length + ' classes';
        } else {
            accessInfo = 'None';
        }
        
        // Last login
        const lastLogin = cred.lastLogin ? new Date(cred.lastLogin).toLocaleString() : 'Never';
        
        row.innerHTML = `
            <td>${cred.staff?.name || '-'}</td>
            <td>${cred.loginId}</td>
            <td>${cred.accessLevel}</td>
            <td>${accessInfo}</td>
            <td>${cred.isActive ? 'Active' : 'Inactive'}</td>
            <td>${lastLogin}</td>
            <td>
                <button onclick="updateCredential('${cred._id}')">Update</button>
                <button onclick="toggleCredentialStatus('${cred._id}', ${!cred.isActive})">${cred.isActive ? 'Deactivate' : 'Activate'}</button>
                <button onclick="deleteCredential('${cred._id}')">Delete</button>
            </td>
        `;
    });
}

async function updateCredential(id) {
    const cred = credentialsData.find(c => c._id === id);
    if (!cred) return;
    
    const newPassword = prompt('Enter new password (leave empty to keep current):');
    
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    try {
        showLoading('Updating credential...');
        
        const response = await apiPut(API_ENDPOINTS.CREDENTIALS + '/' + id, {
            password: newPassword
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            loadCredentialsData();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function toggleCredentialStatus(id, newStatus) {
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} this credential?`)) return;
    
    try {
        showLoading('Updating status...');
        
        const response = await apiPut(API_ENDPOINTS.CREDENTIALS + '/' + id, {
            isActive: newStatus
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            loadCredentialsData();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function deleteCredential(id) {
    if (!confirm('Are you sure you want to delete this credential? The staff member will lose access to the system.')) return;
    
    try {
        showLoading('Deleting credential...');
        
        const response = await apiDelete(API_ENDPOINTS.CREDENTIALS + '/' + id, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            loadCredentialsData();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}