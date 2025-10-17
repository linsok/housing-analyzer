# Profile Feature Guide

## Overview
The Profile feature allows users (Renters, Property Owners, and Admins) to view and manage their personal information, change passwords, and update account settings.

---

## 🔧 Issue Fixed

**Problem**: Clicking "Profile" in the navbar was redirecting to the Home page instead of showing the user's profile.

**Solution**: Created a dedicated Profile page (`/profile`) with comprehensive user information management.

---

## 📍 Access

- **Route**: `/profile`
- **Navigation**: Click "Profile" in the navbar (available when logged in)
- **Protection**: Requires authentication (all logged-in users can access)

---

## 🎯 Features

### 1. **Profile Sidebar**

#### Profile Picture
- Display current profile picture or default avatar
- Upload/change profile picture (in edit mode)
- Circular avatar with camera icon for upload
- Supports image preview before saving

#### User Information Display
- Full name or username
- Username with @ prefix
- Role badge (Admin/Property Owner/Renter) with color coding:
  - **Admin**: Red badge
  - **Property Owner**: Green badge
  - **Renter**: Blue badge

#### Statistics
- **Verification Status**: Shows current verification state
  - Verified (green)
  - Pending (yellow)
  - Rejected (red)
- **Trust Score**: For property owners (0.00 - 5.00)
- **Member Since**: Account creation date

#### Navigation Tabs
- Profile Information
- Security Settings

---

### 2. **Profile Information Tab**

#### Edit Mode
- Click "Edit Profile" button to enable editing
- All fields become editable
- Profile picture upload becomes available
- "Save Changes" and "Cancel" buttons appear

#### Editable Fields

**Basic Information**:
- First Name
- Last Name

**Contact Information**:
- Email Address (with email icon)
- Phone Number (with phone icon)
  - Placeholder: +855 12 345 678

**Bio**:
- Multi-line text area
- Describe yourself
- Optional field

**Location**:
- City (with map pin icon)
- Country
- Full Address (multi-line)

#### Read-Only Account Information
- Username
- Role
- Joined Date
- Last Updated Date

#### Save Functionality
- Updates profile data via API
- Uploads profile picture if changed
- Updates local auth store
- Shows success/error messages
- Exits edit mode on successful save

---

### 3. **Security Tab**

#### Change Password Form
- **Current Password**: Required for verification
- **New Password**: Minimum 8 characters
- **Confirm New Password**: Must match new password

**Validation**:
- Current password must be correct
- New password minimum length: 8 characters
- New password and confirmation must match
- Shows error messages for validation failures

**Success Behavior**:
- Clears password form
- Shows success message
- Password updated in database

#### Owner Verification Status (Property Owners Only)
Displays verification information in a blue info box:

**Pending Status**:
- Message: "Your verification documents are being reviewed by our admin team. This usually takes 1-2 business days."

**Verified Status**:
- Message: "Your account is verified! You can now list properties and receive bookings."

**Rejected Status**:
- Message: "Your verification was rejected. Please contact support for more information."

---

## 🎨 UI/UX Features

### Design Elements
- **Two-column layout**: Sidebar + Main content
- **Responsive design**: Stacks on mobile devices
- **Card-based sections**: Clean, organized appearance
- **Color-coded badges**: Easy role identification
- **Icon integration**: Lucide icons throughout
- **Smooth transitions**: Hover effects and animations

### User Feedback
- **Success messages**: Green background with checkmark icon
- **Error messages**: Red background with alert icon
- **Auto-dismiss**: Messages disappear after 5 seconds
- **Loading states**: "Saving..." text during operations
- **Disabled states**: Form fields disabled when not in edit mode

### Visual Hierarchy
- Clear section headers
- Grouped related fields
- Proper spacing and padding
- Border separators for sections
- Consistent button styling

---

## 📊 User Information Displayed

### For All Users
- Username
- Email
- Full Name (First + Last)
- Phone Number
- Bio
- Address
- City
- Country
- Role
- Verification Status
- Account Creation Date
- Last Update Date

### Additional for Property Owners
- Trust Score (0.00 - 5.00)
- Verification Status Details
- Owner-specific verification information

---

## 🔐 Security Features

### Password Management
- Requires current password for changes
- Minimum 8 character requirement
- Password confirmation validation
- Secure password hashing on backend

### Data Protection
- Authentication required to access profile
- Users can only edit their own profile
- Profile picture upload validation
- Secure API endpoints

---

## 🔄 Workflow

### Viewing Profile
```
1. User clicks "Profile" in navbar
2. Profile page loads with user data
3. User sees all their information in read-only mode
4. User can switch between Profile and Security tabs
```

### Editing Profile
```
1. User clicks "Edit Profile" button
2. All fields become editable
3. User can upload new profile picture
4. User modifies desired fields
5. User clicks "Save Changes"
6. System validates and saves data
7. Success message appears
8. Profile returns to read-only mode
```

### Changing Password
```
1. User navigates to Security tab
2. User enters current password
3. User enters new password (min 8 chars)
4. User confirms new password
5. User clicks "Change Password"
6. System validates passwords
7. Password updated if valid
8. Success message appears
9. Form clears
```

---

## 🛠️ Technical Implementation

### Frontend Components

**File**: `frontend/src/pages/Profile.jsx`

**Key Features**:
- React hooks (useState, useEffect)
- Zustand auth store integration
- Form state management
- Image preview functionality
- Tab navigation
- Real-time validation
- API integration

