// basic-info.js - Part 1: Basic Information Logic

let currentSection = 'designations';
let designationsData = [];
let classesData = [];
let staffData = [];
let subjectsData = [];
let studentsData = [];

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    // Show first section by default
    showSection('designations');
    
    // Load all data
    loadDesignations();
    loadClasses();
    loadStaff();
    loadSubjects();
    loadStudents();
    loadHierarchy();
    
    // Setup form handlers
    document.getElementById('add-designation-form').addEventListener('submit', handleAddDesignation);
    document.getElementById('add-class-form').addEventListener('submit', handleAddClass);
    document.getElementById('add-staff-form').addEventListener('submit', handleAddStaff);
    document.getElementById('add-subject-form').addEventListener('submit', handleAddSubject);
    document.getElementById('add-student-form').addEventListener('submit', handleAddStudent);
    document.getElementById('bulk-upload-form').addEventListener('submit', handleBulkUpload);
});

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.style.display = 'none');
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('#section-tabs button');
    tabs.forEach(t => t.style.fontWeight = 'normal');
    
    // Show selected section
    document.getElementById('section-' + sectionName).style.display = 'block';
    document.getElementById('tab-' + sectionName).style.fontWeight = 'bold';
    
    currentSection = sectionName;
}

// ===================================
// 1. DESIGNATIONS MANAGEMENT
// ===================================

async function loadDesignations() {
    try {
        const response = await apiGet(API_ENDPOINTS.DESIGNATIONS, true);
        if (response.success) {
            designationsData = response.data;
            displayDesignations();
        }
    } catch (error) {
        showError('Failed to load designations: ' + error.message);
    }
}

