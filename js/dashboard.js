// dashboard.js - Institution Dashboard Logic (FIXED with Debugging)

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
        
        // ✅ ADD DEBUGGING - Log the entire response to see structure
        console.log('📊 API Response:', response);
        console.log('📊 Data:', response.data);
        
        if (response.success) {
            const data = response.data;
            
            // ✅ Log specific fields to debug
            console.log('🏢 Institution Code:', data.institutionCode);
            console.log('📍 Address Object:', data.address);
            console.log('📞 Contacts Object:', data.contacts);
            
            // Display logo
            if (data.logo) {
                const logoImg = document.getElementById('institution-logo');
                logoImg.src = data.logo;
                logoImg.style.display = 'block';
            }
            
            // Display profile details
            document.getElementById('inst-code').textContent = data.institutionCode || '-';
            document.getElementById('inst-name').textContent = data.name || '-';
            document.getElementById('inst-type').textContent = data.type || '-';
            
            // ✅ FIXED: Better handling of address with null checks
            if (data.address) {
                document.getElementById('inst-state').textContent = data.address.state || '-';
                document.getElementById('inst-district').textContent = data.address.district || '-';
                
                // Add city if element exists
                const cityElement = document.getElementById('inst-city');
                if (cityElement) {
                    cityElement.textContent = data.address.city || '-';
                }
            } else {
                console.warn('⚠️ Address object is missing or null');
                document.getElementById('inst-state').textContent = '-';
                document.getElementById('inst-district').textContent = '-';
            }
            
            // ✅ FIXED: Better handling of contacts with null checks
            if (data.contacts) {
                document.getElementById('inst-mobile1').textContent = data.contacts.mobile1 || '-';
                document.getElementById('inst-mobile2').textContent = data.contacts.mobile2 || '-';
                document.getElementById('inst-email').textContent = data.contacts.email || '-';
            } else {
                console.warn('⚠️ Contacts object is missing or null');
                document.getElementById('inst-mobile1').textContent = '-';
                document.getElementById('inst-mobile2').textContent = '-';
                document.getElementById('inst-email').textContent = '-';
            }
            
            // Display last login
            if (data.lastLogin) {
                const date = new Date(data.lastLogin);
                document.getElementById('inst-last-login').textContent = date.toLocaleString();
            } else {
                document.getElementById('inst-last-login').textContent = 'First login';
            }
            
            // Display statistics
            if (data.stats) {
                document.getElementById('stat-staff').textContent = data.stats.totalStaff || 0;
                document.getElementById('stat-classes').textContent = data.stats.totalClasses || 0;
                document.getElementById('stat-subjects').textContent = data.stats.totalSubjects || 0;
                document.getElementById('stat-students').textContent = data.stats.totalStudents || 0;
            } else {
                console.warn('⚠️ Stats object is missing');
                // Set to 0 if stats not available
                document.getElementById('stat-staff').textContent = 0;
                document.getElementById('stat-classes').textContent = 0;
                document.getElementById('stat-subjects').textContent = 0;
                document.getElementById('stat-students').textContent = 0;
            }
        } else {
            console.error('❌ API call failed:', response);
            showError('Failed to load dashboard data');
        }
        
    } catch (error) {
        hideLoading();
        console.error('❌ Error loading dashboard:', error);
        showError(error.message);
    }
}

function goToPart1() {
    window.location.href = 'part1-basic-info.html';
}

function goToPart2() {
    window.location.href = 'part2-mapping.html';
}

function goToPart3() {
    window.location.href = 'part3-credentials.html';
}