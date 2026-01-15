// mapping.js - Part 2: Mapping Logic

let staffData = [];
let classesData = [];
let subjectsData = [];
let designationsData = [];
let staffClassMappings = [];
let classSubjectMappings = [];
let teacherSubjectMappings = [];

document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    // Load all data
    loadAllData();
    
    // Show first section
    showMappingSection('staff-class');
    
    // Setup form handlers
    document.getElementById('assign-staff-class-form').addEventListener('submit', handleAssignStaffToClasses);
    document.getElementById('assign-class-subject-form').addEventListener('submit', handleAssignSubjectsToClass);
    document.getElementById('assign-teacher-subject-form').addEventListener('submit', handleAssignTeacherToSubjects);
    
    // Setup class selection for teacher-subject form
    document.getElementById('ts-class').addEventListener('change', handleTeacherClassSelection);
});

async function loadAllData() {
    try {
        showLoading('Loading data...');
        
        // Load all required data
        const [staff, classes, subjects, designations, mappings] = await Promise.all([
            apiGet(API_ENDPOINTS.STAFF, true),
            apiGet(API_ENDPOINTS.CLASSES, true),
            apiGet(API_ENDPOINTS.SUBJECTS, true),
            apiGet(API_ENDPOINTS.DESIGNATIONS, true),
            apiGet(API_ENDPOINTS.ALL_MAPPINGS, true)
        ]);
        
        staffData = staff.data;
        classesData = classes.data;
        subjectsData = subjects.data;
        designationsData = designations.data;
        
        if (mappings.success) {
            staffClassMappings = mappings.data.staffToClass || [];
            classSubjectMappings = mappings.data.classToSubject || [];
            teacherSubjectMappings = mappings.data.teacherToSubject || [];
        }
        
        hideLoading();
        
        // Populate dropdowns and display data
        setupStaffClassSection();
        setupClassSubjectSection();
        setupTeacherSubjectSection();
        
        displayAllMappings();
        
    } catch (error) {
        hideLoading();
        showError('Failed to load data: ' + error.message);
    }
}

function showMappingSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.mapping-section');
    sections.forEach(s => s.style.display = 'none');
    
    // Remove active style from all tabs
    const tabs = document.querySelectorAll('#section-tabs button');
    tabs.forEach(t => t.style.fontWeight = 'normal');
    
    // Show selected section
    document.getElementById('section-' + sectionName).style.display = 'block';
    document.getElementById('tab-' + sectionName).style.fontWeight = 'bold';
}

// ===================================
// 1. STAFF-CLASS MAPPING
// ===================================

function setupStaffClassSection() {
    // Populate staff dropdown
    const staffSelect = document.getElementById('sc-staff-name');
    populateDropdown(staffSelect, staffData, '_id', 'name');
    
    // Populate designation dropdown
    const desSelect = document.getElementById('sc-designation');
    populateDropdown(desSelect, designationsData, '_id', 'name');
    
    // Create class checkboxes
    const classesContainer = document.getElementById('sc-classes-checkboxes');
    classesContainer.innerHTML = '';
    
    classesData.forEach(cls => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="sc-class" value="${cls._id}">
            ${cls.nickname || cls.className}
        `;
        classesContainer.appendChild(label);
        classesContainer.appendChild(document.createElement('br'));
    });
}

function toggleAllClasses(checkbox) {
    const classCheckboxes = document.querySelectorAll('input[name="sc-class"]');
    classCheckboxes.forEach(cb => cb.checked = checkbox.checked);
}

async function handleAssignStaffToClasses(e) {
    e.preventDefault();
    
    const staffId = document.getElementById('sc-staff-name').value;
    const designationId = document.getElementById('sc-designation').value;
    
    // Get selected classes
    const selectedClasses = Array.from(document.querySelectorAll('input[name="sc-class"]:checked'))
        .map(cb => cb.value);
    
    try {
        showLoading('Assigning staff to classes...');
        
        const response = await apiPost(API_ENDPOINTS.STAFF_CLASS_MAPPING, {
            staffId: staffId,
            designationId: designationId,
            assignedClasses: selectedClasses
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            document.getElementById('assign-staff-class-form').reset();
            loadAllData();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

function displayStaffClassMappings() {
    const tbody = document.querySelector('#staff-class-table tbody');
    tbody.innerHTML = '';
    
    staffClassMappings.forEach(mapping => {
        const row = tbody.insertRow();
        const classes = mapping.assignedClasses.map(c => c.className).join(', ') || 'None';
        
        row.innerHTML = `
            <td>${mapping.staffId?.name || '-'}</td>
            <td>${mapping.designationId?.name || '-'}</td>
            <td>${classes}</td>
            <td>
                <button onclick="editStaffClassMapping('${mapping._id}')">Edit</button>
                <button onclick="deleteStaffClassMapping('${mapping._id}')">Delete</button>
            </td>
        `;
    });
}

async function editStaffClassMapping(id) {
    alert('Please use the form above to update staff assignments');
}

async function deleteStaffClassMapping(id) {
    if (!confirm('Remove this staff assignment?')) return;
    alert('Delete mapping feature - please reassign with empty classes for now');
}

// ===================================
// 2. CLASS-SUBJECT MAPPING
// ===================================

function setupClassSubjectSection() {
    // Populate class dropdown
    const classSelect = document.getElementById('cs-class');
    populateDropdown(classSelect, classesData, '_id', data => data.nickname || data.className);
    
    // Create subject checkboxes
    const subjectsContainer = document.getElementById('cs-subjects-checkboxes');
    subjectsContainer.innerHTML = '';
    
    subjectsData.forEach(subject => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="cs-subject" value="${subject._id}">
            ${subject.subjectName}
        `;
        subjectsContainer.appendChild(label);
        subjectsContainer.appendChild(document.createElement('br'));
    });
}

