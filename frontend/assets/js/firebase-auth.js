/**
 * Firebase Authentication Module
 * Handles Firebase auth and syncs with backend JWT
 */

// ========================================
// Firebase Auth Helper Functions
// ========================================

class FirebaseAuthClient {
    constructor() {
        this.auth = window.firebaseAuth;
        this.currentUser = null;
    }

    // ========================================
    // Sign Up with Email/Password
    // ========================================
    async signUpWithEmail(email, password, displayName) {
        try {
            // Create user in Firebase
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update profile with display name
            await user.updateProfile({ displayName });

            // Send verification email
            await user.sendEmailVerification();

            // Get ID token for backend
            const idToken = await user.getIdToken();

            // Sync with backend
            await this.syncWithBackend(idToken, { email, name: displayName });

            return { success: true, user };
        } catch (error) {
            console.error('Firebase signup error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    // ========================================
    // Sign In with Email/Password
    // ========================================
    async signInWithEmail(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            // Sync with backend
            await this.syncWithBackend(idToken);

            return { success: true, user };
        } catch (error) {
            console.error('Firebase signin error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    // ========================================
    // Sign In with Google
    // ========================================
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');

            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;
            const idToken = await user.getIdToken();

            // Sync with backend
            await this.syncWithBackend(idToken);

            return { success: true, user };
        } catch (error) {
            console.error('Firebase Google signin error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    // ========================================
    // Sign In with Facebook
    // ========================================
    async signInWithFacebook() {
        try {
            const provider = new firebase.auth.FacebookAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;
            const idToken = await user.getIdToken();

            await this.syncWithBackend(idToken);
            return { success: true, user };
        } catch (error) {
            console.error('Firebase Facebook signin error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    // ========================================
    // Sign In with GitHub
    // ========================================
    async signInWithGithub() {
        try {
            const provider = new firebase.auth.GithubAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;
            const idToken = await user.getIdToken();

            await this.syncWithBackend(idToken);
            return { success: true, user };
        } catch (error) {
            console.error('Firebase GitHub signin error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    // ========================================
    // Sign Out
    // ========================================
    async signOut() {
        try {
            await this.auth.signOut();

            // Also logout from backend
            if (window.authClient) {
                await window.authClient.logout();
            }

            return { success: true };
        } catch (error) {
            console.error('Firebase signout error:', error);
            throw error;
        }
    }

    // ========================================
    // Send Password Reset Email
    // ========================================
    async sendPasswordReset(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    // ========================================
    // Sync Firebase User with Backend
    // ========================================
    async syncWithBackend(firebaseIdToken, additionalData = {}) {
        try {
            // If using existing backend, send Firebase token to verify and create JWT
            const response = await fetch(`${window.authClient.baseURL}/auth/firebase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    firebaseToken: firebaseIdToken,
                    ...additionalData
                })
            });

            const data = await response.json();

            if (data.success && data.data.accessToken) {
                // Store backend JWT
                window.authClient.setToken(data.data.accessToken);
                window.authClient.setUser(data.data.user);
            }

            return data;
        } catch (error) {
            console.error('Backend sync error:', error);
            // Continue even if backend sync fails (Firebase auth still works)
            return { success: false, error };
        }
    }

    // ========================================
    // Get Current User
    // ========================================
    getCurrentUser() {
        return this.auth.currentUser;
    }

    // ========================================
    // Auth State Observer
    // ========================================
    onAuthStateChanged(callback) {
        return this.auth.onAuthStateChanged(callback);
    }

    // ========================================
    // Error Message Helper
    // ========================================
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': 'Email already registered',
            'auth/invalid-email': 'Invalid email address',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed',
            'auth/cancelled-popup-request': 'Only one popup allowed at a time',
            'auth/account-exists-with-different-credential': 'Account exists with different sign-in method'
        };

        return errorMessages[errorCode] || 'Authentication failed. Please try again.';
    }
}

// Initialize Firebase Auth Client
window.firebaseAuthClient = new FirebaseAuthClient();

// Monitor auth state changes
if (window.firebaseAuth) {
    window.firebaseAuth.onAuthStateChanged(user => {
        if (user) {
            console.log('✅ User is signed in:', user.email);
            window.firebaseAuthClient.currentUser = user;
        } else {
            console.log('👤 No user signed in');
            window.firebaseAuthClient.currentUser = null;
        }
    });
}

export default window.firebaseAuthClient;
