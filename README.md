# FixMyWay

> **Report it. Track it. Fix it.**
>
> A citizen-focused mobile platform for reporting, discovering, and verifying road and civic infrastructure issues with location-aware reporting and AI-assisted issue classification.

## 📱 What is FixMyWay?

FixMyWay turns a citizen's on-ground observation into a structured civic report. Users can capture an issue, attach its location, get an AI-assisted category suggestion, check for nearby duplicate reports, and follow the issue through community verification and resolution.

The application is built as an Android mobile experience using Expo and React Native, with Firebase services for authentication, storage, and persistence.

## ✨ Key Features

### 🗺️ Civic Issue Map

- Interactive Google Maps view of reported civic issues.
- Category-based issue markers for potholes, garbage, streetlights, road damage, and other problems.
- Active and resolved issue states.
- Current-location support and map recentering.
- Category and status filters.
- Quick issue previews from the map.

### 📸 Smart Issue Reporting

- Camera capture and gallery selection.
- Image preview, replacement, and retake flows.
- AI-assisted visual classification with confidence scores.
- Automatic GPS location capture and reverse geocoding.
- Nearby duplicate detection using the Haversine distance formula.
- Photo compression before upload.
- Firebase Storage and Cloud Firestore integration.

### 🤝 Community Verification

- Citizens can confirm that an active issue still exists.
- Duplicate confirmations are prevented per user.
- Community members can mark verified issues as resolved.
- Issue state transitions from `ACTIVE` to `RESOLVED` after community confirmation.

### 👤 Citizen Dashboard

- View submitted reports by status.
- Track personal civic impact statistics.
- Review reports, confirmations, and resolved issues.
- Demo account switching for presentations and testing.

## 🧰 Tech Stack

| Area | Technologies |
| --- | --- |
| Mobile | React Native, Expo, TypeScript |
| UI | React Native components, custom UI system |
| Maps & Location | Google Maps, Expo Location |
| Backend / Data | Firebase Authentication, Cloud Firestore, Firebase Storage |
| AI | Vision-based issue classification |
| Development | Node.js, npm, Git, EAS |

## 🏗️ Application Architecture

```text
Citizen
   │
   ├── Capture / Select Image
   │
   ├── Location Detection
   │
   ├── AI Issue Classification
   │
   ├── Duplicate Detection
   │
   ▼
Issue Report
   │
   ├── Firebase Storage
   ├── Cloud Firestore
   └── Community Verification
             │
             ▼
      Active → Resolved
```

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- Expo CLI / Expo tooling
- Android device with Expo Go, or an Android emulator
- Firebase project for production data

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npx expo start
```

### Run on Android

```bash
npx expo run:android
```

For Expo Go, install Expo Go on an Android device and connect the device and development machine to the same network. If required, use tunnel mode:

```bash
npx expo start --tunnel
```

## 📦 Build an Android APK

The project uses Expo Application Services (EAS) for standalone Android builds.

```bash
eas login
eas build -p android --profile preview
```

## 🔐 Firebase Configuration

Create a Firebase project and configure the services required by the application:

1. Enable Firebase Authentication.
2. Create a Cloud Firestore database.
3. Enable Firebase Storage.
4. Configure the application environment variables using the project's environment configuration.
5. Deploy the Firestore security rules where appropriate.

Never commit private API keys, service-account credentials, or other secrets to the repository.

## 🗺️ Google Maps Configuration

For a production Android build, configure the required Google Maps SDK credentials and place the API key in the appropriate Expo configuration or environment setup.

## 📁 Project Structure

```text
components/       Reusable UI and feature components
constants/        Categories, badges, themes, and application constants
contexts/         Authentication and issue state management
services/         AI, authentication, Firebase, location, issues, and notifications
server/           Supporting server-side functionality
types/            TypeScript domain types
utils/             Shared utility functions
```

## 🎯 Core Workflow

```text
Observe an issue
      ↓
Capture a photo
      ↓
Detect location
      ↓
AI-assisted classification
      ↓
Check nearby duplicates
      ↓
Submit civic report
      ↓
Community verification
      ↓
Resolution tracking
```

## 📌 Project Status

FixMyWay is a hackathon-focused civic technology project designed to demonstrate a complete citizen reporting workflow, from on-device issue capture through location-aware reporting, community validation, and resolution tracking.

## 📄 License & Attribution

If this project incorporates code or dependencies distributed under third-party licenses, their applicable license and attribution requirements remain in effect. Review the repository's license files before redistribution.
