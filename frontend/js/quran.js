// quran.js - ملف جافاسكريبت للتعامل مع بيانات القرآن الكريم

// بيانات القرآن الكريم
let quranData = null;
let currentSurah = null;
let currentAyah = null;

// تحميل بيانات القرآن الكريم
async function loadQuranData() {
    try {
        // في بيئة التطوير، نستخدم بيانات محلية
        // في الإنتاج، سنستخدم طلب API حقيقي
        const response = await fetch('/api/quran/surahs');
        quranData = await response.json();
        return quranData;
    } catch (error) {
        console.error('خطأ في تحميل بيانات القرآن:', error);
        // استخدام بيانات احتياطية في حالة فشل الطلب
        return mockQuranData;
    }
}

// الحصول على سورة محددة
async function getSurah(surahNumber) {
    try {
        if (!quranData) {
            await loadQuranData();
        }
        
        // في بيئة التطوير، نستخدم بيانات محلية
        // في الإنتاج، سنستخدم طلب API حقيقي
        const response = await fetch(`/api/quran/surah/${surahNumber}`);
        currentSurah = await response.json();
        return currentSurah;
    } catch (error) {
        console.error(`خطأ في الحصول على السورة رقم ${surahNumber}:`, error);
        // استخدام بيانات احتياطية في حالة فشل الطلب
        const mockSurah = mockQuranData.find(surah => surah.number === parseInt(surahNumber));
        currentSurah = mockSurah;
        return mockSurah;
    }
}

// الحصول على آية محددة
async function getAyah(surahNumber, ayahNumber) {
    try {
        // في بيئة التطوير، نستخدم بيانات محلية
        // في الإنتاج، سنستخدم طلب API حقيقي
        const response = await fetch(`/api/quran/ayah/${surahNumber}/${ayahNumber}`);
        currentAyah = await response.json();
        return currentAyah;
    } catch (error) {
        console.error(`خطأ في الحصول على الآية رقم ${ayahNumber} من السورة رقم ${surahNumber}:`, error);
        // استخدام بيانات احتياطية في حالة فشل الطلب
        if (!currentSurah || currentSurah.number !== parseInt(surahNumber)) {
            await getSurah(surahNumber);
        }
        
        if (currentSurah && currentSurah.ayahs) {
            const ayah = currentSurah.ayahs.find(a => a.number === parseInt(ayahNumber));
            currentAyah = ayah;
            return ayah;
        }
        
        return null;
    }
}

// البحث في القرآن
async function searchQuran(query, searchType = 'text') {
    try {
        // في بيئة التطوير، نستخدم بيانات محلية
        // في الإنتاج، سنستخدم طلب API حقيقي
        const response = await fetch(`/api/quran/search?q=${encodeURIComponent(query)}&type=${searchType}`);
        const results = await response.json();
        return results;
    } catch (error) {
        console.error(`خطأ في البحث عن "${query}":`, error);
        // محاكاة نتائج البحث في حالة فشل الطلب
        return mockSearchResults(query);
    }
}

// الحصول على آية اليوم
async function getVerseOfDay() {
    try {
        // في بيئة التطوير، نستخدم بيانات محلية
        // في الإنتاج، سنستخدم طلب API حقيقي
        const response = await fetch('/api/quran/ayah-of-day');
        const verseOfDay = await response.json();
        return verseOfDay;
    } catch (error) {
        console.error('خطأ في الحصول على آية اليوم:', error);
        // استخدام بيانات احتياطية في حالة فشل الطلب
        return mockVerseOfDay;
    }
}

