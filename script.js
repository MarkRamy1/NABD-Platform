// Main app script with i18n support
const API_BASE = 'http://localhost:3001';
const CSV_PATH = 'Hospitals_Greater_Cairo_Region.csv';

// ========== Global State ==========
let hospitals = [];
let filtered = [];
let currentPage = 1;
let currentHospitalId = null;
const PAGE_SIZE = 9;

// possible specializations (randomly assigned for demo)
const SPECIALIZATIONS = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'Oncology', 'Dermatology', 'Gynecology', 'Ophthalmology',
    'ENT', 'Urology', 'Gastroenterology', 'Psychiatry'
];

// Map specialization names to translation keys
const SPECIALIZATION_KEYS = {
    'Cardiology': 'hospital.cardiology',
    'Neurology': 'hospital.neurology',
    'Orthopedics': 'hospital.orthopedics',
    'Pediatrics': 'hospital.pediatrics',
    'Oncology': 'hospital.oncology',
    'Dermatology': 'hospital.dermatology',
    'Gynecology': 'hospital.gynecology',
    'Ophthalmology': 'hospital.ophthalmology',
    'ENT': 'hospital.ent',
    'Urology': 'hospital.urology',
    'Gastroenterology': 'hospital.gastroenterology',
    'Psychiatry': 'hospital.psychiatry'
};

// Get translated specialization name
function getSpecializationName(spec) {
    if (!spec) return 'N/A';
    const key = SPECIALIZATION_KEYS[spec];
    return key ? t(key) : spec;
}


// ========== Language/i18n ==========
async function switchLanguage(lang) {
    await loadTranslations(lang);
    // Rebuild filters & cards in the newly selected language
    populateFilters();
    renderGrid();
}

// ========== Page Navigation ==========
function showPage(pageId) {
    document.querySelectorAll('section.page').forEach(p => {
        p.style.display = p.id === pageId ? 'block' : 'none';
    });
    if (pageId === 'home') {
        document.querySelector('section.hero').style.display = 'block';
    }
}

// Hash-based routing
window.addEventListener('hashchange', () => {
    const page = location.hash.substring(1) || 'home';
    showPage(page);
});

// Initial page
document.addEventListener('DOMContentLoaded', () => {
    initI18n();
    loadDataset();
    // ensure no modal is visible when page opens
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    // clear any hash and show home section by default
    if (location.hash) location.hash = '';
    showPage('home');
});

// ========== CSV Parsing ==========
function parseCSV(text) {
    const rows = [];
    let cur = '';
    let inQuote = false;
    const cells = [];
    const pushCell = () => {
        cells.push(cur.replace(/\r?\n/g, ' ').trim());
        cur = '';
    };
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === '"') {
            if (inQuote && text[i + 1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuote = !inQuote;
            }
            continue;
        }
        if (ch === ',' && !inQuote) {
            pushCell();
            continue;
        }
        if (ch === '\n' && !inQuote) {
            pushCell();
            rows.push(cells.splice(0, cells.length));
            continue;
        }
        cur += ch;
    }
    if (cur !== '') pushCell();
    if (cells.length) rows.push(cells);
    return rows;
}

function safeGet(arr, i) {
    return (arr && arr[i]) ? arr[i] : '';
}

function randomRating(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = (h << 5) - h + seed.charCodeAt(i);
        h |= 0;
    }
    const r = 3 + Math.abs(h) % 21 / 10;
    return Math.round(r * 10) / 10;
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let out = '';
    for (let i = 0; i < full; i++) out += '★';
    if (half) out += '☆';
    while (out.length < 5) out += '☆';
    return `<span class="stars">${out}</span>`;
}

