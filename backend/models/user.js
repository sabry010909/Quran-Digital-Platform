// models/user.js - نموذج المستخدمين

const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

// إنشاء مستخدم جديد
exports.createUser = async (userData) => {
  try {
    const { username, email, password, name } = userData;
    
    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // إنشاء استعلام SQL لإدخال المستخدم الجديد
    const query = `
      INSERT INTO users (username, email, password, name, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    // تنفيذ الاستعلام
    const [result] = await pool.execute(query, [username, email, hashedPassword, name]);
    
    // إرجاع بيانات المستخدم الجديد
    return {
      id: result.insertId,
      username,
      email,
      name
    };
  } catch (error) {
    console.error('خطأ في إنشاء مستخدم جديد:', error);
    throw error;
  }
};

// الحصول على مستخدم بواسطة البريد الإلكتروني
exports.getUserByEmail = async (email) => {
  try {
    // إنشاء استعلام SQL للبحث عن المستخدم
    const query = `
      SELECT * FROM users
      WHERE email = ?
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [email]);
    
    // إرجاع المستخدم إذا وجد
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`خطأ في البحث عن المستخدم بالبريد الإلكتروني ${email}:`, error);
    throw error;
  }
};

// الحصول على مستخدم بواسطة المعرف
exports.getUserById = async (userId) => {
  try {
    // إنشاء استعلام SQL للبحث عن المستخدم
    const query = `
      SELECT * FROM users
      WHERE id = ?
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [userId]);
    
    // إرجاع المستخدم إذا وجد
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`خطأ في البحث عن المستخدم بالمعرف ${userId}:`, error);
    throw error;
  }
};

// تحديث معلومات المستخدم
exports.updateUser = async (userId, userData) => {
  try {
    const { name, username } = userData;
    
    // إنشاء استعلام SQL لتحديث المستخدم
    const query = `
      UPDATE users
      SET name = ?, username = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    // تنفيذ الاستعلام
    await pool.execute(query, [name, username, userId]);
    
    // الحصول على المستخدم المحدث
    return await exports.getUserById(userId);
  } catch (error) {
    console.error(`خطأ في تحديث المستخدم بالمعرف ${userId}:`, error);
    throw error;
  }
};

// تحديث كلمة المرور
exports.updatePassword = async (userId, newPassword) => {
  try {
    // تشفير كلمة المرور الجديدة
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // إنشاء استعلام SQL لتحديث كلمة المرور
    const query = `
      UPDATE users
      SET password = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    // تنفيذ الاستعلام
    await pool.execute(query, [hashedPassword, userId]);
    
    return true;
  } catch (error) {
    console.error(`خطأ في تحديث كلمة المرور للمستخدم بالمعرف ${userId}:`, error);
    throw error;
  }
};

// حفظ تقدم الحفظ
exports.saveMemorizationProgress = async (userId, surahNumber, ayahNumber, status) => {
  try {
    // التحقق من وجود تقدم سابق
    const checkQuery = `
      SELECT * FROM memorization_progress
      WHERE user_id = ? AND surah_number = ? AND ayah_number = ?
    `;
    
    const [existingProgress] = await pool.execute(checkQuery, [userId, surahNumber, ayahNumber]);
    
    if (existingProgress.length > 0) {
      // تحديث التقدم الموجود
      const updateQuery = `
        UPDATE memorization_progress
        SET status = ?, updated_at = NOW()
        WHERE user_id = ? AND surah_number = ? AND ayah_number = ?
      `;
      
      await pool.execute(updateQuery, [status, userId, surahNumber, ayahNumber]);
    } else {
      // إنشاء تقدم جديد
      const insertQuery = `
        INSERT INTO memorization_progress (user_id, surah_number, ayah_number, status, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      await pool.execute(insertQuery, [userId, surahNumber, ayahNumber, status]);
    }
    
    return true;
  } catch (error) {
    console.error(`خطأ في حفظ تقدم الحفظ للمستخدم ${userId} للآية ${ayahNumber} من السورة ${surahNumber}:`, error);
    throw error;
  }
};

// الحصول على تقدم الحفظ
exports.getMemorizationProgress = async (userId) => {
  try {
    // إنشاء استعلام SQL للحصول على تقدم الحفظ
    const query = `
      SELECT * FROM memorization_progress
      WHERE user_id = ?
      ORDER BY surah_number, ayah_number
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [userId]);
    
    return rows;
  } catch (error) {
    console.error(`خطأ في الحصول على تقدم الحفظ للمستخدم ${userId}:`, error);
    throw error;
  }
};

// الحصول على تقدم الحفظ لسورة محددة
exports.getMemorizationProgressBySurah = async (userId, surahNumber) => {
  try {
    // إنشاء استعلام SQL للحصول على تقدم الحفظ لسورة محددة
    const query = `
      SELECT * FROM memorization_progress
      WHERE user_id = ? AND surah_number = ?
      ORDER BY ayah_number
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [userId, surahNumber]);
    
    return rows;
  } catch (error) {
    console.error(`خطأ في الحصول على تقدم الحفظ للمستخدم ${userId} للسورة ${surahNumber}:`, error);
    throw error;
  }
};

// حفظ إعدادات المستخدم
exports.saveUserSettings = async (userId, settings) => {
  try {
    // التحقق من وجود إعدادات سابقة
    const checkQuery = `
      SELECT * FROM user_settings
      WHERE user_id = ?
    `;
    
    const [existingSettings] = await pool.execute(checkQuery, [userId]);
    
    // تحويل الإعدادات إلى JSON
    const settingsJson = JSON.stringify(settings);
    
    if (existingSettings.length > 0) {
      // تحديث الإعدادات الموجودة
      const updateQuery = `
        UPDATE user_settings
        SET settings = ?, updated_at = NOW()
        WHERE user_id = ?
      `;
      
      await pool.execute(updateQuery, [settingsJson, userId]);
    } else {
      // إنشاء إعدادات جديدة
      const insertQuery = `
        INSERT INTO user_settings (user_id, settings, created_at)
        VALUES (?, ?, NOW())
      `;
      
      await pool.execute(insertQuery, [userId, settingsJson]);
    }
    
    return true;
  } catch (error) {
    console.error(`خطأ في حفظ إعدادات المستخدم ${userId}:`, error);
    throw error;
  }
};

// الحصول على إعدادات المستخدم
exports.getUserSettings = async (userId) => {
  try {
    // إنشاء استعلام SQL للحصول على إعدادات المستخدم
    const query = `
      SELECT * FROM user_settings
      WHERE user_id = ?
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [userId]);
    
    // إرجاع الإعدادات إذا وجدت
    if (rows.length > 0) {
      return JSON.parse(rows[0].settings);
    } else {
      // إرجاع إعدادات افتراضية
      return {
        theme: 'light',
        fontSize: 'medium',
        reciterPreference: 'Mishary Rashid Alafasy',
        autoPlayNext: true,
        repeatAyah: false,
        repeatCount: 1
      };
    }
  } catch (error) {
    console.error(`خطأ في الحصول على إعدادات المستخدم ${userId}:`, error);
    throw error;
  }
};
