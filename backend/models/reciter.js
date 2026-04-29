// models/reciter.js - نموذج القراء والتلاوات الصوتية

const { pool } = require('../config/db');
const axios = require('axios');

// الحصول على قائمة القراء المتاحين
exports.getAllReciters = async () => {
  try {
    // إنشاء استعلام SQL للحصول على القراء
    const query = `
      SELECT * FROM reciters
      ORDER BY name_ar
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query);
    
    // إذا لم تكن هناك بيانات في قاعدة البيانات، نقوم بإرجاع قراء افتراضيين
    if (rows.length === 0) {
      return [
        {
          id: 'mishari-rashid-alafasy',
          name: 'مشاري راشد العفاسي',
          name_en: 'Mishari Rashid Alafasy',
          style: 'مرتل',
          bio: 'قارئ كويتي مشهور، ولد عام 1976م، وهو إمام وخطيب في مسجد الراشد بالكويت',
          cover_url: '/assets/images/reciters/alafasy.jpg'
        },
        {
          id: 'abdul-basit-abdul-samad',
          name: 'عبد الباسط عبد الصمد',
          name_en: 'Abdul Basit Abdul Samad',
          style: 'مرتل ومجود',
          bio: 'قارئ مصري مشهور، ولد عام 1927م وتوفي عام 1988م، اشتهر بصوته العذب وإتقانه لأحكام التجويد',
          cover_url: '/assets/images/reciters/abdul-basit.jpg'
        },
        {
          id: 'mahmoud-khalil-al-husary',
          name: 'محمود خليل الحصري',
          name_en: 'Mahmoud Khalil Al-Husary',
          style: 'مرتل ومجود',
          bio: 'قارئ مصري مشهور، ولد عام 1917م وتوفي عام 1980م، كان شيخ عموم المقارئ المصرية',
          cover_url: '/assets/images/reciters/al-husary.jpg'
        },
        {
          id: 'muhammad-siddiq-al-minshawi',
          name: 'محمد صديق المنشاوي',
          name_en: 'Muhammad Siddiq Al-Minshawi',
          style: 'مرتل ومجود',
          bio: 'قارئ مصري مشهور، ولد عام 1920م وتوفي عام 1969م، اشتهر بالتلاوة المجودة',
          cover_url: '/assets/images/reciters/al-minshawi.jpg'
        },
        {
          id: 'maher-al-muaiqly',
          name: 'ماهر المعيقلي',
          name_en: 'Maher Al-Muaiqly',
          style: 'مرتل',
          bio: 'قارئ سعودي، ولد عام 1969م، وهو إمام وخطيب في المسجد الحرام بمكة المكرمة',
          cover_url: '/assets/images/reciters/al-muaiqly.jpg'
        }
      ];
    }
    
    return rows;
  } catch (error) {
    console.error('خطأ في الحصول على قائمة القراء:', error);
    throw error;
  }
};

// الحصول على معلومات قارئ محدد
exports.getReciterById = async (reciterId) => {
  try {
    // إنشاء استعلام SQL للبحث عن القارئ
    const query = `
      SELECT * FROM reciters
      WHERE id = ?
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [reciterId]);
    
    // إرجاع القارئ إذا وجد
    if (rows.length > 0) {
      return rows[0];
    }
    
    // إذا لم يوجد القارئ، نقوم بإرجاع null
    return null;
  } catch (error) {
    console.error(`خطأ في الحصول على معلومات القارئ ${reciterId}:`, error);
    throw error;
  }
};

