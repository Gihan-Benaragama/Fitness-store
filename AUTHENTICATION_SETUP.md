# FitZone Authentication & Admin Dashboard Setup Guide

## Overview
This guide explains the new login/register functionality and admin dashboard features added to FitZone.

## Features Added

### 1. User Authentication System
- **Register**: Users can create new accounts with:
  - First Name
  - Last Name
  - Email (unique)
  - Password
  - Phone (optional)
  - Address (optional)

- **Login**: Users can login with email and password
  - Users are redirected to home page after successful login
  - Admins are redirected to admin dashboard

### 2. Home Page Changes
- Added "Ready to Get Started?" section with Login/Register button
- Modal-based login/register form
- Smooth transitions and validation

### 3. Navbar Updates
- **For Non-Authenticated Users**: Shows "Login" button
- **For Authenticated Users**: 
  - Shows user dropdown with name
  - Access to profile and orders
  - Logout button
- **For Admin Users**: 
  - Additional "Admin" button in navbar
  - Quick access to admin dashboard

### 4. Admin Dashboard
Complete admin panel with:

#### Tabs:
1. **Overview**: Dashboard statistics
   - Total users count
   - Total products count
   - Total orders count
   - Quick stats with filtered data

2. **Users Management**
   - View all registered users
   - See user details: Name, Email, Phone, Role, Status
   - Identify admin vs regular users
   - See blocked/active status

3. **Products Management**
   - View all products
   - See product details: Name, Category, Price, Stock, Rating

4. **Orders Management**
   - Ready for order management features
   - Currently showing placeholder

## How to Use

### For Users:
1. **Register**:
   - Click "Login / Register" button on home page or navbar
   - Select "Register" tab
   - Fill in required fields (name, email, password)
   - Click Register
   - After successful registration, login with your credentials

2. **Login**:
   - Click "Login" button
   - Enter your email and password
   - Click Login
   - You'll be redirected to home page

3. **Logout**:
   - Click on your name in the navbar
   - Click "Logout"

### For Admins:
1. **Login as Admin**:
   - Use an admin account (see "Setting Up Admin Users" below)
   - You'll be automatically redirected to admin dashboard

2. **Access Dashboard**:
   - Click the "⚙️ Admin" button in the navbar
   - Or navigate directly to `/admin-dashboard`

3. **View Statistics**:
   - Click "📊 Overview" to see dashboard statistics
   - Quick access to key metrics

4. **Manage Users**:
   - Click "👥 Users"
   - View all registered users
   - See user roles and account status

5. **Manage Products**:
   - Click "📦 Products"
   - View all available products
   - See pricing and stock information

## Setting Up Admin Users

To create an admin user, you need to manually update the database:

### Using MongoDB CLI or Compass:
```javascript
// Find a user and update their isAdmin field
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

Or if the user doesn't exist, create one:
```javascript
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  password: "hashed_password_here", // Must be bcrypt hashed
  isAdmin: true,
  isBlocked: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## File Structure

### Frontend Changes:
```
frontend/src/
├── context/
│   └── AuthContext.js (NEW) - Authentication state management
├── components/
│   ├── LoginRegisterModal/ (NEW)
│   │   ├── LoginRegisterModal.js
│   │   └── LoginRegisterModal.css
│   └── Navbar/
│       ├── Navbar.js (UPDATED)
│       └── Navbar.css (UPDATED)
├── pages/
│   ├── Home/ (UPDATED)
│   ├── AdminDashboard/ (NEW)
│   │   ├── AdminDashboard.js
│   │   └── AdminDashboard.css
├── services/
│   └── api.js (UPDATED) - Added user management endpoints
└── App.js (UPDATED) - Added AuthProvider and admin route
```

## Authentication Flow

1. **Registration**:
   - User fills form → API call to POST `/api/users/register`
   - Password is hashed with bcrypt
   - User stored in database

2. **Login**:
   - User enters credentials → API call to POST `/api/users/login`
   - Backend validates password and returns JWT token
   - Token stored in localStorage
   - User info decoded from JWT and stored in AuthContext

3. **Protected Routes**:
   - AdminDashboard checks `isAdmin` in user context
   - If not admin, redirects to home page
   - Token is automatically added to API requests via interceptor

## JWT Token Structure

The JWT contains:
- `id`: User's MongoDB ID
- `email`: User's email
- `firstName`: User's first name
- `lastName`: User's last name
- `isAdmin`: Boolean indicating admin status
- `iat`: Issued at time
- `exp`: Expiration time (7 days)

## API Endpoints Used

### User Endpoints:
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)
- `PUT /api/users/block/:id` - Block/unblock user (admin)

### Product Endpoints (used in dashboard):
- `GET /api/products` - Get all products

## Customization Options

### To add more admin features:

1. **Add Edit Users**:
   - Add button in users table
   - Create edit modal
   - Call `PUT /api/users/:id`

2. **Add Delete Users**:
   - Add delete button with confirmation
   - Call `DELETE /api/users/:id`

3. **Add Block Users**:
   - Add block/unblock toggle
   - Call `PUT /api/users/block/:id`

4. **Add Product Management**:
   - Create similar tables for editing/deleting products
   - Add create product form

## Styling

- Primary color: `#ff6b35` (Orange)
- Secondary color: `#ff5722` (Deep Orange)
- Success color: `#4CAF50` (Green)
- Admin theme: Dark red header with accent colors

## Browser Support

Works on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Future Enhancements

1. Add product management CRUD operations
2. Add order management with status updates
3. Add analytics and charts
4. Add user activity logs
5. Add email notifications
6. Add role-based access control (multiple admin roles)
7. Add CSV export functionality
