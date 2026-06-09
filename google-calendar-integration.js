// Google Calendar Integration — OAuth 2.0 access tokens + Calendar API
// Credentials load from google-calendar-config.js (see google-calendar-config.example.js)

const GOOGLE_CLIENT_ID = (window.NABD_GOOGLE_CONFIG || {}).clientId || '';
const GOOGLE_API_KEY = (window.NABD_GOOGLE_CONFIG || {}).apiKey || '';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let googleAccessToken = null;
let googleAccessTokenExpiry = 0;
let tokenClient = null;
let gapiReady = false;
let gsiReady = false;

function isGoogleCalendarConfigured() {
    return Boolean(GOOGLE_CLIENT_ID);
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
}

function clearLegacyGoogleTokens() {
    localStorage.removeItem('googleAuthToken');
}

function clearGoogleAccessToken() {
    googleAccessToken = null;
    googleAccessTokenExpiry = 0;
    localStorage.removeItem('googleAccessToken');
    localStorage.removeItem('googleAccessTokenExpiry');
    if (window.gapi?.client) {
        gapi.client.setToken(null);
    }
}

function applyAccessToken(token, expiresInSeconds) {
    googleAccessToken = token;
    googleAccessTokenExpiry = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem('googleAccessToken', token);
    localStorage.setItem('googleAccessTokenExpiry', String(googleAccessTokenExpiry));
    if (window.gapi?.client) {
        gapi.client.setToken({ access_token: token });
    }
}

function restoreGoogleAccessToken() {
    const token = localStorage.getItem('googleAccessToken');
    const expiry = Number(localStorage.getItem('googleAccessTokenExpiry') || 0);
    if (token && expiry > Date.now() + 60_000) {
        googleAccessToken = token;
        googleAccessTokenExpiry = expiry;
        if (window.gapi?.client) {
            gapi.client.setToken({ access_token: token });
        }
        return true;
    }
    clearGoogleAccessToken();
    return false;
}

function isGoogleAuthenticated() {
    if (googleAccessToken && googleAccessTokenExpiry > Date.now() + 60_000) {
        return true;
    }
    return restoreGoogleAccessToken();
}

async function initGoogleIdentityServices() {
    if (gsiReady || !isGoogleCalendarConfigured()) return;
    await loadScript('https://accounts.google.com/gsi/client');
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: () => {}
    });
    gsiReady = true;
}

async function loadGoogleCalendarAPI() {
    if (gapiReady || !isGoogleCalendarConfigured()) return;
    await loadScript('https://apis.google.com/js/api.js');
    await new Promise((resolve, reject) => {
        gapi.load('client', { callback: resolve, onerror: reject });
    });
    const initOptions = {
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
    };
    if (GOOGLE_API_KEY) {
        initOptions.apiKey = GOOGLE_API_KEY;
    }
    await gapi.client.init(initOptions);
    gapiReady = true;
    restoreGoogleAccessToken();
}

function requestGoogleCalendarAccess(prompt = '') {
    return new Promise((resolve, reject) => {
        if (!isGoogleCalendarConfigured()) {
            reject(new Error('Google Calendar is not configured'));
            return;
        }
        if (!tokenClient) {
            reject(new Error('Google Identity Services not initialized'));
            return;
        }
        if (isGoogleAuthenticated()) {
            resolve(googleAccessToken);
            return;
        }
        tokenClient.callback = (response) => {
            if (response.error !== undefined) {
                reject(new Error(response.error));
                return;
            }
            applyAccessToken(response.access_token, response.expires_in);
            resolve(googleAccessToken);
        };
        tokenClient.requestAccessToken({ prompt });
    });
}

async function ensureGoogleCalendarAuth() {
    if (!isGoogleCalendarConfigured()) {
        throw new Error('Google Calendar is not configured');
    }
    if (isGoogleAuthenticated()) {
        return googleAccessToken;
    }
    try {
        return await requestGoogleCalendarAccess('');
    } catch {
        return await requestGoogleCalendarAccess('consent');
    }
}

