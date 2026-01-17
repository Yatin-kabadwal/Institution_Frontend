// staff-dashboard.js - ENHANCED WITH ANIMATIONS & BETTER UX

// ===============================
// INITIALIZATION
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Staff Dashboard initializing...');
    
    // Check authentication
    if (!checkAuth()) {
        console.error('Authentication failed');
        return;
    }
    
    // Verify this is a staff user (not institution)
    const userType = localStorage.getItem('userType');
    
    if (userType === 'institution') {
        console.log('Institution user detected, redirecting to institution dashboard...');
        window.location.href = 'dashboard.html';
        return;
    }
    
    if (userType !== 'staff') {
        showError('Unauthorized access. Please login as staff.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    console.log('✅ Authentication verified - Staff user');
    
    // Load dashboard data
    loadStaffDashboard();
});

// ===============================
// MAIN DASHBOARD LOADER
// ===============================

async function loadStaffDashboard() {
    try {
        showLoading('Loading your dashboard...');
        
        // Fetch staff profile
        const profileResponse = await apiGet(API_ENDPOINTS.STAFF_PROFILE, true);
        
        console.log('📊 Staff Profile API Response:', profileResponse);
        
        if (!profileResponse.success) {
            throw new Error(profileResponse.message || 'Failed to load profile data');
        }

        const data = profileResponse.data;

        if (!data) {
            throw new Error('No data received from server');
        }
        
        // Display profile with animations
        displayStaffProfile(data);
        
        // Fetch assignments
        await loadStaffAssignments();
        
        hideLoading();
        
        console.log('✅ Staff Dashboard loaded successfully');
        
    } catch (error) {
        hideLoading();
        console.error('❌ Error loading staff dashboard:', error);
        showError(error.message || 'Failed to load dashboard data');
    }
}

// ===============================
// DISPLAY STAFF PROFILE
// ===============================

function displayStaffProfile(data) {
    console.log('📋 Displaying staff profile:', data);
    
    // Update welcome banner
    const nameDisplay = document.getElementById('staff-name-display');
    if (nameDisplay && data.staff) {
        nameDisplay.textContent = data.staff.name || 'Staff Member';
    }
    
    // Update institution info
    const instNameDisplay = document.getElementById('inst-name-display');
    const instCodeDisplay = document.getElementById('inst-code-display');
    
    const institutionCode = localStorage.getItem('institutionCode');
    if (instCodeDisplay) {
        instCodeDisplay.textContent = institutionCode || 'N/A';
    }
    if (instNameDisplay) {
        instNameDisplay.textContent = 'Institution'; // Could fetch from API if needed
    }
    
    // Profile details - Staff info
    if (data.staff) {
        safeDisplay('staff-name', data.staff.name);
        safeDisplay('staff-mobile', data.staff.mobile);
        safeDisplay('staff-designation', data.staff.designation?.name || 'Not Assigned');
    }
    
    // Profile details - Credential info
    if (data.credential) {
        safeDisplay('staff-loginid', data.credential.loginId);
        
        // Access Level with badge
        const accessElement = document.getElementById('staff-access-level');
        if (accessElement && data.credential.accessLevel) {
            const accessLevel = data.credential.accessLevel;
            const badge = document.createElement('span');
            badge.className = `access-badge access-${accessLevel}`;
            badge.textContent = accessLevel.toUpperCase();
            accessElement.innerHTML = '';
            accessElement.appendChild(badge);
        }
        
        // Status with badge
        const statusElement = document.getElementById('staff-status');
        if (statusElement) {
            const isActive = data.credential.isActive;
            const badge = document.createElement('span');
            badge.className = `status-badge ${isActive ? 'status-active' : 'status-inactive'}`;
            badge.textContent = isActive ? 'ACTIVE' : 'INACTIVE';
            statusElement.innerHTML = '';
            statusElement.appendChild(badge);
        }
        
        // Display permissions based on access level
        displayPermissions(data.credential);
    }
}

// ===============================
// LOAD STAFF ASSIGNMENTS
// ===============================

async function loadStaffAssignments() {
    try {
        const response = await apiGet(API_ENDPOINTS.STAFF_ASSIGNMENTS, true);
        
        console.log('📚 Staff Assignments API Response:', response);
        
        if (!response.success) {
            console.warn('Failed to load assignments:', response.message);
            return;
        }
        
        const data = response.data;
        
        // Display assigned classes
        if (data.classMapping && data.classMapping.classes) {
            displayAssignedClasses(data.classMapping.classes);
        }
        
        // Display teaching subjects
        if (data.subjectMappings && data.subjectMappings.length > 0) {
            displayTeachingSubjects(data.subjectMappings);
        }
        
    } catch (error) {
        console.error('❌ Error loading assignments:', error);
        // Don't show error to user, just log it
    }
}

