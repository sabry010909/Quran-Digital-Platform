// models/verse.js - نموذج الآيات القرآنية

const { pool } = require('../config/db');
const quranJson = require('quran-json');
const nodeQuran = require('node-quran');

// الحصول على قائمة السور
exports.getAllSurahs = async () => {
  try {
    // استخدام مكتبة quran-json للحصول على قائمة السور
    const surahs = quranJson[0].surahs.map(surah => ({
      number: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      numberOfAyahs: surah.ayahs.length,
      revelationType: surah.revelationType
    }));
    
    return surahs;
  } catch (error) {
    console.error('خطأ في الحصول على قائمة السور:', error);
    throw error;
  }
};

// الحصول على سورة محددة بالرقم
exports.getSurahByNumber = async (surahNumber) => {
  try {
    // التحقق من صحة رقم السورة
    if (surahNumber < 1 || surahNumber > 114) {
      throw new Error('رقم السورة غير صحيح. يجب أن يكون بين 1 و 114');
    }
    
    // استخدام مكتبة quran-json للحصول على السورة
    const surah = quranJson[0].surahs.find(s => s.number === surahNumber);
    
    if (!surah) {
      return null;
    }
    
    return {
      number: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      revelationType: surah.revelationType,
      ayahs: surah.ayahs.map(ayah => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        juz: ayah.juz,
        manzil: ayah.manzil,
        page: ayah.page,
        ruku: ayah.ruku,
        hizbQuarter: ayah.hizbQuarter,
        sajda: ayah.sajda
      }))
    };
  } catch (error) {
    console.error(`خطأ في الحصول على السورة رقم ${surahNumber}:`, error);
    throw error;
  }
};

// الحصول على آية محددة
exports.getAyahByNumber = async (surahNumber, ayahNumber) => {
  try {
    // التحقق من صحة رقم السورة
    if (surahNumber < 1 || surahNumber > 114) {
      throw new Error('رقم السورة غير صحيح. يجب أن يكون بين 1 و 114');
    }
    
    // استخدام مكتبة quran-json للحصول على السورة
    const surah = quranJson[0].surahs.find(s => s.number === surahNumber);
    
    if (!surah) {
      return null;
    }
    
    // البحث عن الآية المحددة
    const ayah = surah.ayahs.find(a => a.numberInSurah === ayahNumber);
    
    if (!ayah) {
      return null;
    }
    
    return {
      surah: {
        number: surah.number,
        name: surah.name,
        englishName: surah.englishName,
        englishNameTranslation: surah.englishNameTranslation,
        revelationType: surah.revelationType
      },
      number: ayah.numberInSurah,
      text: ayah.text,
      juz: ayah.juz,
      manzil: ayah.manzil,
      page: ayah.page,
      ruku: ayah.ruku,
      hizbQuarter: ayah.hizbQuarter,
      sajda: ayah.sajda
    };
  } catch (error) {
    console.error(`خطأ في الحصول على الآية رقم ${ayahNumber} من السورة رقم ${surahNumber}:`, error);
    throw error;
  }
};

// الحصول على مجموعة من الآيات
exports.getAyahRange = async (surahNumber, startAyah, endAyah) => {
  try {
    // التحقق من صحة رقم السورة
    if (surahNumber < 1 || surahNumber > 114) {
      throw new Error('رقم السورة غير صحيح. يجب أن يكون بين 1 و 114');
    }
    
    // استخدام مكتبة quran-json للحصول على السورة
    const surah = quranJson[0].surahs.find(s => s.number === surahNumber);
    
    if (!surah) {
      return [];
    }
    
    // التحقق من صحة نطاق الآيات
    if (startAyah < 1 || endAyah > surah.ayahs.length || startAyah > endAyah) {
      throw new Error('نطاق الآيات غير صحيح');
    }
    
    // استخراج الآيات المطلوبة
    const ayahs = surah.ayahs
      .filter(a => a.numberInSurah >= startAyah && a.numberInSurah <= endAyah)
      .map(ayah => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        juz: ayah.juz,
        manzil: ayah.manzil,
        page: ayah.page,
        ruku: ayah.ruku,
        hizbQuarter: ayah.hizbQuarter,
        sajda: ayah.sajda
      }));
    
    return {
      surah: {
        number: surah.number,
        name: surah.name,
        englishName: surah.englishName,
        englishNameTranslation: surah.englishNameTranslation,
        revelationType: surah.revelationType
      },
      ayahs
    };
  } catch (error) {
    console.error(`خطأ في الحصول على نطاق الآيات من ${startAyah} إلى ${endAyah} من السورة رقم ${surahNumber}:`, error);
    throw error;
  }
};

