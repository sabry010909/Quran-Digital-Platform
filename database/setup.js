// setup.js - ملف إعداد قاعدة البيانات لموقع القرآن الكريم

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// تحميل متغيرات البيئة
dotenv.config();

// تكوين الاتصال بقاعدة البيانات
const { dbConfig } = require('../backend/config/db');
dbConfig.multipleStatements = true; // نضيف الخيار هنا لأن ملف db.js مش حاطه


// دالة لإنشاء قاعدة البيانات وتنفيذ المخطط
async function setupDatabase() {
  let connection;
  
  try {
    console.log('بدء إعداد قاعدة البيانات...');
    
    // إنشاء اتصال بالخادم
    connection = await mysql.createConnection(dbConfig);
    
    // قراءة ملف المخطط
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // تنفيذ استعلامات المخطط
    console.log('تنفيذ مخطط قاعدة البيانات...');
    await connection.query(schemaSql);
    
    console.log('تم إعداد قاعدة البيانات بنجاح!');
    
    // إغلاق الاتصال
    await connection.end();
    
    return true;
  } catch (error) {
    console.error('حدث خطأ أثناء إعداد قاعدة البيانات:', error);
    
    // إغلاق الاتصال في حالة حدوث خطأ
    if (connection) {
      await connection.end();
    }
    
    return false;
  }
}

// تنفيذ الإعداد إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  setupDatabase()
    .then(success => {
      if (success) {
        console.log('اكتمل إعداد قاعدة البيانات بنجاح.');
      } else {
        console.error('فشل إعداد قاعدة البيانات.');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('حدث خطأ غير متوقع:', err);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
