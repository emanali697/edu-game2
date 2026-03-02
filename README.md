# عالم التعلّم 🎮

منصة تعليمية ممتعة للأطفال — تعلّم الرياضيات والعربية والإنجليزية والعلوم من خلال ألعاب تفاعلية.

---

## Tech Stack

- **React 19** + **Vite 7**
- **Firebase** — Realtime Database + Authentication (Email & Phone OTP)
- **Bootstrap 5 RTL** — Arabic right-to-left UI
- **React Router v7**

---

## Features

### Parent Dashboard
- Register with **email/password** or **Saudi phone OTP**
- Add up to **10 children** per account
- Set **allowed subjects** per child (Math, Arabic, English, Science)
- **Edit** child name, grade, and subjects anytime
- **Delete** child with full data cleanup
- Generate a **direct play link** for each child (no login needed)
- **Reset devices** — each link works on up to 3 devices max

### Child Play
- Child opens their link directly on any device
- **Device limit**: max 3 unique devices per child link
- Auto-navigates to game if only 1 subject is allowed
- Filters subjects to only what the parent enabled

### Achievements
- Automatic achievement unlocking after game sessions
- 13 achievement types (streaks, perfect scores, subject stars, etc.)
- Click any unlocked achievement to **share it** via:
  - WhatsApp
  - Twitter / X
  - Native share (mobile)
  - Copy text

---

## Project Structure

```
src/
├── pages/
│   ├── LandingPage.jsx
│   ├── RegisterPage.jsx       # Email + Phone OTP registration
│   ├── LoginPage.jsx
│   ├── ParentDashboardPage.jsx
│   ├── ChildPlayPage.jsx      # Direct child link handler
│   ├── GameSetupPage.jsx
│   ├── GamePlayPage.jsx
│   ├── AchievementsPage.jsx   # Share modal
│   ├── SubscriptionPage.jsx
│   └── AdminPage.jsx
├── services/
│   ├── firebase.js            # Full DB layer
│   ├── auth.js                # Email + Phone Auth
│   └── firebaseApp.js
├── context/
│   ├── AuthContext.jsx
│   └── GameContext.jsx
├── data/
│   ├── config/                # subjects, grades, encouragements
│   └── questions/             # Questions per subject per grade
├── utils/
│   ├── constants.js           # APP_NAME, SUPPORT_WHATSAPP, etc.
│   └── helpers.js             # getDeviceId, generateAccessToken, etc.
└── hooks/
    └── useGame.js
```

---

## Getting Started

```bash
npm install
npm run dev
```

---

## Firebase Setup

1. Create a Firebase project
2. Enable **Realtime Database** and **Authentication** (Email + Phone)
3. Add your config to `src/services/firebaseApp.js`
4. Update `SUPPORT_WHATSAPP` in `src/utils/constants.js`

---

## Subjects

| ID | Name |
|---|---|
| `math` | الرياضيات |
| `arabic` | اللغة العربية |
| `english` | اللغة الإنجليزية |
| `science` | العلوم |

Grades: KG1, KG2, KG3, 1st–6th grade