function toggleAllSubjects(checkbox) {
    const subjectCheckboxes = document.querySelectorAll('input[name="cs-subject"]');
    subjectCheckboxes.forEach(cb => cb.checked = checkbox.checked);
}

async function handleAssignSubjectsToClass(e) {
    e.preventDefault();
    
    const classId = document.getElementById('cs-class').value;
    
    // Get selected subjects
    const selectedSubjects = Array.from(document.querySelectorAll('input[name="cs-subject"]:checked'))
        .map(cb => cb.value);
    
    if (selectedSubjects.length === 0) {
        showError('Please select at least one subject');
        return;
    }
    
    try {
        showLoading('Assigning subjects to class...');
        
        const response = await apiPost(API_ENDPOINTS.CLASS_SUBJECT_MAPPING, {
            classId: classId,
            subjectIds: selectedSubjects
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            document.getElementById('assign-class-subject-form').reset();
            document.getElementById('cs-all-subjects').checked = false;
            loadAllData();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

function displayClassSubjectMappings() {
    const tbody = document.querySelector('#class-subject-table tbody');
    tbody.innerHTML = '';
    
    classSubjectMappings.forEach(mapping => {
        const row = tbody.insertRow();
        const subjects = mapping.subjectIds.map(s => s.subjectName).join(', ') || 'None';
        
        row.innerHTML = `
            <td>${mapping.classId?.className || '-'} ${mapping.classId?.nickname ? '(' + mapping.classId.nickname + ')' : ''}</td>
            <td>${subjects}</td>
            <td>
                <button onclick="editClassSubjectMapping('${mapping.classId._id}')">Edit</button>
            </td>
        `;
    });
}

async function editClassSubjectMapping(classId) {
    alert('Please use the form above to update class subject assignments');
}

// ===================================
// 3. TEACHER-SUBJECT MAPPING
// ===================================

function setupTeacherSubjectSection() {
    // Populate teacher dropdown (only staff members)
    const teacherSelect = document.getElementById('ts-teacher');
    populateDropdown(teacherSelect, staffData, '_id', 'name');
    
    // Populate class dropdown
    const classSelect = document.getElementById('ts-class');
    populateDropdown(classSelect, classesData, '_id', data => data.nickname || data.className);
}

async function handleTeacherClassSelection() {
    const classId = document.getElementById('ts-class').value;
    
    if (!classId) {
        document.getElementById('ts-subjects-container').style.display = 'none';
        return;
    }
    
    // Find subjects assigned to this class
    const classMapping = classSubjectMappings.find(m => m.classId._id === classId);
    
    if (!classMapping || !classMapping.subjectIds || classMapping.subjectIds.length === 0) {
        showError('No subjects assigned to this class yet. Please assign subjects first in Section 2.');
        document.getElementById('ts-subjects-container').style.display = 'none';
        return;
    }
    
    // Show subjects as checkboxes
    const container = document.getElementById('ts-subjects-checkboxes');
    container.innerHTML = '';
    
    classMapping.subjectIds.forEach(subject => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="ts-subject" value="${subject._id}">
            ${subject.subjectName}
        `;
        container.appendChild(label);
        container.appendChild(document.createElement('br'));
    });
    
    document.getElementById('ts-subjects-container').style.display = 'block';
}

async function handleAssignTeacherToSubjects(e) {
    e.preventDefault();
    
    const teacherId = document.getElementById('ts-teacher').value;
    const classId = document.getElementById('ts-class').value;
    
    // Get selected subjects
    const selectedSubjects = Array.from(document.querySelectorAll('input[name="ts-subject"]:checked'))
        .map(cb => cb.value);
    
    if (selectedSubjects.length === 0) {
        showError('Please select at least one subject');
        return;
    }
    
    try {
        showLoading('Assigning teacher to subjects...');
        
        const response = await apiPost(API_ENDPOINTS.TEACHER_SUBJECT_MAPPING, {
            teacherId: teacherId,
            classId: classId,
            subjectIds: selectedSubjects
        }, true);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            document.getElementById('assign-teacher-subject-form').reset();
            document.getElementById('ts-subjects-container').style.display = 'none';
            loadAllData();
        }
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

function displayTeacherSubjectMappings() {
    const tbody = document.querySelector('#teacher-subject-table tbody');
    tbody.innerHTML = '';
    
    teacherSubjectMappings.forEach(mapping => {
        const row = tbody.insertRow();
        const subjects = mapping.subjectIds.map(s => s.subjectName).join(', ') || 'None';
        
        row.innerHTML = `
            <td>${mapping.teacherId?.name || '-'}</td>
            <td>${mapping.classId?.className || '-'} ${mapping.classId?.nickname ? '(' + mapping.classId.nickname + ')' : ''}</td>
            <td>${subjects}</td>
            <td>
                <button onclick="editTeacherSubjectMapping('${mapping._id}')">Edit</button>
                <button onclick="deleteTeacherSubjectMapping('${mapping._id}')">Delete</button>
            </td>
        `;
    });
}

async function editTeacherSubjectMapping(id) {
    alert('Please use the form above to update teacher subject assignments');
}

async function deleteTeacherSubjectMapping(id) {
    if (!confirm('Remove this teacher assignment?')) return;
    alert('Delete mapping feature - please reassign for now');
}

// ===================================
// DISPLAY ALL MAPPINGS
// ===================================

function displayAllMappings() {
    displayStaffClassMappings();
    displayClassSubjectMappings();
    displayTeacherSubjectMappings();
}