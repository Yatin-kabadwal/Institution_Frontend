// Register.js - Registration Logic

document.addEventListener('DOMContentLoaded', function() {
    // Populate state dropdown
    const stateSelect = document.getElementById('state');
    populateDropdown(stateSelect, INDIAN_STATES);
    
    // Show/hide "Other Type" input based on selection
    const typeSelect = document.getElementById('type');
    const otherTypeContainer = document.getElementById('other-type-container');
    
    typeSelect.addEventListener('change', function() {
        if (this.value === 'Other') {
            otherTypeContainer.style.display = 'block';
            document.getElementById('other-type').required = true;
        } else {
            otherTypeContainer.style.display = 'none';
            document.getElementById('other-type').required = false;
        }
    });
    
    // Handle form submission
    const form = document.getElementById('register-form');
    form.addEventListener('submit', handleRegistration);
});

async function handleRegistration(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    let type = document.getElementById('type').value;
    const state = document.getElementById('state').value;
    const district = document.getElementById('district').value.trim();
    const city = document.getElementById('city').value.trim();
    const location = document.getElementById('location').value.trim();
    const mobile1 = document.getElementById('mobile1').value.trim();
    const mobile2 = document.getElementById('mobile2').value.trim();
    const email = document.getElementById('email').value.trim();
    const logoFile = document.getElementById('logo').files[0];
    
    // If "Other" type is selected, get the specified type
    if (type === 'Other') {
        type = document.getElementById('other-type').value.trim();
    }
    
    // Validate mobile numbers
    if (!validateMobile(mobile1)) {
        showError('Mobile Number 1 must be 10 digits');
        return;
    }
    
    if (mobile2 && !validateMobile(mobile2)) {
        showError('Mobile Number 2 must be 10 digits');
        return;
    }
    
    // Validate email
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    try {
        showLoading('Registering institution...');
        
        // Prepare FormData
        const formData = new FormData();
        formData.append('name', name);
        formData.append('type', type);
        
        // Address object
        const address = {
            state: state,
            district: district,
            city: city,
            location: location
        };
        formData.append('address', JSON.stringify(address));
        
        // Contacts object
        const contacts = {
            mobile1: mobile1,
            mobile2: mobile2 || null,
            email: email
        };
        formData.append('contacts', JSON.stringify(contacts));
        
        // Logo file (if uploaded)
        if (logoFile) {
            formData.append('logo', logoFile);
        }
        
        // Make API call
        const response = await apiPostFormData(API_ENDPOINTS.REGISTER, formData, false);
        
        hideLoading();
        
        if (response.success) {
            showSuccess(response.message);
            
            // Store institution code for OTP verification
            localStorage.setItem('pendingInstitutionCode', response.institutionCode);
            
            // Show OTP (for development - remove in production)
            alert('OTP: ' + response.otp + '\nInstitution Code: ' + response.institutionCode);
            
            // Redirect to OTP verification page after 2 seconds
            setTimeout(() => {
                window.location.href = 'verify-otp.html';
            }, 2000);
        }
        
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}