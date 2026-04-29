// controllers/audioController.js - وحدة التحكم بالتلاوات الصوتية

const { pool } = require('../config/db');
const audioModel = require('../models/reciter');

// الحصول على قائمة القراء المتاحين
exports.getAllReciters = async (req, res) => {
  try {
    const reciters = await audioModel.getAllReciters();
    
    res.status(200).json({
      success: true,
      data: reciters
    });
  } catch (error) {
    console.error('خطأ في الحصول على قائمة القراء:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب قائمة القراء',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على معلومات قارئ محدد
exports.getReciterInfo = async (req, res) => {
  try {
    const reciterId = req.params.reciterId;
    
    const reciter = await audioModel.getReciterById(reciterId);
    
    if (!reciter) {
      return res.status(404).json({
        success: false,
        message: 'القارئ غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: reciter
    });
  } catch (error) {
    console.error(`خطأ في الحصول على معلومات القارئ ${req.params.reciterId}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب معلومات القارئ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على تلاوة سورة كاملة لقارئ محدد
exports.getSurahRecitation = async (req, res) => {
  try {
    const reciterId = req.params.reciterId;
    const surahNumber = parseInt(req.params.surahNumber);
    
    // التحقق من صحة المعلمات
    if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
      return res.status(400).json({
        success: false,
        message: 'رقم السورة غير صحيح. يجب أن يكون بين 1 و 114'
      });
    }
    
    // الحصول على التلاوة
    const recitation = await audioModel.getSurahRecitation(reciterId, surahNumber);
    
    if (!recitation) {
      return res.status(404).json({
        success: false,
        message: 'التلاوة غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: recitation
    });
  } catch (error) {
    console.error(`خطأ في الحصول على تلاوة السورة رقم ${req.params.surahNumber} للقارئ ${req.params.reciterId}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التلاوة',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على تلاوة آية محددة لقارئ محدد
exports.getAyahRecitation = async (req, res) => {
  try {
    const reciterId = req.params.reciterId;
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
    
    // الحصول على التلاوة
    const recitation = await audioModel.getAyahRecitation(reciterId, surahNumber, ayahNumber);
    
    if (!recitation) {
      return res.status(404).json({
        success: false,
        message: 'التلاوة غير موجودة'
      });
    }
    
    res.status(200).json({
      success: true,
      data: recitation
    });
  } catch (error) {
    console.error(`خطأ في الحصول على تلاوة الآية رقم ${req.params.ayahNumber} من السورة رقم ${req.params.surahNumber} للقارئ ${req.params.reciterId}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التلاوة',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على تلاوة مجموعة من الآيات لقارئ محدد
exports.getAyahRangeRecitation = async (req, res) => {
  try {
    const reciterId = req.params.reciterId;
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
    
    // الحصول على التلاوة
    const recitations = await audioModel.getAyahRangeRecitation(reciterId, surahNumber, startAyah, endAyah);
    
    res.status(200).json({
      success: true,
      data: recitations
    });
  } catch (error) {
    console.error(`خطأ في الحصول على تلاوة نطاق الآيات من ${req.params.startAyah} إلى ${req.params.endAyah} من السورة رقم ${req.params.surahNumber} للقارئ ${req.params.reciterId}:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التلاوة',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على تلاوة اليوم
exports.getRecitationOfDay = async (req, res) => {
  try {
    const recitationOfDay = await audioModel.getRecitationOfDay();
    
    res.status(200).json({
      success: true,
      data: recitationOfDay
    });
  } catch (error) {
    console.error('خطأ في الحصول على تلاوة اليوم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب تلاوة اليوم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على قائمة التلاوات المفضلة للمستخدم
exports.getFavoriteRecitations = async (req, res) => {
  try {
    // التحقق من وجود جلسة مستخدم
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به، يرجى تسجيل الدخول'
      });
    }
    
    const userId = req.session.user.id;
    
    // الحصول على التلاوات المفضلة
    const favorites = await audioModel.getFavoriteRecitations(userId);
    
    res.status(200).json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('خطأ في الحصول على التلاوات المفضلة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب التلاوات المفضلة',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// إضافة تلاوة إلى المفضلة
exports.addToFavorites = async (req, res) => {
  try {
    // التحقق من وجود جلسة مستخدم
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به، يرجى تسجيل الدخول'
      });
    }
    
    const userId = req.session.user.id;
    const { reciterId, surahNumber, ayahNumber } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!reciterId || !surahNumber) {
      return res.status(400).json({
        success: false,
        message: 'معرف القارئ ورقم السورة مطلوبان'
      });
    }
    
    // إضافة التلاوة إلى المفضلة
    await audioModel.addToFavorites(userId, reciterId, surahNumber, ayahNumber);
    
    res.status(200).json({
      success: true,
      message: 'تمت إضافة التلاوة إلى المفضلة بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إضافة التلاوة إلى المفضلة:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إضافة التلاوة إلى المفضلة',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// حذف تلاوة من المفضلة
exports.removeFromFavorites = async (req, res) => {
  try {
    // التحقق من وجود جلسة مستخدم
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به، يرجى تسجيل الدخول'
      });
    }
    
    const userId = req.session.user.id;
    const recitationId = req.params.recitationId;
    
    // حذف التلاوة من المفضلة
    await audioModel.removeFromFavorites(userId, recitationId);
    
    res.status(200).json({
      success: true,
      message: 'تم حذف التلاوة من المفضلة بنجاح'
    });
  } catch (error) {
    console.error(`خطأ في حذف التلاوة ${req.params.recitationId} من المفضلة:`, error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حذف التلاوة من المفضلة',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
