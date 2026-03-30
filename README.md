# EduTrack - Educational Scenario Platform

EduTrack is a platform for teachers to create educational scenarios, integrate web apps, and track student progress.

## Features
- Create and edit educational scenarios with multiple modules (content, web apps, quizzes).
- Real-time student progress tracking.
- Support for multiple languages (English, Greek).
- Dark and Light mode support.
- Customizable backgrounds for different sections.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide React, Framer Motion.
- **Backend:** Firebase (Firestore, Authentication).

## Setup Instructions

### 1. Firebase Configuration
This project requires a Firebase project. You need to provide your Firebase configuration details.

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Authentication** (Google Sign-In).
3. Create a file named `firebase-applet-config.json` in the root directory (use `firebase-applet-config.json.example` as a template).
4. Alternatively, you can set the following environment variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_FIRESTORE_DATABASE_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in the required values.

### 3. Installation
```bash
npm install
```

### 4. Development
```bash
npm run dev
```

### 5. Build
```bash
npm run build
```

## Security
Sensitive configuration files like `firebase-applet-config.json` and `.env` are excluded from version control via `.gitignore`.
