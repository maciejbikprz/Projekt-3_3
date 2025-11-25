const getGifBtn = document.getElementById('getGifBtn');
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

getGifBtn.addEventListener('click', fetchRandomGif);
window.addEventListener('load', () => {
    loadApiKey().then(() => fetchRandomGif());
});

async function fetchRandomGif() {
    try {
        getGifBtn.disabled = true;
        gifContainer.innerHTML = '<p>Loading...</p>';

        if (!apiKey) {
            throw new Error('API key not available');
        }

        const url = `https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&rating=g`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch GIF');
        }

        const data = await response.json();
        displayGif(data);
    } catch (error) {
        console.error('Error:', error);
        gifContainer.innerHTML = '<p>Error loading GIF. Make sure server is running!</p>';
    } finally {
        getGifBtn.disabled = false;
    }
}

function displayGif(data) {
    const gifUrl = data.data.images.original.url;
    const title = data.data.title || 'Random GIF';
    
    gifContainer.innerHTML = `
        <div class="gif-wrapper">
            <h2>${title}</h2>
            <img src="${gifUrl}" alt="${title}" />
        </div>
    `;
}
