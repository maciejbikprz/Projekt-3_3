const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const gifContainer = document.getElementById('gifContainer');

let apiKey = null;

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

searchBtn.addEventListener('click', searchGifs);
randomBtn.addEventListener('click', getRandomGif);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchGifs();
});

window.addEventListener('load', () => {
    loadApiKey().then(() => getRandomGif());
});

// Wyszukiwanie GIFów po frazie
async function searchGifs() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
        searchBtn.disabled = true;
        gifContainer.innerHTML = '<p>Searching...</p>';

        if (!apiKey) throw new Error('API key not available');

        const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=12&rating=g`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Failed to search GIFs');

        const data = await response.json();
        displayGrid(data.data);
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
