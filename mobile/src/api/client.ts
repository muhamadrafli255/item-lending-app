import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For real device via Expo Go, use your PC's LAN IP
// For Android emulator, use 'http://10.0.2.2:3000'
const BASE_URL = 'https://debf-140-213-45-97.ngrok-free.app';

const COOKIE_KEY = 'session-cookies';

// Simple cookie jar: stores cookies as a key-value map
let cookieJar: Record<string, string> = {};

function parseCookies(setCookieHeaders: string | string[]): Record<string, string> {
    const cookies: Record<string, string> = {};
    const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    for (const header of headers) {
        // Extract cookie name=value (before the first ;)
        const parts = header.split(';')[0];
        if (parts) {
            const eqIndex = parts.indexOf('=');
            if (eqIndex > 0) {
                const name = parts.substring(0, eqIndex).trim();
                const value = parts.substring(eqIndex + 1).trim();
                cookies[name] = value;
            }
        }
    }
    return cookies;
}

function getCookieString(): string {
    return Object.entries(cookieJar)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
}

async function saveCookies() {
    await AsyncStorage.setItem(COOKIE_KEY, JSON.stringify(cookieJar));
}

async function loadCookies() {
    try {
        const stored = await AsyncStorage.getItem(COOKIE_KEY);
        if (stored) {
            cookieJar = JSON.parse(stored);
        }
    } catch {
        cookieJar = {};
    }
}

// Load cookies on startup
loadCookies();

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

// Attach session cookies to every request
api.interceptors.request.use(async (config) => {
    await loadCookies();
    const cookieStr = getCookieString();
    if (cookieStr) {
        config.headers.Cookie = cookieStr;
    }
    return config;
});

// Capture cookies from every response
api.interceptors.response.use(
    (response) => {
        const setCookie = response.headers['set-cookie'];
        if (setCookie) {
            const newCookies = parseCookies(setCookie);
            cookieJar = { ...cookieJar, ...newCookies };
            saveCookies();
        }
        return response;
    },
    (error) => {
        // Also capture cookies from error responses
        if (error?.response?.headers?.['set-cookie']) {
            const newCookies = parseCookies(error.response.headers['set-cookie']);
            cookieJar = { ...cookieJar, ...newCookies };
            saveCookies();
        }
        return Promise.reject(error);
    }
);

// ============ AUTH ============

export async function getCsrfToken(): Promise<string> {
    const res = await api.get('/api/auth/csrf');
    return res.data.csrfToken;
}

export async function loginUser(email: string, password: string) {
    const csrfToken = await getCsrfToken();

    const res = await api.post('/api/auth/callback/credentials',
        new URLSearchParams({
            email,
            password,
            csrfToken,
            callbackUrl: BASE_URL,
            json: 'true',
        }).toString(),
        {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            maxRedirects: 0,
            validateStatus: (status) => status < 400 || status === 302,
        }
    );

    // After login, also try fetching the session to ensure cookies are valid
    try {
        const sessionRes = await api.get('/api/auth/session');
        if (sessionRes.data?.user) {
            return res;
        }
    } catch {
        // Session fetch failed, but login might still have worked
    }

    return res;
}

export async function registerUser(name: string, email: string, password: string) {
    const res = await api.post('/api/register', { name, email, password });
    return res.data;
}

export async function logoutUser() {
    cookieJar = {};
    await AsyncStorage.removeItem(COOKIE_KEY);
}

// ============ ITEMS ============

export async function getItems() {
    const res = await api.get('/api/items');
    return res.data;
}

export async function getItemDetail(id: string) {
    const res = await api.get(`/api/items/${id}`);
    return res.data;
}

// ============ LOANS ============

export async function getLoans(status?: string) {
    const params = status ? { status } : {};
    const res = await api.get('/api/loans', { params });
    return res.data;
}

export async function createLoan(itemId: string, quantity: number) {
    const res = await api.post('/api/loans', { itemId, quantity });
    return res.data;
}

export async function returnLoan(loanId: string) {
    const res = await api.put(`/api/loans/${loanId}`, { action: 'return' });
    return res.data;
}

// ============ PROFILE ============

export async function getProfile() {
    const res = await api.get('/api/profile');
    return res.data;
}

export async function updateProfile(data: { name?: string; image?: string; currentPassword?: string; newPassword?: string }) {
    const res = await api.put('/api/profile', data);
    return res.data;
}

export { api, BASE_URL };

// Helper: resolve image URL (relative paths need BASE_URL prefix)
export function getImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BASE_URL}${path}`;
}
