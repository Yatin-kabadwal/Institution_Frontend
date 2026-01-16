// dashboard.js - SECURE FIXED VERSION WITH PROPER NULL HANDLING

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth()) {
        return;
    }
    
    // Verify this is an institution user (not staff)
    const userType = localStorage.getItem('userType');
    if (userType === 'staff') {
        // Redirect staff to their dashboard
        window.location.href = 'staff-dashboard.html';
        return;
    }
    
    if (userType !== 'institution') {
        showError('Unauthorized access. Please login as institution.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Load dashboard data
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        showLoading('Loading dashboard...');
        
        // Fetch institution profile
        const response = await apiGet(API_ENDPOINTS.INSTITUTION_PROFILE, true);
        
        hideLoading();
        
        console.log('📊 Dashboard API Response:', response);
        
        if (!response.success) {
            throw new Error(response.message || 'Failed to load dashboard data');
        }

        const data = response.data;

        if (!data) {
            throw new Error('No data received from server');
        }
        
        // Display logo
        displayLogo(data.logo);
        
        // Display profile details with safe null handling
        displayProfileDetails(data);
        
        // Display last login
        displayLastLogin(data.lastLogin);
        
        // Display statistics
        displayStatistics(data.stats);
        
    } catch (error) {
        hideLoading();
        console.error('❌ Error loading dashboard:', error);
        showError(error.message || 'Failed to load dashboard data');
    }
}

// ===============================
// DISPLAY LOGO
// ===============================
function displayLogo(logo) {
    const logoImg = document.getElementById('institution-logo');
    if (logo && logoImg) {
        logoImg.src = logo;
        logoImg.style.display = 'block';
        logoImg.onerror = function() {
            console.warn('Failed to load logo image');
            this.style.display = 'none';
        };
    }
}

// ===============================
// DISPLAY PROFILE DETAILS - SAFE NULL HANDLING
// ===============================
function displayProfileDetails(data) {
    // Helper function for safe display
    const safeDisplay = (elementId, value, fallback = '-') => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value ?? fallback;
        }
    };

    // Basic Information
    safeDisplay('inst-code', data.institutionCode);
    safeDisplay('inst-name', data.name);
    safeDisplay('inst-type', data.type);
    
    // Address - Handle all possible null/undefined cases
    if (data.address && typeof data.address === 'object') {
        safeDisplay('inst-state', data.address.state);
        safeDisplay('inst-district', data.address.district);
        safeDisplay('inst-city', data.address.city);
        
        // Handle location if element exists
        const locationElement = document.getElementById('inst-location');
        if (locationElement) {
            safeDisplay('inst-location', data.address.location);
        }
    } else {
        // Address is null/undefined or invalid format
        console.warn('⚠️ Address data is missing or invalid:', data.address);
        safeDisplay('inst-state', null);
        safeDisplay('inst-district', null);
        safeDisplay('inst-city', null);
        
        // Show warning to user
        const addressWarning = document.createElement('p');
        addressWarning.style.color = '#f59e0b';
        addressWarning.style.fontStyle = 'italic';
        addressWarning.textContent = '⚠️ Address information is incomplete. Please update your profile.';
        
        const profileDetails = document.getElementById('profile-details');
        if (profileDetails) {
            profileDetails.insertBefore(addressWarning, profileDetails.firstChild);
        }
    }
    
    // Contacts - Handle all possible null/undefined cases
    if (data.contacts && typeof data.contacts === 'object') {
        safeDisplay('inst-mobile1', data.contacts.mobile1);
        safeDisplay('inst-mobile2', data.contacts.mobile2);
        safeDisplay('inst-email', data.contacts.email);
    } else {
        // Contacts is null/undefined or invalid format
        console.warn('⚠️ Contacts data is missing or invalid:', data.contacts);
        safeDisplay('inst-mobile1', null);
        safeDisplay('inst-mobile2', null);
        safeDisplay('inst-email', null);
        
        // Show warning to user
        const contactsWarning = document.createElement('p');
        contactsWarning.style.color = '#f59e0b';
        contactsWarning.style.fontStyle = 'italic';
        contactsWarning.textContent = '⚠️ Contact information is incomplete. Please update your profile.';
        
        const profileDetails = document.getElementById('profile-details');
        if (profileDetails) {
            const contactsHeading = Array.from(profileDetails.querySelectorAll('h4'))
                .find(h => h.textContent.includes('Contact'));
            if (contactsHeading) {
                contactsHeading.insertAdjacentElement('afterend', contactsWarning);
            }
        }
    }
}

// ===============================
// DISPLAY LAST LOGIN
// ===============================
function displayLastLogin(lastLogin) {
    const element = document.getElementById('inst-last-login');
    if (!element) return;
    
    if (lastLogin) {
        try {
            const date = new Date(lastLogin);
            if (isNaN(date.getTime())) {
                element.textContent = 'Invalid date';
            } else {
                element.textContent = date.toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (error) {
            console.error('Error parsing last login date:', error);
            element.textContent = 'Invalid date';
        }
    } else {
        element.textContent = 'First login';
    }
}

// ===============================
// DISPLAY STATISTICS - SAFE NULL HANDLING
// ===============================
function displayStatistics(stats) {
    // Helper function for safe stat display
    const safeStatDisplay = (elementId, value) => {
        const element = document.getElementById(elementId);
        if (element) {
            // Convert to number and ensure it's not NaN
            const numValue = Number(value);
            element.textContent = isNaN(numValue) ? '0' : numValue.toString();
        }
    };

    if (stats && typeof stats === 'object') {
        safeStatDisplay('stat-staff', stats.totalStaff);
        safeStatDisplay('stat-classes', stats.totalClasses);
        safeStatDisplay('stat-subjects', stats.totalSubjects);
        safeStatDisplay('stat-students', stats.totalStudents);
    } else {
        // Stats missing - set all to 0
        console.warn('⚠️ Statistics data is missing');
        safeStatDisplay('stat-staff', 0);
        safeStatDisplay('stat-classes', 0);
        safeStatDisplay('stat-subjects', 0);
        safeStatDisplay('stat-students', 0);
    }
}

// ===============================
// NAVIGATION FUNCTIONS
// ===============================
function goToPart1() {
    window.location.href = 'part1-basic-info.html';
}

function goToPart2() {
    window.location.href = 'part2-mapping.html';
}

function goToPart3() {
    window.location.href = 'part3-credentials.html';
}