// عرض السورة في صفحة القراءة
function renderSurah(surah, container) {
    if (!surah || !container) return;
    
    // إنشاء عنوان السورة
    const surahHeader = document.createElement('div');
    surahHeader.className = 'surah-header';
    surahHeader.innerHTML = `
        <h1 class="surah-title">سورة ${surah.name}</h1>
        <div class="surah-info">
            <span class="revelation-type">${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
            <span class="ayah-count">${surah.numberOfAyahs} آية</span>
        </div>
    `;
    
    // إضافة البسملة (باستثناء سورة التوبة)
    if (surah.number !== 9) {
        const bismillah = document.createElement('div');
        bismillah.className = 'bismillah';
        bismillah.textContent = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ';
        container.appendChild(bismillah);
    }
    
    // إنشاء حاوية الآيات
    const ayahsContainer = document.createElement('div');
    ayahsContainer.className = 'ayahs-container';
    
    // إضافة كل آية
    surah.ayahs.forEach(ayah => {
        const ayahElement = document.createElement('div');
        ayahElement.className = 'ayah';
        ayahElement.setAttribute('data-ayah-number', ayah.number);
        
        ayahElement.innerHTML = `
            <div class="ayah-text">${ayah.text}</div>
            <div class="ayah-actions">
                <span class="ayah-number">${ayah.number}</span>
                <div class="action-buttons">
                    <button class="btn btn-icon play-ayah" title="استماع">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-icon tafsir-ayah" title="تفسير">
                        <i class="fas fa-book"></i>
                    </button>
                    <button class="btn btn-icon bookmark-ayah" title="حفظ">
                        <i class="far fa-bookmark"></i>
                    </button>
                    <button class="btn btn-icon share-ayah" title="مشاركة">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        `;
        
        // إضافة أحداث للأزرار
        const playButton = ayahElement.querySelector('.play-ayah');
        if (playButton) {
            playButton.addEventListener('click', function() {
                playAyah(surah.number, ayah.number);
            });
        }
        
        const tafsirButton = ayahElement.querySelector('.tafsir-ayah');
        if (tafsirButton) {
            tafsirButton.addEventListener('click', function() {
                showTafsir(surah.number, ayah.number);
            });
        }
        
        const bookmarkButton = ayahElement.querySelector('.bookmark-ayah');
        if (bookmarkButton) {
            bookmarkButton.addEventListener('click', function() {
                toggleBookmark(surah.number, ayah.number, this);
            });
        }
        
        const shareButton = ayahElement.querySelector('.share-ayah');
        if (shareButton) {
            shareButton.addEventListener('click', function() {
                shareAyah(surah.number, ayah.number, ayah.text);
            });
        }
        
        ayahsContainer.appendChild(ayahElement);
    });
    
    // إضافة العناصر إلى الحاوية
    container.innerHTML = '';
    container.appendChild(surahHeader);
    container.appendChild(ayahsContainer);
    
    // تهيئة ميزات إضافية
    initReadingFeatures();
}

// تشغيل تلاوة آية
function playAyah(surahNumber, ayahNumber) {
    // الحصول على مشغل الصوت
    const audioPlayer = document.getElementById('audioPlayer') || createAudioPlayer();
    
    // تعيين مصدر الصوت
    const reciterId = localStorage.getItem('selectedReciter') || 'mishari-rashid-alafasy';
    audioPlayer.src = `/api/audio/recitation/${reciterId}/ayah/${surahNumber}/${ayahNumber}`;
    
    // تشغيل الصوت
    audioPlayer.play();
}

// إنشاء مشغل صوت إذا لم يكن موجودًا
function createAudioPlayer() {
    const audioPlayer = document.createElement('audio');
    audioPlayer.id = 'audioPlayer';
    audioPlayer.controls = false;
    document.body.appendChild(audioPlayer);
    return audioPlayer;
}

// عرض تفسير آية
function showTafsir(surahNumber, ayahNumber) {
    // إنشاء نافذة منبثقة للتفسير
    const tafsirModal = document.createElement('div');
    tafsirModal.className = 'modal tafsir-modal';
    tafsirModal.style.display = 'block';
    
    tafsirModal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>تفسير الآية ${ayahNumber} من سورة ${currentSurah.name}</h2>
            <div class="ayah-text-container"></div>
            <div class="tafsir-tabs">
                <button class="tafsir-tab active" data-source="muyassar">التفسير الميسر</button>
                <button class="tafsir-tab" data-source="jalalayn">تفسير الجلالين</button>
                <button class="tafsir-tab" data-source="kathir">تفسير ابن كثير</button>
            </div>
            <div class="tafsir-content">
                <div class="loading-spinner">جاري تحميل التفسير...</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(tafsirModal);
    
    // إضافة نص الآية
    const ayahTextContainer = tafsirModal.querySelector('.ayah-text-container');
    if (currentSurah && currentSurah.ayahs) {
        const ayah = currentSurah.ayahs.find(a => a.number === parseInt(ayahNumber));
        if (ayah) {
            ayahTextContainer.innerHTML = `<p class="ayah-text">${ayah.text}</p>`;
        }
    }
    
    // إضافة حدث الإغلاق
    const closeButton = tafsirModal.querySelector('.close-modal');
    closeButton.addEventListener('click', function() {
        document.body.removeChild(tafsirModal);
    });
    
    // إضافة أحداث للتبديل بين مصادر التفسير
    const tafsirTabs = tafsirModal.querySelectorAll('.tafsir-tab');
    tafsirTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // إزالة الفئة النشطة من جميع علامات التبويب
            tafsirTabs.forEach(t => t.classList.remove('active'));
            // إضافة الفئة النشطة للعلامة المحددة
            this.classList.add('active');
            
            // تحميل التفسير من المصدر المحدد
            const source = this.getAttribute('data-source');
            loadTafsir(surahNumber, ayahNumber, source, tafsirModal.querySelector('.tafsir-content'));
        });
    });
    
    // تحميل التفسير الافتراضي
    loadTafsir(surahNumber, ayahNumber, 'muyassar', tafsirModal.querySelector('.tafsir-content'));
}

