const router = require("express").Router();
const {signup,login, deleteUser, updatePassword, forgotPassword, resetPassword}=require('../Controllers/Cont')

router.post('/signup',signup);
router.post('/login',login);
router.delete('/delete',deleteUser);
router.put('/update-password',updatePassword);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password',resetPassword);

module.exports= router;