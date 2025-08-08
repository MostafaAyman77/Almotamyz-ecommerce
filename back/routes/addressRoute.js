const express = require('express');

const {
    addAddress,
    removeAddress,
    getLoggedUserAddresses,
    updateAddress,
    getAddress,
} = require('../services/addressService');

const authService = require('../services/authService');

const {
    addAddressValidator,
    removeAddressValidator,
    updateAddressValidator,
    getAddressValidator,
} = require('../utils/validators/addressValidator');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));

router
    .route('/')
    .post(addAddressValidator, addAddress)
    .get(getLoggedUserAddresses);

router
    .route('/:addressId')
    .get(getAddressValidator, getAddress)
    .put(updateAddressValidator, updateAddress)
    .delete(removeAddressValidator, removeAddress);

module.exports = router;

