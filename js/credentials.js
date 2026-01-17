// credentials.js - MATCHING YOUR HTML IDs

let staffData = [];
let classesData = [];
let credentialsData = [];
let isDataLoaded = false;

// ===============================
// INITIALIZE PAGE
// ===============================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

function initializePage() {
    console.log('🚀 Initializing credentials page...');
    
    if (!checkAuth()) {
        console.log('❌ Authentication failed');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('✅ Authentication passed');
    
    setTimeout(() => {
        checkRequiredElements();
        loadCredentialsData();
        setupEventListeners();
    }, 100);
}

// ===============================
// CHECK AUTH
// ===============================
function checkAuth() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    return token && userType === 'institution';
}

// ===============================
// CHECK REQUIRED ELEMENTS - MATCHING YOUR HTML
// ===============================
function checkRequiredElements() {
    console.log('🔍 Checking required DOM elements...');
    
    const requiredElements = {
        'create-credentials-form': 'Form',
        'staff-select': 'Staff dropdown',
        'password': 'Password input',
        'confirm-password': 'Retype password input',
        'can-access-all-classes': 'All classes checkbox',
        'class-checkboxes': 'Classes container',
        'loginid-display': 'Login ID display',
        'credentials-table': 'Credentials table',
        'loading': 'Loading indicator',
        'error-message': 'Error message',
        'success-message': 'Success message'
    };
    
    let missingElements = [];
    
    for (const [id, name] of Object.entries(requiredElements)) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Missing: ${name} (ID: ${id})`);
            missingElements.push(name);
        } else {
            console.log(`✅ Found: ${name}`);
        }
    }
    
    if (missingElements.length > 0) {
        console.error('❌ Missing elements:', missingElements);
        showError(`Page setup incomplete. Missing: ${missingElements.join(', ')}`);
    } else {
        console.log('✅ All required elements found!');
    }
}

// ===============================
// SETUP EVENT LISTENERS
// ===============================
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Form submission
    const form = document.getElementById('create-credentials-form');
    if (form) {
        form.addEventListener('submit', handleCreateCredentials);
        console.log('✅ Form submit listener added');
    } else {
        console.error('❌ Form not found');
    }
    
    // Staff selection
    const staffSelect = document.getElementById('staff-select');
    if (staffSelect) {
        staffSelect.addEventListener('change', handleStaffSelection);
        console.log('✅ Staff select listener added');
    } else {
        console.error('❌ Staff select not found');
    }
    
    // All classes checkbox
    const allClassesCheckbox = document.getElementById('can-access-all-classes');
    if (allClassesCheckbox) {
        allClassesCheckbox.addEventListener('change', function(e) {
            toggleAllClasses(e.target.checked);
        });
        console.log('✅ All classes checkbox listener added');
    } else {
        console.error('❌ All classes checkbox not found');
    }
}

// ===============================
// LOAD DATA
// ===============================
async function loadCredentialsData() {
    console.log('📥 Starting data load...');
    
    try {
        showLoading('Loading data...');
        
        const [staffResponse, classesResponse, credentialsResponse] = await Promise.all([
            apiGet(API_ENDPOINTS.STAFF, true),
            apiGet(API_ENDPOINTS.CLASSES, true),
            apiGet(API_ENDPOINTS.CREDENTIALS, true)
        ]);
        
        staffData = staffResponse.data || [];
        classesData = classesResponse.data || [];
        credentialsData = credentialsResponse.data || [];
        
        console.log('✅ Data loaded:', {
            staff: staffData.length,
            classes: classesData.length,
            credentials: credentialsData.length
        });
        
        isDataLoaded = true;
        hideLoading();
        
        setupCredentialForm();
        displayCredentials();
        
    } catch (error) {
        console.error('❌ Load error:', error);
        hideLoading();
        showError('Failed to load data: ' + error.message);
    }
}

// ===============================
// SETUP FORM - MATCHING YOUR HTML
// ===============================
function setupCredentialForm() {
    console.log('🛠️ Setting up credential form...');
    
    if (!isDataLoaded) return;
    
    // Populate staff dropdown
    const staffSelect = document.getElementById('staff-select');
    if (!staffSelect) {
        console.error('❌ Staff select not found');
        return;
    }
    
    // Filter staff without credentials
    const staffWithoutCredentials = staffData.filter(staff => {
        return !credentialsData.some(cred => 
            cred.staff && cred.staff._id === staff._id
        );
    });
    
    console.log(`📊 Staff: ${staffWithoutCredentials.length} without credentials`);
    
    // Populate dropdown
    staffSelect.innerHTML = '<option value="">-- Choose Staff --</option>';
    
    if (staffWithoutCredentials.length === 0) {
        staffSelect.innerHTML = '<option value="">All staff have credentials</option>';
        staffSelect.disabled = true;
        return;
    }
    
    staffWithoutCredentials.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff._id;
        option.textContent = `${staff.name}${staff.designation?.name ? ' - ' + staff.designation.name : ''}`;
        option.dataset.mobile = staff.mobileNo || '';
        staffSelect.appendChild(option);
    });
    
    staffSelect.disabled = false;
    console.log(`✅ Populated ${staffWithoutCredentials.length} staff`);
    
    // Setup class checkboxes
    setupClassCheckboxes();
}

// ===============================
// SETUP CLASS CHECKBOXES
// ===============================
function setupClassCheckboxes() {
    console.log('📋 Setting up class checkboxes...');
    
    const container = document.getElementById('class-checkboxes');
    if (!container) {
        console.error('❌ Class checkboxes container not found');
        return;
    }
    
    container.innerHTML = '';
    
    if (classesData.length === 0) {
        container.innerHTML = '<p style="color: gray;"><em>No classes available</em></p>';
        return;
    }
    
    classesData.forEach(cls => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.marginBottom = '8px';
        label.style.cursor = 'pointer';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'specific-class';
        checkbox.value = cls._id;
        checkbox.style.marginRight = '8px';
        
        const text = document.createTextNode(cls.nickname || cls.className);
        
        label.appendChild(checkbox);
        label.appendChild(text);
        container.appendChild(label);
    });
    
    console.log(`✅ Created ${classesData.length} class checkboxes`);
}

// ===============================
// HANDLE STAFF SELECTION
// ===============================
function handleStaffSelection(e) {
    console.log('👤 Staff selected');
    
    const staffId = e.target.value;
    const loginDisplay = document.getElementById('loginid-display');
    
    if (!staffId || !loginDisplay) return;
    
    const selectedOption = e.target.options[e.target.selectedIndex];
    const mobile = selectedOption.dataset.mobile;
    
    if (mobile) {
        loginDisplay.textContent = mobile;
        console.log('📱 Login ID:', mobile);
    } else {
        loginDisplay.textContent = 'Select a staff member first';
    }
}

// ===============================
// TOGGLE ALL CLASSES
// ===============================
function toggleAllClasses(isChecked) {
    console.log('🔄 Toggle all classes:', isChecked);
    
    const classCheckboxes = document.querySelectorAll('input[name="specific-class"]');
    classCheckboxes.forEach(cb => {
        cb.checked = isChecked;
        cb.disabled = isChecked;
    });
    
    console.log(`✅ ${classCheckboxes.length} checkboxes ${isChecked ? 'checked' : 'unchecked'}`);
}

// ===============================
// CREATE CREDENTIALS - MATCHING YOUR HTML
// ===============================
async function handleCreateCredentials(e) {
    e.preventDefault();
    console.log('📝 Creating credentials...');
    
    // Get form values using YOUR HTML IDs
    const staffId = document.getElementById('staff-select').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const canAccessAllClasses = document.getElementById('can-access-all-classes').checked;
    
    // Get selected access level (radio button)
    const accessLevelRadio = document.querySelector('input[name="access-level"]:checked');
    const accessLevel = accessLevelRadio ? accessLevelRadio.value : null;
    
    console.log('📋 Form values:', {
        staffId,
        passwordLength: password?.length,
        accessLevel,
        canAccessAllClasses
    });
    
    // Validation
    if (!staffId) {
        showError('Please select a staff member');
        return;
    }
    
    if (!password || password.trim() === '') {
        showError('Please enter a password');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (!accessLevel) {
        showError('Please select an access level');
        return;
    }
    
    // Get selected classes
    const selectedClasses = Array.from(document.querySelectorAll('input[name="specific-class"]:checked'))
        .map(cb => cb.value);
    
    console.log('📚 Selected classes:', selectedClasses.length);
    
    // Check if credentials already exist
    const existingCred = credentialsData.find(c => c.staff && c.staff._id === staffId);
    if (existingCred) {
        showError('Credentials already exist for this staff member');
        return;
    }
    
    try {
        showLoading('Creating credentials...');
        
        const requestData = {
            staffId: staffId,
            password: password,
            accessLevel: accessLevel,
            additionalAccess: {
                canAccessAllClasses: canAccessAllClasses,
                specificClasses: canAccessAllClasses ? [] : selectedClasses
            }
        };
        
        console.log('📤 Request:', requestData);
        
        const response = await apiPost(API_ENDPOINTS.CREDENTIALS, requestData, true);
        
        console.log('📨 Response:', response);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message || 'Credentials created successfully!');
            
            // Reset form
            document.getElementById('create-credentials-form').reset();
            document.getElementById('loginid-display').textContent = 'Select a staff member first';
            
            // Uncheck all class checkboxes
            document.querySelectorAll('input[name="specific-class"]').forEach(cb => {
                cb.checked = false;
                cb.disabled = false;
            });
            
            console.log('✅ Form reset, reloading data...');
            await loadCredentialsData();
        } else {
            showError(response.message || 'Failed to create credentials');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        hideLoading();
        showError(error.message || 'An error occurred');
    }
}

// ===============================
// DISPLAY CREDENTIALS TABLE
// ===============================
function displayCredentials() {
    console.log('📊 Displaying credentials...');
    
    const tbody = document.querySelector('#credentials-table tbody');
    if (!tbody) {
        console.error('❌ Table tbody not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (credentialsData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
                    No credentials created yet
                </td>
            </tr>
        `;
        return;
    }
    
    console.log(`📋 Displaying ${credentialsData.length} credentials`);
    
    credentialsData.forEach(cred => {
        const row = tbody.insertRow();
        
        let accessInfo = 'None';
        if (cred.additionalAccess?.canAccessAllClasses) {
            accessInfo = '<strong>All Classes</strong>';
        } else if (cred.additionalAccess?.specificClasses?.length > 0) {
            accessInfo = `${cred.additionalAccess.specificClasses.length} classes`;
        }
        
        const lastLogin = cred.lastLogin ? 
            new Date(cred.lastLogin).toLocaleString() : 
            '<em>Never</em>';
        
        const statusText = cred.isActive ? 
            '<span style="color: #28a745; font-weight: bold;">● Active</span>' : 
            '<span style="color: #dc3545; font-weight: bold;">● Inactive</span>';
        
        row.innerHTML = `
            <td>${cred.staff?.name || '-'}</td>
            <td><code>${cred.loginId || '-'}</code></td>
            <td><strong>${cred.accessLevel || '-'}</strong></td>
            <td>${accessInfo}</td>
            <td>${statusText}</td>
            <td>${lastLogin}</td>
            <td style="white-space: nowrap;">
                <button onclick="updateCredential('${cred._id}')" 
                        style="padding: 5px 10px; margin: 2px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 3px;">
                    ✏️ Update
                </button>
                <button onclick="toggleCredentialStatus('${cred._id}', ${!cred.isActive})" 
                        style="padding: 5px 10px; margin: 2px; cursor: pointer; background: ${cred.isActive ? '#ffc107' : '#28a745'}; color: white; border: none; border-radius: 3px;">
                    ${cred.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                </button>
                <button onclick="deleteCredential('${cred._id}')" 
                        style="padding: 5px 10px; margin: 2px; cursor: pointer; background: #dc3545; color: white; border: none; border-radius: 3px;">
                    🗑️ Delete
                </button>
            </td>
        `;
    });
    
    console.log('✅ Table populated');
}