function displayDesignations() {
    const tbody = document.querySelector('#designations-table tbody');
    tbody.innerHTML = '';
    
    designationsData.forEach(des => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${des.name}</td>
            <td>${des.level || '-'}</td>
            <td>${des.staffCount || 0}</td>
            <td>
                <button onclick="editDesignation('${des._id}')">Edit</button>
                <button onclick="deleteDesignation('${des._id}')">Delete</button>
            </td>
        `;
    });
    
    // Update staff designation dropdown
    const staffDesSelect = document.getElementById('staff-designation');
    populateDropdown(staffDesSelect, designationsData, '_id', 'name');
}

async function handleAddDesignation(e) {
    e.preventDefault();
    
    const name = document.getElementById('des-name').value.trim();
    const level = document.getElementById('des-level').value;
    
    try {
        showLoading('Adding designation...');
        
        const response = await apiPost(API_ENDPOINTS.DESIGNATIONS, {
            name: name,
            level: level ? parseInt(level) : null
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            document.getElementById('add-designation-form').reset();
            loadDesignations();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function editDesignation(id) {
    const des = designationsData.find(d => d._id === id);
    if (!des) return;
    
    const newName = prompt('Edit Designation Name:', des.name);
    if (!newName) return;
    
    const newLevel = prompt('Edit Level (1-10, leave empty for none):', des.level || '');
    
    try {
        showLoading('Updating designation...');
        
        const response = await apiPut(API_ENDPOINTS.DESIGNATIONS + '/' + id, {
            name: newName,
            level: newLevel ? parseInt(newLevel) : null
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            loadDesignations();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function deleteDesignation(id) {
    if (!confirm('Are you sure you want to delete this designation?')) return;
    
    try {
        showLoading('Deleting designation...');
        
        const response = await apiDelete(API_ENDPOINTS.DESIGNATIONS + '/' + id, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            loadDesignations();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// ===================================
// 2. CLASSES MANAGEMENT
// ===================================

async function loadClasses() {
    try {
        const response = await apiGet(API_ENDPOINTS.CLASSES, true);
        if (response.success) {
            classesData = response.data;
            displayClasses();
        }
    } catch (error) {
        showError('Failed to load classes: ' + error.message);
    }
}

function displayClasses() {
    const tbody = document.querySelector('#classes-table tbody');
    tbody.innerHTML = '';
    
    classesData.forEach(cls => {
        const row = tbody.insertRow();
        const subjects = cls.assignedSubjects ? cls.assignedSubjects.map(s => s.subjectName).join(', ') : '-';
        
        row.innerHTML = `
            <td>${cls.className}</td>
            <td>${cls.nickname || '-'}</td>
            <td>${cls.studentCount || 0}</td>
            <td>${subjects}</td>
            <td>
                <button onclick="editClass('${cls._id}')">Edit</button>
                <button onclick="deleteClass('${cls._id}')">Delete</button>
            </td>
        `;
    });
    
    // Update student class dropdown
    const studentClassSelect = document.getElementById('student-class');
    populateDropdown(studentClassSelect, classesData, '_id', data => data.nickname || data.className);
}

async function handleAddClass(e) {
    e.preventDefault();
    
    const className = document.getElementById('class-name').value.trim();
    const nickname = document.getElementById('class-nickname').value.trim();
    
    try {
        showLoading('Adding class...');
        
        const response = await apiPost(API_ENDPOINTS.CLASSES, {
            className: className,
            nickname: nickname || null
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            document.getElementById('add-class-form').reset();
            loadClasses();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function editClass(id) {
    const cls = classesData.find(c => c._id === id);
    if (!cls) return;
    
    const newClassName = prompt('Edit Class Name:', cls.className);
    if (!newClassName) return;
    
    const newNickname = prompt('Edit Nick Name (leave empty for none):', cls.nickname || '');
    
    try {
        showLoading('Updating class...');
        
        const response = await apiPut(API_ENDPOINTS.CLASSES + '/' + id, {
            className: newClassName,
            nickname: newNickname || null
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            loadClasses();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function deleteClass(id) {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    try {
        showLoading('Deleting class...');
        
        const response = await apiDelete(API_ENDPOINTS.CLASSES + '/' + id, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            loadClasses();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// basic-info-continued.js - Part 1 Logic Continued
// IMPORTANT: Add this code to the end of basic-info.js file

// ===================================
// 3. STAFF MANAGEMENT
// ===================================

async function loadStaff() {
    try {
        const response = await apiGet(API_ENDPOINTS.STAFF, true);
        if (response.success) {
            staffData = response.data;
            displayStaff();
        }
    } catch (error) {
        showError('Failed to load staff: ' + error.message);
    }
}

function displayStaff() {
    const tbody = document.querySelector('#staff-table tbody');
    tbody.innerHTML = '';
    
    staffData.forEach(staff => {
        const row = tbody.insertRow();
        const classes = staff.assignedClasses ? staff.assignedClasses.map(c => c.className).join(', ') : '-';
        const credentials = staff.hasCredentials ? (staff.isCredentialActive ? 'Yes (Active)' : 'Yes (Inactive)') : 'No';
        
        row.innerHTML = `
            <td>${staff.name}</td>
            <td>${staff.mobileNo}</td>
            <td>${staff.designationId?.name || '-'}</td>
            <td>${classes}</td>
            <td>${credentials}</td>
            <td>
                <button onclick="editStaff('${staff._id}')">Edit</button>
                <button onclick="deleteStaff('${staff._id}')">Delete</button>
            </td>
        `;
    });
}

async function handleAddStaff(e) {
    e.preventDefault();
    
    const name = document.getElementById('staff-name').value.trim();
    const mobileNo = document.getElementById('staff-mobile').value.trim();
    const designationId = document.getElementById('staff-designation').value;
    
    if (!validateMobile(mobileNo)) {
        showError('Please enter a valid 10-digit mobile number');
        return;
    }
    
    try {
        showLoading('Adding staff...');
        
        const response = await apiPost(API_ENDPOINTS.STAFF, {
            name: name,
            mobileNo: mobileNo,
            designationId: designationId
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            document.getElementById('add-staff-form').reset();
            loadStaff();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function editStaff(id) {
    const staff = staffData.find(s => s._id === id);
    if (!staff) return;
    
    const newName = prompt('Edit Staff Name:', staff.name);
    if (!newName) return;
    
    const newMobile = prompt('Edit Mobile Number:', staff.mobileNo);
    if (!newMobile || !validateMobile(newMobile)) {
        alert('Invalid mobile number');
        return;
    }
    
    try {
        showLoading('Updating staff...');
        
        const response = await apiPut(API_ENDPOINTS.STAFF + '/' + id, {
            name: newName,
            mobileNo: newMobile
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            loadStaff();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function deleteStaff(id) {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
        showLoading('Deleting staff...');
        
        const response = await apiDelete(API_ENDPOINTS.STAFF + '/' + id, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            loadStaff();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// ===================================
// 4. SUBJECTS MANAGEMENT
// ===================================

async function loadSubjects() {
    try {
        const response = await apiGet(API_ENDPOINTS.SUBJECTS, true);
        if (response.success) {
            subjectsData = response.data;
            displaySubjects();
        }
    } catch (error) {
        showError('Failed to load subjects: ' + error.message);
    }
}

function displaySubjects() {
    const tbody = document.querySelector('#subjects-table tbody');
    tbody.innerHTML = '';
    
    subjectsData.forEach(subject => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${subject.subjectName}</td>
            <td>
                <button onclick="editSubject('${subject._id}')">Edit</button>
                <button onclick="deleteSubject('${subject._id}')">Delete</button>
            </td>
        `;
    });
}

