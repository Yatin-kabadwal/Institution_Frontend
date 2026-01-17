// staff-dashboard.js - FIXED VERSION

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
    
    // Verify this is a staff user
    const userType = localStorage.getItem('userType');
    
    if (userType === 'institution') {
        console.log('Institution user detected, redirecting...');
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
            throw new Error(profileResponse.message || 'Failed to load profile');
        }

        const data = profileResponse.data;

        if (!data) {
            throw new Error('No data received from server');
        }
        
        // Display profile
        displayStaffProfile(data);
        
        // Fetch assignments
        await loadStaffAssignments();
        
        hideLoading();
        
        console.log('✅ Staff Dashboard loaded successfully');
        
    } catch (error) {
        hideLoading();
        console.error('❌ Error loading dashboard:', error);
        showError(error.message || 'Failed to load dashboard');
    }
}

// ===============================
// DISPLAY STAFF PROFILE - FIXED
// ===============================

function displayStaffProfile(data) {
    console.log('📋 Displaying staff profile:', data);
    
    // Update welcome banner
    const nameDisplay = document.getElementById('staff-name-display');
    if (nameDisplay && data.staff) {
        nameDisplay.textContent = data.staff.name || 'Staff Member';
    }
    
    // ✅ FIX: Get institution code from credential
    const instCodeDisplay = document.getElementById('inst-code-display');
    if (instCodeDisplay) {
        // Try to get from credential first, then localStorage
        const institutionCode = data.credential?.institutionId || 
                               localStorage.getItem('institutionCode') || 
                               'N/A';
        instCodeDisplay.textContent = institutionCode;
    }
    
    // Update institution name (placeholder for now)
    const instNameDisplay = document.getElementById('inst-name-display');
    if (instNameDisplay) {
        instNameDisplay.textContent = 'Your Institution';
    }
    
    // Profile details - Staff info
    if (data.staff) {
        safeDisplay('staff-name', data.staff.name);
        
        // ✅ FIX: Use mobileNo instead of mobile
        safeDisplay('staff-mobile', data.staff.mobileNo || data.staff.mobile);
        
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
        
        // Display permissions
        displayPermissions(data.credential);
    }
}

// ===============================
// LOAD STAFF ASSIGNMENTS - FIXED
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
        
        // ✅ FIX: Better null checking for assigned classes
        if (data && data.classMapping) {
            // Extract class names from assignedClasses array
            let classNames = [];
            
            if (data.classMapping.assignedClasses && Array.isArray(data.classMapping.assignedClasses)) {
                classNames = data.classMapping.assignedClasses.map(cls => {
                    // Handle both string and object formats
                    if (typeof cls === 'string') {
                        return cls;
                    } else if (cls && cls.className) {
                        return cls.nickname || cls.className;
                    }
                    return null;
                }).filter(name => name !== null);
            }
            
            console.log('✅ Processed class names:', classNames);
            displayAssignedClasses(classNames);
        } else {
            console.log('ℹ️ No class mapping data');
            displayAssignedClasses([]);
        }
        
        // ✅ FIX: Better null checking for subject mappings
        if (data && data.subjectMappings && Array.isArray(data.subjectMappings)) {
            displayTeachingSubjects(data.subjectMappings);
        } else {
            console.log('ℹ️ No subject mappings');
            displayTeachingSubjects([]);
        }
        
    } catch (error) {
        console.error('❌ Error loading assignments:', error);
        // Don't show error to user, just display empty states
        displayAssignedClasses([]);
        displayTeachingSubjects([]);
    }
}

// ===============================
// DISPLAY ASSIGNED CLASSES - FIXED
// ===============================

function displayAssignedClasses(classNames) {
    const container = document.getElementById('classes-list');
    if (!container) {
        console.error('❌ Classes list container not found');
        return;
    }
    
    console.log('📚 Displaying classes:', classNames);
    
    // Handle empty or invalid data
    if (!classNames || !Array.isArray(classNames) || classNames.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📭 No classes assigned yet</p>
                <small>Classes will appear here once assigned by admin</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    classNames.forEach((className, index) => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.animation = 'fadeInUp 0.6s ease-out';
        
        card.innerHTML = `
            <h4>${sanitizeHTML(className)}</h4>
            <p>Assigned Class</p>
        `;
        
        container.appendChild(card);
    });
    
    console.log(`✅ Displayed ${classNames.length} classes`);
}

// ===============================
// DISPLAY TEACHING SUBJECTS - FIXED
// ===============================

function displayTeachingSubjects(subjectMappings) {
    const section = document.getElementById('subjects-section');
    const container = document.getElementById('subjects-list');
    
    if (!section || !container) {
        console.error('❌ Subjects section not found');
        return;
    }
    
    console.log('📖 Displaying subjects:', subjectMappings);
    
    // ✅ FIX: Better validation
    if (!subjectMappings || !Array.isArray(subjectMappings) || subjectMappings.length === 0) {
        section.style.display = 'none';
        console.log('ℹ️ No subjects to display');
        return;
    }
    
    // Show section
    section.style.display = 'block';
    container.innerHTML = '';
    
    // Group subjects by class
    const subjectsByClass = {};
    
    subjectMappings.forEach(mapping => {
        if (!mapping) return;
        
        const className = mapping.classId?.className || 
                         mapping.class?.className || 
                         mapping.class?.name || 
                         'Unknown Class';
        
        if (!subjectsByClass[className]) {
            subjectsByClass[className] = [];
        }
        
        // Handle subjects array
        const subjects = mapping.subjectIds || mapping.subjects || [];
        
        subjects.forEach(subject => {
            if (!subject) return;
            
            const subjectName = subject.subjectName || subject.name;
            
            if (subjectName && !subjectsByClass[className].includes(subjectName)) {
                subjectsByClass[className].push(subjectName);
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
            card.style.animation = 'fadeInUp 0.6s ease-out';
            
            card.innerHTML = `
                <h4>${sanitizeHTML(subject)}</h4>
                <p>in ${sanitizeHTML(className)}</p>
            `;
            
            container.appendChild(card);
            index++;
        });
    }
    
    console.log(`✅ Displayed subjects from ${Object.keys(subjectsByClass).length} classes`);
}

// ===============================
// DISPLAY PERMISSIONS
// ===============================

function displayPermissions(credential) {
    const container = document.getElementById('permissions-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    const accessLevel = credential.accessLevel;
    const canAccessAllClasses = credential.additionalAccess?.canAccessAllClasses || false;
    
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
// SANITIZATION
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