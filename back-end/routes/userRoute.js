const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

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
} = require("../services/userService");

const authService = require("../services/authService");
const { userRole } = require("../enum.js");

const router = express.Router();

// Apply protection to all routes
router.use(authService.protect);

// User routes (for logged-in users)
router.get("/getMe",getLoggedUserData, getUser);
router.put("/changeMyPassword", updateLoggedUserPassword);
router.put("/updateMe", updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMe", deleteLoggedUserData);

// Admin routes (require admin/manager role)
router.put(
  "/changePassword/:id",
  authService.allowedTo("admin", "manager"),
  changeUserPasswordValidator,
  changeUserPassword
);

router
  .route("/")
  .get(authService.allowedTo("admin", "manager"), getUsers)
  .post(
    authService.allowedTo("admin", "manager"),
    uploadUserImage,
    resizeImage,
    createUserValidator,
    createUser
  );

// Parameterized routes for admin operations
router
  .route("/:id")
  .get(authService.allowedTo("admin", "manager"), getUserValidator, getUser)
  .put(
    authService.allowedTo("admin", "manager"),
    uploadUserImage,
    resizeImage,
    updateUserValidator,
    updateUser
  )
  .delete(
    authService.allowedTo("admin", "manager"),
    deleteUserValidator,
    deleteUser
  );

module.exports = router;