// تحميل تفسير من مصدر محدد
async function loadTafsir(surahNumber, ayahNumber, source, container) {
    try {
        container.innerHTML = '<div class="loading-spinner">جاري تحميل التفسير...</div>';
        
        // في بيئة التطوير، نستخدم بيانات محلية
        // في الإنتاج، سنستخدم طلب API حقيقي
        const response = await fetch(`/api/tafsir/${source}/ayah/${surahNumber}/${ayahNumber}`);
        const tafsir = await response.json();
        
        container.innerHTML = `
            <div class="tafsir-text">
                <h3>${getTafsirSourceName(source)}</h3>
                <p>${tafsir.text || 'التفسير غير متوفر لهذه الآية من هذا المصدر.'}</p>
            </div>
        `;
    } catch (error) {
        console.error(`خطأ في تحميل تفسير الآية ${ayahNumber} من السورة ${surahNumber} من المصدر ${source}:`, error);
        container.innerHTML = `
            <div class="error-message">
                <p>حدث خطأ أثناء تحميل التفسير. يرجى المحاولة مرة أخرى.</p>
            </div>
        `;
    }
}

// الحصول على اسم مصدر التفسير
function getTafsirSourceName(sourceId) {
    const sources = {
        'muyassar': 'التفسير الميسر',
        'jalalayn': 'تفسير الجلالين',
        'kathir': 'تفسير ابن كثير',
        'tabari': 'تفسير الطبري',
        'qurtubi': 'تفسير القرطبي'
    };
    
    return sources[sourceId] || sourceId;
}

// تبديل حالة العلامة المرجعية للآية
function toggleBookmark(surahNumber, ayahNumber, button) {
    // التحقق من تسجيل الدخول
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        alert('يرجى تسجيل الدخول لاستخدام ميزة الحفظ');
        return;
    }
    
    // الحصول على العلامات المرجعية المحفوظة
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    
    // البحث عن العلامة المرجعية
    const bookmarkIndex = bookmarks.findIndex(b => 
        b.surahNumber === parseInt(surahNumber) && b.ayahNumber === parseInt(ayahNumber)
    );
    
    if (bookmarkIndex === -1) {
        // إضافة علامة مرجعية جديدة
        bookmarks.push({
            surahNumber: parseInt(surahNumber),
            ayahNumber: parseInt(ayahNumber),
            timestamp: new Date().toISOString()
        });
        
        // تحديث الزر
        button.innerHTML = '<i class="fas fa-bookmark"></i>';
        button.title = 'إزالة من الحفظ';
    } else {
        // إزالة العلامة المرجعية
        bookmarks.splice(bookmarkIndex, 1);
        
        // تحديث الزر
        button.innerHTML = '<i class="far fa-bookmark"></i>';
        button.title = 'حفظ';
    }
    
    // حفظ العلامات المرجعية
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    
    // في الإنتاج، سنرسل طلبًا إلى الخادم لتحديث العلامات المرجعية
    // saveBookmarksToServer(bookmarks);
}

