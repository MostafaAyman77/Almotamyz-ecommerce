const express = require('express');
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
  updateLoggedUserPasswordValidator,
  addAddressValidator,
  removeAddressValidator,
  getUsersValidator,
} = require('../utils/validators/userValidator');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
  deactivateUser,
  activateUser,
  verifyUser,
  getUsersStatsByRole,
  getActiveUsersCount,
  getVerifiedUsersCount,
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require('../services/userService');

const authService = require('../services/authService');
const { userRole } = require('../enum');

const router = express.Router();

// Apply authentication to all routes
router.use(authService.protect);

// ===================================
// Logged-in User Routes (Self-Management)
// ===================================

// Get logged user profile
router.get('/getMe', getLoggedUserData, getUser);

// Update logged user password
router.put(
  '/changeMyPassword',
  updateLoggedUserPasswordValidator,
  updateLoggedUserPassword
);

// Update logged user data
router.put(
  '/updateMe',
  uploadUserImage,
  resizeImage,
  updateLoggedUserValidator,
  updateLoggedUserData
);

// Deactivate logged user account
router.delete('/deleteMe', deleteLoggedUserData);

// Logged user addresses management
router
  .route('/addresses')
  .get(getLoggedUserAddresses)
  .post(addAddressValidator, addAddress);

router.delete('/addresses/:addressId', removeAddressValidator,removeAddress);

// ===================================
// Admin/Manager Statistics Routes
// ===================================

// Get users statistics by role
router.get(
  '/stats/roles',
  authService.allowedTo(userRole.admin, userRole.manager),
  getUsersStatsByRole
);

// Get active/inactive users count
router.get(
  '/stats/active',
  authService.allowedTo(userRole.admin, userRole.manager),
  getActiveUsersCount
);

// Get verified/unverified users count
router.get(
  '/stats/verified',
  authService.allowedTo(userRole.admin, userRole.manager),
  getVerifiedUsersCount
);

// ===================================
// Admin/Manager User Management Routes
// ===================================

// Change user password (admin action)
router.put(
  '/changePassword/:id',
  authService.allowedTo(userRole.admin, userRole.manager),
  changeUserPasswordValidator,
  changeUserPassword
);

// Deactivate user
router.put(
  '/deactivate/:id',
  authService.allowedTo(userRole.admin, userRole.manager),
  getUserValidator,
  deactivateUser
);

// Activate user
router.put(
  '/activate/:id',
  authService.allowedTo(userRole.admin, userRole.manager),
  getUserValidator,
  activateUser
);

// Verify user email
router.put(
  '/verify/:id',
  authService.allowedTo(userRole.admin, userRole.manager),
  getUserValidator,
  verifyUser
);

// Get all users / Create user
router
  .route('/')
  .get(
    authService.allowedTo(userRole.admin, userRole.manager),
    getUsersValidator,
    getUsers
  )
  .post(
    authService.allowedTo(userRole.admin, userRole.manager),
    // uploadUserImage,
    // resizeImage,
    createUserValidator,
    createUser
  );

// Get, Update, Delete specific user
router
  .route('/:id')
  .get(
    authService.allowedTo(userRole.admin, userRole.manager),
    getUserValidator,
    getUser
  )
  .put(
    authService.allowedTo(userRole.admin, userRole.manager),
    // uploadUserImage,
    // resizeImage,
    updateUserValidator,
    updateUser
  )
  .delete(
    authService.allowedTo(userRole.admin, userRole.manager),
    deleteUserValidator,
    deleteUser
  );

module.exports = router;