function buildCalendarEventResource(eventDetails) {
    return {
        summary: eventDetails.title,
        description: eventDetails.description,
        start: {
            dateTime: new Date(eventDetails.startDateTime).toISOString(),
            timeZone: 'Africa/Cairo'
        },
        end: {
            dateTime: new Date(eventDetails.endDateTime).toISOString(),
            timeZone: 'Africa/Cairo'
        },
        location: eventDetails.location,
        attendees: eventDetails.userEmail ? [{ email: eventDetails.userEmail }] : []
    };
}

async function createGoogleCalendarEvent(eventDetails) {
    const accessToken = await ensureGoogleCalendarAuth();
    const event = buildCalendarEventResource(eventDetails);

    if (gapiReady && window.gapi?.client?.calendar) {
        const response = await gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: event
        });
        return response.result;
    }

    const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        }
    );

    if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Calendar API error (${response.status}): ${errBody}`);
    }

    return response.json();
}

async function initGoogleCalendarConnectButton() {
    const container = document.getElementById('google-signin-container');
    if (!container || !isGoogleCalendarConfigured()) return;

    container.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline-primary';
    btn.textContent = isGoogleAuthenticated()
        ? 'Google Calendar connected'
        : 'Connect Google Calendar';
    btn.disabled = isGoogleAuthenticated();
    btn.addEventListener('click', async () => {
        try {
            await requestGoogleCalendarAccess('consent');
            btn.textContent = 'Google Calendar connected';
            btn.disabled = true;
        } catch (err) {
            console.error('Google Calendar connect failed:', err);
            alert('Could not connect Google Calendar. Please try again.');
        }
    });
    container.appendChild(btn);
}

async function initGoogleCalendar() {
    clearLegacyGoogleTokens();

    if (!isGoogleCalendarConfigured()) {
        console.warn(
            'Google Calendar: copy google-calendar-config.example.js to google-calendar-config.js and add your credentials.'
        );
        return;
    }

    await initGoogleIdentityServices();
    await loadGoogleCalendarAPI();
    await initGoogleCalendarConnectButton();
}

// Store appointment locally
function saveAppointmentLocally(appointmentData) {
    const userEmail = JSON.parse(localStorage.getItem('nabd_user') || '{}').email;
    const appointments = JSON.parse(localStorage.getItem(`appointments_${userEmail}`) || '[]');

    const appointment = {
        id: Date.now(),
        ...appointmentData,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
    };

    appointments.push(appointment);
    localStorage.setItem(`appointments_${userEmail}`, JSON.stringify(appointments));
    return appointment;
}

function getUserAppointments() {
    const userEmail = JSON.parse(localStorage.getItem('nabd_user') || '{}').email;
    if (!userEmail) return [];
    return JSON.parse(localStorage.getItem(`appointments_${userEmail}`) || '[]');
}

function cancelAppointment(appointmentId) {
    const userEmail = JSON.parse(localStorage.getItem('nabd_user') || '{}').email;
    if (!userEmail) return false;

    let appointments = JSON.parse(localStorage.getItem(`appointments_${userEmail}`) || '[]');
    appointments = appointments.filter(apt => apt.id !== appointmentId);
    localStorage.setItem(`appointments_${userEmail}`, JSON.stringify(appointments));
    return true;
}

function updateAppointment(appointmentId, updates) {
    const userEmail = JSON.parse(localStorage.getItem('nabd_user') || '{}').email;
    if (!userEmail) return false;

    let appointments = JSON.parse(localStorage.getItem(`appointments_${userEmail}`) || '[]');
    const index = appointments.findIndex(apt => apt.id === appointmentId);

    if (index !== -1) {
        appointments[index] = { ...appointments[index], ...updates };
        localStorage.setItem(`appointments_${userEmail}`, JSON.stringify(appointments));
        return appointments[index];
    }
    return null;
}

function formatAppointmentDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initGoogleCalendar().catch((err) => {
        console.error('Google Calendar initialization failed:', err);
    });
});
