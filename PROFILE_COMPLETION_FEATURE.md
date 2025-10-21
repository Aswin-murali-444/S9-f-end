# Profile Completion Feature

This document describes the profile completion feature for service providers in the Nexus platform.

## Overview

The profile completion feature allows service providers with "pending_verification" status to complete their profile information through a guided multi-step form. Once completed, their status changes to "active" and they can start receiving service requests.

## Features

### 1. Profile Completion Modal
- **Multi-step form** with 5 steps:
  1. Personal Information (name, phone)
  2. Service Details (specialization, category, service, experience, hourly rate)
  3. Location Information (address, city, state, pincode)
  4. Professional Information (bio, qualifications, certifications, languages)
  5. Documents & Verification (profile photo, ID proof, address proof)

### 2. Automatic Detection
- Automatically detects when a service provider has "pending_verification" status
- Shows the profile completion modal on dashboard load
- Displays a verification notice in the profile tab

### 3. Form Validation
- Real-time validation for all required fields
- Step-by-step validation before proceeding
- Clear error messages and visual feedback

### 4. Database Integration
- Updates `user_profiles` table with personal information
- Updates `service_provider_details` table with professional information
- Changes user status from "pending_verification" to "active"

## Files Added/Modified

### Frontend Files
- `src/components/ProfileCompletionModal.jsx` - Main modal component
- `src/components/ProfileCompletionModal.css` - Modal styling
- `src/pages/dashboards/ServiceProviderDashboard.jsx` - Integration with dashboard
- `src/services/api.js` - API methods for profile completion

### Backend Files
- `routes/users.js` - Profile completion API endpoint

## API Endpoints

### POST /profile/complete
Completes a service provider's profile and changes status to active.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "9876543210",
  "specialization": "House Cleaning",
  "service_category_id": "uuid",
  "service_id": "uuid",
  "experience_years": 5,
  "hourly_rate": 500,
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "bio": "Professional cleaner with 5 years experience",
  "qualifications": "Diploma in Housekeeping",
  "certifications": "Safety Certified",
  "languages": ["English", "Hindi"],
  "availability": {
    "monday": {"start": "09:00", "end": "18:00", "available": true},
    // ... other days
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile completed successfully",
  "status": "active"
}
```

## Usage

### 1. Automatic Trigger
The modal automatically appears when:
- A service provider logs in with "pending_verification" status
- The dashboard loads and detects incomplete profile

### 2. Manual Trigger
Users can manually open the modal by:
- Clicking "Complete Profile" button in the profile tab
- This appears when status is "pending_verification"

### 3. Form Flow
1. User fills out each step with required information
2. Form validates each step before allowing progression
3. User can navigate back to previous steps
4. Final submission updates database and changes status
5. Dashboard refreshes to show updated status

## Database Schema

### user_profiles Table
- `first_name` - User's first name
- `last_name` - User's last name
- `phone` - Phone number
- `address` - Full address
- `city` - City name
- `state` - State name
- `pincode` - Postal code
- `bio` - Professional bio
- `qualifications` - Educational qualifications
- `certifications` - Professional certifications
- `languages` - Array of spoken languages

### service_provider_details Table
- `specialization` - Service specialization
- `service_category_id` - Foreign key to service_categories
- `service_id` - Foreign key to services
- `status` - Provider status (pending_verification → active)
- `experience_years` - Years of experience
- `hourly_rate` - Hourly service rate
- `availability` - JSON object with weekly availability

## Validation Rules

### Required Fields
- First name, last name, phone
- Specialization, service category, service
- Experience years, hourly rate
- Address, city, state, pincode

### Field Validation
- **Phone**: 10-digit Indian mobile number starting with 6-9
- **Experience**: 0-50 years
- **Hourly Rate**: ₹50-₹10,000
- **Pincode**: 6-digit Indian postal code
- **Address**: Minimum 10 characters

## Styling

The modal uses a modern, responsive design with:
- Step-by-step progress indicator
- Form validation with error states
- Mobile-responsive layout
- Smooth animations and transitions
- Professional color scheme matching the dashboard

## Error Handling

- Network errors are caught and displayed to user
- Validation errors show inline with form fields
- Database errors are logged and user-friendly messages shown
- Form state is preserved on errors

## Future Enhancements

- File upload for documents
- Photo upload with preview
- Location picker with map integration
- Social media profile links
- Portfolio/work samples upload
- Advanced availability scheduling
- Multi-language support
- Offline form completion

## Testing

To test the feature:
1. Create a service provider with "pending_verification" status
2. Login to the service provider dashboard
3. The profile completion modal should appear automatically
4. Fill out the form and submit
5. Verify status changes to "active" in database
6. Dashboard should refresh and show updated status