// ========== Rendering ==========
function renderGrid() {
    const hospitalGrid = document.getElementById('hospital-grid');
    if (!hospitalGrid) return;
    
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);
    
    hospitalGrid.innerHTML = pageItems.map(h => {
        const rating = h.rating.toFixed(1);
        const reviews = h.reviews || Math.floor(h.rating * 50);
        const isFav = isFavorite(h.id);
        const imgSrc = 'hospital.png';
        const hospName = getHospitalNameInLanguage(h.name, currentLanguage);
        return `
            <article class="card" data-id="${h.id}">
                <div class="card-media">
                    <img src="${imgSrc}" loading="lazy" alt="${hospName} photo">
                </div>
                <div class="card-header">
                    <h3>${hospName}</h3>
                </div>
                <div class="card-body">
                    <p class="meta">${h.region} • ${h.phone || 'N/A'}${h.specialization ? ' • ' + getSpecializationName(h.specialization) : ''}</p>
                    <div class="rating">
                        ${renderStars(h.rating)} 
                        <strong>${rating}</strong> 
                        <span class="muted">(${reviews} ${t('hospital.reviews')})</span>
                    </div>
                    <div style="margin-top:12px;display:flex;gap:8px;">
                        <button class="btn btn-sm btn-outline-primary" onclick="openDetail(${h.id})">${t('hospital.view_details')}</button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="toggleFavoritBtn(${h.id})" title="Toggle favorite">
                            ${isFav ? '♥ ' : '♡ '}${isFav ? t('hospital.remove_from_favorites') : t('hospital.add_to_favorites')}
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    const pagesCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) pageInfo.textContent = `${t('common.page')} ${currentPage} ${t('common.of')} ${pagesCount}`;
    
    // Update pagination buttons
    const prevBtn = document.querySelector('button[onclick="prevPage()"]');
    const nextBtn = document.querySelector('button[onclick="nextPage()"]');
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= pagesCount;
}

// ========== Filtering / Searching ==========
function applyFilters() {
    const searchVal = document.getElementById('search');
    const regionVal = document.getElementById('region-filter');
    const specVal = document.getElementById('specialization-filter');
    const sortVal = document.getElementById('sort-by');
    
    const q = (searchVal ? searchVal.value : '').toLowerCase().trim();
    const region = (regionVal ? regionVal.value : '').trim();
    const specialization = (specVal ? specVal.value : '').trim();
    const sort = sortVal ? sortVal.value : 'name';
    
    filtered = hospitals.filter(h => {
        if (region && h.region !== region) return false;
        if (specialization && h.specialization !== specialization) return false;
        if (q && !h.name.toLowerCase().includes(q) && !h.description.toLowerCase().includes(q)) return false;
        return true;
    });
    
    if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    if (sort === 'beds') filtered.sort((a, b) => b.beds - a.beds);
    // else keep alphabetical
    
    currentPage = 1;
    renderGrid();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderGrid();
    }
}

function nextPage() {
    const pagesCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage < pagesCount) {
        currentPage++;
        renderGrid();
    }
}

// ========== Modals ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

function switchModal(closeId, openId) {
    closeModal(closeId);
    openModal(openId);
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// ========== Detail Modal ==========
function openDetail(id) {
    currentHospitalId = id;
    const h = hospitals.find(x => x.id === id);
    if (!h) return;
    
    const hospName = getHospitalNameInLanguage(h.name, currentLanguage);
    document.getElementById('modal-name').textContent = hospName;
    document.getElementById('modal-phone').textContent = h.phone || 'N/A';
    document.getElementById('modal-location').textContent = h.location || h.region || 'N/A';
    document.getElementById('modal-region').textContent = h.region || 'N/A';
    const specEl = document.getElementById('modal-specialization');
    if (specEl) specEl.textContent = getSpecializationName(h.specialization);
    document.getElementById('modal-beds').textContent = h.beds || 'N/A';
    document.getElementById('modal-staff').textContent = h.staff || 'N/A';
    document.getElementById('modal-hours').textContent = h.hours || '24/7';
    
    const favBtn = document.getElementById('modal-favorite');
    if (favBtn) {
        const isFav = isFavorite(id);
        favBtn.textContent = isFav ? t('hospital.remove_from_favorites') : t('hospital.add_to_favorites');
    }

    const listEl = document.getElementById('modal-reviews-list');
    if (listEl) listEl.innerHTML = '<span class="text-muted">' + t('common.loading') + '</span>';
    openModal('detail-modal');
    loadAndShowReviews(id);
}

function toggleFavoriteFromModal() {
    if (currentHospitalId) {
        toggleFavoritBtn(currentHospitalId);
        const h = hospitals.find(x => x.id === currentHospitalId);
        if (h) {
            const isFav = isFavorite(currentHospitalId);
            const favBtn = document.getElementById('modal-favorite');
            if (favBtn) {
                favBtn.textContent = isFav ? t('hospital.remove_from_favorites') : t('hospital.add_to_favorites');
            }
        }
    }
}

// ========== Reviews (load from mock data, show in detail modal) ==========
function loadAndShowReviews(hospitalId) {
    const listEl = document.getElementById('modal-reviews-list');
    if (!listEl) return;
    
    // Get mock reviews for this hospital
    const reviews = typeof getMockReviews === 'function' ? getMockReviews(hospitalId) : [];
    
    if (reviews.length === 0) {
        listEl.innerHTML = '<p class="mb-0">' + t('review.no_reviews') + '</p>';
        return;
    }
    
    listEl.innerHTML = reviews.map((r) => {
        const comment = currentLanguage === 'ar' ? (r.comment_ar || r.comment_en) : (r.comment_en || r.comment_ar);
        const userName = currentLanguage === 'ar' ? (r.user_name_ar || r.user_name_en) : (r.user_name_en || r.user_name_ar);
        const stars = '★'.repeat(Math.round(r.rating)) + '☆'.repeat(5 - Math.round(r.rating));
        return `<div class="border-bottom pb-2 mb-2"><span class="stars">${stars}</span> <strong>${r.rating}</strong><br><span class="text-dark">${(comment || '').replace(/</g, '<')}</span><br><small>${userName || ''} · ${r.visit_date || ''}</small></div>`;
    }).join('');
}

// ========== Review Modal ==========
function openReviewModal() {
    if (!isLoggedIn()) {
        openModal('login-modal');
        return;
    }
    // make sure review form is cleared
    const form = document.querySelector('#review-modal form');
    if (form) form.reset();
    openModal('review-modal');
}

function handleReviewSubmit(e) {
    e.preventDefault();
    const rating = document.getElementById('review-rating').value;
    const commentAr = document.getElementById('review-comment-ar').value;
    const commentEn = document.getElementById('review-comment-en').value;
    const visitDate = document.getElementById('review-date').value;
    const proof = document.getElementById('review-proof').files[0];
    
    const user = JSON.parse(localStorage.getItem('nabd_user') || '{}');
    const userName = user.name || 'Anonymous';

    // Save review to mock data
    if (typeof addMockReview === 'function') {
        addMockReview(currentHospitalId, parseFloat(rating), commentEn, commentAr, userName);
        // Reload reviews to show the new one
        loadAndShowReviews(currentHospitalId);
    }

    alert(t('common.success'));
    closeModal('review-modal');
}

function openProfileModal() {
    const user = JSON.parse(localStorage.getItem('nabd_user') || '{}');
    if (!user || !user.email) {
        openModal('login-modal');
        return;
    }
    // populate fields
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-email').value = user.email;
    document.getElementById('profile-phone').value = user.phone || '';
    openModal('profile-modal');
}

function handleProfileSave(e) {
    e.preventDefault();
    const name = document.getElementById('profile-name').value;
    const phone = document.getElementById('profile-phone').value;
    const email = document.getElementById('profile-email').value;
    // update storage
    localStorage.setItem(`nabd_profile_${email}`, JSON.stringify({ name, phone }));
    const user = { email, name, phone };
    localStorage.setItem('nabd_user', JSON.stringify(user));
    updateAuthUI();
    alert(t('common.success'));
    closeModal('profile-modal');
}


// ========== Favorites (localStorage) ==========
function getFavorites() {
    return JSON.parse(localStorage.getItem('nabd_favs') || '[]');
}

function isFavorite(id) {
    return getFavorites().includes(id);
}

function toggleFavoritBtn(id) {
    if (!isLoggedIn()) {
        openModal('login-modal');
        return;
    }
    const favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx >= 0) {
        favs.splice(idx, 1);
    } else {
        favs.push(id);
    }
    localStorage.setItem('nabd_favs', JSON.stringify(favs));
    renderGrid();
}

// ========== Auth & API helpers ==========
function getAuthHeaders() {
    const token = localStorage.getItem('nabd_token');
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
}

function isLoggedIn() {
    return !!localStorage.getItem('nabd_user');
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('#login-name') ? form.querySelector('#login-name').value.trim() : '';
    const email = form.querySelector('input[type="email"]').value.trim();
    const password = form.querySelector('input[type="password"]').value;

    // Try API login first
    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (res.ok && data.user && data.token) {
            const u = data.user;
            localStorage.setItem('nabd_token', data.token);
            localStorage.setItem('nabd_user', JSON.stringify({
                id: u.id,
                email: u.email,
                name: u.name_en || u.name_ar || name || email,
                name_en: u.name_en,
                name_ar: u.name_ar,
                phone: u.phone || '',
            }));
            closeModal('login-modal');
            updateAuthUI();
            return;
        }
    } catch (err) {
        console.warn('Login API failed, using local fallback', err);
    }
    
    // Fallback: create local profile with the provided name
    const profile = JSON.parse(localStorage.getItem(`nabd_profile_${email}`) || '{}');
    const userName = name || profile.name || email;
    const user = { 
        email, 
        name: userName, 
        name_en: userName,
        name_ar: userName,
        phone: profile.phone || '' 
    };
    localStorage.setItem('nabd_user', JSON.stringify(user));
    localStorage.setItem(`nabd_profile_${email}`, JSON.stringify({ name: userName, phone: profile.phone || '' }));
    closeModal('login-modal');
    updateAuthUI();
}

async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('input[type="text"]').value.trim();
    const email = form.querySelector('input[type="email"]').value.trim();
    const phone = (form.querySelector('input[type="tel"]').value || '').trim();
    const password = form.querySelectorAll('input[type="password"]')[0].value;

    // Gmail-only validation
    if (!email.toLowerCase().endsWith('@gmail.com')) {
        alert('Only Gmail accounts (@gmail.com) are allowed for registration. Please use your Gmail account.');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                name_en: name,
                name_ar: name,
                phone,
                language_preference: currentLanguage,
            }),
        });
        const data = await res.json();
        if (res.ok && data.user && data.token) {
            const u = data.user;
            localStorage.setItem('nabd_token', data.token);
            localStorage.setItem('nabd_user', JSON.stringify({
                id: u.id,
                email: u.email,
                name: u.name_en || u.name_ar || name,
                name_en: u.name_en,
                name_ar: u.name_ar,
                phone: u.phone || '',
            }));
            closeModal('register-modal');
            updateAuthUI();
            return;
        }
    } catch (err) {
        console.warn('Register API failed, using local fallback', err);
    }
    localStorage.setItem(`nabd_profile_${email}`, JSON.stringify({ name, phone }));
    localStorage.setItem('nabd_user', JSON.stringify({ 
        email, 
        name, 
        name_en: name, 
        name_ar: name, 
        phone 
    }));
    closeModal('register-modal');
    updateAuthUI();
}

async function handleLogout() {
    const token = localStorage.getItem('nabd_token');
    if (token) {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
        } catch (e) {}
    }
    localStorage.removeItem('nabd_token');
    localStorage.removeItem('nabd_user');
    localStorage.removeItem('nabd_favs');
    updateAuthUI();
}

function getDisplayName(user) {
    if (!user) return '';
    const name = currentLanguage === 'ar'
        ? (user.name_ar || user.name_en || user.name)
        : (user.name_en || user.name_ar || user.name);
    return name || user.email || '';
}

function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userMenu = document.getElementById('user-menu');
    const userBtn = document.getElementById('user-btn');

    if (isLoggedIn()) {
        const user = JSON.parse(localStorage.getItem('nabd_user') || '{}');
        if (userBtn) userBtn.textContent = getDisplayName(user);
        if (userMenu) userMenu.style.display = 'block';
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    } else {
        if (userMenu) userMenu.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (registerBtn) registerBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// ========== Contact Form ==========
function sendContact(e) {
    e.preventDefault();
    alert(t('contact.success'));
    e.target.reset();
}

// ========== Load Dataset ==========
async function loadDataset() {
    try {
        // Try backend API first
        const res = await fetch(`${API_BASE}/api/hospitals?page=1&limit=200`);
        if (!res.ok) throw new Error('API fetch failed');
        const data = await res.json();
        const list = Array.isArray(data.hospitals) ? data.hospitals : [];

        hospitals = list.map((h) => {
            const id = String(h.id);
            const region = h.city_en || h.city_ar || 'Cairo';
            const phone = h.phone || 'N/A';
            const description = h.description_en || 'General Hospital';
            const location = h.city_en || h.city_ar || region;
            const beds = h.beds || 100;
            const staff = h.staff || 50;
            const rating = typeof h.average_rating === 'number'
                ? h.average_rating
                : randomRating((h.name_en || '') + region);
            const reviews = typeof h.total_reviews === 'number'
                ? h.total_reviews
                : Math.floor(rating * 50);

            let specialization = '';
            if (Array.isArray(h.specializations) && h.specializations.length > 0) {
                specialization = h.specializations[0].name_en || h.specializations[0].id || '';
            }

            return {
                id,
                name: h.name_en || h.name_ar || 'Unknown Hospital',
                name_ar: h.name_ar || '',
                region,
                phone,
                description,
                location,
                hours: '24/7',
                beds,
                staff,
                rating,
                reviews,
                specialization,
                image: 'hospital.jpg',
            };
        });

        if (hospitals.length === 0) throw new Error('No hospitals from API');
    } catch (err) {
        console.warn('Failed to load from API, falling back to CSV/sample data', err);
        try {
            const res = await fetch(CSV_PATH);
            if (!res.ok) throw new Error('CSV fetch failed');
            const text = await res.text();
            const rows = parseCSV(text);
            
            hospitals = [];
            for (let i = 1; i < rows.length; i++) {
                const r = rows[i];
                if (r.length < 3) continue;
                
                const name = safeGet(r, 0).trim();
                if (!name || name.length < 3) continue;
                
                const id = i;
                const region = safeGet(r, 2) || 'Cairo';
                const phone = safeGet(r, 3) || 'N/A';
                const description = safeGet(r, 4) || 'General Hospital';
                const location = safeGet(r, 5) || region;
                const hours = safeGet(r, 6) || '24/7';
                const beds = parseInt(safeGet(r, 10)) || 100;
                const staff = parseInt(safeGet(r, 11)) || 50;
                const rating = randomRating(name + region);
                const specialization = SPECIALIZATIONS[Math.floor(Math.random() * SPECIALIZATIONS.length)];
                
                hospitals.push({
                    id,
                    name,
                    region,
                    phone,
                    description,
                    location,
                    hours,
                    beds,
                    staff,
                    rating,
                    reviews: Math.floor(rating * 50),
                    specialization,
                    image: safeGet(r, 12) || 'hospital.jpg'
                });
            }
        } catch (csvErr) {
            console.warn('Failed to load CSV, using sample data', csvErr);
            hospitals = [
                { id: 1, name: 'Dar el Salam General Hospital', region: 'Cairo', phone: '+20 123 456', description: 'Leading general hospital', location: 'Downtown', hours: '24/7', beds: 220, staff: 450, rating: 4.8, reviews: 184, specialization: SPECIALIZATIONS[0], image: 'hospital.jpg' },
                { id: 2, name: 'Dar el Oyoun Hospital', region: 'Cairo', phone: '+20 234 567', description: 'Specialized eye care', location: 'Zamalek', hours: '24/7', beds: 120, staff: 200, rating: 4.9, reviews: 187, specialization: SPECIALIZATIONS[7], image: 'hospital.jpg' },
                { id: 3, name: 'Dar Al Fouad Hospital', region: 'Giza', phone: '+20 345 678', description: 'Premium private hospital', location: 'New Cairo', hours: '24/7', beds: 350, staff: 900, rating: 5.0, reviews: 232, specialization: SPECIALIZATIONS[2], image: 'hospital.jpg' }
            ];
        }
    }
    
    populateFilters();
    
    filtered = hospitals.slice();
    applyFilters();
    updateAuthUI();
}

// ========== Filters (Regions & Specializations) ==========
function populateFilters() {
    if (!hospitals || !hospitals.length) return;

    // Populate region filter
    const regions = [...new Set(hospitals.map(h => h.region).filter(Boolean))];
    const regionFilter = document.getElementById('region-filter');
    if (regionFilter) {
        regionFilter.innerHTML = `<option value="">${t('hospital.filter_by_city')}</option>` + 
            regions.map(r => `<option value="${r}">${r}</option>`).join('');
    }

    // Populate specialization filter
    const specs = [...new Set(hospitals.map(h => h.specialization).filter(Boolean))];
    const specFilter = document.getElementById('specialization-filter');
    if (specFilter) {
        specFilter.innerHTML = `<option value="">${t('hospital.filter_by_specialization')}</option>` +
            specs.map(s => `<option value="${s}">${getSpecializationName(s)}</option>`).join('');
    }
}

// ========== Appointment Booking ==========
function openAppointmentModal() {
    if (!isLoggedIn()) {
        alert(t('appointment.login_required'));
        openModal('login-modal');
        return;
    }

    // Set hospital name in form
    const hospital = hospitals.find(h => h.id === currentHospitalId);
    if (hospital) {
        document.getElementById('appointment-hospital').value = 
            getHospitalNameInLanguage(hospital.name, currentLanguage);
        document.getElementById('appointment-specialization').value = 
            getSpecializationName(hospital.specialization);
    }

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('appointment-date');
    dateInput.min = today;
    dateInput.value = today;

    // Show form
    document.getElementById('appointment-form').style.display = 'block';
    document.getElementById('google-signin-section').style.display = 'none';

    openModal('appointment-modal');
}

async function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('nabd_user') || '{}');
    if (!user.email) {
        alert(t('appointment.not_logged_in'));
        return;
    }

    const hospital = hospitals.find(h => h.id === currentHospitalId);
    const appointmentDate = document.getElementById('appointment-date').value;
    const appointmentTime = document.getElementById('appointment-time').value;
    const doctorName = document.getElementById('appointment-doctor').value;
    const notes = document.getElementById('appointment-notes').value;
    const saveToCalendar = document.getElementById('appointment-save-calendar').checked;

    // Create datetime objects
    const startDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60000); // 1 hour appointment

    // Prepare appointment data
    const appointmentData = {
        hospitalId: currentHospitalId,
        hospitalName: hospital.name,
        hospitalPhone: hospital.phone,
        hospitalLocation: hospital.location,
        specialization: hospital.specialization,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        doctorName: doctorName || 'Not Specified',
        notes: notes,
        userEmail: user.email,
        userName: user.name,
        status: 'confirmed'
    };

    try {
        // Save to local storage
        const savedAppointment = saveAppointmentLocally(appointmentData);
        console.log('Appointment saved locally:', savedAppointment);

        // Save to Google Calendar if user wants
        if (saveToCalendar) {
            if (!isGoogleCalendarConfigured()) {
                alert(t('appointment.booking_success'));
            } else {
                try {
                    const eventDetails = {
                        title: `Hospital Appointment - ${hospital.name}`,
                        description: `Specialization: ${getSpecializationName(hospital.specialization)}\nDoctor: ${appointmentData.doctorName}\nNotes: ${notes}`,
                        location: hospital.location,
                        startDateTime: startDateTime.toISOString(),
                        endDateTime: endDateTime.toISOString(),
                        userEmail: user.email
                    };

                    await createGoogleCalendarEvent(eventDetails);
                    console.log('Event added to Google Calendar');
                    alert(t('appointment.booking_with_calendar'));
                } catch (error) {
                    console.error('Error saving to Google Calendar:', error);
                    alert(t('appointment.booking_calendar_failed'));
                }
            }
        } else {
            alert(t('appointment.booking_success'));
        }

        // Close modal and refresh UI
        closeModal('appointment-modal');
        e.target.reset();
        
        // Optionally show appointments list
        displayUserAppointments();

    } catch (error) {
        console.error('Error booking appointment:', error);
        alert(t('appointment.error_booking'));
    }
}

function displayUserAppointments() {
    const appointments = getUserAppointments();
    const appointmentsList = document.getElementById('appointments-list');
    
    if (!appointmentsList) return;

    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<p class="text-muted text-center">No appointments booked yet</p>';
        return;
    }

    let html = '<div class="appointments-container">';
    
    appointments.forEach(apt => {
        const appointmentDateTime = formatAppointmentDateTime(`${apt.appointmentDate}T${apt.appointmentTime}`);
        html += `
            <div class="appointment-card p-3 mb-3 border rounded" style="background: #f8f9fa;">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="mb-1">${apt.hospitalName}</h5>
                        <p class="mb-1"><small><strong>Date/Time:</strong> ${appointmentDateTime}</small></p>
                        <p class="mb-1"><small><strong>Specialization:</strong> ${getSpecializationName(apt.specialization)}</small></p>
                        <p class="mb-1"><small><strong>Doctor:</strong> ${apt.doctorName}</small></p>
                        <p class="mb-1"><small><strong>Phone:</strong> ${apt.hospitalPhone}</small></p>
                        <p class="mb-1"><small><strong>Location:</strong> ${apt.hospitalLocation}</small></p>
                        ${apt.notes ? `<p class="mb-0"><small><strong>Notes:</strong> ${apt.notes}</small></p>` : ''}
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="cancelAppointmentUI(${apt.id})">Cancel</button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    appointmentsList.innerHTML = html;
}

function cancelAppointmentUI(appointmentId) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        cancelAppointment(appointmentId);
        displayUserAppointments();
        alert('Appointment cancelled');
    }
}

function showMyAppointments() {
    if (!isLoggedIn()) {
        alert('Please login to view your appointments');
        openModal('login-modal');
        return;
    }
    
    displayUserAppointments();
    openModal('my-appointments-modal');
}

// ========== Event Listeners ==========
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const searchBtn = document.querySelector('button[onclick="applyFilters()"]');
    const regionFilter = document.getElementById('region-filter');
    const sortBy = document.getElementById('sort-by');
    const langSelect = document.getElementById('lang-select');
    
    if (searchInput) searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
    
    if (regionFilter) regionFilter.addEventListener('change', applyFilters);
    if (sortBy) sortBy.addEventListener('change', applyFilters);
    if (langSelect) langSelect.addEventListener('change', (e) => {
        switchLanguage(e.target.value);
    });
});