// البحث في القرآن
exports.searchQuran = async (query) => {
  try {
    const results = [];
    
    // البحث في جميع السور والآيات
    for (const surah of quranJson[0].surahs) {
      const matchingAyahs = surah.ayahs.filter(ayah => 
        ayah.text.includes(query)
      );
      
      if (matchingAyahs.length > 0) {
        matchingAyahs.forEach(ayah => {
          results.push({
            surah: {
              number: surah.number,
              name: surah.name,
              englishName: surah.englishName,
              englishNameTranslation: surah.englishNameTranslation
            },
            ayah: {
              number: ayah.numberInSurah,
              text: ayah.text,
              page: ayah.page,
              juz: ayah.juz
            }
          });
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error(`خطأ في البحث عن "${query}" في القرآن:`, error);
    throw error;
  }
};

// الحصول على آية اليوم
exports.getAyahOfDay = async () => {
  try {
    // اختيار آية عشوائية
    const randomSurahNumber = Math.floor(Math.random() * 114) + 1;
    const surah = quranJson[0].surahs.find(s => s.number === randomSurahNumber);
    const randomAyahNumber = Math.floor(Math.random() * surah.ayahs.length) + 1;
    const ayah = surah.ayahs.find(a => a.numberInSurah === randomAyahNumber);
    
    return {
      date: new Date().toISOString().split('T')[0],
      surah: {
        number: surah.number,
        name: surah.name,
        englishName: surah.englishName,
        englishNameTranslation: surah.englishNameTranslation
      },
      ayah: {
        number: ayah.numberInSurah,
        text: ayah.text,
        page: ayah.page,
        juz: ayah.juz
      }
    };
  } catch (error) {
    console.error('خطأ في الحصول على آية اليوم:', error);
    throw error;
  }
};

// الحصول على صفحة محددة من المصحف
exports.getQuranPage = async (pageNumber) => {
  try {
    // التحقق من صحة رقم الصفحة
    if (pageNumber < 1 || pageNumber > 604) {
      throw new Error('رقم الصفحة غير صحيح. يجب أن يكون بين 1 و 604');
    }
    
    const pageAyahs = [];
    
    // البحث عن الآيات في الصفحة المحددة
    for (const surah of quranJson[0].surahs) {
      const ayahsInPage = surah.ayahs.filter(ayah => ayah.page === pageNumber);
      
      if (ayahsInPage.length > 0) {
        pageAyahs.push({
          surah: {
            number: surah.number,
            name: surah.name,
            englishName: surah.englishName,
            englishNameTranslation: surah.englishNameTranslation
          },
          ayahs: ayahsInPage.map(ayah => ({
            number: ayah.numberInSurah,
            text: ayah.text,
            juz: ayah.juz,
            manzil: ayah.manzil,
            page: ayah.page,
            ruku: ayah.ruku,
            hizbQuarter: ayah.hizbQuarter,
            sajda: ayah.sajda
          }))
        });
      }
    }
    
    return {
      pageNumber,
      ayahs: pageAyahs
    };
  } catch (error) {
    console.error(`خطأ في الحصول على الصفحة رقم ${pageNumber}:`, error);
    throw error;
  }
};

// الحصول على جزء محدد من القرآن
exports.getJuzByNumber = async (juzNumber) => {
  try {
    // التحقق من صحة رقم الجزء
    if (juzNumber < 1 || juzNumber > 30) {
      throw new Error('رقم الجزء غير صحيح. يجب أن يكون بين 1 و 30');
    }
    
    const juzAyahs = [];
    
    // البحث عن الآيات في الجزء المحدد
    for (const surah of quranJson[0].surahs) {
      const ayahsInJuz = surah.ayahs.filter(ayah => ayah.juz === juzNumber);
      
      if (ayahsInJuz.length > 0) {
        juzAyahs.push({
          surah: {
            number: surah.number,
            name: surah.name,
            englishName: surah.englishName,
            englishNameTranslation: surah.englishNameTranslation
          },
          ayahs: ayahsInJuz.map(ayah => ({
            number: ayah.numberInSurah,
            text: ayah.text,
            juz: ayah.juz,
            manzil: ayah.manzil,
            page: ayah.page,
            ruku: ayah.ruku,
            hizbQuarter: ayah.hizbQuarter,
            sajda: ayah.sajda
          }))
        });
      }
    }
    
    return {
      juzNumber,
      ayahs: juzAyahs
    };
  } catch (error) {
    console.error(`خطأ في الحصول على الجزء رقم ${juzNumber}:`, error);
    throw error;
  }
};
