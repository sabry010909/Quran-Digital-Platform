// main.js - الملف الرئيسي للجافاسكريبت لموقع القرآن الكريم

// انتظار تحميل المستند بالكامل
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة القائمة المتنقلة
    initMobileMenu();
    
    // تهيئة النوافذ المنبثقة
    initModals();
    
    // تهيئة فهرس السور
    initSurahIndex();
    
    // تهيئة مشغل الصوت
    initAudioPlayer();
    
    // تهيئة أزرار المشاركة والنسخ
    initShareButtons();
    
    // تهيئة نظام تسجيل الدخول
    initAuthSystem();
});

// تهيئة القائمة المتنقلة
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainMenu = document.querySelector('.main-menu');
    
    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', function() {
            mainMenu.classList.toggle('active');
        });
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.mobile-menu-toggle') && !event.target.closest('.main-menu')) {
                mainMenu.classList.remove('active');
            }
        });
    }
}

// تهيئة النوافذ المنبثقة
function initModals() {
    // الحصول على عناصر النوافذ المنبثقة
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeBtns = document.querySelectorAll('.close-modal');
    const showRegisterLink = document.getElementById('showRegisterLink');
    const showLoginLink = document.getElementById('showLoginLink');
    
    // فتح نافذة تسجيل الدخول
    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', function() {
            loginModal.style.display = 'block';
        });
    }
    
    // فتح نافذة إنشاء حساب
    if (registerBtn && registerModal) {
        registerBtn.addEventListener('click', function() {
            registerModal.style.display = 'block';
        });
    }
    
    // إغلاق النوافذ المنبثقة
    if (closeBtns) {
        closeBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (loginModal) loginModal.style.display = 'none';
                if (registerModal) registerModal.style.display = 'none';
            });
        });
    }
    
    // التبديل بين نوافذ تسجيل الدخول وإنشاء حساب
    if (showRegisterLink && registerModal && loginModal) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = 'block';
        });
    }
    
    if (showLoginLink && loginModal && registerModal) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
    }
    
    // إغلاق النوافذ المنبثقة عند النقر خارجها
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });
    
    // معالجة نماذج تسجيل الدخول وإنشاء حساب
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // إرسال بيانات تسجيل الدخول إلى الخادم
            login(email, password);
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            // التحقق من تطابق كلمتي المرور
            if (password !== confirmPassword) {
                alert('كلمتا المرور غير متطابقتين');
                return;
            }
            
            // إرسال بيانات إنشاء الحساب إلى الخادم
            register(name, username, email, password);
        });
    }
}

// تهيئة فهرس السور
function initSurahIndex() {
    const surahsGrid = document.querySelector('.surahs-grid');
    const sortSelect = document.getElementById('sortSurahsBy');
    const filterButtons = document.querySelectorAll('.filter-buttons .btn');
    
    if (surahsGrid) {
        // جلب بيانات السور من الخادم
        fetchSurahs()
            .then(surahs => {
                // عرض السور
                renderSurahs(surahs, surahsGrid);
                
                // تهيئة التصفية والترتيب
                if (sortSelect) {
                    sortSelect.addEventListener('change', function() {
                        const sortedSurahs = sortSurahs(surahs, this.value);
                        renderSurahs(sortedSurahs, surahsGrid);
                    });
                }
                
                if (filterButtons) {
                    filterButtons.forEach(button => {
                        button.addEventListener('click', function() {
                            // إزالة الفئة النشطة من جميع الأزرار
                            filterButtons.forEach(btn => btn.classList.remove('active'));
                            // إضافة الفئة النشطة للزر المحدد
                            this.classList.add('active');
                            
                            const filter = this.getAttribute('data-filter');
                            const filteredSurahs = filterSurahs(surahs, filter);
                            renderSurahs(filteredSurahs, surahsGrid);
                        });
                    });
                }
            })
            .catch(error => {
                console.error('خطأ في جلب بيانات السور:', error);
                surahsGrid.innerHTML = '<p class="error-message">حدث خطأ أثناء تحميل فهرس السور. يرجى المحاولة مرة أخرى.</p>';
            });
    }
}

// جلب بيانات السور من الخادم
async function fetchSurahs() {
    try {
        // في بيئة التطوير، يمكننا استخدام بيانات وهمية
        // في الإنتاج، سنستخدم طلب API حقيقي
        return mockSurahs;
    } catch (error) {
        console.error('خطأ في جلب بيانات السور:', error);
        throw error;
    }
}

