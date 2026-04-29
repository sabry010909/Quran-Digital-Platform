// routes/user.js - طرق API للمستخدمين

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// تسجيل مستخدم جديد
router.post('/register', userController.registerUser);

// تسجيل الدخول
router.post('/login', userController.loginUser);

// تسجيل الخروج
router.post('/logout', userController.logoutUser);

// الحصول على معلومات المستخدم الحالي
router.get('/profile', userController.getUserProfile);

// تحديث معلومات المستخدم
router.put('/profile', userController.updateUserProfile);

// تغيير كلمة المرور
router.put('/change-password', userController.changePassword);

// حفظ تقدم الحفظ
router.post('/memorization-progress', userController.saveMemorizationProgress);

// الحصول على تقدم الحفظ
router.get('/memorization-progress', userController.getMemorizationProgress);

// حفظ إعدادات المستخدم
router.post('/settings', userController.saveUserSettings);

// الحصول على إعدادات المستخدم
router.get('/settings', userController.getUserSettings);

module.exports = router;
