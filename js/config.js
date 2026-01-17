// API Configuration
const API_BASE_URL = 'https://institution-backend.onrender.com/api';

// API Endpoints
const API_ENDPOINTS = {
    // Auth
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    SET_PASSWORD: '/auth/set-password',
    INSTITUTION_LOGIN: '/auth/institution/login',
    STAFF_LOGIN: '/auth/staff/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    
    // Dashboard
    PROFILE: '/dashboard/profile',
    STATS: '/dashboard/stats',
    
    // Institution
    INSTITUTION_PROFILE: '/institution/profile',
    
    // ✅ STAFF ENDPOINTS (ADDED - THESE WERE MISSING!)
    STAFF_PROFILE: '/staff/profile',
    STAFF_ASSIGNMENTS: '/staff/assignments',
    
    // Designations
    DESIGNATIONS: '/designations',
    
    // Classes
    CLASSES: '/classes',
    
    // Staff
    STAFF: '/staff',
    
    // Subjects
    SUBJECTS: '/subjects',
    
    // Students
    STUDENTS: '/students',
    STUDENTS_BULK_UPLOAD: '/students/bulk-upload',
    STUDENTS_BY_CLASS: '/students/class',
    
    // Hierarchy
    HIERARCHY: '/hierarchy',
    
    // Mappings
    STAFF_CLASS_MAPPING: '/mappings/staff-class',
    CLASS_SUBJECT_MAPPING: '/mappings/class-subject',
    TEACHER_SUBJECT_MAPPING: '/mappings/teacher-subject',
    ALL_MAPPINGS: '/mappings/all',
    
    // Credentials
    CREDENTIALS: '/credentials',
    
    // Attendance
    ATTENDANCE: '/attendance'
};

// Constants
const INSTITUTION_TYPES = ['School', 'College', 'University'];

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Access Levels
const ACCESS_LEVELS = ['teacher', 'coordinator', 'admin'];