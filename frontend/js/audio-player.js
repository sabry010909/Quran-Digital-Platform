// audio-player.js - ملف جافاسكريبت لمشغل الصوت في موقع القرآن الكريم

// متغيرات عامة
let currentReciter = null;
let currentSurah = null;
let currentAyah = null;
let isPlaying = false;
let isRepeatEnabled = false;
let repeatCount = 1;
let currentRepeatCount = 0;
let audioQueue = [];
let currentAudioIndex = 0;

// تهيئة مشغل الصوت
document.addEventListener('DOMContentLoaded', function() {
    initAudioPlayer();
});

// تهيئة مشغل الصوت
function initAudioPlayer() {
    // الحصول على عناصر مشغل الصوت
    const audioPlayer = document.getElementById('recitationAudio');
    const playBtn = document.getElementById('playRecitationBtn');
    const pauseBtn = document.getElementById('pauseRecitationBtn');
    const stopBtn = document.getElementById('stopRecitationBtn');
    const repeatBtn = document.getElementById('repeatRecitationBtn');
    const volumeControl = document.getElementById('volumeControl');
    const reciterSelect = document.getElementById('reciterSelect');
    const speedControl = document.getElementById('speedControl');
    
    // تحميل الإعدادات المحفوظة
    loadAudioSettings();
    
    if (audioPlayer) {
        // إضافة أحداث للمشغل
        audioPlayer.addEventListener('ended', handleAudioEnded);
        audioPlayer.addEventListener('play', function() {
            isPlaying = true;
            updatePlayerUI();
        });
        audioPlayer.addEventListener('pause', function() {
            isPlaying = false;
            updatePlayerUI();
        });
        audioPlayer.addEventListener('timeupdate', updateProgressBar);
        
        // أزرار التشغيل والإيقاف
        if (playBtn) {
            playBtn.addEventListener('click', function() {
                playAudio();
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', function() {
                pauseAudio();
            });
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                stopAudio();
            });
        }
        
        // زر التكرار
        if (repeatBtn) {
            repeatBtn.addEventListener('click', function() {
                toggleRepeat();
            });
        }
        
        // التحكم في مستوى الصوت
        if (volumeControl) {
            volumeControl.addEventListener('input', function() {
                setVolume(this.value);
            });
            
            // تعيين مستوى الصوت المحفوظ
            const savedVolume = localStorage.getItem('audioVolume') || 1;
            volumeControl.value = savedVolume;
            audioPlayer.volume = savedVolume;
        }
        
        // اختيار القارئ
        if (reciterSelect) {
            reciterSelect.addEventListener('change', function() {
                changeReciter(this.value);
            });
            
            // تعيين القارئ المحفوظ
            const savedReciter = localStorage.getItem('selectedReciter');
            if (savedReciter) {
                reciterSelect.value = savedReciter;
                currentReciter = savedReciter;
            } else {
                currentReciter = reciterSelect.value;
            }
        }
        
        // التحكم في سرعة التشغيل
        if (speedControl) {
            speedControl.addEventListener('change', function() {
                setPlaybackSpeed(this.value);
            });
            
            // تعيين سرعة التشغيل المحفوظة
            const savedSpeed = localStorage.getItem('playbackSpeed') || 1;
            speedControl.value = savedSpeed;
            audioPlayer.playbackRate = savedSpeed;
        }
    }
    
    // تهيئة أزرار التنقل بين الآيات
    initNavigationButtons();
}

// تحميل إعدادات الصوت المحفوظة
function loadAudioSettings() {
    const audioPlayer = document.getElementById('recitationAudio');
    if (!audioPlayer) return;
    
    // تحميل مستوى الصوت
    const savedVolume = localStorage.getItem('audioVolume');
    if (savedVolume !== null) {
        audioPlayer.volume = parseFloat(savedVolume);
    }
    
    // تحميل إعداد التكرار
    isRepeatEnabled = localStorage.getItem('repeatEnabled') === 'true';
    repeatCount = parseInt(localStorage.getItem('repeatCount') || '1');
    
    // تحميل سرعة التشغيل
    const savedSpeed = localStorage.getItem('playbackSpeed');
    if (savedSpeed !== null) {
        audioPlayer.playbackRate = parseFloat(savedSpeed);
    }
    
    // تحميل القارئ المحدد
    currentReciter = localStorage.getItem('selectedReciter') || 'mishari-rashid-alafasy';
}

// تشغيل الصوت
function playAudio() {
    const audioPlayer = document.getElementById('recitationAudio');
    if (audioPlayer) {
        audioPlayer.play();
    }
}

