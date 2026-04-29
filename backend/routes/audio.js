// routes/audio.js - طرق API للتلاوات الصوتية

const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');

// الحصول على قائمة القراء المتاحين
router.get('/reciters', audioController.getAllReciters);

// الحصول على معلومات قارئ محدد
router.get('/reciter/:reciterId', audioController.getReciterInfo);

// الحصول على تلاوة سورة كاملة لقارئ محدد
router.get('/recitation/:reciterId/surah/:surahNumber', audioController.getSurahRecitation);

// الحصول على تلاوة آية محددة لقارئ محدد
router.get('/recitation/:reciterId/ayah/:surahNumber/:ayahNumber', audioController.getAyahRecitation);

// الحصول على تلاوة مجموعة من الآيات لقارئ محدد
router.get('/recitation/:reciterId/range/:surahNumber/:startAyah/:endAyah', audioController.getAyahRangeRecitation);

// الحصول على تلاوة اليوم
router.get('/recitation-of-day', audioController.getRecitationOfDay);

// الحصول على قائمة التلاوات المفضلة للمستخدم
router.get('/favorites', audioController.getFavoriteRecitations);

// إضافة تلاوة إلى المفضلة
router.post('/favorites', audioController.addToFavorites);

// حذف تلاوة من المفضلة
router.delete('/favorites/:recitationId', audioController.removeFromFavorites);

module.exports = router;
