/**
 * Firebase Configuration
 * Initialize Firebase for authentication
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project or select existing
 * 3. Enable Authentication > Sign-in methods
 * 4. Enable: Email/Password, Google, Facebook, GitHub
 * 5. Copy your config from Project Settings > General
 * 6. Replace the config object below with your actual values
 */

// Firebase Configuration Object
// REPLACE WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
let firebaseApp;
let firebaseAuth;

if (typeof firebase !== 'undefined') {
    try {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
    }
} else {
    console.warn('⚠️ Firebase SDK not loaded. Please include Firebase scripts in HTML.');
}

// Export for use in other modules
window.firebaseApp = firebaseApp;
window.firebaseAuth = firebaseAuth;
window.firebaseConfig = firebaseConfig;

export { firebaseApp, firebaseAuth, firebaseConfig };