// ===============================
// UPDATE CREDENTIAL
// ===============================
async function updateCredential(id) {
    const cred = credentialsData.find(c => c._id === id);
    if (!cred) {
        showError('Credential not found');
        return;
    }
    
    const staffName = cred.staff?.name || 'this staff member';
    const newPassword = prompt(`Update password for ${staffName}\n\nEnter new password (minimum 6 characters):`);
    
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    try {
        showLoading('Updating...');
        
        const response = await apiPut(API_ENDPOINTS.CREDENTIALS + '/' + id, {
            password: newPassword
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess('Password updated successfully!');
            await loadCredentialsData();
        } else {
            showError(response.message || 'Update failed');
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// ===============================
// TOGGLE STATUS
// ===============================
async function toggleCredentialStatus(id, newStatus) {
    const cred = credentialsData.find(c => c._id === id);
    if (!cred) return;
    
    const action = newStatus ? 'activate' : 'deactivate';
    const staffName = cred.staff?.name || 'this staff member';
    
    if (!confirm(`${action.toUpperCase()} credentials for ${staffName}?`)) return;
    
    try {
        showLoading(`${action}ing...`);
        
        const response = await apiPut(API_ENDPOINTS.CREDENTIALS + '/' + id, {
            isActive: newStatus
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(`Credential ${action}d!`);
            await loadCredentialsData();
        } else {
            showError(response.message);
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// ===============================
// DELETE CREDENTIAL
// ===============================
async function deleteCredential(id) {
    const cred = credentialsData.find(c => c._id === id);
    if (!cred) return;
    
    const staffName = cred.staff?.name || 'this staff member';
    
    if (!confirm(`⚠️ DELETE credentials for ${staffName}?\n\nThis cannot be undone.`)) return;
    
    try {
        showLoading('Deleting...');
        
        const response = await apiDelete(API_ENDPOINTS.CREDENTIALS + '/' + id, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess('Credential deleted!');
            await loadCredentialsData();
        } else {
            showError(response.message);
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// ===============================
// UI HELPERS
// ===============================
function showLoading(message = 'Loading...') {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.textContent = '⏳ ' + message;
        loading.style.display = 'block';
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

function showError(message) {
    console.error('❌', message);
    hideMessages();
    
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = '❌ ' + message;
        errorDiv.classList.add('show');
        
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    } else {
        alert('Error: ' + message);
    }
}

function showSuccess(message) {
    console.log('✅', message);
    hideMessages();
    
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = '✅ ' + message;
        successDiv.classList.add('show');
        
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 5000);
    } else {
        alert(message);
    }
}

function hideMessages() {
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    if (errorDiv) errorDiv.classList.remove('show');
    if (successDiv) successDiv.classList.remove('show');
}

// ===============================
// LOGOUT
// ===============================
function logout() {
    if (confirm('Logout?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

console.log('✅ credentials.js loaded');