// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// This object will hold all your translations
const resources = {
  en: {
    translation: {
      // Navbar
      "kumbhShilp": "Kumbh-Shilp",
      "navigationPortal": "Navigation Portal",
      "home": "Home",
      "map": "Map",
      "alerts": "Alerts",
      "family": "Family",
      "familyTracker": "Family Tracker",
      "about": "About",
      "login": "Login",
      "signIn": "Sign In",
      "vipSignIn": "VIP Sign In",
      "profile": "Profile",
      "verifyAlerts": "Verify Alerts",
      "logout": "Logout",
      // You can add translations for other pages here
      "familyNotFound": "Family Not Found",
      "familyNotFoundMessage": "You must join or create a family to use the tracker."
    }
  },
  hi: {
    translation: {
      // Navbar
      "kumbhShilp": "कुंभ-शिल्प",
      "navigationPortal": "नेविगेशन पोर्टल",
      "home": "होम",
      "map": "नक्शा",
      "alerts": "अलर्ट",
      "family": "परिवार",
      "familyTracker": "फ़ैमिली ट्रैकर",
      "about": "हमारेबारेमें",
      "login": "लॉगिन",
      "signIn": "साइनइनकरें",
      "vipSignIn": "वीआईपी साइन इन",
      "profile": "प्रोफ़ाइल",
      "verifyAlerts": "अलर्ट सत्यापित करें",
      "logout": "लॉगआउट",
      // Other pages
      "familyNotFound": "परिवार नहीं मिला",
      "familyNotFoundMessage": "ट्रैकर का उपयोग करने के लिए आपको एक परिवार में शामिल होना होगा या बनाना होगा।"
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en', // use english if selected language translation is not available
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;