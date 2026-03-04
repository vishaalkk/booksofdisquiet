document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const mapSearch = document.getElementById('mapSearch');
    const folderTree = document.getElementById('folderTree');
    const languageFoldersContainer = document.getElementById('languageFolders');
    const authorFoldersContainer = document.getElementById('authorFolders');
    const storeFoldersContainer = document.getElementById('storeFolders');
    const cards = Array.from(document.querySelectorAll('.fragment-card'));
    const currentFolderNameEl = document.getElementById('currentFolderName');
    const folderStatsEl = document.getElementById('folderStats');
    const gridContainer = document.getElementById('gridContainer');
    const cityOverlay = document.getElementById('cityDetailOverlay');
    const cityContent = document.getElementById('cityDetailContent');
    const closeOverlay = document.querySelector('.close-overlay');
    
    // Mobile Nav Elements
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const directoryPane = document.querySelector('.directory-pane');

    // Receipt Modal Elements
    const receiptModal = document.getElementById('receiptModal');
    const thermalReceipt = document.getElementById('thermalReceipt');
    const closeReceiptBtn = document.querySelector('.close-receipt');

    let currentFolderType = 'all'; 
    let currentFolderValue = 'all';
    let currentSearch = '';
    let map = null;
    let markers = [];

    // 1. Initial Order Randomization
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    shuffleArray(cards);
    cards.forEach(card => gridContainer.appendChild(card));

    // --- Floating Writer Caricatures ---
    const writers = [
        { name: "Fernando Pessoa", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Pessoa_chapeu.jpg/500px-Pessoa_chapeu.jpg" },
        { name: "Clarice Lispector", img: "https://upload.wikimedia.org/wikipedia/commons/7/75/Clarice_Lispector_%28cropped%29.jpg" },
        { name: "Fyodor Dostoevsky", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg/500px-Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg" },
        { name: "Sylvia Plath", img: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Sylvia_Plath.jpg" },
        { name: "Karl Ove Knausgaard", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Karl_Ove_Knausg%C3%A5rd_2024_in_M%C3%BCnchen_02.jpg/500px-Karl_Ove_Knausg%C3%A5rd_2024_in_M%C3%BCnchen_02.jpg" },
        { name: "Javier Marías", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Javier_Mar%C3%ADas_%28Feria_del_Libro_de_Madrid%2C_31_de_mayo_de_2008%29.jpg/500px-Javier_Mar%C3%ADas_%28Feria_del_Libro_de_Madrid%2C_31_de_mayo_de_2008%29.jpg" }
    ];

    shuffleArray(writers);
    const titleContainerEl = document.querySelector('.title-container');

    writers.slice(0, 2).forEach((writer, index) => {
        const img = document.createElement('img');
        img.className = 'floating-writer';
        img.src = writer.img;
        img.alt = writer.name;
        img.title = writer.name;
        img.style.transform = `rotate(${(Math.random() * 20) - 10}deg)`;
        const randomTop = Math.floor(Math.random() * 80) - 20;
        const sideOffset = -150 - Math.floor(Math.random() * 60);
        if (index === 0) img.style.left = sideOffset + 'px';
        else img.style.right = sideOffset + 'px';
        img.style.top = randomTop + 'px';
        titleContainerEl.appendChild(img);
    });

    // 2. Dynamic Folder Generation
    const languages = new Set();
    const authors = new Set();
    const stores = new Set();

    cards.forEach(card => {
        const lang = card.getAttribute('data-language');
        if (lang) languages.add(lang.charAt(0).toUpperCase() + lang.slice(1));
        const author = card.getAttribute('data-author');
        if (author && author.trim() !== '') {
            authors.add(author.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        }
        const store = card.getAttribute('data-store');
        if (store && store.trim() !== '') {
            stores.add(store.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        }
    });

    function createFolderItems(set, container, prefix) {
        Array.from(set).sort().forEach(item => {
            const el = document.createElement('div');
            el.className = 'tree-item';
            el.setAttribute('data-folder', `${prefix}-${item.toLowerCase()}`);
            el.setAttribute('data-view', 'grid');
            el.innerHTML = `<span class="folder-icon">📁</span> ${item}`;
            container.appendChild(el);
        });
    }

    createFolderItems(languages, languageFoldersContainer, 'language');
    createFolderItems(authors, authorFoldersContainer, 'author');
    createFolderItems(stores, storeFoldersContainer, 'store');

    // 3. View Management
    function switchView(viewId) {
        document.querySelectorAll('.folder-contents, .system-view').forEach(v => {
            v.classList.remove('active-view');
            v.style.display = 'none';
        });
        
        if (viewId === 'grid') {
            gridContainer.classList.add('active-view');
            gridContainer.style.display = 'grid';
            renderView();
        } else if (viewId === 'map') {
            const mapView = document.getElementById('mapView');
            mapView.classList.add('active-view');
            mapView.style.display = 'block';
            initMap();
        } else if (viewId === 'stats') {
            const statsView = document.getElementById('statsView');
            statsView.classList.add('active-view');
            statsView.style.display = 'block';
            renderStats();
        }
    }

    function renderView() {
        let visibleCount = 0;
        cards.forEach(card => {
            const title = card.getAttribute('data-title') || '';
            const author = card.getAttribute('data-author') || '';
            const store = card.getAttribute('data-store') || '';
            const isRead = card.getAttribute('data-read') === 'true';
            const language = card.getAttribute('data-language') || '';

            const matchesSearch = currentSearch === '' || 
                                  title.includes(currentSearch) || 
                                  author.includes(currentSearch) || 
                                  store.includes(currentSearch);

            let matchesFolder = true;
            if (currentFolderType === 'status') {
                if (currentFolderValue === 'read' && !isRead) matchesFolder = false;
                if (currentFolderValue === 'unread' && isRead) matchesFolder = false;
            } else if (currentFolderType === 'language' && language !== currentFolderValue) matchesFolder = false;
            else if (currentFolderType === 'author' && author !== currentFolderValue) matchesFolder = false;
            else if (currentFolderType === 'store' && store !== currentFolderValue) matchesFolder = false;

            if (matchesSearch && matchesFolder) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        folderStatsEl.innerText = `${visibleCount} item${visibleCount !== 1 ? 's' : ''}`;
    }

    // 4. Map & Stats Logics
    const cityData = {
        'brooklyn': { coords: [40.6782, -73.9442], color: '#FFB7B2', icon: '🏢', name: 'Brooklyn' },
        'toronto': { coords: [43.6532, -79.3832], color: '#B5EAD7', icon: '🗼', name: 'Toronto' },
        'london': { coords: [51.5074, -0.1278], color: '#C7CEEA', icon: '🏰', name: 'London' },
        'san francisco': { coords: [37.7749, -122.4194], color: '#FFDAC1', icon: '🌉', name: 'San Francisco' },
        'karachi': { coords: [24.8607, 67.0011], color: '#E2F0CB', icon: '🕌', name: 'Karachi' },
        'berkeley': { coords: [37.8715, -122.2730], color: '#FF9AA2', icon: '🎓', name: 'Berkeley' },
        'new haven': { coords: [41.3083, -72.9279], color: '#B5EAD7', icon: '🗝️', name: 'New Haven' },
        'austin': { coords: [30.2672, -97.7431], color: '#C7CEEA', icon: '🎸', name: 'Austin' }
    };

    function createStampSVG(city) {
        return `
            <div class="city-doodle-icon" style="
                background-color: ${city.color};
                border: 3px solid var(--ink);
                box-shadow: 4px 4px 0px var(--ink);
                width: 50px;
                height: 60px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            ">
                <div style="font-size: 20px; margin-bottom: 2px;">${city.icon}</div>
                <div style="
                    font-family: var(--font-mono);
                    font-size: 8px;
                    font-weight: bold;
                    text-transform: uppercase;
                    background: var(--ink);
                    color: white;
                    width: 100%;
                    text-align: center;
                    position: absolute;
                    bottom: 0;
                    padding: 2px 0;
                ">${city.name.substring(0, 8)}</div>
            </div>
        `;
    }

    const cityAliases = { 'ny': 'brooklyn', 'new york': 'brooklyn', 'sf': 'san francisco', 'oakland': 'berkeley' };

    function initMap() {
        if (!map) {
            map = L.map('map', { zoomControl: false }).setView([35, -40], 3);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '©OpenStreetMap'
            }).addTo(map);

            for (const key in cityData) {
                const city = cityData[key];
                const customIcon = L.divIcon({
                    className: 'city-doodle-marker',
                    html: createStampSVG(city),
                    iconSize: [50, 60],
                    iconAnchor: [25, 30]
                });
                const marker = L.marker(city.coords, { icon: customIcon }).addTo(map);
                marker.on('click', () => showCityDetail(key));
                markers.push({ key, marker, name: city.name });
            }
        }
        setTimeout(() => map.invalidateSize(), 100);
    }

    function showCityDetail(cityKey) {
        const city = cityData[cityKey];
        const relevantAliases = Object.keys(cityAliases).filter(k => cityAliases[k] === cityKey);
        const searchTerms = [cityKey, ...relevantAliases];
        const storesInCity = new Set();
        cards.forEach(card => {
            const store = (card.getAttribute('data-store') || '').toLowerCase();
            if (searchTerms.some(term => store.includes(term))) {
                const sName = card.getAttribute('data-store');
                if (sName && sName !== 'unknown') storesInCity.add(sName);
            }
        });
        cityContent.innerHTML = `
            <h2 class="city-title">${city.name}</h2>
            <div class="stamps-container">${Array.from(storesInCity).map(s => `<span class="bookstore-stamp">${s}</span>`).join('')}</div>
        `;
        cityOverlay.classList.add('active');
    }

    function renderStats() {
        const total = cards.length;
        const read = cards.filter(c => c.getAttribute('data-read') === 'true').length;
        const unread = total - read;
        const counts = { lang: {}, writer: {}, store: {} };
        cards.forEach(c => {
            const l = (c.getAttribute('data-language') || 'unknown').trim() || 'Unknown';
            counts.lang[l] = (counts.lang[l] || 0) + 1;
            const w = (c.getAttribute('data-author') || 'unknown').trim() || 'Unknown';
            counts.writer[w] = (counts.writer[w] || 0) + 1;
            const s = (c.getAttribute('data-store') || 'unknown').trim() || 'Unknown';
            counts.store[s] = (counts.store[s] || 0) + 1;
        });
        function draw(data, id) {
            const container = document.getElementById(id);
            if (!container) return;
            container.innerHTML = '';
            const sorted = Object.entries(data).sort((a,b) => b[1] - a[1]).slice(0, 6);
            const max = Math.max(...sorted.map(s => s[1]));
            sorted.forEach(([label, val]) => {
                const p = (val / max) * 100;
                container.innerHTML += `<div class="stat-row"><div class="stat-label"><span>${label}</span><span>${val}</span></div><div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${p}%"></div></div></div>`;
            });
        }
        draw({ 'Read': read, 'Unread': unread }, 'readChart');
        draw(counts.lang, 'langChart');
        draw(counts.writer, 'writerChart');
        draw(counts.store, 'locationChart');
    }

    // --- Thermal Receipt Logic ---
    function showThermalReceipt(data) {
        thermalReceipt.innerHTML = `
            <div class="receipt-header">
                <h4>V:\\ARCHIVES</h4>
                <p>${data.store.toUpperCase()}</p>
                <p>FRAGMENT ACQUISITION</p>
            </div>
            <div class="receipt-body">
                <div class="receipt-row">
                    <span>DATE: ${data.date}</span>
                    <span>#${Math.floor(Math.random() * 90000) + 10000}</span>
                </div>
                <div class="receipt-divider"></div>
                <div class="receipt-row"><span>TITLE:</span></div>
                <div style="font-weight: bold; margin-bottom: 10px; line-height: 1.2;">${data.title.toUpperCase()}</div>
                <div class="receipt-row">
                    <span>WRITER:</span>
                    <span>${data.author.toUpperCase()}</span>
                </div>
                <div class="receipt-divider"></div>
                <div class="receipt-total">
                    <span>TOTAL</span>
                    <span>${data.price || '$0.00'}</span>
                </div>
                <div class="barcode"></div>
                <div class="receipt-footer">
                    <p>THANK YOU FOR SUPPORTING THE ARCHIVE.</p>
                    <p>ALL SALES ARE FINAL.</p>
                </div>
            </div>
        `;
        receiptModal.style.display = 'flex';
    }

    // 5. Attach Event Listeners
    function setupListeners() {
        // Mobile Toggle logic
        if (mobileNavToggle) {
            mobileNavToggle.onclick = (e) => {
                e.stopPropagation();
                directoryPane.classList.toggle('drawer-open');
                mobileNavToggle.innerHTML = directoryPane.classList.contains('drawer-open') ? 
                    '<span class="folder-icon">✖</span> CLOSE MENU' : 
                    '<span class="folder-icon">📂</span> BROWSE ARCHIVES';
            };
        }

        folderTree.addEventListener('click', (e) => {
            const item = e.target.closest('.tree-item');
            if (!item) return;

            // Close drawer on mobile after selection
            if (window.innerWidth <= 900) {
                directoryPane.classList.remove('drawer-open');
                mobileNavToggle.innerHTML = '<span class="folder-icon">📂</span> BROWSE ARCHIVES';
            }

            document.querySelectorAll('.tree-item').forEach(i => {
                i.classList.remove('active');
                const icon = i.querySelector('.folder-icon');
                if(icon && !i.getAttribute('data-view')) icon.innerText = '📁';
            });
            item.classList.add('active');
            const activeIcon = item.querySelector('.folder-icon');
            if(activeIcon && !item.getAttribute('data-view')) activeIcon.innerText = '📂';
            const folderData = item.getAttribute('data-folder');
            const view = item.getAttribute('data-view');
            if (folderData === 'all') {
                currentFolderType = 'all';
                currentFolderValue = 'all';
                currentFolderNameEl.innerText = 'All Fragments';
            } else if (folderData.includes('-')) {
                const parts = folderData.split('-');
                currentFolderType = parts[0];
                currentFolderValue = parts.slice(1).join('-');
                currentFolderNameEl.innerText = item.innerText.replace(/[📂📁🗺️📊]/g, '').trim();
            }
            switchView(view || 'grid');
        });

        gridContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-receipt-btn');
            if (btn) {
                const card = btn.closest('.fragment-card');
                showThermalReceipt({
                    title: card.querySelector('h2').innerText,
                    author: card.querySelector('h3').innerText,
                    store: card.getAttribute('data-store') || 'Unknown Source',
                    price: card.getAttribute('data-price'),
                    date: card.getAttribute('data-date')
                });
            }
        });

        if (closeReceiptBtn) closeReceiptBtn.onclick = () => receiptModal.style.display = 'none';
        if (closeOverlay) closeOverlay.onclick = () => cityOverlay.classList.remove('active');

        window.onclick = (e) => {
            if (e.target === receiptModal) receiptModal.style.display = 'none';
            if (e.target === cityOverlay) cityOverlay.classList.remove('active');
            
            // Close mobile drawer when clicking outside
            if (window.innerWidth <= 900 && 
                !directoryPane.contains(e.target) && 
                e.target !== mobileNavToggle && 
                directoryPane.classList.contains('drawer-open')) {
                directoryPane.classList.remove('drawer-open');
                mobileNavToggle.innerHTML = '<span class="folder-icon">📂</span> BROWSE ARCHIVES';
            }
        };

        mapSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (!query) return;
            const found = markers.find(m => m.name.toLowerCase().includes(query) || m.key.includes(query));
            if (found) { map.flyTo(found.marker.getLatLng(), 10); showCityDetail(found.key); }
        });

        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            if (currentSearch !== '' && currentFolderType !== 'all') {
                const allFolder = document.querySelector('[data-folder="all"]');
                if (allFolder) allFolder.click();
                searchInput.value = currentSearch;
            } else { renderView(); }
        });

        document.querySelectorAll('.tree-section.collapsible').forEach(section => {
            section.addEventListener('click', () => {
                const targetGroup = document.getElementById(section.getAttribute('data-target'));
                targetGroup.classList.toggle('collapsed');
                section.querySelector('.collapse-icon').innerText = targetGroup.classList.contains('collapsed') ? '+' : '−';
            });
        });
    }

    setupListeners();
    renderView();
});