// عرض السور في الشبكة
function renderSurahs(surahs, container) {
    container.innerHTML = '';
    
    surahs.forEach(surah => {
        const surahCard = document.createElement('div');
        surahCard.className = 'surah-card';
        surahCard.setAttribute('data-surah-number', surah.number);
        
        surahCard.innerHTML = `
            <div class="surah-number">${surah.number}</div>
            <div class="surah-name">${surah.name}</div>
            <div class="surah-info">
                <span>${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                <span>${surah.numberOfAyahs} آية</span>
            </div>
        `;
        
        // إضافة حدث النقر للانتقال إلى صفحة السورة
        surahCard.addEventListener('click', function() {
            window.location.href = `pages/reading.html?surah=${surah.number}`;
        });
        
        container.appendChild(surahCard);
    });
}

// ترتيب السور حسب المعيار المحدد
function sortSurahs(surahs, criterion) {
    const surahsCopy = [...surahs];
    
    switch (criterion) {
        case 'order':
            return surahsCopy.sort((a, b) => a.number - b.number);
        case 'name':
            return surahsCopy.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        case 'revelation':
            return surahsCopy.sort((a, b) => {
                if (a.revelationType === b.revelationType) {
                    return a.number - b.number;
                }
                return a.revelationType === 'Meccan' ? -1 : 1;
            });
        case 'ayahs':
            return surahsCopy.sort((a, b) => a.numberOfAyahs - b.numberOfAyahs);
        default:
            return surahsCopy;
    }
}

// تصفية السور حسب نوع النزول
function filterSurahs(surahs, filter) {
    if (filter === 'all') {
        return surahs;
    }
    
    return surahs.filter(surah => {
        if (filter === 'makki') {
            return surah.revelationType === 'Meccan';
        } else if (filter === 'madani') {
            return surah.revelationType === 'Medinan';
        }
        return true;
    });
}

// تهيئة مشغل الصوت
function initAudioPlayer() {
    const audio = document.getElementById('recitationAudio');
    const playBtn = document.getElementById('playRecitationBtn');
    const pauseBtn = document.getElementById('pauseRecitationBtn');
    const stopBtn = document.getElementById('stopRecitationBtn');
    const repeatBtn = document.getElementById('repeatRecitationBtn');
    const volumeControl = document.getElementById('volumeControl');
    const versePlayBtn = document.getElementById('playVerseBtn');
    
    if (audio) {
        // أزرار التشغيل والإيقاف
        if (playBtn) {
            playBtn.addEventListener('click', function() {
                audio.play();
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', function() {
                audio.pause();
            });
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                audio.pause();
                audio.currentTime = 0;
            });
        }
        
        // زر التكرار
        if (repeatBtn) {
            repeatBtn.addEventListener('click', function() {
                audio.loop = !audio.loop;
                this.classList.toggle('active');
            });
        }
        
        // التحكم في مستوى الصوت
        if (volumeControl) {
            volumeControl.addEventListener('input', function() {
                audio.volume = this.value;
            });
        }
    }
    
    // زر تشغيل آية اليوم
    if (versePlayBtn && audio) {
        versePlayBtn.addEventListener('click', function() {
            // تغيير مصدر الصوت إلى تلاوة آية اليوم
            audio.src = 'assets/audio/alafasy/verse_of_day.mp3';
            audio.play();
        });
    }
}

// تهيئة أزرار المشاركة والنسخ
function initShareButtons() {
    const shareVerseBtn = document.getElementById('shareVerseBtn');
    const copyVerseBtn = document.getElementById('copyVerseBtn');
    
    if (shareVerseBtn) {
        shareVerseBtn.addEventListener('click', function() {
            // التحقق من دعم واجهة برمجة المشاركة
            if (navigator.share) {
                const verseText = document.querySelector('.arabic-text').textContent;
                const verseInfo = document.querySelector('.verse-info').textContent;
                
                navigator.share({
                    title: 'آية اليوم من موقع القرآن الكريم',
                    text: `${verseText}\n${verseInfo}`,
                    url: window.location.href
                })
                .catch(error => console.error('خطأ في المشاركة:', error));
            } else {
                alert('متصفحك لا يدعم واجهة برمجة المشاركة');
            }
        });
    }
    
    if (copyVerseBtn) {
        copyVerseBtn.addEventListener('click', function() {
            const verseText = document.querySelector('.arabic-text').textContent;
            const verseInfo = document.querySelector('.verse-info').textContent;
            const textToCopy = `${verseText}\n${verseInfo}`;
            
            // نسخ النص إلى الحافظة
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // إظهار رسالة نجاح
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i>';
                    
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                })
                .catch(error => console.error('خطأ في نسخ النص:', error));
        });
    }
}

