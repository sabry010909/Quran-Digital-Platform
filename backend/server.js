// server.js - الملف الرئيسي للخادم الخلفي

// استيراد المكتبات اللازمة
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');

// تحميل متغيرات البيئة من ملف .env (إذا وجد)
dotenv.config();

// إنشاء تطبيق Express
const app = express();
const PORT = process.env.PORT || 3000;

// إعداد middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// إعداد جلسات المستخدمين
app.use(session({
  secret: process.env.SESSION_SECRET || 'quran_website_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// تعيين المجلد العام للملفات الثابتة
app.use(express.static(path.join(__dirname, '../frontend')));

// استيراد الطرق (Routes)
const quranRoutes = require('./routes/quran');
const userRoutes = require('./routes/user');
const tafsirRoutes = require('./routes/tafsir');
const audioRoutes = require('./routes/audio');

// استخدام الطرق
app.use('/api/quran', quranRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tafsir', tafsirRoutes);
app.use('/api/audio', audioRoutes);

// الطريق الرئيسي - توجيه جميع الطلبات غير المعالجة إلى التطبيق الأمامي
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'حدث خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// بدء تشغيل الخادم
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
  console.log(`الموقع متاح على: http://localhost:${PORT}`);
});

module.exports = app;
