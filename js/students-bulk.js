// js/students-bulk.js
// Bulk student upload functionality

// Download Student Template
function downloadStudentTemplate() {
    try {
        const wb = XLSX.utils.book_new();
        const wsData = [
            ['Name', 'Father Name', 'Mobile No'],
            ['John Doe', 'Robert Doe', '9876543210'],
            ['Jane Smith', 'Michael Smith', '9876543211'],
            ['Alex Johnson', 'David Johnson', '9876543212']
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Set column widths
        ws['!cols'] = [
            { wch: 20 },
            { wch: 20 },
            { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Students');
        XLSX.writeFile(wb, 'Student_Upload_Template.xlsx');

        showSuccess('📥 Template downloaded successfully!');
    } catch (error) {
        console.error('Download error:', error);
        showError('Failed to download template');
    }
}

// Phone Validation for Individual Student Form
document.addEventListener('DOMContentLoaded', function() {
    const mobileInput = document.getElementById('student-mobile');
    
    if (mobileInput) {
        mobileInput.addEventListener('input', function() {
            const hint = this.nextElementSibling;
            const value = this.value.replace(/\D/g, '');
            this.value = value;
            
            if (value.length === 10) {
                this.style.borderColor = '#10B981';
                this.style.backgroundColor = '#f0fdf4';
                if (hint) {
                    hint.textContent = '✓ Valid 10 digit number';
                    hint.style.color = '#10B981';
                    hint.style.fontWeight = '600';
                }
            } else if (value.length > 0) {
                this.style.borderColor = '#EF4444';
                this.style.backgroundColor = '#fef2f2';
                if (hint) {
                    hint.textContent = `✗ ${value.length}/10 digits`;
                    hint.style.color = '#EF4444';
                    hint.style.fontWeight = '600';
                }
            } else {
                this.style.borderColor = '#e0e0e0';
                this.style.backgroundColor = 'white';
                if (hint) {
                    hint.textContent = 'Enter 10 digits';
                    hint.style.color = '#666';
                    hint.style.fontWeight = 'normal';
                }
            }
        });
    }
});

// Bulk Upload Form Handler
document.getElementById('bulk-upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const classId = document.getElementById('bulk-class-select').value;
    const fileInput = document.getElementById('student-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showError('Please select a file');
        return;
    }
    
    if (!classId) {
        showError('Please select a class');
        return;
    }
    
    // File size check (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB');
        return;
    }
    
    const formData = new FormData();
    formData.append('classId', classId);
    formData.append('file', file);
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/bulk-upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            const resultsDiv = document.getElementById('upload-results');
            const statsDiv = document.getElementById('upload-stats');
            
            resultsDiv.style.display = 'block';
            resultsDiv.style.background = '#f0fdf4';
            resultsDiv.style.border = '1px solid #86efac';
            
            let statsHTML = `
                <p style="color:#10B981; font-weight:600;">✅ Upload Successful!</p>
                <ul style="margin:10px 0; padding-left:20px;">
                    <li><strong>Total Processed:</strong> ${data.stats.totalProcessed}</li>
                    <li><strong>Successfully Added:</strong> ${data.stats.successful}</li>
                    <li><strong>Failed/Duplicates:</strong> ${data.stats.failed}</li>
                </ul>
            `;
            
            if (data.stats.failed > 0) {
                statsHTML += `<p style="color:#f59e0b; margin-top:10px;"><strong>Note:</strong> ${data.stats.failed} students were not added (possibly duplicates or validation errors)</p>`;
            }
            
            statsDiv.innerHTML = statsHTML;
            
            // Reset form
            document.getElementById('bulk-upload-form').reset();
            
            // Reload students list
            if (typeof loadAllStudents === 'function') {
                setTimeout(() => loadAllStudents(), 1000);
            }
            
            showSuccess(`🎉 Successfully uploaded ${data.stats.successful} students!`);
            
            // Hide results after 10 seconds
            setTimeout(() => {
                resultsDiv.style.display = 'none';
            }, 10000);
            
        } else {
            const resultsDiv = document.getElementById('upload-results');
            const statsDiv = document.getElementById('upload-stats');
            
            resultsDiv.style.display = 'block';
            resultsDiv.style.background = '#fef2f2';
            resultsDiv.style.border = '1px solid #fca5a5';
            
            statsDiv.innerHTML = `
                <p style="color:#EF4444; font-weight:600;">❌ Upload Failed</p>
                <p style="margin:10px 0;">${data.message || 'Please check your file and try again'}</p>
            `;
            
            showError(data.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showError('Network error: ' + error.message);
    } finally {
        showLoading(false);
    }
});

// Load classes for dropdowns
async function loadClassesForStudents() {
    try {
        const response = await fetch(`${API_BASE_URL}/classes`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const bulkSelect = document.getElementById('bulk-class-select');
            const individualSelect = document.getElementById('student-class');
            
            [bulkSelect, individualSelect].forEach(select => {
                if (select) {
                    select.innerHTML = '<option value="">Choose a class...</option>';
                    data.data.forEach(cls => {
                        const option = document.createElement('option');
                        option.value = cls._id;
                        option.textContent = cls.className + (cls.nickname ? ` (${cls.nickname})` : '');
                        select.appendChild(option);
                    });
                }
            });
        }
    } catch (error) {
        console.error('Load classes error:', error);
    }
}

// Initialize students section
function initStudentsSection() {
    console.log('Initializing students section...');
    loadClassesForStudents();
    if (typeof loadAllStudents === 'function') {
        loadAllStudents();
    }
}

// Helper function to show loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

// Helper function to show success message
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        successDiv.style.padding = '15px';
        successDiv.style.background = '#f0fdf4';
        successDiv.style.border = '1px solid #86efac';
        successDiv.style.borderRadius = '8px';
        successDiv.style.marginBottom = '20px';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 5000);
    }
}

// Helper function to show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.style.padding = '15px';
        errorDiv.style.background = '#fef2f2';
        errorDiv.style.border = '1px solid #fca5a5';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.marginBottom = '20px';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Override or enhance showSection function
(function() {
    const originalShowSection = window.showSection;
    window.showSection = function(sectionName) {
        // Call original if it exists
        if (originalShowSection && typeof originalShowSection === 'function') {
            originalShowSection(sectionName);
        } else {
            // Fallback: hide all sections and show selected one
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            const targetSection = document.getElementById('section-' + sectionName);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        }
        
        // If students section, initialize it
        if (sectionName === 'students') {
            setTimeout(() => initStudentsSection(), 100);
        }
    };
})();

console.log('✅ Students bulk upload script loaded');