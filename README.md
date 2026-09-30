# FixMyWay — AI-Assisted Civic Issue Reporting

> **See it. Snap it. Fix it.**

FixMyWay is a React Native + Expo mobile app for reporting, verifying, and tracking civic issues such as potholes, waste, road damage, and broken streetlights.

It combines **AI-assisted image analysis, GPS location, geospatial duplicate detection, community verification, and Firebase** to turn citizen reports into structured, trackable civic issues.

## 🎥 Product Showcase

Real running Android application demonstration:

- 📱 [Vertical 9:16 Demo](FixMyWay_LinkedIn_Showcase.mp4)
- 🖥️ [Landscape 16:9 Demo](FixMyWay_LinkedIn_Showcase_16x9.mp4)
- [Direct video](https://raw.githubusercontent.com/Jyatin/-fixmyway/main/FixMyWay_LinkedIn_Showcase.mp4)

## ✨ Key Features

- **AI-assisted reporting** — suggests issue category, severity, and approximate dimensions from photos.
- **GPS & reverse geocoding** — captures location and converts coordinates into readable addresses.
- **Duplicate detection** — uses Haversine distance to identify nearby existing reports.
- **Community verification** — nearby citizens can confirm whether an issue still exists.
- **Issue lifecycle tracking** — follows reports from submission through verification and resolution.
- **Live civic map** — displays issues with category and status filters.
- **Civic profile & gamification** — contribution history, trust score, streaks, levels, and badges.
- **Environmental telemetry** — district health, AQI, rainfall, and related data.

## 🧠 AI Pipeline

```text
Photo → Image Optimization → Gemini Vision
     → Category + Severity + Dimensions
     → Citizen Review → Civic Report
```

The AI is **assistive**: users review and can modify the suggested category, severity, and description before submission.

## 🔄 Workflow

```text
Observe → Capture → Locate → Analyze → Check Duplicates
        → Submit → Community Verify → Track → Resolve
```

## 🛠️ Tech Stack

| Area | Technology |
|---|---|
| Mobile | React Native, Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| Backend / Database | Firebase Auth, Firestore, Storage |
| Maps & Location | Google Maps, `react-native-maps`, Expo Location |
| AI | Google Gemini Vision API |
| Environmental Data | Open-Meteo Air Quality API |

## 🚀 Getting Started

```bash
git clone https://github.com/Jyatin/-fixmyway.git
cd -fixmyway
npm install
npx expo start
```

Configure the required Firebase, Google Maps, and Gemini environment variables before running the application.

## 📱 Application Flow

1. Sign in.
2. Explore civic issues on the map.
3. Capture a photo of an issue.
4. Capture GPS/location data.
5. Review the AI analysis.
6. Check for nearby duplicates.
7. Submit the report.
8. Track verification and resolution.

## 📌 Project Status

FixMyWay is an actively developed project demonstrating **mobile development, AI integration, geospatial logic, Firebase services, and civic-tech UX**.

## 👨‍💻 Author

**Jyatin Kumar Singh**  
B.Tech CSE — Full Stack Development

- GitHub: https://github.com/Jyatin
- LinkedIn: https://www.linkedin.com/in/jyatinsingh/

## 📄 License

MIT License