// ===============================
// DISPLAY ASSIGNED CLASSES
// ===============================

function displayAssignedClasses(classes) {
    const container = document.getElementById('classes-list');
    if (!container) return;
    
    if (!classes || classes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📭 No classes assigned yet</p>
                <small>Classes will appear here once assigned by admin</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    classes.forEach((className, index) => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <h4>${sanitizeHTML(className)}</h4>
            <p>Assigned Class</p>
        `;
        
        container.appendChild(card);
    });
}

// ===============================
// DISPLAY TEACHING SUBJECTS
// ===============================

function displayTeachingSubjects(subjectMappings) {
    const section = document.getElementById('subjects-section');
    const container = document.getElementById('subjects-list');
    
    if (!section || !container) return;
    
    if (!subjectMappings || subjectMappings.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    // Show section
    section.style.display = 'block';
    container.innerHTML = '';
    
    // Group subjects by class
    const subjectsByClass = {};
    
    subjectMappings.forEach(mapping => {
        const className = mapping.class?.name || 'Unknown Class';
        if (!subjectsByClass[className]) {
            subjectsByClass[className] = [];
        }
        mapping.subjects.forEach(subject => {
            if (subject.name && !subjectsByClass[className].includes(subject.name)) {
                subjectsByClass[className].push(subject.name);
            }
        });
    });
    
    // Display subjects
    let index = 0;
    for (const [className, subjects] of Object.entries(subjectsByClass)) {
        subjects.forEach(subject => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.style.animationDelay = `${index * 0.1}s`;
            
            card.innerHTML = `
                <h4>${sanitizeHTML(subject)}</h4>
                <p>in ${sanitizeHTML(className)}</p>
            `;
            
            container.appendChild(card);
            index++;
        });
    }
}

// ===============================
// DISPLAY PERMISSIONS
// ===============================

function displayPermissions(credential) {
    const container = document.getElementById('permissions-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const accessLevel = credential.accessLevel;
    const canAccessAllClasses = credential.canAccessAllClasses;
    
    // Define permissions based on access level
    let permissions = [];
    
    if (accessLevel === 'teacher') {
        permissions = [
            { icon: '👀', text: 'View assigned classes' },
            { icon: '📚', text: 'View teaching subjects' },
            { icon: '👥', text: 'View student information' },
            { icon: '✅', text: 'Mark attendance' }
        ];
    } else if (accessLevel === 'coordinator') {
        permissions = [
            { icon: '👀', text: 'View assigned classes' },
            { icon: '📚', text: 'View teaching subjects' },
            { icon: '👥', text: 'View and manage students' },
            { icon: '✅', text: 'Mark attendance' },
            { icon: '📊', text: 'Generate reports' },
            { icon: '📝', text: 'Update student records' }
        ];
    } else if (accessLevel === 'admin') {
        permissions = [
            { icon: '🔐', text: 'Full system access' },
            { icon: '👥', text: 'Manage all staff' },
            { icon: '📚', text: 'Manage all classes' },
            { icon: '📖', text: 'Manage all subjects' },
            { icon: '🎓', text: 'Manage all students' },
            { icon: '📊', text: 'Access all reports' }
        ];
    }
    
    // Add class access permission
    if (canAccessAllClasses) {
        permissions.push({ icon: '🌐', text: 'Access to ALL classes' });
    } else {
        permissions.push({ icon: '🎯', text: 'Access to assigned classes only' });
    }
    
    // Create permission items
    permissions.forEach((perm, index) => {
        const item = document.createElement('div');
        item.className = 'permission-item';
        item.style.animationDelay = `${index * 0.05}s`;
        item.style.animation = 'fadeInUp 0.4s ease-out';
        
        item.innerHTML = `
            <span class="permission-icon">${perm.icon}</span>
            <span class="permission-text">${perm.text}</span>
        `;
        
        container.appendChild(item);
    });
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

function safeDisplay(elementId, value, fallback = '-') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value ?? fallback;
        element.style.animation = 'fadeIn 0.4s ease-out';
    }
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('No authentication token found');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('loginId');
        localStorage.removeItem('institutionCode');
        window.location.href = 'index.html';
    }
}

// ===============================
// MESSAGE FUNCTIONS
// ===============================

function showLoading(message = 'Loading...') {
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
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = '❌ ' + message;
        errorDiv.classList.add('show');
        errorDiv.style.animation = 'slideInRight 0.4s ease-out';
        
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = '✅ ' + message;
        successDiv.classList.add('show');
        successDiv.style.animation = 'slideInRight 0.4s ease-out';
        
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 3000);
    }
}

// ===============================
// SANITIZATION (from utils.js)
// ===============================

function sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ===============================
// EXPORT FUNCTIONS
// ===============================

window.logout = logout;

console.log('✅ Staff-Dashboard.js loaded successfully');