async function handleAddSubject(e) {
    e.preventDefault();
    
    const subjectName = document.getElementById('subject-name').value.trim();
    
    try {
        showLoading('Adding subject...');
        
        const response = await apiPost(API_ENDPOINTS.SUBJECTS, {
            subjectName: subjectName
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            document.getElementById('add-subject-form').reset();
            loadSubjects();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function editSubject(id) {
    const subject = subjectsData.find(s => s._id === id);
    if (!subject) return;
    
    const newName = prompt('Edit Subject Name:', subject.subjectName);
    if (!newName) return;
    
    try {
        showLoading('Updating subject...');
        
        const response = await apiPut(API_ENDPOINTS.SUBJECTS + '/' + id, {
            subjectName: newName
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            loadSubjects();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function deleteSubject(id) {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    try {
        showLoading('Deleting subject...');
        
        const response = await apiDelete(API_ENDPOINTS.SUBJECTS + '/' + id, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            loadSubjects();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// ===================================
// 5. STUDENTS MANAGEMENT
// ===================================

async function loadStudents() {
    try {
        const response = await apiGet(API_ENDPOINTS.STUDENTS + '?limit=100', true);
        if (response.success) {
            studentsData = response.data;
            displayStudents();
        }
    } catch (error) {
        showError('Failed to load students: ' + error.message);
    }
}

async function loadAllStudents() {
    document.getElementById('search-student').value = '';
    loadStudents();
}

function displayStudents() {
    const tbody = document.querySelector('#students-table tbody');
    tbody.innerHTML = '';
    
    studentsData.forEach((student, index) => {  // Add index
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>  <!-- Add serial number -->
            <td>${student.name}</td>
            <td>${student.fatherName}</td>
            <td>${student.classId?.className || '-'}</td>
            <td>${student.mobileNo}</td>
            <td>
                <button onclick="editStudent('${student._id}')">Edit</button>
                <button onclick="deleteStudent('${student._id}')">Delete</button>
            </td>
        `;
    });
    
    // ✅ ADD THIS: Update student count
    const countDiv = document.getElementById('student-count');
    if (countDiv) {
        countDiv.innerHTML = `Total: <strong>${studentsData.length}</strong>`;
    }
}

async function handleAddStudent(e) {
    e.preventDefault();
    
    const name = document.getElementById('student-name').value.trim();
    const fatherName = document.getElementById('student-father').value.trim();
    const classId = document.getElementById('student-class').value;
    const mobileNo = document.getElementById('student-mobile').value.trim();
    
    if (!validateMobile(mobileNo)) {
        showError('Please enter a valid 10-digit mobile number');
        return;
    }
    
    try {
        showLoading('Adding student...');
        
        const response = await apiPost(API_ENDPOINTS.STUDENTS, {
            name: name,
            fatherName: fatherName,
            classId: classId,
            mobileNo: mobileNo
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            document.getElementById('add-student-form').reset();
            loadStudents();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function handleBulkUpload(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('student-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showError('Please select a file');
        return;
    }
    
    try {
        showLoading('Uploading students...');
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiPostFormData(API_ENDPOINTS.STUDENTS_BULK_UPLOAD, formData, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message + '\nSuccessful: ' + response.stats.successful + '\nFailed: ' + response.stats.failed);
            document.getElementById('bulk-upload-form').reset();
            loadStudents();
            
            if (response.stats.errors.length > 0) {
                console.error('Upload errors:', response.stats.errors);
            }
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function searchStudents() {
    const searchTerm = document.getElementById('search-student').value.trim();
    
    if (!searchTerm) {
        loadStudents();
        return;
    }
    
    try {
        showLoading('Searching...');
        
        const response = await apiGet(API_ENDPOINTS.STUDENTS + '?search=' + encodeURIComponent(searchTerm), true);
        
        hideLoading();
        
        if (response.success) {
            studentsData = response.data;
            displayStudents();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function editStudent(id) {
    alert('Edit student feature: Please delete and re-add for now');
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
        showLoading('Deleting student...');
        
        const response = await apiDelete(API_ENDPOINTS.STUDENTS + '/' + id, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            loadStudents();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

// ===================================
// 6. HIERARCHY MANAGEMENT
// ===================================

async function loadHierarchy() {
    try {
        const response = await apiGet(API_ENDPOINTS.HIERARCHY, true);
        if (response.success && response.data && response.data.levels) {
            displayCurrentHierarchy(response.data.levels);
        }
    } catch (error) {
        console.error('Failed to load hierarchy:', error);
    }
}

function generateHierarchyLevels() {
    const numLevels = parseInt(document.getElementById('num-levels').value);
    const container = document.getElementById('hierarchy-levels-container');
    
    container.innerHTML = '<h3>Define Level Names:</h3>';
    
    for (let i = 1; i <= numLevels; i++) {
        const div = document.createElement('div');
        div.innerHTML = `
            <label for="level-${i}">Level ${i} Name: *</label>
            <input type="text" id="level-${i}" required>
        `;
        container.appendChild(div);
    }
    
    document.getElementById('save-hierarchy-btn').style.display = 'block';
}

async function saveHierarchy() {
    const numLevels = parseInt(document.getElementById('num-levels').value);
    const levels = [];
    
    for (let i = 1; i <= numLevels; i++) {
        const name = document.getElementById('level-' + i).value.trim();
        if (!name) {
            showError('Please fill all level names');
            return;
        }
        levels.push({
            levelNumber: i,
            name: name
        });
    }
    
    try {
        showLoading('Saving hierarchy...');
        
        const response = await apiPost(API_ENDPOINTS.HIERARCHY, {
            levels: levels
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            displayCurrentHierarchy(levels);
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

function displayCurrentHierarchy(levels) {
    const container = document.getElementById('current-hierarchy');
    
    if (!levels || levels.length === 0) {
        container.innerHTML = '<p>No hierarchy defined yet.</p>';
        return;
    }
    
    container.innerHTML = '<ul>';
    levels.forEach(level => {
        container.innerHTML += `<li>Level ${level.levelNumber}: ${level.name}</li>`;
    });
    container.innerHTML += '</ul>';
}