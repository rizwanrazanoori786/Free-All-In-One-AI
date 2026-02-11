/**
 * Free All In One AI - API Integration
 * Centralized API configuration and fetch utilities
 */

// ========================================
// API Configuration
// NOTE: Auth-protected endpoints will automatically include JWT token
// via authClient.protectedFetch() from auth.js
// ========================================
const API_CONFIG = {
    // Base URL - Update this when connecting to backend
    baseURL: 'http://localhost:5000/api', // Update for production

    // Endpoints
    endpoints: {
        textToPdf: '/tools/text-to-pdf',
        textToImage: '/tools/text-to-image',
        textToInvoice: '/tools/text-to-invoice',
        seoChecker: '/tools/seo-checker',
        qrGenerator: '/tools/qr-generator',
        visitingCard: '/tools/visiting-card'
    },

    // Request timeout (ms)
    timeout: 30000,

    // Headers
    defaultHeaders: {
        'Content-Type': 'application/json'
    }
};

// ========================================
// API Client Class
// ========================================
class APIClient {
    constructor(config) {
        this.config = config;
    }

    /**
     * Make a fetch request with timeout
     */
    async fetchWithTimeout(url, options = {}) {
        const { timeout = this.config.timeout } = options;

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    /**
     * Generic API request method
     */
    async request(endpoint, options = {}) {
        const url = `${this.config.baseURL}${endpoint}`;

        const defaultOptions = {
            headers: {
                ...this.config.defaultHeaders,
                ...options.headers
            }
        };

        const requestOptions = {
            ...defaultOptions,
            ...options
        };

        try {
            const response = await this.fetchWithTimeout(url, requestOptions);

            // Handle HTTP errors
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Check content type
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else if (contentType && contentType.includes('application/pdf')) {
                return await response.blob();
            } else if (contentType && contentType.includes('image/')) {
                return await response.blob();
            } else {
                return await response.text();
            }

        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return this.request(url, {
            method: 'GET'
        });
    }

    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * POST request with FormData (for file uploads)
     */
    async postFormData(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData
        });
    }
}

// ========================================
// Create API Client Instance
// ========================================
const api = new APIClient(API_CONFIG);

// ========================================
// Input Validation Helpers
// ========================================
const validators = {
    /**
     * Validate text input
     */
    validateText(text, minLength = 1, maxLength = 10000) {
        if (!text || typeof text !== 'string') {
            throw new Error('Text is required');
        }

        const trimmed = text.trim();

        if (trimmed.length < minLength) {
            throw new Error(`Text must be at least ${minLength} characters`);
        }

        if (trimmed.length > maxLength) {
            throw new Error(`Text must not exceed ${maxLength} characters`);
        }

        return trimmed;
    },

    /**
     * Validate URL
     */
    validateURL(url) {
        if (!url || typeof url !== 'string') {
            throw new Error('URL is required');
        }

        try {
            new URL(url);
            return url;
        } catch {
            throw new Error('Invalid URL format');
        }
    },

    /**
     * Validate email
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            throw new Error('Email is required');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        return email;
    },

    /**
     * Validate file
     */
    validateFile(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
        if (!file || !(file instanceof File)) {
            throw new Error('File is required');
        }

        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
        }

        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            throw new Error(`File size must not exceed ${maxSizeMB}MB`);
        }

        return file;
    },

    /**
     * Validate color code
     */
    validateColor(color) {
        if (!color || typeof color !== 'string') {
            throw new Error('Color is required');
        }

        const colorRegex = /^#([0-9A-F]{3}){1,2}$/i;

        if (!colorRegex.test(color)) {
            throw new Error('Invalid color format (use hex format like #FF5733)');
        }

        return color;
    }
};

// ========================================
// Tool-Specific API Functions
// ========================================

/**
 * Text to PDF
 */
async function generatePDF(text, options = {}) {
    try {
        const validatedText = validators.validateText(text);

        const response = await api.post(API_CONFIG.endpoints.textToPdf, {
            text: validatedText,
            ...options
        });

        return response;
    } catch (error) {
        throw new Error(`PDF Generation Failed: ${error.message}`);
    }
}

/**
 * Text to Image
 */
async function generateImage(prompt, options = {}) {
    try {
        const validatedPrompt = validators.validateText(prompt, 3, 1000);

        const response = await api.post(API_CONFIG.endpoints.textToImage, {
            prompt: validatedPrompt,
            ...options
        });

        return response;
    } catch (error) {
        throw new Error(`Image Generation Failed: ${error.message}`);
    }
}

/**
 * Text to Invoice
 */
async function generateInvoice(invoiceData) {
    try {
        // Basic validation
        if (!invoiceData || typeof invoiceData !== 'object') {
            throw new Error('Invoice data is required');
        }

        const response = await api.post(API_CONFIG.endpoints.textToInvoice, invoiceData);

        return response;
    } catch (error) {
        throw new Error(`Invoice Generation Failed: ${error.message}`);
    }
}

/**
 * SEO Checker
 */
async function checkSEO(url) {
    try {
        const validatedURL = validators.validateURL(url);

        const response = await api.post(API_CONFIG.endpoints.seoChecker, {
            url: validatedURL
        });

        return response;
    } catch (error) {
        throw new Error(`SEO Check Failed: ${error.message}`);
    }
}

/**
 * QR Code Generator
 */
async function generateQRCode(data, options = {}) {
    try {
        const validatedData = validators.validateText(data);

        const response = await api.post(API_CONFIG.endpoints.qrGenerator, {
            data: validatedData,
            ...options
        });

        return response;
    } catch (error) {
        throw new Error(`QR Code Generation Failed: ${error.message}`);
    }
}

/**
 * Visiting Card Generator
 */
async function generateVisitingCard(cardData) {
    try {
        // Basic validation
        if (!cardData || typeof cardData !== 'object') {
            throw new Error('Card data is required');
        }

        // Create FormData if logo is included
        if (cardData.logo instanceof File) {
            const formData = new FormData();

            Object.keys(cardData).forEach(key => {
                if (key === 'logo') {
                    formData.append('logo', cardData.logo);
                } else {
                    formData.append(key, cardData[key]);
                }
            });

            const response = await api.postFormData(API_CONFIG.endpoints.visitingCard, formData);
            return response;
        } else {
            const response = await api.post(API_CONFIG.endpoints.visitingCard, cardData);
            return response;
        }
    } catch (error) {
        throw new Error(`Visiting Card Generation Failed: ${error.message}`);
    }
}

// ========================================
// Download Helper
// ========================================
function downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// ========================================
// Export API functions
// ========================================
window.apiClient = {
    // Core API client
    api,

    // Tool functions
    generatePDF,
    generateImage,
    generateInvoice,
    checkSEO,
    generateQRCode,
    generateVisitingCard,

    // Validators
    validators,

    // Helpers
    downloadFile,

    // Configuration
    config: API_CONFIG
};
