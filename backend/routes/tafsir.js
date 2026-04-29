// routes/tafsir.js - طرق API للتفسير

const express = require('express');
const router = express.Router();
const tafsirController = require('../controllers/tafsirController');

// الحصول على قائمة مصادر التفسير المتاحة
router.get('/sources', tafsirController.getTafsirSources);

// الحصول على تفسير آية محددة من مصدر محدد
router.get('/:sourceId/ayah/:surahNumber/:ayahNumber', tafsirController.getAyahTafsir);

// الحصول على تفسير سورة كاملة من مصدر محدد
router.get('/:sourceId/surah/:surahNumber', tafsirController.getSurahTafsir);

// الحصول على تفسير مجموعة من الآيات من مصدر محدد
router.get('/:sourceId/range/:surahNumber/:startAyah/:endAyah', tafsirController.getTafsirRange);

// البحث في التفسير
router.get('/search', tafsirController.searchTafsir);

// الحصول على تفسير صوتي لآية محددة
router.get('/audio/:surahNumber/:ayahNumber', tafsirController.getAudioTafsir);

module.exports = router;
