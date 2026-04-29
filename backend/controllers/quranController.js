// controllers/quranController.js - وحدة التحكم بالقرآن الكريم

const { pool } = require('../config/db');
const quranModel = require('../models/verse');

// الحصول على قائمة السور
exports.getAllSurahs = async (req, res) => {
  try {
    const surahs = await quranModel.getAllSurahs();
    res.status(200).json({
      success: true,
      data: surahs
    });
  } catch (error) {
    console.error('خطأ في الحصول على قائمة السور:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب قائمة السور',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على سورة محددة بالرقم
exports.getSurahByNumber = async (req, res) => {
  try {
    const surahNumber = parseInt(req.params.surahNumber);
    
    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({
        success: false,
        message: 'رقم السورة غير صحيح. يجب أن يكون بين 1 و 114'
      });
    }
    
    const surah = await quranModel.getSurahByNumber(surahNumber);
    
    if (!surah) {
      return res.status(404).json({
        success: false,
        message: 'السورة غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: surah
    });
  } catch (error) {
    console.error(`خطأ في الحصول على السورة رقم ${req.params.surahNumber}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب السورة',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على آية محددة
exports.getAyahByNumber = async (req, res) => {
  try {
    const surahNumber = parseInt(req.params.surahNumber);
    const ayahNumber = parseInt(req.params.ayahNumber);
    
    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({
        success: false,
        message: 'رقم السورة غير صحيح. يجب أن يكون بين 1 و 114'
      });
    }
    
    if (isNaN(ayahNumber) || ayahNumber < 1) {
      return res.status(400).json({
        success: false,
        message: 'رقم الآية غير صحيح'
      });
    }
    
    const ayah = await quranModel.getAyahByNumber(surahNumber, ayahNumber);
    
    if (!ayah) {
      return res.status(404).json({
        success: false,
        message: 'الآية غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: ayah
    });
  } catch (error) {
    console.error(`خطأ في الحصول على الآية رقم ${req.params.ayahNumber} من السورة رقم ${req.params.surahNumber}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الآية',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على مجموعة من الآيات
exports.getAyahRange = async (req, res) => {
  try {
    const surahNumber = parseInt(req.params.surahNumber);
    const startAyah = parseInt(req.params.startAyah);
    const endAyah = parseInt(req.params.endAyah);
    
    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({
        success: false,
        message: 'رقم السورة غير صحيح. يجب أن يكون بين 1 و 114'
      });
    }
    
    if (isNaN(startAyah) || startAyah < 1 || isNaN(endAyah) || endAyah < startAyah) {
      return res.status(400).json({
        success: false,
        message: 'نطاق الآيات غير صحيح'
      });
    }
    
    const ayahs = await quranModel.getAyahRange(surahNumber, startAyah, endAyah);
    
    res.status(200).json({
      success: true,
      data: ayahs
    });
  } catch (error) {
    console.error(`خطأ في الحصول على نطاق الآيات من ${req.params.startAyah} إلى ${req.params.endAyah} من السورة رقم ${req.params.surahNumber}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب نطاق الآيات',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// البحث في القرآن
exports.searchQuran = async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم نص للبحث'
      });
    }
    
    const results = await quranModel.searchQuran(query);
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error(`خطأ في البحث عن "${req.query.q}":`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء البحث في القرآن',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على آية اليوم
exports.getAyahOfDay = async (req, res) => {
  try {
    const ayahOfDay = await quranModel.getAyahOfDay();
    
    res.status(200).json({
      success: true,
      data: ayahOfDay
    });
  } catch (error) {
    console.error('خطأ في الحصول على آية اليوم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب آية اليوم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على صفحة محددة من المصحف
exports.getQuranPage = async (req, res) => {
  try {
    const pageNumber = parseInt(req.params.pageNumber);
    
    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > 604) {
      return res.status(400).json({
        success: false,
        message: 'رقم الصفحة غير صحيح. يجب أن يكون بين 1 و 604'
      });
    }
    
    const page = await quranModel.getQuranPage(pageNumber);
    
    res.status(200).json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error(`خطأ في الحصول على الصفحة رقم ${req.params.pageNumber}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب صفحة المصحف',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على جزء محدد من القرآن
exports.getJuzByNumber = async (req, res) => {
  try {
    const juzNumber = parseInt(req.params.juzNumber);
    
    if (isNaN(juzNumber) || juzNumber < 1 || juzNumber > 30) {
      return res.status(400).json({
        success: false,
        message: 'رقم الجزء غير صحيح. يجب أن يكون بين 1 و 30'
      });
    }
    
    const juz = await quranModel.getJuzByNumber(juzNumber);
    
    res.status(200).json({
      success: true,
      data: juz
    });
  } catch (error) {
    console.error(`خطأ في الحصول على الجزء رقم ${req.params.juzNumber}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الجزء',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