// تهيئة نظام تسجيل الدخول
function initAuthSystem() {
    // التحقق من وجود المستخدم في الجلسة
    checkAuthStatus();
    
    // معالجة تسجيل الخروج
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

// التحقق من حالة تسجيل الدخول
async function checkAuthStatus() {
    try {
        // في بيئة التطوير، نستخدم بيانات وهمية
        // في الإنتاج، سنستخدم طلب API حقيقي
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isLoggedIn) {
            // إظهار واجهة المستخدم المسجل
            showLoggedInUI();
        } else {
            // إظهار واجهة المستخدم غير المسجل
            showLoggedOutUI();
        }
    } catch (error) {
        console.error('خطأ في التحقق من حالة تسجيل الدخول:', error);
    }
}

// إظهار واجهة المستخدم المسجل
function showLoggedInUI() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userProfile = document.querySelector('.user-profile');
    const username = document.querySelector('.username');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    if (username) username.textContent = localStorage.getItem('username') || 'المستخدم';
}

// إظهار واجهة المستخدم غير المسجل
function showLoggedOutUI() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userProfile = document.querySelector('.user-profile');
    
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (registerBtn) registerBtn.style.display = 'inline-block';
    if (userProfile) userProfile.style.display = 'none';
}

// تسجيل الدخول
async function login(email, password) {
    try {
        // في بيئة التطوير، نستخدم بيانات وهمية
        // في الإنتاج، سنستخدم طلب API حقيقي
        
        // محاكاة طلب تسجيل الدخول
        console.log('تسجيل الدخول باستخدام:', { email, password });
        
        // محاكاة استجابة ناجحة
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', email.split('@')[0]);
        
        // إغلاق النافذة المنبثقة
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        
        // تحديث واجهة المستخدم
        showLoggedInUI();
        
        // إعادة تحميل الصفحة لتحديث البيانات
        // window.location.reload();
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        alert('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    }
}

// إنشاء حساب جديد
async function register(name, username, email, password) {
    try {
        // في بيئة التطوير، نستخدم بيانات وهمية
        // في الإنتاج، سنستخدم طلب API حقيقي
        
        // محاكاة طلب إنشاء حساب
        console.log('إنشاء حساب باستخدام:', { name, username, email, password });
        
        // محاكاة استجابة ناجحة
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        
        // إغلاق النافذة المنبثقة
        const registerModal = document.getElementById('registerModal');
        if (registerModal) registerModal.style.display = 'none';
        
        // تحديث واجهة المستخدم
        showLoggedInUI();
        
        // إعادة تحميل الصفحة لتحديث البيانات
        // window.location.reload();
    } catch (error) {
        console.error('خطأ في إنشاء حساب:', error);
        alert('حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    }
}

// تسجيل الخروج
function logout() {
    // حذف بيانات الجلسة
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    
    // تحديث واجهة المستخدم
    showLoggedOutUI();
    
    // إعادة تحميل الصفحة لتحديث البيانات
    // window.location.reload();
}

// بيانات وهمية للسور
const mockSurahs = [
    { number: 1, name: "الفاتحة", englishName: "Al-Fatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
    { number: 2, name: "البقرة", englishName: "Al-Baqara", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" },
    { number: 3, name: "آل عمران", englishName: "Aal-Imran", englishNameTranslation: "The Family of Imran", numberOfAyahs: 200, revelationType: "Medinan" },
    { number: 4, name: "النساء", englishName: "An-Nisa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan" },
    { number: 5, name: "المائدة", englishName: "Al-Ma'ida", englishNameTranslation: "The Table Spread", numberOfAyahs: 120, revelationType: "Medinan" },
    { number: 6, name: "الأنعام", englishName: "Al-An'am", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan" },
    { number: 7, name: "الأعراف", englishName: "Al-A'raf", englishNameTranslation: "The Heights", numberOfAyahs: 206, revelationType: "Meccan" },
    { number: 8, name: "الأنفال", englishName: "Al-Anfal", englishNameTranslation: "The Spoils of War", numberOfAyahs: 75, revelationType: "Medinan" },
    { number: 9, name: "التوبة", englishName: "At-Tawba", englishNameTranslation: "The Repentance", numberOfAyahs: 129, revelationType: "Medinan" },
    { number: 10, name: "يونس", englishName: "Yunus", englishNameTranslation: "Jonah", numberOfAyahs: 109, revelationType: "Meccan" },
    { number: 11, name: "هود", englishName: "Hud", englishNameTranslation: "Hud", numberOfAyahs: 123, revelationType: "Meccan" },
    { number: 12, name: "يوسف", englishName: "Yusuf", englishNameTranslation: "Joseph", numberOfAyahs: 111, revelationType: "Meccan" },
    // يمكن إضافة المزيد من السور هنا
];
