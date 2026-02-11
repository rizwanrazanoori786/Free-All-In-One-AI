/**
 * Authentication Module
 * Handles user login, signup, logout, and token management
 */

// ========================================
// Configuration
// ========================================

const AUTH_CONFIG = {
    baseURL: window.API_CONFIG?.baseURL || 'http://localhost:5000/api',
    tokenKey: 'access_token',
    userKey: 'user_data'
};

// ========================================
// Authentication API Class
// ========================================

class AuthClient {
    constructor() {
        this.baseURL = AUTH_CONFIG.baseURL;
    }

    // Get stored token
    getToken() {
        return localStorage.getItem(AUTH_CONFIG.tokenKey);
    }

    // Store token
    setToken(token) {
        localStorage.setItem(AUTH_CONFIG.tokenKey, token);
    }

    // Remove token
    removeToken() {
        localStorage.removeItem(AUTH_CONFIG.tokenKey);
        localStorage.removeItem(AUTH_CONFIG.userKey);
    }

    // Get stored user
    getUser() {
        const userStr = localStorage.getItem(AUTH_CONFIG.userKey);
        return userStr ? JSON.parse(userStr) : null;
    }

    // Store user
    setUser(user) {
        localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(user));
    }

    // Check if authenticated
    isAuthenticated() {
        return !!this.getToken();
    }

    // ========================================
    // Signup
    // ========================================

    async signup(email, password, name) {
        try {
            const response = await fetch(`${this.baseURL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password, name })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            this.setToken(data.data.accessToken);
            this.setUser(data.data.user);

            return data;
        } catch (error) {
            throw error;
        }
    }

    // ========================================
    // Login
    // ========================================

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            this.setToken(data.data.accessToken);
            this.setUser(data.data.user);

            return data;
        } catch (error) {
            throw error;
        }
    }

    // ========================================
    // Google Login
    // ========================================

    async googleLogin(credential) {
        try {
            const response = await fetch(`${this.baseURL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ credential })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Google login failed');
            }

            this.setToken(data.data.accessToken);
            this.setUser(data.data.user);

            return data;
        } catch (error) {
            throw error;
        }
    }

    // ========================================
    // Logout
    // ========================================

    async logout() {
        try {
            await fetch(`${this.baseURL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                },
                credentials: 'include'
            });

            this.removeToken();
            window.location.href = '/login.html';
        } catch (error) {
            // Still remove token on error
            this.removeToken();
            window.location.href = '/login.html';
        }
    }

    // ========================================
    // Refresh Token
    // ========================================

    async refreshToken() {
        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            this.setToken(data.data.accessToken);
            return data.data.accessToken;
        } catch (error) {
            this.removeToken();
            window.location.href = '/login.html';
            throw error;
        }
    }

    // ========================================
    // Get Current User
    // ========================================

    async getCurrentUser() {
        try {
            const response = await fetch(`${this.baseURL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error('Failed to get user');
            }

            this.setUser(data.data.user);
            return data.data.user;
        } catch (error) {
            throw error;
        }
    }

    // ========================================
    // Protected Fetch (with auto token refresh)
    // ========================================

    async protectedFetch(url, options = {}) {
        const token = this.getToken();

        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        // Add authorization header
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        options.credentials = 'include';

        try {
            let response = await fetch(url, options);

            // If token expired, try to refresh
            if (response.status === 401) {
                await this.refreshToken();

                // Retry request with new token
                options.headers['Authorization'] = `Bearer ${this.getToken()}`;
                response = await fetch(url, options);
            }

            return response;
        } catch (error) {
            throw error;
        }
    }
}

// ========================================
// Initialize Auth Client
// ========================================

window.authClient = new AuthClient();

// ========================================
// Password Strength Checker
// ========================================

window.checkPasswordStrength = function (password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
};

// ========================================
// Check Auth on Protected Pages
// ========================================

window.requireAuth = function () {
    if (!window.authClient.isAuthenticated()) {
        window.location.href = '/login.html';
    }
};

// ========================================
// Redirect if Already Logged In
// ========================================

window.redirectIfAuthenticated = function () {
    if (window.authClient.isAuthenticated()) {
        window.location.href = '/dashboard.html';
    }
};

// ========================================
// Update UI with User Info
// ========================================

window.updateAuthUI = function () {
    const user = window.authClient.getUser();
    const authButtons = document.querySelector('.auth-buttons');
    const userProfile = document.querySelector('.user-profile-dropdown');

    if (user && authButtons) {
        authButtons.style.display = 'none';
    }

    if (user && userProfile) {
        userProfile.style.display = 'block';
        const nameElement = userProfile.querySelector('.profile-name');
        const avatarElement = userProfile.querySelector('.profile-avatar');

        if (nameElement) nameElement.textContent = user.name;
        if (avatarElement) {
            if (user.avatar) {
                avatarElement.innerHTML = `<img src="${user.avatar}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;">`;
            } else {
                avatarElement.textContent = user.name.charAt(0).toUpperCase();
            }
        }
    }
};

export default window.authClient;
