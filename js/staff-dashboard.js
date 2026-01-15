// staff-dashboard.js - FINAL CORRECTED VERSION

let staffData = null;
let credentialData = null;
let institutionData = null;
let staffClassMappings = null;
let teacherSubjectMappings = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    const userType = localStorage.getItem('userType');
    if (userType !== 'staff') {
        showError('Unauthorized access. Please login as staff.');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    loadStaffDashboard();
});

/* ======================================================
   MAIN DASHBOARD LOADER
====================================================== */
async function loadStaffDashboard() {
    try {
        showLoading('Loading your dashboard...');

        /* ✅ STAFF PROFILE */
        const profileRes = await apiGet('/staff/profile', true);

        if (!profileRes.success) {
            throw new Error('Failed to load staff profile');
        }

        staffData = profileRes.data.staff;
        credentialData = profileRes.data.credential;

        displayStaffProfile();

        /* ✅ INSTITUTION INFO (FROM LOCALSTORAGE) */
        displayInstitutionInfo();

        /* ✅ STAFF ASSIGNMENTS (NEW ENDPOINT) */
        await loadStaffAssignments();

        hideLoading();

    } catch (err) {
        hideLoading();
        console.error('Dashboard load error:', err);
        showError(err.message || 'Failed to load dashboard');
        
        // If unauthorized, redirect to login
        if (err.message.includes('Unauthorized') || err.message.includes('401')) {
            setTimeout(() => {
                logout();
            }, 2000);
        }
    }
}

/* ======================================================
   STAFF PROFILE DISPLAY
====================================================== */
function displayStaffProfile() {
    if (!staffData || !credentialData) return;

    document.getElementById('staff-name-header').textContent = staffData.name;

    document.getElementById('staff-name').textContent = staffData.name;
    document.getElementById('staff-mobile').textContent = staffData.mobileNo || '-';
    document.getElementById('staff-login-id').textContent = credentialData.loginId;
    document.getElementById('staff-designation').textContent =
        staffData.designationId?.name || staffData.designation || 'N/A';

    document.getElementById('staff-access-level').textContent =
        credentialData.accessLevel.toUpperCase();

    document.getElementById('staff-status').textContent =
        credentialData.isActive ? '✅ Active' : '❌ Inactive';

    document.getElementById('staff-last-login').textContent =
        credentialData.lastLogin
            ? new Date(credentialData.lastLogin).toLocaleString()
            : 'First login';

    displayPermissions();
    setupAccessBasedFeatures();
}

/* ======================================================
   PERMISSIONS
====================================================== */
function displayPermissions() {
    const el = document.getElementById('permissions-list');
    if (!credentialData) return;

    const map = {
        admin: [
            '✅ Full System Access',
            '✅ Manage Staff',
            '✅ Manage Students',
            '✅ View All Reports'
        ],
        coordinator: [
            '✅ Manage Classes',
            '✅ View Students',
            '✅ Manage Schedules'
        ],
        teacher: [
            '✅ Take Attendance',
            '✅ View Assigned Classes',
            '✅ View Student Lists'
        ]
    };

    const permissions = map[credentialData.accessLevel] || [];
    el.innerHTML = permissions.map(p => `<p>${p}</p>`).join('');
}

/* ======================================================
   ACCESS BASED UI
====================================================== */
function setupAccessBasedFeatures() {
    const level = credentialData.accessLevel;

    // Attendance button - for all staff with teaching assignments
    if (['teacher', 'coordinator', 'admin'].includes(level)) {
        document.getElementById('attendance-btn').style.display = 'block';
        document.getElementById('teaching-subjects-card').style.display = 'block';
    }

    // Schedule management - for coordinators and admins
    if (['coordinator', 'admin'].includes(level)) {
        document.getElementById('schedule-btn').style.display = 'block';
    }

    // Staff directory - admin only
    if (level === 'admin') {
        document.getElementById('view-staff-btn').style.display = 'block';
    }
}

/* ======================================================
   INSTITUTION INFO - FROM LOCALSTORAGE
====================================================== */
function displayInstitutionInfo() {
    // Get institution info from localStorage (saved during login)
    const instCode = localStorage.getItem('institutionCode') || '-';
    
    document.getElementById('inst-name').textContent = '-';
    document.getElementById('inst-type').textContent = '-';
    document.getElementById('inst-code').textContent = instCode;
}

/* ======================================================
   STAFF ASSIGNMENTS - NEW ENDPOINT
====================================================== */
async function loadStaffAssignments() {
    try {
        const res = await apiGet('/staff/assignments', true);
        
        if (!res.success) {
            throw new Error('Failed to load assignments');
        }
        
        staffClassMappings = res.data.classMapping;
        teacherSubjectMappings = res.data.subjectMappings || [];
        
        displayAssignedClasses();
        displayTeachingSubjects();
        
    } catch (err) {
        console.warn('Assignments load error:', err.message);
        // Show empty state instead of error
        displayAssignedClasses();
        displayTeachingSubjects();
    }
}

function displayAssignedClasses() {
    const el = document.getElementById('assigned-classes-list');
    
    if (!staffClassMappings?.assignedClasses?.length) {
        el.innerHTML = '<p style="color: #666;">No classes assigned yet</p>';
        return;
    }

    el.innerHTML = staffClassMappings.assignedClasses
        .map(c => {
            const className = c.nickname || c.className;
            return `<div style="padding: 0.5rem; background: #f5f5f5; border-radius: 4px; margin-bottom: 0.5rem;">
                <strong>${className}</strong>
            </div>`;
        })
        .join('');
}

function displayTeachingSubjects() {
    const el = document.getElementById('teaching-subjects-list');
    
    if (!teacherSubjectMappings || teacherSubjectMappings.length === 0) {
        el.innerHTML = '<p style="color: #666;">No subjects assigned yet</p>';
        return;
    }

    el.innerHTML = teacherSubjectMappings.map(m => {
        const className = m.classId?.nickname || m.classId?.className || 'Unknown Class';
        const subjects = m.subjectIds?.map(s => s.subjectName || s).join(', ') || 'No subjects';
        
        return `
            <div style="padding: 0.75rem; background: #f5f5f5; border-radius: 4px; margin-bottom: 0.5rem;">
                <strong style="display: block; margin-bottom: 0.25rem;">${className}</strong>
                <p style="margin: 0; color: #666; font-size: 0.9rem;">${subjects}</p>
            </div>
        `;
    }).join('');
}

/* ======================================================
   QUICK ACTIONS
====================================================== */
function goToAttendance() {
    // Check if staff has coordinator or admin access
    if (credentialData.accessLevel === 'coordinator' || credentialData.accessLevel === 'admin') {
        window.location.href = 'staff-attendance.html';
        return;
    }
    
    if (!teacherSubjectMappings || teacherSubjectMappings.length === 0) {
        showError('No teaching assignments found. Please contact administrator.');
        return;
    }
    window.location.href = 'staff-attendance.html';
}

function viewStudents() {
    window.location.href = 'staff-students.html';
}

function viewSchedule() {
    showSuccess('Schedule feature coming soon');
}

function viewAllStaff() {
    showSuccess('Staff directory coming soon');
}