// مشاركة آية
function shareAyah(surahNumber, ayahNumber, ayahText) {
    // التحقق من دعم واجهة برمجة المشاركة
    if (navigator.share) {
        navigator.share({
            title: `الآية ${ayahNumber} من سورة ${currentSurah.name}`,
            text: ayahText,
            url: `${window.location.origin}/pages/reading.html?surah=${surahNumber}&ayah=${ayahNumber}`
        })
        .catch(error => console.error('خطأ في المشاركة:', error));
    } else {
        // نسخ النص إلى الحافظة
        const textToCopy = `${ayahText}\n(سورة ${currentSurah.name} - الآية ${ayahNumber})`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                alert('تم نسخ الآية إلى الحافظة');
            })
            .catch(error => console.error('خطأ في نسخ النص:', error));
    }
}

// تهيئة ميزات القراءة
function initReadingFeatures() {
    // تهيئة تغيير حجم الخط
    const fontSizeControls = document.querySelectorAll('.font-size-control');
    if (fontSizeControls) {
        fontSizeControls.forEach(control => {
            control.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                changeFontSize(action);
            });
        });
    }
    
    // تهيئة تبديل الوضع المظلم
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            toggleDarkMode();
        });
        
        // تطبيق الوضع المظلم إذا كان مفعلاً
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
    }
}

// تغيير حجم الخط
function changeFontSize(action) {
    const ayahTexts = document.querySelectorAll('.ayah-text');
    if (!ayahTexts.length) return;
    
    // الحصول على حجم الخط الحالي
    const currentSize = parseFloat(window.getComputedStyle(ayahTexts[0]).fontSize);
    
    // تحديد الحجم الجديد
    let newSize;
    if (action === 'increase') {
        newSize = currentSize * 1.1;
    } else if (action === 'decrease') {
        newSize = currentSize * 0.9;
    } else if (action === 'reset') {
        newSize = 24; // الحجم الافتراضي
    }
    
    // تطبيق الحجم الجديد
    ayahTexts.forEach(text => {
        text.style.fontSize = `${newSize}px`;
    });
    
    // حفظ الإعداد
    localStorage.setItem('fontSize', newSize);
}

// تبديل الوضع المظلم
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// بيانات وهمية للقرآن الكريم
const mockQuranData = [
    {
        number: 1,
        name: "الفاتحة",
        englishName: "Al-Fatiha",
        englishNameTranslation: "The Opening",
        numberOfAyahs: 7,
        revelationType: "Meccan",
        ayahs: [
            { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", juz: 1, page: 1 },
            { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", juz: 1, page: 1 },
            { number: 3, text: "الرَّحْمَنِ الرَّحِيمِ", juz: 1, page: 1 },
            { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ", juz: 1, page: 1 },
            { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", juz: 1, page: 1 },
            { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", juz: 1, page: 1 },
            { number: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", juz: 1, page: 1 }
        ]
    },
    // يمكن إضافة المزيد من السور هنا
];

// بيانات وهمية لآية اليوم
const mockVerseOfDay = {
    date: new Date().toISOString().split('T')[0],
    surah: {
        number: 51,
        name: "الذاريات",
        englishName: "Adh-Dhariyat",
        englishNameTranslation: "The Winnowing Winds"
    },
    ayah: {
        number: 56,
        text: "وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ",
        page: 523,
        juz: 27
    }
};

// محاكاة نتائج البحث
function mockSearchResults(query) {
    // نتائج بحث وهمية
    return {
        success: true,
        count: 3,
        data: [
            {
                surah: {
                    number: 2,
                    name: "البقرة",
                    englishName: "Al-Baqara"
                },
                ayah: {
                    number: 255,
                    text: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
                    page: 42,
                    juz: 3
                }
            },
            {
                surah: {
                    number: 112,
                    name: "الإخلاص",
                    englishName: "Al-Ikhlas"
                },
                ayah: {
                    number: 1,
                    text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
                    page: 604,
                    juz: 30
                }
            },
            {
                surah: {
                    number: 1,
                    name: "الفاتحة",
                    englishName: "Al-Fatiha"
                },
                ayah: {
                    number: 2,
                    text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                    page: 1,
                    juz: 1
                }
            }
        ]
    };
}

// تصدير الدوال
window.quranJS = {
    loadQuranData,
    getSurah,
    getAyah,
    searchQuran,
    getVerseOfDay,
    renderSurah
};
