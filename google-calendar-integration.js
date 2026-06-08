// Google Calendar Integration Module
// Handles OAuth 2.0 authentication and appointment booking

// Replace these with your Google Cloud project credentials
const GOOGLE_CLIENT_ID = '560277826555-kccliqerreockqn0rgaq1f4h62u10j4b.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyC14i6apvAuxjbkyV_cE5q8Yo3ydWo5nRo';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

let googleAuthToken = null;
let googleUserProfile = null;

// Initialize Google API
async function initGoogleAPI() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleSignIn
            });
            resolve();
        };
        document.head.appendChild(script);
    });
}

// Load Google Calendar API
async function loadGoogleCalendarAPI() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.onload = () => {
            window.gapi.load('client', () => {
                window.gapi.client.init({
                    apiKey: GOOGLE_API_KEY,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                    clientId: GOOGLE_CLIENT_ID,
                    scope: SCOPES
                }).then(() => {
                    resolve();
                });
            });
        };
        document.head.appendChild(script);
    });
}

// Handle Google Sign In
function handleGoogleSignIn(response) {
    googleAuthToken = response.credential;
    // Decode JWT to get user info
    const decoded = parseJwt(response.credential);
    googleUserProfile = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
    };
    localStorage.setItem('googleAuthToken', response.credential);
    localStorage.setItem('googleUserProfile', JSON.stringify(googleUserProfile));
    console.log('Google Sign-In successful:', googleUserProfile);
}

// Parse JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
    );
    return JSON.parse(jsonPayload);
}

// Check if user is authenticated with Google
function isGoogleAuthenticated() {
    const token = localStorage.getItem('googleAuthToken');
    return !!token && googleAuthToken !== null;
}

// Initialize Google Sign-In button
async function initGoogleSignInButton() {
    try {
        await initGoogleAPI();
        const googleSignInContainer = document.getElementById('google-signin-container');
        if (googleSignInContainer && window.google) {
            window.google.accounts.id.renderButton(
                googleSignInContainer,
                {
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with'
                }
            );
        }
    } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
    }
}

// Create Google Calendar Event
async function createGoogleCalendarEvent(eventDetails) {
    try {
        // If not using OAuth, use direct API call with token
        if (!window.gapi || !window.gapi.client.calendar) {
            return await createCalendarEventViaAPI(eventDetails);
        }

        const event = {
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
            attendees: [
                { email: eventDetails.userEmail }
            ]
        };

        const request = window.gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: event
        });

        return new Promise((resolve, reject) => {
            request.then((response) => {
                console.log('Event created:', response.result);
                resolve(response.result);
            }).catch((error) => {
                console.error('Error creating event:', error);
                reject(error);
            });
        });

    } catch (error) {
        console.error('Error in createGoogleCalendarEvent:', error);
        throw error;
    }
}

// Alternative: Create calendar event via direct REST API call
async function createCalendarEventViaAPI(eventDetails) {
    try {
        const token = localStorage.getItem('googleAuthToken');
        if (!token) {
            throw new Error('No Google authentication token found');
        }

        const event = {
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
            location: eventDetails.location
        };

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });

        if (!response.ok) {
            throw new Error(`Failed to create event: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Event created via REST API:', result);
        return result;

    } catch (error) {
        console.error('Error in createCalendarEventViaAPI:', error);
        throw error;
    }
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

// Get user appointments
function getUserAppointments() {
    const userEmail = JSON.parse(localStorage.getItem('nabd_user') || '{}').email;
    if (!userEmail) return [];
    return JSON.parse(localStorage.getItem(`appointments_${userEmail}`) || '[]');
}

// Cancel appointment
function cancelAppointment(appointmentId) {
    const userEmail = JSON.parse(localStorage.getItem('nabd_user') || '{}').email;
    if (!userEmail) return false;

    let appointments = JSON.parse(localStorage.getItem(`appointments_${userEmail}`) || '[]');
    appointments = appointments.filter(apt => apt.id !== appointmentId);
    localStorage.setItem(`appointments_${userEmail}`, JSON.stringify(appointments));
    return true;
}

// Update appointment
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

// Format time for display
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

// Initialize Google Calendar on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load stored token if available
    const storedToken = localStorage.getItem('googleAuthToken');
    const storedProfile = localStorage.getItem('googleUserProfile');
    
    if (storedToken) {
        googleAuthToken = storedToken;
    }
    if (storedProfile) {
        googleUserProfile = JSON.parse(storedProfile);
    }

    // Initialize Google Sign-In button
    initGoogleSignInButton();
});
