// routes/quran.js - طرق API للقرآن الكريم

const express = require('express');
const router = express.Router();
const quranController = require('../controllers/quranController');

// الحصول على قائمة السور
router.get('/surahs', quranController.getAllSurahs);

// الحصول على سورة محددة بالرقم
router.get('/surah/:surahNumber', quranController.getSurahByNumber);

// الحصول على آية محددة
router.get('/ayah/:surahNumber/:ayahNumber', quranController.getAyahByNumber);

// الحصول على مجموعة من الآيات
router.get('/ayahs/:surahNumber/:startAyah/:endAyah', quranController.getAyahRange);

// البحث في القرآن
router.get('/search', quranController.searchQuran);

// الحصول على آية اليوم
router.get('/ayah-of-day', quranController.getAyahOfDay);

// الحصول على صفحة محددة من المصحف
router.get('/page/:pageNumber', quranController.getQuranPage);

// الحصول على جزء محدد من القرآن
router.get('/juz/:juzNumber', quranController.getJuzByNumber);

module.exports = router;
