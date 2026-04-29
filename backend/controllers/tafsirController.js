// controllers/tafsirController.js - وحدة التحكم بالتفسير

const { pool } = require('../config/db');
const tafsirModel = require('../models/tafsir');

// الحصول على قائمة مصادر التفسير المتاحة
exports.getTafsirSources = async (req, res) => {
  try {
    const sources = await tafsirModel.getAllTafsirSources();
    
    res.status(200).json({
      success: true,
      data: sources
    });
  } catch (error) {
    console.error('خطأ في الحصول على مصادر التفسير:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب مصادر التفسير',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على تفسير آية محددة من مصدر محدد
exports.getAyahTafsir = async (req, res) => {
  try {
    const sourceId = req.params.sourceId;
    const surahNumber = parseInt(req.params.surahNumber);
    const ayahNumber = parseInt(req.params.ayahNumber);
    
    // التحقق من صحة المعلمات
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
    
    // الحصول على التفسير
    const tafsir = await tafsirModel.getAyahTafsir(sourceId, surahNumber, ayahNumber);
    
    if (!tafsir) {
      return res.status(404).json({
        success: false,
        message: 'التفسير غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: tafsir
    });
  } catch (error) {
    console.error(`خطأ في الحصول على تفسير الآية رقم ${req.params.ayahNumber} من السورة رقم ${req.params.surahNumber} من المصدر ${req.params.sourceId}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التفسير',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على تفسير سورة كاملة من مصدر محدد
exports.getSurahTafsir = async (req, res) => {
  try {
    const sourceId = req.params.sourceId;
    const surahNumber = parseInt(req.params.surahNumber);
    
    // التحقق من صحة المعلمات
    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({
        success: false,
        message: 'رقم السورة غير صحيح. يجب أن يكون بين 1 و 114'
      });
    }
    
    // الحصول على التفسير
    const tafsir = await tafsirModel.getSurahTafsir(sourceId, surahNumber);
    
    res.status(200).json({
      success: true,
      data: tafsir
    });
  } catch (error) {
    console.error(`خطأ في الحصول على تفسير السورة رقم ${req.params.surahNumber} من المصدر ${req.params.sourceId}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التفسير',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على تفسير مجموعة من الآيات من مصدر محدد
exports.getTafsirRange = async (req, res) => {
  try {
    const sourceId = req.params.sourceId;
    const surahNumber = parseInt(req.params.surahNumber);
    const startAyah = parseInt(req.params.startAyah);
    const endAyah = parseInt(req.params.endAyah);
    
    // التحقق من صحة المعلمات
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
    
    // الحصول على التفسير
    const tafsir = await tafsirModel.getTafsirRange(sourceId, surahNumber, startAyah, endAyah);
    
    res.status(200).json({
      success: true,
      data: tafsir
    });
  } catch (error) {
    console.error(`خطأ في الحصول على تفسير نطاق الآيات من ${req.params.startAyah} إلى ${req.params.endAyah} من السورة رقم ${req.params.surahNumber} من المصدر ${req.params.sourceId}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التفسير',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// البحث في التفسير
exports.searchTafsir = async (req, res) => {
  try {
    const query = req.query.q;
    const sourceId = req.query.sourceId;
    
    // التحقق من وجود نص البحث
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'يرجى تقديم نص للبحث'
      });
    }
    
    // البحث في التفسير
    const results = await tafsirModel.searchTafsir(query, sourceId);
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error(`خطأ في البحث عن "${req.query.q}" في التفسير:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء البحث في التفسير',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على تفسير صوتي لآية محددة
exports.getAudioTafsir = async (req, res) => {
  try {
    const surahNumber = parseInt(req.params.surahNumber);
    const ayahNumber = parseInt(req.params.ayahNumber);
    
    // التحقق من صحة المعلمات
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
    
    // الحصول على التفسير الصوتي
    const audioTafsir = await tafsirModel.getAudioTafsir(surahNumber, ayahNumber);
    
    if (!audioTafsir) {
      return res.status(404).json({
        success: false,
        message: 'التفسير الصوتي غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: audioTafsir
    });
  } catch (error) {
    console.error(`خطأ في الحصول على التفسير الصوتي للآية رقم ${req.params.ayahNumber} من السورة رقم ${req.params.surahNumber}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التفسير الصوتي',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
