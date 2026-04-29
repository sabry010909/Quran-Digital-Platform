const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// تحميل متغيرات البيئة
dotenv.config();

// إعداد تكوين قاعدة البيانات
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'sabry',
    password: process.env.DB_PASSWORD || '2003',
    database: process.env.DB_NAME || 'quran_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// إنشاء مجمع اتصالات قاعدة البيانات
const pool = mysql.createPool(dbConfig);

// اختبار الاتصال بقاعدة البيانات
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('تم الاتصال بقاعدة البيانات بنجاح');
        connection.release();
        return true;
    } catch (error) {
        console.error('فشل الاتصال بقاعدة البيانات:', error.message);
        return false;
    }
}

// تصدير مجمع الاتصالات ودالة اختبار الاتصال
module.exports = { pool, testConnection, dbConfig };
