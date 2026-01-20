// Register.js - Registration Logic (FIXED FOR JSON)

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Register page initialized');
    
    // Populate state dropdown
    const stateSelect = document.getElementById('state');
    populateDropdown(stateSelect, INDIAN_STATES);
    
    // Show/hide "Other Type" input based on selection
    const typeSelect = document.getElementById('type');
    const otherTypeContainer = document.getElementById('other-type-container');
    
    if (typeSelect && otherTypeContainer) {
        typeSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
                otherTypeContainer.style.display = 'block';
                document.getElementById('other-type').required = true;
            } else {
                otherTypeContainer.style.display = 'none';
                document.getElementById('other-type').required = false;
            }
        });
    }
    
    // Handle form submission
    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', handleRegistration);
        console.log('✅ Registration form handler attached');
    } else {
        console.error('❌ Registration form not found');
    }
});

async function handleRegistration(e) {
    e.preventDefault();
    
    console.log('📝 Starting registration process...');
    
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
    
    // If "Other" type is selected, get the specified type
    if (type === 'Other') {
        const otherTypeInput = document.getElementById('other-type');
        if (otherTypeInput) {
            type = otherTypeInput.value.trim();
        }
    }
    
    // Validate mobile numbers
    if (!validateMobile(mobile1)) {
        showError('Mobile Number 1 must be a valid 10-digit number');
        return;
    }
    
    if (mobile2 && !validateMobile(mobile2)) {
        showError('Mobile Number 2 must be a valid 10-digit number');
        return;
    }
    
    // Validate email
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    try {
        showLoading('Registering your institution...');
        
        // ✅ FIXED: Send as JSON object, not FormData
        const registrationData = {
            name: name,
            type: type,
            address: {
                state: state,
                district: district,
                city: city,
                location: location
            },
            contacts: {
                mobile1: mobile1,
                mobile2: mobile2 || '',
                email: email
            }
        };
        
        console.log('📤 Sending registration data:', registrationData);
        
        // ✅ FIXED: Use apiPost instead of apiPostFormData
        const response = await apiPost(API_ENDPOINTS.REGISTER, registrationData, false);
        
        hideLoading();
        
        console.log('✅ Registration response:', response);
        
        if (response.success) {
            showSuccess(response.message || 'Registration successful!');
            
            // Store institution code for OTP verification
            if (response.institutionCode) {
                localStorage.setItem('pendingInstitutionCode', response.institutionCode);
                localStorage.setItem('pendingEmail', email);
                console.log('✅ Stored institution code:', response.institutionCode);
            }
            
            // Show OTP in console for development
            if (response.otp) {
                console.log('🔐 OTP:', response.otp);
                console.log('🏢 Institution Code:', response.institutionCode);
            }
            
            // Redirect to OTP verification page after 2 seconds
            setTimeout(() => {
                window.location.href = 'verify-otp.html';
            }, 2000);
        } else {
            showError(response.message || 'Registration failed');
        }
        
    } catch (error) {
        hideLoading();
        console.error('❌ Registration error:', error);
        showError(error.message || 'Registration failed. Please try again.');
    }
}

console.log('✅ Register.js loaded successfully');