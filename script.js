const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const gifContainer = document.getElementById('gifContainer');
const paginationContainer = document.getElementById('paginationContainer');

let apiKey = null;
let currentQuery = '';
let currentPage = 0;
const gitsPerPage = 12;

// Na starcie spróbuj pobrać klucz - najpierw z serwera, potem z config.json
async function loadApiKey() {
    try {
        // Spróbuj serwer
        const response = await fetch('/api/key');
        if (response.ok) {
            const data = await response.json();
            apiKey = data.key;
            return;
        }
    } catch (e) {
        // Serwer niedostępny
    }
    
    try {
        // Fallback: config.json dla lokalnego
        const response = await fetch('config.json');
        if (response.ok) {
            const data = await response.json();
            apiKey = data.apiKey;
        }
    } catch (e) {
        console.error('Cannot load API key');
    }
}

searchBtn.addEventListener('click', () => {
    currentPage = 0;
    searchGifs();
});
randomBtn.addEventListener('click', getRandomGif);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentPage = 0;
        searchGifs();
    }
});

window.addEventListener('load', () => {
    loadApiKey().then(() => getRandomGif());
});

// Wyszukiwanie GIFów po frazie z paginacją
async function searchGifs() {
    const query = searchInput.value.trim();
    if (!query) return;

    currentQuery = query;

    try {
        searchBtn.disabled = true;
        gifContainer.innerHTML = '<p>Searching...</p>';

        if (!apiKey) throw new Error('API key not available');

        const offset = currentPage * gitsPerPage;
        const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=${gitsPerPage}&offset=${offset}&rating=g`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Failed to search GIFs');

        const data = await response.json();
        displayGrid(data.data);
        displayPagination(data.pagination);
    } catch (error) {
        console.error('Error:', error);
        gifContainer.innerHTML = '<p>Error searching GIFs. Make sure server is running!</p>';
    } finally {
        searchBtn.disabled = false;
    }
}

// Losowy GIF
async function getRandomGif() {
    try {
        randomBtn.disabled = true;
        gifContainer.innerHTML = '<p>Loading...</p>';
        paginationContainer.innerHTML = '';

        if (!apiKey) throw new Error('API key not available');

        const url = `https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&rating=g`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Failed to fetch GIF');

        const data = await response.json();
        displayRandom(data.data);
    } catch (error) {
        console.error('Error:', error);
        gifContainer.innerHTML = '<p>Error loading GIF. Make sure server is running!</p>';
    } finally {
        randomBtn.disabled = false;
    }
}

// Wyświetl jeden GIF (losowy)
function displayRandom(gif) {
    const gifUrl = gif.images.original.url;
    const title = gif.title || 'Random GIF';
    
    gifContainer.innerHTML = `
        <div class="gif-wrapper">
            <h2>${title}</h2>
            <img src="${gifUrl}" alt="${title}" />
        </div>
    `;
}

// Wyświetl grid GIFów (wyszukiwanie)
function displayGrid(gifs) {
    if (gifs.length === 0) {
        gifContainer.innerHTML = '<p>No GIFs found. Try another search!</p>';
        return;
    }

    const gridHTML = `
        <div class="gif-grid">
            ${gifs.map(gif => `
                <div class="gif-item">
                    <img src="${gif.images.fixed_height.url}" alt="${gif.title}" title="${gif.title}">
                </div>
            `).join('')}
        </div>
    `;
    gifContainer.innerHTML = gridHTML;
}

// Wyświetl paginację
function displayPagination(pagination) {
    if (!currentQuery) return;

    const totalPages = Math.ceil(pagination.total_count / gitsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '<div class="pagination">';
    
    // Poprzednia strona
    if (currentPage > 0) {
        paginationHTML += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">← Previous</button>`;
    }

    // Numery stron
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, currentPage + 2);

    if (startPage > 0) {
        paginationHTML += `<button class="page-btn" onclick="goToPage(0)">1</button>`;
        if (startPage > 1) paginationHTML += '<span class="dots">...</span>';
    }

    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        paginationHTML += `<button class="page-btn ${isActive ? 'active' : ''}" onclick="goToPage(${i})">${i + 1}</button>`;
    }

    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) paginationHTML += '<span class="dots">...</span>';
        paginationHTML += `<button class="page-btn" onclick="goToPage(${totalPages - 1})">${totalPages}</button>`;
    }

    // Następna strona
    if (currentPage < totalPages - 1) {
        paginationHTML += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">Next →</button>`;
    }

    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Przejście do konkretnej strony
function goToPage(pageNum) {
    currentPage = pageNum;
    searchGifs();
    window.scrollTo(0, 0);
}
