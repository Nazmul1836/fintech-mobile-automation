# Mukto Pay UAT - Mobile Automation Framework

A production-grade, enterprise-ready mobile test automation framework designed and engineered for **Mukto Pay UAT** (`com.fintech23.muktopay.uat`). Built using **JavaScript**, **Node.js**, **WebdriverIO v9**, **Appium**, **UiAutomator2**, and **Page Object Model (POM)** architecture.

---

## 📱 Target Application Overview

- **Application Name**: Mukto Pay UAT
- **Package Name**: `com.fintech23.muktopay.uat`
- **Launch Activity**: `fintech23.skt.wallet.fintech23_wallet.MainActivity`
- **APK Location**: `./apps/app (48).apk`
- **App Tech Stack**: Flutter Application
- **Key Modules Automating**:
  - Authentication (Login, PIN Visibility, Invalid PIN, Logout)
  - Home Dashboard (Balance Check, Quick Action Shortcuts)
  - Account Profile (eKYC Status, Profile Details, Transaction Limits)
  - Money Transfer (Valid Transfer, Bounds Validation, Zero/Negative Amount Rejection)
  - Transaction History (Statement History, Filters)

---

## 🛠️ Technology Stack

* **Language**: JavaScript (ES Modules)
* **Runtime**: Node.js (v18+)
* **Package Manager**: npm
* **Automation Driver**: Appium + UiAutomator2
* **Framework / Runner**: WebdriverIO v9 + Mocha
* **Assertions**: `@wdio/expect-webdriverio`
* **Design Pattern**: Page Object Model (POM)
* **Environment Config**: `dotenv`

---

## 📁 Project Architecture

```text
fintech-mobile-automation/
│
├── package.json
├── package-lock.json
├── wdio.conf.js                # WebdriverIO & Appium Configuration
├── README.md                   # Technical Documentation
├── .gitignore                  # Git Ignore Policies
├── .env.example                # Environment Variable Template
├── .env                        # Local Environment Config (ignored in Git)
│
├── apps/
│   └── app (48).apk            # Mukto Pay UAT Android APK
│
├── test/
│   ├── pageobjects/            # Page Object Model Layer
│   │   ├── Page.js             # Base Page Object
│   │   ├── LoginPage.js        # Login & Auth Selectors/Actions
│   │   ├── HomePage.js         # Dashboard & Navigation
│   │   ├── AccountPage.js      # User Profile & Limits
│   │   ├── TransferPage.js     # Money Transfer Workflows
│   │   ├── TransactionHistoryPage.js # Statements & Filters
│   │   └── ProfilePage.js      # Profile Settings & Logout
│   │
│   ├── specs/                  # E2E Test Suites
│   │   ├── authentication/
│   │   │   └── login.e2e.js
│   │   ├── account/
│   │   │   └── account.e2e.js
│   │   ├── transfer/
│   │   │   └── transfer.e2e.js
│   │   ├── transaction/
│   │   │   └── history.e2e.js
│   │   └── smoke/
│   │       └── smoke.e2e.js
│   │
│   └── utils/                  # Utility Helpers
│       ├── waitUtils.js        # Explicit Waiting Helpers
│       ├── testData.js         # Centralized Financial Test Data
│       ├── logger.js           # Redacting Logger
│       └── helpers.js          # App Lifecycle Helpers
│
├── reports/                    # Generated Test Reports
├── screenshots/                # Captured Failure Screenshots
├── logs/                       # Execution Log Outputs
│
└── .github/
    └── workflows/
        └── mobile-tests.yml    # GitHub Actions CI Pipeline
```

---

## ⚙️ Prerequisites

Before executing tests, ensure the following are installed on your machine:

1. **Node.js**: v18.0.0 or higher (`node -v`)
2. **Android SDK**:
   - `ANDROID_HOME` or `ANDROID_SDK_ROOT` environment variable configured.
   - Android Build-Tools and Platform-Tools (`adb` added to system `PATH`).
3. **Appium**:
   - Install Appium globally or run via local dependency: `npm install -g appium`
   - Install UiAutomator2 driver: `appium driver install uiautomator2`
4. **Android Device / Emulator**:
   - Running Android Emulator or connected physical device via USB debugging (`adb devices`).

---

## 🚀 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd fintech-mobile-automation
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your device details and credentials.

---

## 🏃 Running Tests

### Execute All Regression Tests
```bash
npm test
```

### Execute Smoke Test Suite
```bash
npm run test:smoke
```

### Execute Authentication Suite Only
```bash
npm run test:auth
```

### Execute Money Transfer Suite Only
```bash
npm run test:transfer
```

### Execute Account Suite Only
```bash
npm run test:account
```

### Execute Transaction History Suite Only
```bash
npm run test:transaction
```

---

## 🛡️ Security & Sensitive Data Protection

* All credentials (PINs, passwords, phone numbers) are driven via environment variables (`.env`).
* `.env` is strictly ignored by Git.
* The `Logger` utility automatically redacts any pattern matching `pin=`, `password=`, `otp=`, or `token=` before outputting to stdout or log files.
* Test reports and failure screenshots never log plain text secret fields.

---

## 📸 Failure Screenshots & Reporting

* Screenshots are automatically saved to `./screenshots/FAILED_<scenario>_<timestamp>.png` whenever a test fails.
* Spec execution details and timings are displayed directly in stdout via `@wdio/spec-reporter`.
* Reports are saved under `./reports/`.

---

## 🤖 CI/CD Integration

GitHub Actions configuration is provided in `.github/workflows/mobile-tests.yml`. The workflow handles:
1. Checking out the repository
2. Setting up Node.js v20
3. Installing dependencies and Appium drivers
4. Executing WebdriverIO test suites
5. Uploading test reports and screenshots as artifacts

---

## ❓ Troubleshooting

1. **`adb` command not found**: Ensure `ANDROID_HOME/platform-tools` is added to your system `PATH`.
2. **Appium server connection failure**: Verify Appium is running or allow WebdriverIO's `@wdio/appium-service` to manage the server lifecycle automatically.
3. **No Android devices found**: Run `adb devices` in terminal to confirm an active emulator or device is connected.