// إيقاف الصوت مؤقتًا
function pauseAudio() {
    const audioPlayer = document.getElementById('recitationAudio');
    if (audioPlayer) {
        audioPlayer.pause();
    }
}

// إيقاف الصوت
function stopAudio() {
    const audioPlayer = document.getElementById('recitationAudio');
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
}

// تبديل وضع التكرار
function toggleRepeat() {
    isRepeatEnabled = !isRepeatEnabled;
    localStorage.setItem('repeatEnabled', isRepeatEnabled);
    
    // تحديث واجهة المستخدم
    const repeatBtn = document.getElementById('repeatRecitationBtn');
    if (repeatBtn) {
        if (isRepeatEnabled) {
            repeatBtn.classList.add('active');
            
            // فتح نافذة إعدادات التكرار
            showRepeatSettings();
        } else {
            repeatBtn.classList.remove('active');
        }
    }
}

// عرض إعدادات التكرار
function showRepeatSettings() {
    // إنشاء نافذة منبثقة للإعدادات
    const settingsModal = document.createElement('div');
    settingsModal.className = 'modal repeat-settings-modal';
    settingsModal.style.display = 'block';
    
    settingsModal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>إعدادات التكرار</h2>
            <div class="form-group">
                <label for="repeatCountInput">عدد مرات التكرار:</label>
                <input type="number" id="repeatCountInput" min="1" max="10" value="${repeatCount}">
            </div>
            <div class="form-group">
                <button id="saveRepeatSettings" class="btn btn-primary">حفظ</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(settingsModal);
    
    // إضافة حدث الإغلاق
    const closeButton = settingsModal.querySelector('.close-modal');
    closeButton.addEventListener('click', function() {
        document.body.removeChild(settingsModal);
    });
    
    // إضافة حدث الحفظ
    const saveButton = settingsModal.querySelector('#saveRepeatSettings');
    saveButton.addEventListener('click', function() {
        const countInput = document.getElementById('repeatCountInput');
        repeatCount = parseInt(countInput.value) || 1;
        localStorage.setItem('repeatCount', repeatCount);
        document.body.removeChild(settingsModal);
    });
}

// تعيين مستوى الصوت
function setVolume(volume) {
    const audioPlayer = document.getElementById('recitationAudio');
    if (audioPlayer) {
        audioPlayer.volume = volume;
        localStorage.setItem('audioVolume', volume);
    }
}

// تغيير القارئ
function changeReciter(reciterId) {
    currentReciter = reciterId;
    localStorage.setItem('selectedReciter', reciterId);
    
    // إذا كان هناك سورة أو آية قيد التشغيل، قم بتحديث المصدر
    if (currentSurah) {
        if (currentAyah) {
            loadAyahAudio(currentSurah, currentAyah);
        } else {
            loadSurahAudio(currentSurah);
        }
    }
}

// تعيين سرعة التشغيل
function setPlaybackSpeed(speed) {
    const audioPlayer = document.getElementById('recitationAudio');
    if (audioPlayer) {
        audioPlayer.playbackRate = speed;
        localStorage.setItem('playbackSpeed', speed);
    }
}

// تحميل صوت سورة كاملة
function loadSurahAudio(surahNumber) {
    const audioPlayer = document.getElementById('recitationAudio');
    if (!audioPlayer) return;
    
    currentSurah = surahNumber;
    currentAyah = null;
    
    // تعيين مصدر الصوت
    const audioUrl = `/api/audio/recitation/${currentReciter}/surah/${surahNumber}`;
    audioPlayer.src = audioUrl;
    
    // تحديث واجهة المستخدم
    updatePlayerInfo(surahNumber);
}

// تحميل صوت آية محددة
function loadAyahAudio(surahNumber, ayahNumber) {
    const audioPlayer = document.getElementById('recitationAudio');
    if (!audioPlayer) return;
    
    currentSurah = surahNumber;
    currentAyah = ayahNumber;
    
    // تعيين مصدر الصوت
    const audioUrl = `/api/audio/recitation/${currentReciter}/ayah/${surahNumber}/${ayahNumber}`;
    audioPlayer.src = audioUrl;
    
    // تحديث واجهة المستخدم
    updatePlayerInfo(surahNumber, ayahNumber);
}

// تحميل مجموعة من الآيات
function loadAyahRange(surahNumber, startAyah, endAyah) {
    // إنشاء قائمة انتظار للآيات
    audioQueue = [];
    for (let i = startAyah; i <= endAyah; i++) {
        audioQueue.push({
            surah: surahNumber,
            ayah: i
        });
    }
    
    // بدء تشغيل أول آية
    currentAudioIndex = 0;
    playQueuedAudio();
}

