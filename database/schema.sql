-- schema.sql - مخطط قاعدة البيانات لموقع القرآن الكريم

-- إنشاء قاعدة البيانات إذا لم تكن موجودة
CREATE DATABASE IF NOT EXISTS quran_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- استخدام قاعدة البيانات
USE quran_db;

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول إعدادات المستخدمين
CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  settings JSON NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تقدم الحفظ
CREATE TABLE IF NOT EXISTS memorization_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  surah_number INT NOT NULL,
  ayah_number INT NOT NULL,
  status ENUM('not_started', 'in_progress', 'memorized', 'needs_review') NOT NULL DEFAULT 'not_started',
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_ayah (user_id, surah_number, ayah_number),
  INDEX idx_user_surah (user_id, surah_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول اختبارات الحفظ
CREATE TABLE IF NOT EXISTS memorization_tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  surah_number INT NOT NULL,
  start_ayah INT NOT NULL,
  end_ayah INT NOT NULL,
  score DECIMAL(5,2),
  date DATETIME NOT NULL,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_surah_number (surah_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول مصادر التفسير
CREATE TABLE IF NOT EXISTS tafsir_sources (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL,
  author VARCHAR(100) NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  INDEX idx_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التفسير
CREATE TABLE IF NOT EXISTS tafsir (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_id VARCHAR(50) NOT NULL,
  surah_number INT NOT NULL,
  ayah_number INT NOT NULL,
  text TEXT NOT NULL,
  author VARCHAR(100),
  language VARCHAR(10) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (source_id) REFERENCES tafsir_sources(id) ON DELETE CASCADE,
  UNIQUE KEY unique_source_ayah (source_id, surah_number, ayah_number),
  INDEX idx_surah_ayah (surah_number, ayah_number),
  FULLTEXT INDEX ft_text (text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التفسير الصوتي
CREATE TABLE IF NOT EXISTS audio_tafsir (
  id INT AUTO_INCREMENT PRIMARY KEY,
  surah_number INT NOT NULL,
  ayah_number INT NOT NULL,
  audio_url VARCHAR(255) NOT NULL,
  duration INT,
  author VARCHAR(100),
  language VARCHAR(10) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  UNIQUE KEY unique_ayah (surah_number, ayah_number, language),
  INDEX idx_surah_ayah (surah_number, ayah_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول القراء
CREATE TABLE IF NOT EXISTS reciters (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  style VARCHAR(50),
  bio TEXT,
  cover_url VARCHAR(255),
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التلاوات
CREATE TABLE IF NOT EXISTS recitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reciter_id VARCHAR(50) NOT NULL,
  surah_number INT NOT NULL,
  ayah_number INT,
  audio_url VARCHAR(255) NOT NULL,
  duration INT,
  format VARCHAR(10),
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  FOREIGN KEY (reciter_id) REFERENCES reciters(id) ON DELETE CASCADE,
  UNIQUE KEY unique_reciter_ayah (reciter_id, surah_number, ayah_number),
  INDEX idx_surah_ayah (surah_number, ayah_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تلاوة اليوم
CREATE TABLE IF NOT EXISTS recitation_of_day (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  reciter_id VARCHAR(50) NOT NULL,
  surah_number INT NOT NULL,
  audio_url VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (reciter_id) REFERENCES reciters(id) ON DELETE CASCADE,
  UNIQUE KEY unique_date (date),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التلاوات المفضلة
CREATE TABLE IF NOT EXISTS favorite_recitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reciter_id VARCHAR(50) NOT NULL,
  surah_number INT NOT NULL,
  ayah_number INT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reciter_id) REFERENCES reciters(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_reciter_ayah (user_id, reciter_id, surah_number, ayah_number),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الأسئلة والأجوبة
CREATE TABLE IF NOT EXISTS questions_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  question TEXT NOT NULL,
  answer TEXT,
  status ENUM('pending', 'answered', 'rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL,
  updated_at DATETIME,
  answered_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FULLTEXT INDEX ft_question (question),
  FULLTEXT INDEX ft_answer (answer),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدخال بيانات أولية لمصادر التفسير
INSERT IGNORE INTO tafsir_sources (id, name, name_ar, language, author, description, created_at) VALUES
('ar.muyassar', 'Al-Muyassar', 'التفسير الميسر', 'ar', 'نخبة من العلماء', 'تفسير ميسر للقرآن الكريم من إعداد مجموعة من العلماء بإشراف مجمع الملك فهد لطباعة المصحف الشريف', NOW()),
('ar.jalalayn', 'Tafsir Al-Jalalayn', 'تفسير الجلالين', 'ar', 'جلال الدين المحلي وجلال الدين السيوطي', 'تفسير موجز للقرآن الكريم ألفه جلال الدين المحلي وأكمله جلال الدين السيوطي', NOW()),
('ar.tabari', 'Tafsir Al-Tabari', 'تفسير الطبري', 'ar', 'أبو جعفر محمد بن جرير الطبري', 'جامع البيان عن تأويل آي القرآن، من أقدم وأشمل كتب التفسير بالمأثور', NOW()),
('ar.kathir', 'Tafsir Ibn Kathir', 'تفسير ابن كثير', 'ar', 'إسماعيل بن عمر بن كثير', 'تفسير القرآن العظيم، من أشهر كتب التفسير بالمأثور', NOW()),
('ar.qurtubi', 'Tafsir Al-Qurtubi', 'تفسير القرطبي', 'ar', 'أبو عبد الله محمد بن أحمد الأنصاري القرطبي', 'الجامع لأحكام القرآن، يركز على استنباط الأحكام الفقهية من القرآن', NOW());

-- إدخال بيانات أولية للقراء
INSERT IGNORE INTO reciters (id, name, name_ar, name_en, style, bio, cover_url, created_at) VALUES
('mishari-rashid-alafasy', 'Mishari Rashid Alafasy', 'مشاري راشد العفاسي', 'Mishari Rashid Alafasy', 'مرتل', 'قارئ كويتي مشهور، ولد عام 1976م، وهو إمام وخطيب في مسجد الراشد بالكويت', '/assets/images/reciters/alafasy.jpg', NOW()),
('abdul-basit-abdul-samad', 'Abdul Basit Abdul Samad', 'عبد الباسط عبد الصمد', 'Abdul Basit Abdul Samad', 'مرتل ومجود', 'قارئ مصري مشهور، ولد عام 1927م وتوفي عام 1988م، اشتهر بصوته العذب وإتقانه لأحكام التجويد', '/assets/images/reciters/abdul-basit.jpg', NOW()),
('mahmoud-khalil-al-husary', 'Mahmoud Khalil Al-Husary', 'محمود خليل الحصري', 'Mahmoud Khalil Al-Husary', 'مرتل ومجود', 'قارئ مصري مشهور، ولد عام 1917م وتوفي عام 1980م، كان شيخ عموم المقارئ المصرية', '/assets/images/reciters/al-husary.jpg', NOW()),
('muhammad-siddiq-al-minshawi', 'Muhammad Siddiq Al-Minshawi', 'محمد صديق المنشاوي', 'Muhammad Siddiq Al-Minshawi', 'مرتل ومجود', 'قارئ مصري مشهور، ولد عام 1920م وتوفي عام 1969م، اشتهر بالتلاوة المجودة', '/assets/images/reciters/al-minshawi.jpg', NOW()),
('maher-al-muaiqly', 'Maher Al-Muaiqly', 'ماهر المعيقلي', 'Maher Al-Muaiqly', 'مرتل', 'قارئ سعودي، ولد عام 1969م، وهو إمام وخطيب في المسجد الحرام بمكة المكرمة', '/assets/images/reciters/al-muaiqly.jpg', NOW());