**State Management**:
- `profile`: User profile data from API
- `formData`: Editable form fields
- `passwordData`: Password change form
- `editMode`: Toggle edit/view mode
- `activeTab`: Current tab selection
- `message`: Success/error messages
- `profilePictureFile`: Selected image file
- `profilePicturePreview`: Image preview URL

### Backend API

**File**: `backend/users/views.py`

**Endpoints**:

1. **Get Profile**
   - Method: `GET`
   - Endpoint: `/api/users/profile/`
   - Returns: Complete user profile data

2. **Update Profile**
   - Method: `PATCH`
   - Endpoint: `/api/users/profile/`
   - Accepts: Profile fields + profile picture
   - Returns: Updated profile data

3. **Change Password**
   - Method: `POST`
   - Endpoint: `/api/users/change_password/`
   - Accepts: `old_password`, `new_password`
   - Returns: Success message

**File**: `frontend/src/services/userService.js`

**Service Methods**:
- `getProfile()`: Fetch user profile
- `updateProfile(data)`: Update profile fields
- `updateProfilePicture(file)`: Upload profile picture
- `changePassword(data)`: Change password
- `getPreferences()`: Get user preferences
- `updatePreferences(data)`: Update preferences
- `uploadVerificationDocuments(data)`: Upload verification docs

---

## 📱 Responsive Design

### Desktop (lg and above)
- Two-column layout
- Sidebar: 1/3 width
- Main content: 2/3 width
- Full navigation visible

### Tablet (md)
- Two-column layout maintained
- Slightly narrower spacing
- Stacked form fields in some sections

### Mobile (sm and below)
- Single column layout
- Sidebar stacks above main content
- Full-width form fields
- Touch-friendly buttons
- Optimized spacing

---

## 🎯 Role-Specific Features

### Renter
- Basic profile information
- Contact details
- Password management
- No verification status

### Property Owner
- All renter features
- Trust score display
- Verification status section
- Owner verification details
- Document upload capability (future)

### Admin
- All features available
- Admin role badge
- Full profile management
- Can access Django admin panel

---

## 🔍 Validation Rules

### Profile Fields
- **Email**: Must be valid email format
- **Phone**: Optional, any format accepted
- **First/Last Name**: Optional
- **Bio**: Optional, max length handled by backend
- **Address**: Optional, multi-line text
- **City/Country**: Optional text fields

### Password Change
- **Current Password**: Required, must match existing
- **New Password**: 
  - Required
  - Minimum 8 characters
  - Cannot be same as current
- **Confirm Password**: Must match new password

### Profile Picture
- **Format**: Image files (jpg, png, etc.)
- **Size**: Handled by backend (recommended max 5MB)
- **Preview**: Shows before upload
- **Upload**: Only on save

---

## 💡 User Tips

### Profile Management
1. Keep your contact information up to date
2. Add a professional profile picture
3. Write a descriptive bio
4. Verify your email address
5. Complete all profile fields for better trust

### Security Best Practices
1. Use a strong password (8+ characters)
2. Change password regularly
3. Don't share your password
4. Keep contact information current
5. Review profile information periodically

### For Property Owners
1. Complete verification process
2. Upload required documents
3. Maintain high trust score
4. Keep business information updated
5. Respond to verification requests promptly

---

## 🐛 Troubleshooting

### Profile Not Loading
- Check internet connection
- Ensure you're logged in
- Refresh the page
- Clear browser cache

### Can't Save Changes
- Verify all required fields are filled
- Check email format is valid
- Ensure you're in edit mode
- Check for error messages

### Password Change Fails
- Verify current password is correct
- Ensure new password is 8+ characters
- Check passwords match
- Try logging out and back in

### Profile Picture Not Uploading
- Check file size (max 5MB recommended)
- Verify file is an image format
- Try a different image
- Check internet connection

---

## 🔗 Related Features

### Navigation
- Accessible from navbar "Profile" link
- Available on all pages when logged in
- Returns to previous page after updates

### Dashboard Integration
- Profile link in all dashboards
- Quick access from user menu
- Consistent across all user roles

### Authentication
- Must be logged in to access
- Redirects to login if not authenticated
- Maintains session after updates

---

## 📈 Future Enhancements

Planned improvements:
- Email verification system
- Two-factor authentication
- Social media profile links
- Profile completion percentage
- Activity log/history
- Privacy settings
- Notification preferences
- Profile visibility controls
- Export profile data
- Delete account option

---

## 🎓 For Developers

### Adding New Profile Fields

1. **Backend**:
   - Add field to User model
   - Run migrations
   - Update serializers

2. **Frontend**:
   - Add field to formData state
   - Add input field in JSX
   - Update handleInputChange if needed

### Customizing Validation

**Frontend**:
```javascript
// Add validation in handleSaveProfile
if (!formData.email.includes('@')) {
  showMessage('error', 'Invalid email');
  return;
}
```

**Backend**:
```python
# Add validation in serializer
def validate_phone(self, value):
    if value and not value.startswith('+'):
        raise serializers.ValidationError("Phone must start with +")
    return value
```

---

## 📞 Support

For issues or questions:
- Contact support through Support page
- Check USER_GUIDE.md for general help
- Review API_DOCUMENTATION.md for API details

---

**Last Updated**: October 2025
**Version**: 1.0
**Status**: ✅ Complete and Functional
