
# 📖 Al-Quran Al-Kareem Interactive Platform

An end-to-end, full-stack digital ecosystem for exploring the Holy Quran. This platform provides a seamless experience for reading, listening, and studying the Quran with advanced educational tools.

**Architected & Developed by: Eng. Sabry Radwan**

---

## 🏗️ System Architecture
The project follows a modular **MVC (Model-View-Controller)** pattern for the backend and a clean, responsive frontend structure:

- **Backend**: Built with **Node.js** & **Express.js**, managing robust API routes for Quranic content, Tafsir, and User data.
- **Frontend**: A high-performance UI developed using **HTML5, CSS3 (with Dark Mode support), and JavaScript**.
- **Database**: **MySQL** integrated for secure user management, progress tracking, and structured content storage.

---

## ✨ Key Features
- **Smart Reading & Tafsir**: Customizable font sizes, themes (Dark/Light), and instant Tafsir comparison.
- **Audio Hub**: Advanced audio player with reciter selection, repetition modes, and playback speed control.
- **Learning & Memorization (Hifz)**: Personalized dashboards to track progress and interactive memorization tests.
- **Tajweed Tools**: Visual aids and video lessons to master Quranic recitation rules.
- **Kids Mode**: A dedicated, simplified interface designed for young learners.
- **Global Search**: High-speed indexing for Ayahs, Surahs, and topics.

---

## 🛠️ Technology Stack
- **Languages**: JavaScript (ES6+), SQL, HTML, CSS.
- **Runtime**: Node.js.
- **Web Framework**: Express.js.
- **Persistence**: MySQL with structured relational schema.
- **Deployment**: Local server configuration with NPM scripts.

---

## 📂 Project Structure
*Organized for scalability and maintainability:*
- `/backend`: Core logic, controllers, and API routing.
- `/frontend`: Responsive pages and optimized assets (CSS/JS).
- `/database`: Relational schema designs and setup scripts.

---

## 🎓 Academic Vision
This platform demonstrates my proficiency in **Full-Stack Web Development** and **Database Management**. It serves as a practical application of the concepts I intend to master during my Master's studies, focusing on **Scalable Software Architectures**.

---

## 📜 License & Copyright
All rights reserved © **Eng. Sabry Radwan**.

 
```
QuranWebsite/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── quran.js
│   │   ├── user.js
│   │   ├── tafsir.js
│   │   ├── audio.js
│   ├── models/
│   │   ├── verse.js
│   │   ├── user.js
│   │   ├── tafsir.js
│   │   ├── reciter.js
│   ├── controllers/
│   │   ├── quranController.js
│   │   ├── userController.js
│   │   ├── tafsirController.js
│   │   ├── audioController.js
│   ├── config/
│   │   ├── db.js
│   │   ├── auth.js
├── frontend/
│   ├── index.html
│   ├── pages/
│   │   ├── reading.html
│   │   ├── listening.html
│   │   ├── tafsir.html
│   │   ├── learning.html
│   │   ├── tajweed.html
│   │   ├── kids.html
│   │   ├── qa.html
│   ├── css/
│   │   ├── style.css
│   │   ├── dark-mode.css
│   │   ├── kids-mode.css
│   ├── js/
│   │   ├── main.js
│   │   ├── quran.js
│   │   ├── audio-player.js
│   │   ├── tafsir.js
│   │   ├── learning.js
│   │   ├── tajweed.js
│   ├── assets/
│   │   ├── audio/
│   │   ├── images/
│   │   ├── fonts/
├── database/
│   ├── setup.js
│   ├── schema.sql
├── package.json
├── .gitignore
├── README.md
```

