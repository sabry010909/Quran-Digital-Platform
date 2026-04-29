// models/tafsir.js - نموذج التفسير

const { pool } = require('../config/db');
const axios = require('axios');

// الحصول على قائمة مصادر التفسير المتاحة
exports.getAllTafsirSources = async () => {
  try {
    // إنشاء استعلام SQL للحصول على مصادر التفسير
    const query = `
      SELECT * FROM tafsir_sources
      ORDER BY name_ar
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query);
    
    // إذا لم تكن هناك بيانات في قاعدة البيانات، نقوم بإرجاع مصادر افتراضية
    if (rows.length === 0) {
      return [
        {
          id: 'ar.muyassar',
          name: 'التفسير الميسر',
          language: 'ar',
          author: 'نخبة من العلماء',
          description: 'تفسير ميسر للقرآن الكريم من إعداد مجموعة من العلماء بإشراف مجمع الملك فهد لطباعة المصحف الشريف'
        },
        {
          id: 'ar.jalalayn',
          name: 'تفسير الجلالين',
          language: 'ar',
          author: 'جلال الدين المحلي وجلال الدين السيوطي',
          description: 'تفسير موجز للقرآن الكريم ألفه جلال الدين المحلي وأكمله جلال الدين السيوطي'
        },
        {
          id: 'ar.tabari',
          name: 'تفسير الطبري',
          language: 'ar',
          author: 'أبو جعفر محمد بن جرير الطبري',
          description: 'جامع البيان عن تأويل آي القرآن، من أقدم وأشمل كتب التفسير بالمأثور'
        },
        {
          id: 'ar.kathir',
          name: 'تفسير ابن كثير',
          language: 'ar',
          author: 'إسماعيل بن عمر بن كثير',
          description: 'تفسير القرآن العظيم، من أشهر كتب التفسير بالمأثور'
        },
        {
          id: 'ar.qurtubi',
          name: 'تفسير القرطبي',
          language: 'ar',
          author: 'أبو عبد الله محمد بن أحمد الأنصاري القرطبي',
          description: 'الجامع لأحكام القرآن، يركز على استنباط الأحكام الفقهية من القرآن'
        }
      ];
    }
    
    return rows;
  } catch (error) {
    console.error('خطأ في الحصول على مصادر التفسير:', error);
    throw error;
  }
};

// الحصول على تفسير آية محددة من مصدر محدد
exports.getAyahTafsir = async (sourceId, surahNumber, ayahNumber) => {
  try {
    // إنشاء استعلام SQL للبحث عن التفسير
    const query = `
      SELECT * FROM tafsir
      WHERE source_id = ? AND surah_number = ? AND ayah_number = ?
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [sourceId, surahNumber, ayahNumber]);
    
    // إذا وجد التفسير في قاعدة البيانات، نقوم بإرجاعه
    if (rows.length > 0) {
      return rows[0];
    }
    
    // إذا لم يوجد التفسير في قاعدة البيانات، نحاول الحصول عليه من API خارجي
    try {
      // هذا مثال افتراضي، يجب استبداله بـ API حقيقي للتفسير
      const response = await axios.get(`https://api.qurancdn.com/api/qdc/tafsirs/${sourceId}/by_ayah/${surahNumber}:${ayahNumber}`);
      
      if (response.data && response.data.tafsir) {
        const tafsirData = {
          source_id: sourceId,
          surah_number: surahNumber,
          ayah_number: ayahNumber,
          text: response.data.tafsir.text,
          author: response.data.tafsir.author,
          language: response.data.tafsir.language
        };
        
        // حفظ التفسير في قاعدة البيانات للاستخدام المستقبلي
        const insertQuery = `
          INSERT INTO tafsir (source_id, surah_number, ayah_number, text, author, language, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        await pool.execute(insertQuery, [
          tafsirData.source_id,
          tafsirData.surah_number,
          tafsirData.ayah_number,
          tafsirData.text,
          tafsirData.author,
          tafsirData.language
        ]);
        
        return tafsirData;
      }
    } catch (apiError) {
      console.error(`خطأ في الحصول على التفسير من API:`, apiError);
    }
    
    // إذا لم نتمكن من الحصول على التفسير من API، نقوم بإرجاع تفسير افتراضي
    return {
      source_id: sourceId,
      surah_number: surahNumber,
      ayah_number: ayahNumber,
      text: 'التفسير غير متوفر حالياً. يرجى المحاولة لاحقاً.',
      author: 'غير متوفر',
      language: 'ar'
    };
  } catch (error) {
    console.error(`خطأ في الحصول على تفسير الآية رقم ${ayahNumber} من السورة رقم ${surahNumber} من المصدر ${sourceId}:`, error);
    throw error;
  }
};

// الحصول على تفسير سورة كاملة من مصدر محدد
exports.getSurahTafsir = async (sourceId, surahNumber) => {
  try {
    // إنشاء استعلام SQL للبحث عن التفسير
    const query = `
      SELECT * FROM tafsir
      WHERE source_id = ? AND surah_number = ?
      ORDER BY ayah_number
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [sourceId, surahNumber]);
    
    // إذا كان هناك تفسير لبعض الآيات على الأقل، نقوم بإرجاعه
    if (rows.length > 0) {
      return {
        source_id: sourceId,
        surah_number: surahNumber,
        ayahs: rows
      };
    }
    
    // إذا لم يوجد تفسير في قاعدة البيانات، نحاول الحصول عليه من API خارجي
    // هذا مثال افتراضي، يجب استبداله بـ API حقيقي للتفسير
    
    // في حالة عدم وجود تفسير، نقوم بإرجاع مصفوفة فارغة
    return {
      source_id: sourceId,
      surah_number: surahNumber,
      ayahs: []
    };
  } catch (error) {
    console.error(`خطأ في الحصول على تفسير السورة رقم ${surahNumber} من المصدر ${sourceId}:`, error);
    throw error;
  }
};

