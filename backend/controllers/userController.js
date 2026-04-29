// controllers/userController.js - وحدة التحكم بالمستخدمين

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const userModel = require('../models/user');

// تسجيل مستخدم جديد
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول (اسم المستخدم، البريد الإلكتروني، كلمة المرور) مطلوبة'
      });
    }
    
    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مسجل بالفعل'
      });
    }
    
    // إنشاء المستخدم الجديد
    const newUser = await userModel.createUser({
      username,
      email,
      password, // سيتم تشفير كلمة المرور في نموذج المستخدم
      name: name || username
    });
    
    // إنشاء رمز الوصول (JWT)
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET || 'quran_website_jwt_secret',
      { expiresIn: '7d' }
    );
    
    // إعداد جلسة المستخدم
    req.session.user = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    };
    
    res.status(201).json({
      success: true,
      message: 'تم تسجيل المستخدم بنجاح',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name
        },
        token
      }
    });
  } catch (error) {
    console.error('خطأ في تسجيل المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل المستخدم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// تسجيل الدخول
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      });
    }
    
    // البحث عن المستخدم
    const user = await userModel.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }
    
    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }
    
    // إنشاء رمز الوصول (JWT)
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'quran_website_jwt_secret',
      { expiresIn: '7d' }
    );
    
    // إعداد جلسة المستخدم
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    
    res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name
        },
        token
      }
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// تسجيل الخروج
exports.logoutUser = (req, res) => {
  try {
    // مسح جلسة المستخدم
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'حدث خطأ أثناء تسجيل الخروج',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'تم تسجيل الخروج بنجاح'
      });
    });
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الخروج',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على معلومات المستخدم الحالي
exports.getUserProfile = async (req, res) => {
  try {
    // التحقق من وجود جلسة مستخدم
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به، يرجى تسجيل الدخول'
      });
    }
    
    const userId = req.session.user.id;
    
    // الحصول على معلومات المستخدم
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على معلومات المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب معلومات المستخدم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// تحديث معلومات المستخدم
exports.updateUserProfile = async (req, res) => {
  try {
    // التحقق من وجود جلسة مستخدم
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به، يرجى تسجيل الدخول'
      });
    }
    
    const userId = req.session.user.id;
    const { name, username } = req.body;
    
    // تحديث معلومات المستخدم
    const updatedUser = await userModel.updateUser(userId, { name, username });
    
    res.status(200).json({
      success: true,
      message: 'تم تحديث معلومات المستخدم بنجاح',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name
      }
    });
  } catch (error) {
    console.error('خطأ في تحديث معلومات المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث معلومات المستخدم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// تغيير كلمة المرور
exports.changePassword = async (req, res) => {
  try {
    // التحقق من وجود جلسة مستخدم
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به، يرجى تسجيل الدخول'
      });
    }
    
    const userId = req.session.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية والجديدة مطلوبة'
      });
    }
    
    // الحصول على معلومات المستخدم
    const user = await userModel.getUserById(userId);
    
    // التحقق من كلمة المرور الحالية
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }
    
    // تحديث كلمة المرور
    await userModel.updatePassword(userId, newPassword);
    
    res.status(200).json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تغيير كلمة المرور:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تغيير كلمة المرور',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// حفظ تقدم الحفظ
exports.saveMemorizationProgress = async (req, res) => {
  try {
    // التحقق من وجود جلسة مستخدم
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به، يرجى تسجيل الدخول'
      });
    }
    
    const userId = req.session.user.id;
    const { surahNumber, ayahNumber, status } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!surahNumber || !ayahNumber || !status) {
      return res.status(400).json({
        success: false,
        message: 'رقم السورة ورقم الآية والحالة مطلوبة'
      });
    }
    
    // حفظ تقدم الحفظ
    await userModel.saveMemorizationProgress(userId, surahNumber, ayahNumber, status);
    
    res.status(200).json({
      success: true,
      message: 'تم حفظ تقدم الحفظ بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حفظ تقدم الحفظ:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حفظ تقدم الحفظ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على تقدم الحفظ
exports.getMemorizationProgress = async (req, res) => {
  try {
    // التحقق من وجود جلسة مستخدم
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به، يرجى تسجيل الدخول'
      });
    }
    
    const userId = req.session.user.id;
    const { surahNumber } = req.query;
    
    let progress;
    
    // الحصول على تقدم الحفظ لسورة محددة أو لجميع السور
    if (surahNumber) {
      progress = await userModel.getMemorizationProgressBySurah(userId, surahNumber);
    } else {
      progress = await userModel.getMemorizationProgress(userId);
    }
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('خطأ في الحصول على تقدم الحفظ:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب تقدم الحفظ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// حفظ إعدادات المستخدم
exports.saveUserSettings = async (req, res) => {
  try {
    // التحقق من وجود جلسة مستخدم
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به، يرجى تسجيل الدخول'
      });
    }
    
    const userId = req.session.user.id;
    const { settings } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'الإعدادات مطلوبة'
      });
    }
    
    // حفظ إعدادات المستخدم
    await userModel.saveUserSettings(userId, settings);
    
    res.status(200).json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حفظ إعدادات المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حفظ الإعدادات',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// الحصول على إعدادات المستخدم
exports.getUserSettings = async (req, res) => {
  try {
    // التحقق من وجود جلسة مستخدم
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به، يرجى تسجيل الدخول'
      });
    }
    
    const userId = req.session.user.id;
    
    // الحصول على إعدادات المستخدم
    const settings = await userModel.getUserSettings(userId);
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('خطأ في الحصول على إعدادات المستخدم:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإعدادات',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