// تشغيل الصوت التالي في قائمة الانتظار
function playQueuedAudio() {
    if (currentAudioIndex < audioQueue.length) {
        const audio = audioQueue[currentAudioIndex];
        loadAyahAudio(audio.surah, audio.ayah);
        playAudio();
    }
}

// معالجة انتهاء الصوت
function handleAudioEnded() {
    if (isRepeatEnabled) {
        // زيادة عداد التكرار
        currentRepeatCount++;
        
        if (currentRepeatCount < repeatCount) {
            // إعادة تشغيل الصوت
            const audioPlayer = document.getElementById('recitationAudio');
            if (audioPlayer) {
                audioPlayer.currentTime = 0;
                audioPlayer.play();
            }
            return;
        } else {
            // إعادة تعيين عداد التكرار
            currentRepeatCount = 0;
        }
    }
    
    // التحقق من وجود صوت تالي في قائمة الانتظار
    if (audioQueue.length > 0 && currentAudioIndex < audioQueue.length - 1) {
        currentAudioIndex++;
        playQueuedAudio();
    }
}

// تحديث شريط التقدم
function updateProgressBar() {
    const audioPlayer = document.getElementById('recitationAudio');
    const progressBar = document.getElementById('audioProgressBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    
    if (audioPlayer && progressBar) {
        const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${percentage}%`;
    }
    
    if (audioPlayer && currentTimeDisplay) {
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    }
    
    if (audioPlayer && durationDisplay && !isNaN(audioPlayer.duration)) {
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    }
}

// تنسيق الوقت (ثواني إلى mm:ss)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// تحديث معلومات المشغل
function updatePlayerInfo(surahNumber, ayahNumber = null) {
    const playerTitle = document.getElementById('playerTitle');
    const playerSubtitle = document.getElementById('playerSubtitle');
    const reciterName = document.getElementById('reciterName');
    
    // الحصول على اسم السورة
    getSurahName(surahNumber)
        .then(surahName => {
            if (playerTitle) {
                playerTitle.textContent = `سورة ${surahName}`;
            }
            
            if (playerSubtitle && ayahNumber) {
                playerSubtitle.textContent = `الآية ${ayahNumber}`;
            } else if (playerSubtitle) {
                playerSubtitle.textContent = 'السورة كاملة';
            }
        });
    
    // الحصول على اسم القارئ
    getReciterName(currentReciter)
        .then(name => {
            if (reciterName) {
                reciterName.textContent = name;
            }
        });
}

// الحصول على اسم السورة
async function getSurahName(surahNumber) {
    try {
        // في بيئة التطوير، نستخدم بيانات محلية
        // في الإنتاج، سنستخدم طلب API حقيقي
        const surahNames = {
            1: "الفاتحة",
            2: "البقرة",
            3: "آل عمران",
            4: "النساء",
            5: "المائدة",
            6: "الأنعام",
            7: "الأعراف",
            8: "الأنفال",
            9: "التوبة",
            10: "يونس",
            // ... باقي السور
        };
        
        return surahNames[surahNumber] || `سورة ${surahNumber}`;
    } catch (error) {
        console.error(`خطأ في الحصول على اسم السورة ${surahNumber}:`, error);
        return `سورة ${surahNumber}`;
    }
}

// الحصول على اسم القارئ
async function getReciterName(reciterId) {
    try {
        // في بيئة التطوير، نستخدم بيانات محلية
        // في الإنتاج، سنستخدم طلب API حقيقي
        const reciterNames = {
            'mishari-rashid-alafasy': 'مشاري راشد العفاسي',
            'abdul-basit-abdul-samad': 'عبد الباسط عبد الصمد',
            'mahmoud-khalil-al-husary': 'محمود خليل الحصري',
            'muhammad-siddiq-al-minshawi': 'محمد صديق المنشاوي',
            'maher-al-muaiqly': 'ماهر المعيقلي'
        };
        
        return reciterNames[reciterId] || reciterId;
    } catch (error) {
        console.error(`خطأ في الحصول على اسم القارئ ${reciterId}:`, error);
        return reciterId;
    }
}

// تحديث واجهة المستخدم للمشغل
function updatePlayerUI() {
    const playBtn = document.getElementById('playRecitationBtn');
    const pauseBtn = document.getElementById('pauseRecitationBtn');
    
    if (isPlaying) {
        if (playBtn) playBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'inline-block';
    } else {
        if (playBtn) playBtn.style.display = 'inline-block';
        if (pauseBtn) pauseBtn.style.display = 'none';
    }
}

// تهيئة أزرار التنقل بين الآيات
function initNavigationButtons() {
    const prevAyahBtn = document.getElementById('prevAyahBtn');
    const nextAyahBtn = document.getElementById('nextAyahBtn');
    const prevSurahBtn = document.getElementById('prevSurahBtn');
    const nextSurahBtn = document.getElementById('nextSurahBtn');
    
    if (prevAyahBtn) {
        prevAyahBtn.addEventListener('click', function() {
            navigateToPrevAyah();
        });
    }
    
    if (nextAyahBtn) {
        nextAyahBtn.addEventListener('click', function() {
            navigateToNextAyah();
        });
    }
    
    if (prevSurahBtn) {
        prevSurahBtn.addEventListener('click', function() {
            navigateToPrevSurah();
        });
    }
    
    if (nextSurahBtn) {
        nextSurahBtn.addEventListener('click', function() {
            navigateToNextSurah();
        });
    }
}

// الانتقال إلى الآية السابقة
function navigateToPrevAyah() {
    if (!currentSurah || !currentAyah) return;
    
    if (currentAyah > 1) {
        // الانتقال إلى الآية السابقة في نفس السورة
        loadAyahAudio(currentSurah, currentAyah - 1);
        playAudio();
    } else {
        // الانتقال إلى آخر آية في السورة السابقة
        if (currentSurah > 1) {
            getSurahAyahCount(currentSurah - 1)
                .then(ayahCount => {
                    loadAyahAudio(currentSurah - 1, ayahCount);
                    playAudio();
                });
        }
    }
}

// الانتقال إلى الآية التالية
function navigateToNextAyah() {
    if (!currentSurah) return;
    
    if (currentAyah) {
        // الحصول على عدد آيات السورة الحالية
        getSurahAyahCount(currentSurah)
            .then(ayahCount => {
                if (currentAyah < ayahCount) {
                    // الانتقال إلى الآية التالية في نفس السورة
                    loadAyahAudio(currentSurah, currentAyah + 1);
                    playAudio();
                } else {
                    // الانتقال إلى أول آية في السورة التالية
                    if (currentSurah < 114) {
                        loadAyahAudio(currentSurah + 1, 1);
                        playAudio();
                    }
                }
            });
    } else {
        // إذا كانت السورة كاملة قيد التشغيل، انتقل إلى أول آية
        loadAyahAudio(currentSurah, 1);
        playAudio();
    }
}

// الانتقال إلى السورة السابقة
function navigateToPrevSurah() {
    if (!currentSurah) return;
    
    if (currentSurah > 1) {
        if (currentAyah) {
            // الانتقال إلى نفس رقم الآية في السورة السابقة (إذا كانت موجودة)
            getSurahAyahCount(currentSurah - 1)
                .then(ayahCount => {
                    const targetAyah = Math.min(currentAyah, ayahCount);
                    loadAyahAudio(currentSurah - 1, targetAyah);
                    playAudio();
                });
        } else {
            // الانتقال إلى السورة السابقة كاملة
            loadSurahAudio(currentSurah - 1);
            playAudio();
        }
    }
}

// الانتقال إلى السورة التالية
function navigateToNextSurah() {
    if (!currentSurah) return;
    
    if (currentSurah < 114) {
        if (currentAyah) {
            // الانتقال إلى نفس رقم الآية في السورة التالية (إذا كانت موجودة)
            getSurahAyahCount(currentSurah + 1)
                .then(ayahCount => {
                    const targetAyah = Math.min(currentAyah, ayahCount);
                    loadAyahAudio(currentSurah + 1, targetAyah);
                    playAudio();
                });
        } else {
            // الانتقال إلى السورة التالية كاملة
            loadSurahAudio(currentSurah + 1);
            playAudio();
        }
    }
}

// الحصول على عدد آيات السورة
async function getSurahAyahCount(surahNumber) {
    try {
        // في بيئة التطوير، نستخدم بيانات محلية
        // في الإنتاج، سنستخدم طلب API حقيقي
        const surahAyahCounts = {
            1: 7,
            2: 286,
            3: 200,
            4: 176,
            5: 120,
            6: 165,
            7: 206,
            8: 75,
            9: 129,
            10: 109,
            // ... باقي السور
        };
        
        return surahAyahCounts[surahNumber] || 0;
    } catch (error) {
        console.error(`خطأ في الحصول على عدد آيات السورة ${surahNumber}:`, error);
        return 0;
    }
}

// تصدير الدوال
window.audioPlayerJS = {
    loadSurahAudio,
    loadAyahAudio,
    loadAyahRange,
    playAudio,
    pauseAudio,
    stopAudio,
    toggleRepeat,
    setVolume,
    changeReciter,
    setPlaybackSpeed
};