// الحصول على تفسير مجموعة من الآيات من مصدر محدد
exports.getTafsirRange = async (sourceId, surahNumber, startAyah, endAyah) => {
  try {
    // إنشاء استعلام SQL للبحث عن التفسير
    const query = `
      SELECT * FROM tafsir
      WHERE source_id = ? AND surah_number = ? AND ayah_number BETWEEN ? AND ?
      ORDER BY ayah_number
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [sourceId, surahNumber, startAyah, endAyah]);
    
    // إرجاع التفسير
    return {
      source_id: sourceId,
      surah_number: surahNumber,
      start_ayah: startAyah,
      end_ayah: endAyah,
      ayahs: rows
    };
  } catch (error) {
    console.error(`خطأ في الحصول على تفسير نطاق الآيات من ${startAyah} إلى ${endAyah} من السورة رقم ${surahNumber} من المصدر ${sourceId}:`, error);
    throw error;
  }
};

// البحث في التفسير
exports.searchTafsir = async (query, sourceId = null) => {
  try {
    let sqlQuery;
    let params;
    
    if (sourceId) {
      // البحث في مصدر محدد
      sqlQuery = `
        SELECT * FROM tafsir
        WHERE source_id = ? AND text LIKE ?
        ORDER BY surah_number, ayah_number
        LIMIT 100
      `;
      params = [sourceId, `%${query}%`];
    } else {
      // البحث في جميع المصادر
      sqlQuery = `
        SELECT * FROM tafsir
        WHERE text LIKE ?
        ORDER BY source_id, surah_number, ayah_number
        LIMIT 100
      `;
      params = [`%${query}%`];
    }
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(sqlQuery, params);
    
    return rows;
  } catch (error) {
    console.error(`خطأ في البحث عن "${query}" في التفسير:`, error);
    throw error;
  }
};

// الحصول على تفسير صوتي لآية محددة
exports.getAudioTafsir = async (surahNumber, ayahNumber) => {
  try {
    // إنشاء استعلام SQL للبحث عن التفسير الصوتي
    const query = `
      SELECT * FROM audio_tafsir
      WHERE surah_number = ? AND ayah_number = ?
    `;
    
    // تنفيذ الاستعلام
    const [rows] = await pool.execute(query, [surahNumber, ayahNumber]);
    
    // إذا وجد التفسير الصوتي في قاعدة البيانات، نقوم بإرجاعه
    if (rows.length > 0) {
      return rows[0];
    }
    
    // إذا لم يوجد التفسير الصوتي، نقوم بإرجاع null
    return null;
  } catch (error) {
    console.error(`خطأ في الحصول على التفسير الصوتي للآية رقم ${ayahNumber} من السورة رقم ${surahNumber}:`, error);
    throw error;
  }
};
