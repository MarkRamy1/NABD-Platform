# 🏥 NABD - Hospital Platform Prototype

> **نبض (Pulse)** - Empowering patients with transparent hospital information and community-driven insights across the Greater Cairo region.

![NABD Logo](Favicon_Nabd.jpeg)

[![Status](https://img.shields.io/badge/Status-Active-green)]() 
[![Version](https://img.shields.io/badge/Version-1.0-blue)]() 
[![Languages](https://img.shields.io/badge/Languages-English%20%7C%20Arabic-orange)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Technical Architecture](#technical-architecture)
- [Data Overview](#data-overview)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 Overview

**NABD** is a bilingual healthcare discovery platform that helps patients find, compare, and review hospitals across the Greater Cairo region. The platform combines data-driven hospital insights with community-driven reviews to empower informed healthcare decisions.

### Problem Statement
- Patients struggle to find reliable hospital information
- No centralized platform for hospital comparison
- Lack of verified patient reviews and ratings
- Limited transparency in healthcare options

### Solution
NABD bridges this gap by providing:
- **Database of 325 hospitals** with detailed information (Greater Cairo CSV)
- **Community reviews and ratings** from verified patients
- **Bilingual interface** (English & Arabic)
- **Advanced search and filtering** capabilities
- **Google Calendar integration** for appointment booking

---

## ✨ Features

### 🔍 Core Features

| Feature | Description | Status |
|---------|---|:---:|
| **Hospital Discovery** | Search and browse 325 hospitals with detailed profiles | ✅ |
| **Advanced Filtering** | Filter by location, specialty, bed capacity, and working hours | ✅ |
| **Rating System** | 5-star community ratings with detailed patient reviews | ✅ |
| **Bilingual Support** | Complete English & Arabic interface | ✅ |
| **User Authentication** | Secure login system with Gmail support | ✅ |
| **Favorites Management** | Save and bookmark preferred hospitals | ✅ |
| **Profile Management** | Update user information and preferences | ✅ |
| **Google Calendar Sync** | Book appointments and sync to Google Calendar | ✅ |
| **Responsive Design** | Mobile, tablet, and desktop optimized | ✅ |

### 📊 Data Insights

- **Total Hospitals**: 325 (in deployed CSV; analytics target 402)
- **Regions Covered**: Cairo, Giza, El Qalyubia
- **Review Database**: Sample bilingual reviews (mock data for demo hospitals)
- **Live demo**: [markramy1.github.io/NABD-Platform](https://markramy1.github.io/NABD-Platform/)

---

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required for prototype version

### Option 1: Local Development (Instant)

```bash
git clone https://github.com/MarkRamy1/NABD-Platform.git
cd NABD-Platform
cp google-calendar-config.example.js google-calendar-config.js
# Edit google-calendar-config.js with your Google OAuth credentials (optional)

python -m http.server 8000
# Open http://localhost:8000
```

### Option 2: Live Demo (GitHub Pages)
```
https://markramy1.github.io/NABD-Platform/
```

---

## 📁 Project Structure

```
NABD-Platform/
├── index.html                         # ⭐ Main entry point
├── script.js                          # Application logic
├── style.css, bootstrap.css
├── i18n.js, hospital-names.js, mockReviews.js
├── google-calendar-integration.js
├── google-calendar-config.example.js  # Copy → google-calendar-config.js (gitignored)
├── Hospitals_Greater_Cairo_Region.csv
├── locales/en/common.json, locales/ar/common.json
├── .github/workflows/pages.yml        # GitHub Pages CI deploy
├── nabd-platform/PROJECT_REPORT.md    # Strategy / vision document
└── README.md, DEPLOYMENT.md, GOOGLE_CALENDAR_SETUP.md
```

---

## 💻 Installation

### For Local Development

**1. Clone Repository**
```bash
git clone https://github.com/yourusername/NABD-Hospital-Platform.git
cd NABD-Hospital-Platform
```

**2. No Dependencies Required!**
The prototype uses vanilla HTML/CSS/JavaScript. Simply open `index.html` in your browser.

**3. (Optional) Local Server for Testing**

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js:**
```bash
npx http-server
```

**Using Ruby:**
```bash
ruby -run -ehttpd . -p8000
```

Then visit: `http://localhost:8000/nabd-platform/Normal\ Files/`

---

## 📖 Usage Guide

### 1. **Browsing Hospitals**
- Navigate to "Ratings" tab
- Search by hospital name
- Filter by region, specialization, or working hours
- Click "View Details" to see full information

### 2. **Viewing Reviews**
- Open any hospital details
- Scroll to "Reviews" section
- Reviews are displayed in your selected language (EN/AR)
- Click "Write Review" to add your own

### 3. **Managing Favorites**
- Click "♡" (heart icon) to save hospitals
- Access saved hospitals from your profile
- Remove favorites anytime

### 4. **Booking Appointments**
- Click "Book Appointment" button
- Sign in with Gmail
- Select date and time
- Appointment syncs automatically to Google Calendar

### 5. **Profile Management**
- Click your name in top-right dropdown
- Select "My Profile"
- Update your information
- Click "Save Changes"

### 6. **Language Switching**
- Use language selector in navbar (EN/AR)
- All content updates immediately
- Hospital names translated automatically

---

## 🌐 Deployment

### Deploy to GitHub Pages (Recommended)

1. Push to `main` on [MarkRamy1/NABD-Platform](https://github.com/MarkRamy1/NABD-Platform)
2. Repo **Settings → Pages → Build and deployment → Source:** **GitHub Actions**
3. (Optional) **Settings → Secrets → Actions:** add `GOOGLE_CLIENT_ID` and `GOOGLE_API_KEY` for Calendar sync on production
4. Each push runs `.github/workflows/pages.yml` and deploys the repo root as a static site

**Live URL:** https://markramy1.github.io/NABD-Platform/

See [DEPLOYMENT.md](DEPLOYMENT.md) and [GOOGLE_CALENDAR_SETUP.md](GOOGLE_CALENDAR_SETUP.md) for details.

### Deploy to Netlify

- **Publish directory:** repository root (where `index.html` lives)
- **Build command:** leave empty
- Copy `google-calendar-config.example.js` → `google-calendar-config.js` and add credentials before deploy

---

## 🏗️ Technical Architecture

### Frontend Stack
```
HTML5 + CSS3 + Vanilla JavaScript
├── Bootstrap 5          (UI Framework)
├── i18n Library         (Internationalization)
└── Google APIs          (Calendar Integration)
```

### Key Technologies
- **HTML5**: Semantic markup, responsive containers
- **CSS3**: Flexbox, Grid, Media queries for responsive design
- **JavaScript ES6+**: Modern JavaScript features
- **Bootstrap 5**: Rapid UI development
- **Google Calendar API**: OAuth 2.0 integration
- **LocalStorage**: Client-side data persistence

### Architecture Highlights

```
┌─────────────────────────────────────────┐
│          USER INTERFACE (HTML)          │
├─────────────────────────────────────────┤
│      Navbar | Hero | Hospital Grid      │
│      Modals | Reviews | Profiles        │
├─────────────────────────────────────────┤
│       LOGIC LAYER (JavaScript)          │
├─────────────────────────────────────────┤
│  script.js (Core Logic)                 │
│  i18n.js (Language)                     │
│  hospital-names.js (Translations)       │
│  mockReviews.js (Data)                  │
│  google-calendar-integration.js (API)   │
├─────────────────────────────────────────┤
│      STYLING (Bootstrap + CSS)          │
├─────────────────────────────────────────┤
│      DATA STORAGE (LocalStorage)        │
└─────────────────────────────────────────┘
```

### Data Flow

```
1. Page Load
   ↓
2. Initialize Translations (i18n)
   ↓
3. Load Hospital Data from CSV
   ↓
4. Render Hospital Grid
   ↓
5. User Interaction
   ├── Search/Filter
   ├── View Details
   ├── Write Review
   ├── Book Appointment
   └── Update Profile
   ↓
6. Store in LocalStorage
   ↓
7. Sync to Google Calendar (optional)
```

---

## 📊 Data Overview

### Hospital Database

**Hospitals by Region:**
```
Cairo:        248 hospitals (61.7%)
Giza:         87 hospitals (21.6%)
El Qalyubia:  67 hospitals (16.7%)
─────────────────────────────────
Total:        402 hospitals
```

**Hospital Metrics:**
```
Average Beds:     257 per hospital
Average Staff:    274 per hospital
Min Beds:         20
Max Beds:         500+
24/7 Services:    195 hospitals (48.5%)
```

**Specializations:**
- Cardiology
- Neurology
- Orthopedics
- Pediatrics
- Oncology
- Dermatology
- Gynecology
- Ophthalmology
- ENT
- Urology
- Gastroenterology
- Psychiatry

### Sample Data Files

- `Hospitals_Greater_Cairo_Region.csv` - Main hospital database
- Hospital distribution visualizations (HTML)
- Data summary reports

---

## 🔗 API Integration

### Google Calendar Integration

**Configuration:** Copy `google-calendar-config.example.js` to `google-calendar-config.js` (gitignored) and add your OAuth Client ID and API key. See `GOOGLE_CALENDAR_SETUP.md`.

**Scopes:** `https://www.googleapis.com/auth/calendar.events`

**Features:**
- Gmail authentication (Gmail-only accounts)
- Appointment booking with calendar sync
- Automatic event creation
- User profile management

**Setup Instructions:**
See `GOOGLE_CALENDAR_SETUP.md` in Normal Files folder

---

## 🌍 Internationalization (i18n)

### Supported Languages
- **English** (en) - Default
- **Arabic** (ar) - Arabic RTL support

### Features
- Automatic language detection
- Persistent language preference
- Bilingual hospital names
- Translated UI elements
- Arabic right-to-left (RTL) layout support

### Adding New Languages

Edit `i18n.js`:
```javascript
const TRANSLATIONS = {
  en: { /* English translations */ },
  ar: { /* Arabic translations */ },
  fr: { /* Add new language */ }
};
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Hospital search and filtering works
- [ ] Reviews display correctly
- [ ] Bilingual switching works (EN/AR)
- [ ] Profile auto-populates when logged in
- [ ] Google Calendar integration functions
- [ ] Responsive design on mobile
- [ ] No console errors
- [ ] Page loads under 3 seconds

### Test Accounts (for review submission)

Use any Gmail account for testing:
```
Email: test@gmail.com
Password: (your Gmail password)
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

### 1. Fork the Repository
```bash
git clone https://github.com/yourusername/NABD-Hospital-Platform.git
cd NABD-Hospital-Platform
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes
```bash
# Edit files in nabd-platform/Normal Files/
```

### 4. Commit & Push
```bash
git add .
git commit -m "Add: description of your changes"
git push origin feature/your-feature-name
```

### 5. Submit Pull Request
- Go to GitHub and create a pull request
- Describe your changes clearly
- Wait for review

### Contribution Guidelines
- Keep code clean and well-commented
- Follow existing code style
- Test changes locally before submitting
- Update documentation as needed

---

## 📋 Development Roadmap

### Phase 1: MVP (Current) ✅
- [x] Hospital database integration
- [x] Search and filtering
- [x] Review system
- [x] Bilingual support
- [x] Google Calendar integration

### Phase 2: Enhancements (Planned)
- [ ] Backend API for persistent data
- [ ] User authentication system
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Hospital admin panel

### Phase 3: Scale (Future)
- [ ] Expand to additional regions
- [ ] Telemedicine integration
- [ ] Insurance provider integration
- [ ] Real-time availability tracking

---

## 🐛 Known Issues & Limitations

| Issue | Impact | Workaround |
|-------|--------|-----------|
| Reviews not persisting across sessions | Data lost on page refresh | Use browser back-up for production |
| No real backend API | Can't sync data across devices | Mock data sufficient for prototype |
| Gmail-only authentication | Limits user base | Planned for future versions |
| Single region coverage | Geographic limitation | Easy to expand to new regions |

---

## 📄 License

This project is licensed under the **MIT License** - see LICENSE file for details.

### MIT License Summary
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ❌ Liability: Not provided
- ❌ Warranty: Not provided

---

## 📞 Contact & Support

### Project Information
- **Project Name**: NABD (نبض - Pulse)
- **Version**: 1.0 Prototype
- **Status**: Active Development
- **Last Updated**: June 8, 2026

### Support
- **Documentation**: See `PROJECT_REPORT.md`
- **Google Calendar Setup**: See `GOOGLE_CALENDAR_SETUP.md`
- **Implementation Notes**: See `IMPLEMENTATION_NOTES.txt`
- **Issues & Feedback**: Create GitHub issue

### Authors
- Development Team
- Healthcare Data Analysis
- UI/UX Design

---

## 🎓 Learning Resources

### Technologies Used
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.0/)
- [Google Calendar API](https://developers.google.com/calendar)
- [MDN Web Docs](https://developer.mozilla.org/)
- [i18n Best Practices](https://www.w3.org/International/)

### Deployment
- [GitHub Pages Guide](https://pages.github.com/)
- [Netlify Deployment](https://docs.netlify.com/)
- [Static Site Hosting](https://www.staticgen.com/)

---

## ✅ Quick Verification Checklist

Before deploying to production:

```
Project Readiness:
├── ✅ All features working locally
├── ✅ Reviews displaying correctly
├── ✅ Bilingual support functional
├── ✅ No console errors
├── ✅ Responsive design tested
├── ✅ Profile management working
├── ✅ Google Calendar integration ready
└── ✅ README.md comprehensive

Deployment Readiness:
├── ✅ .gitignore configured
├── ✅ GitHub repo created
├── ✅ GitHub Pages enabled
├── ✅ Or Netlify connected
├── ✅ Custom domain (optional)
└── ✅ HTTPS enabled
```

---

## 🚀 Getting Started Now

### 1. Try Locally (2 minutes)
```bash
cd nabd-platform/Normal\ Files
open index.html
```

### 2. Push to GitHub (5 minutes)
```bash
git init && git add . && git commit -m "NABD Prototype"
git remote add origin https://github.com/you/NABD-Hospital-Platform
git push -u origin main
```

### 3. Enable GitHub Pages (2 minutes)
Settings → Pages → Deploy from main → Save

### 4. Share Your Link! 🎉
```
https://yourusername.github.io/NABD-Hospital-Platform
```

---

## 📈 Project Statistics

```
📁 Files: 14 core files
💾 Size: ~5-10MB (optimized)
🏥 Hospitals: 402 records
⭐ Reviews: 50+ samples
🌍 Languages: 2 (EN/AR)
📱 Responsive: Yes
🔐 Google Calendar: Connected
⚡ Load Time: <2 seconds
```

---

**Made with ❤️ for healthcare accessibility in Egypt**

*Last Updated: June 8, 2026*