// الحصول على تلاوة سورة كاملة لقارئ محدد
exports.getSurahRecitation = async (reciterId, surahNumber) => {
  try {
    // إنشاء استعلام SQL للبحث عن التلاوة
    const query = `
      SELECT * FROM recitations
      WHERE reciter_id = ? AND surah_number = ? AND ayah_number IS NULL
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [reciterId, surahNumber]);
    
    // إذا وجدت التلاوة في قاعدة البيانات، نقوم بإرجاعها
    if (rows.length > 0) {
      return rows[0];
    }
    
    // إذا لم توجد التلاوة في قاعدة البيانات، نحاول الحصول عليها من API خارجي
    try {
      // هذا مثال افتراضي، يجب استبداله بـ API حقيقي للتلاوات
      const response = await axios.get(`https://api.qurancdn.com/api/qdc/audio/reciters/${reciterId}/surahs/${surahNumber}`);
      
      if (response.data && response.data.audio_file) {
        const recitationData = {
          reciter_id: reciterId,
          surah_number: surahNumber,
          ayah_number: null,
          audio_url: response.data.audio_file.url,
          duration: response.data.audio_file.duration,
          format: response.data.audio_file.format
        };
        
        // حفظ التلاوة في قاعدة البيانات للاستخدام المستقبلي
        const insertQuery = `
          INSERT INTO recitations (reciter_id, surah_number, ayah_number, audio_url, duration, format, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        await pool.execute(insertQuery, [
          recitationData.reciter_id,
          recitationData.surah_number,
          recitationData.ayah_number,
          recitationData.audio_url,
          recitationData.duration,
          recitationData.format
        ]);
        
        return recitationData;
      }
    } catch (apiError) {
      console.error(`خطأ في الحصول على التلاوة من API:`, apiError);
    }
    
    // إذا لم نتمكن من الحصول على التلاوة من API، نقوم بإرجاع تلاوة افتراضية
    // هذه مجرد أمثلة للتلاوات، يجب استبدالها بروابط حقيقية
    const defaultRecitations = {
      'mishari-rashid-alafasy': `/assets/audio/alafasy/surah_${surahNumber}.mp3`,
      'abdul-basit-abdul-samad': `/assets/audio/abdul-basit/surah_${surahNumber}.mp3`,
      'mahmoud-khalil-al-husary': `/assets/audio/al-husary/surah_${surahNumber}.mp3`,
      'muhammad-siddiq-al-minshawi': `/assets/audio/al-minshawi/surah_${surahNumber}.mp3`,
      'maher-al-muaiqly': `/assets/audio/al-muaiqly/surah_${surahNumber}.mp3`
    };
    
    return {
      reciter_id: reciterId,
      surah_number: surahNumber,
      ayah_number: null,
      audio_url: defaultRecitations[reciterId] || `/assets/audio/default/surah_${surahNumber}.mp3`,
      duration: 0,
      format: 'mp3'
    };
  } catch (error) {
    console.error(`خطأ في الحصول على تلاوة السورة رقم ${surahNumber} للقارئ ${reciterId}:`, error);
    throw error;
  }
};

// الحصول على تلاوة آية محددة لقارئ محدد
exports.getAyahRecitation = async (reciterId, surahNumber, ayahNumber) => {
  try {
    // إنشاء استعلام SQL للبحث عن التلاوة
    const query = `
      SELECT * FROM recitations
      WHERE reciter_id = ? AND surah_number = ? AND ayah_number = ?
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [reciterId, surahNumber, ayahNumber]);
    
    // إذا وجدت التلاوة في قاعدة البيانات، نقوم بإرجاعها
    if (rows.length > 0) {
      return rows[0];
    }
    
    // إذا لم توجد التلاوة في قاعدة البيانات، نحاول الحصول عليها من API خارجي
    try {
      // هذا مثال افتراضي، يجب استبداله بـ API حقيقي للتلاوات
      const response = await axios.get(`https://api.qurancdn.com/api/qdc/audio/reciters/${reciterId}/ayahs/${surahNumber}:${ayahNumber}`);
      
      if (response.data && response.data.audio_file) {
        const recitationData = {
          reciter_id: reciterId,
          surah_number: surahNumber,
          ayah_number: ayahNumber,
          audio_url: response.data.audio_file.url,
          duration: response.data.audio_file.duration,
          format: response.data.audio_file.format
        };
        
        // حفظ التلاوة في قاعدة البيانات للاستخدام المستقبلي
        const insertQuery = `
          INSERT INTO recitations (reciter_id, surah_number, ayah_number, audio_url, duration, format, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        await pool.execute(insertQuery, [
          recitationData.reciter_id,
          recitationData.surah_number,
          recitationData.ayah_number,
          recitationData.audio_url,
          recitationData.duration,
          recitationData.format
        ]);
        
        return recitationData;
      }
    } catch (apiError) {
      console.error(`خطأ في الحصول على التلاوة من API:`, apiError);
    }
    
    // إذا لم نتمكن من الحصول على التلاوة من API، نقوم بإرجاع تلاوة افتراضية
    // هذه مجرد أمثلة للتلاوات، يجب استبدالها بروابط حقيقية
    const defaultRecitations = {
      'mishari-rashid-alafasy': `/assets/audio/alafasy/surah_${surahNumber}_ayah_${ayahNumber}.mp3`,
      'abdul-basit-abdul-samad': `/assets/audio/abdul-basit/surah_${surahNumber}_ayah_${ayahNumber}.mp3`,
      'mahmoud-khalil-al-husary': `/assets/audio/al-husary/surah_${surahNumber}_ayah_${ayahNumber}.mp3`,
      'muhammad-siddiq-al-minshawi': `/assets/audio/al-minshawi/surah_${surahNumber}_ayah_${ayahNumber}.mp3`,
      'maher-al-muaiqly': `/assets/audio/al-muaiqly/surah_${surahNumber}_ayah_${ayahNumber}.mp3`
    };
    
    return {
      reciter_id: reciterId,
      surah_number: surahNumber,
      ayah_number: ayahNumber,
      audio_url: defaultRecitations[reciterId] || `/assets/audio/default/surah_${surahNumber}_ayah_${ayahNumber}.mp3`,
      duration: 0,
      format: 'mp3'
    };
  } catch (error) {
    console.error(`خطأ في الحصول على تلاوة الآية رقم ${ayahNumber} من السورة رقم ${surahNumber} للقارئ ${reciterId}:`, error);
    throw error;
  }
};

// الحصول على تلاوة مجموعة من الآيات لقارئ محدد
exports.getAyahRangeRecitation = async (reciterId, surahNumber, startAyah, endAyah) => {
  try {
    const recitations = [];
    
    // الحصول على تلاوة كل آية على حدة
    for (let ayahNumber = startAyah; ayahNumber <= endAyah; ayahNumber++) {
      const recitation = await exports.getAyahRecitation(reciterId, surahNumber, ayahNumber);
      recitations.push(recitation);
    }
    
    return recitations;
  } catch (error) {
    console.error(`خطأ في الحصول على تلاوة نطاق الآيات من ${startAyah} إلى ${endAyah} من السورة رقم ${surahNumber} للقارئ ${reciterId}:`, error);
    throw error;
  }
};

// الحصول على تلاوة اليوم
exports.getRecitationOfDay = async () => {
  try {
    // إنشاء استعلام SQL للبحث عن تلاوة اليوم
    const query = `
      SELECT * FROM recitation_of_day
      WHERE date = CURDATE()
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query);
    
    // إذا وجدت تلاوة اليوم في قاعدة البيانات، نقوم بإرجاعها
    if (rows.length > 0) {
      return rows[0];
    }
    
    // إذا لم توجد تلاوة اليوم، نقوم باختيار تلاوة عشوائية
    // الحصول على قائمة القراء
    const reciters = await exports.getAllReciters();
    
    // اختيار قارئ عشوائي
    const randomReciterIndex = Math.floor(Math.random() * reciters.length);
    const randomReciter = reciters[randomReciterIndex];
    
    // اختيار سورة عشوائية
    const randomSurahNumber = Math.floor(Math.random() * 114) + 1;
    
    // الحصول على تلاوة السورة
    const recitation = await exports.getSurahRecitation(randomReciter.id, randomSurahNumber);
    
    // حفظ تلاوة اليوم في قاعدة البيانات
    const insertQuery = `
      INSERT INTO recitation_of_day (date, reciter_id, surah_number, audio_url, created_at)
      VALUES (CURDATE(), ?, ?, ?, NOW())
    `;
    
    await pool.execute(insertQuery, [
      randomReciter.id,
      randomSurahNumber,
      recitation.audio_url
    ]);
    
    return {
      date: new Date().toISOString().split('T')[0],
      reciter_id: randomReciter.id,
      reciter_name: randomReciter.name,
      surah_number: randomSurahNumber,
      audio_url: recitation.audio_url
    };
  } catch (error) {
    console.error('خطأ في الحصول على تلاوة اليوم:', error);
    throw error;
  }
};

// الحصول على قائمة التلاوات المفضلة للمستخدم
exports.getFavoriteRecitations = async (userId) => {
  try {
    // إنشاء استعلام SQL للحصول على التلاوات المفضلة
    const query = `
      SELECT fr.*, r.name as reciter_name, r.name_en as reciter_name_en
      FROM favorite_recitations fr
      JOIN reciters r ON fr.reciter_id = r.id
      WHERE fr.user_id = ?
      ORDER BY fr.created_at DESC
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [userId]);
    
    return rows;
  } catch (error) {
    console.error(`خطأ في الحصول على التلاوات المفضلة للمستخدم ${userId}:`, error);
    throw error;
  }
};

// إضافة تلاوة إلى المفضلة
exports.addToFavorites = async (userId, reciterId, surahNumber, ayahNumber = null) => {
  try {
    // التحقق من وجود التلاوة في المفضلة
    const checkQuery = `
      SELECT * FROM favorite_recitations
      WHERE user_id = ? AND reciter_id = ? AND surah_number = ? AND (ayah_number = ? OR (ayah_number IS NULL AND ? IS NULL))
    `;
    
    const [existingFavorites] = await pool.execute(checkQuery, [userId, reciterId, surahNumber, ayahNumber, ayahNumber]);
    
    // إذا كانت التلاوة موجودة بالفعل في المفضلة، نقوم بإرجاع true
    if (existingFavorites.length > 0) {
      return true;
    }
    
    // إضافة التلاوة إلى المفضلة
    const insertQuery = `
      INSERT INTO favorite_recitations (user_id, reciter_id, surah_number, ayah_number, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    await pool.execute(insertQuery, [userId, reciterId, surahNumber, ayahNumber]);
    
    return true;
  } catch (error) {
    console.error(`خطأ في إضافة التلاوة إلى المفضلة للمستخدم ${userId}:`, error);
    throw error;
  }
};

// حذف تلاوة من المفضلة
exports.removeFromFavorites = async (userId, recitationId) => {
  try {
    // حذف التلاوة من المفضلة
    const deleteQuery = `
      DELETE FROM favorite_recitations
      WHERE id = ? AND user_id = ?
    `;
    
    await pool.execute(deleteQuery, [recitationId, userId]);
    
    return true;
  } catch (error) {
    console.error(`خطأ في حذف التلاوة ${recitationId} من المفضلة للمستخدم ${userId}:`, error);
    throw error;
  }
};
