document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const mapSearch = document.getElementById('mapSearch');
    const folderTree = document.getElementById('folderTree');
    const languageFoldersContainer = document.getElementById('languageFolders');
    const genreFoldersContainer = document.getElementById('genreFolders');
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
        { name: "Javier Marías", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Javier_Mar%C3%ADas_%28Feria_del_Libro_de_Madrid%2C_31_de_mayo_de_2008%29.jpg/500px-Javier_Mar%C3%ADas_%28Feria_del_Libro_de_Madrid%2C_31_de_mayo_de_2008%29.jpg" },
        { name: "Albert Camus", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Albert_Camus%2C_gagnant_de_prix_Nobel%2C_portrait_en_buste%2C_pos%C3%A9_au_bureau%2C_faisant_face_%C3%A0_gauche%2C_cigarette_de_tabagisme.jpg/500px-Albert_Camus%2C_gagnant_de_prix_Nobel%2C_portrait_en_buste%2C_pos%C3%A9_au_bureau%2C_faisant_face_%C3%A0_gauche%2C_cigarette_de_tabagisme.jpg" },
        { name: "Forough Farrokhzad", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Forough_Farrokhzad%2C_1960s.jpg/330px-Forough_Farrokhzad%2C_1960s.jpg" },
        { name: "Franz Kafka", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Franz_Kafka%2C_1923.jpg/500px-Franz_Kafka%2C_1923.jpg" },
        { name: "Natalia Ginzburg", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Natalia_Ginzburg_1956.jpg/500px-Natalia_Ginzburg_1956.jpg" },
        { name: "Hisham Matar", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Hisham_Matar%2C_author%2C_at_the_2024_National_Book_Awards_finalist_reading_2_%28cropped%29.jpg/500px-Hisham_Matar%2C_author%2C_at_the_2024_National_Book_Awards_finalist_reading_2_%28cropped%29.jpg" },
        { name: "Hermann Hesse", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Hermann_Hesse_2.jpg/500px-Hermann_Hesse_2.jpg" },
        { name: "Somerset Maugham", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Maugham_retouched.jpg/500px-Maugham_retouched.jpg" },
        { name: "Joan Didion", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Didion1970_%28cropped%29.jpg/500px-Didion1970_%28cropped%29.jpg" },
        { name: "James Baldwin", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/James_Baldwin_37_Allan_Warren_%28cropped%29.jpg/500px-James_Baldwin_37_Allan_Warren_%28cropped%29.jpg" },
        { name: "Marcel Proust", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Otto_Wegener_Proust_vers_1895_bis.jpg/500px-Otto_Wegener_Proust_vers_1895_bis.jpg" },
        { name: "Tezer Ozlu", img: "https://upload.wikimedia.org/wikipedia/tr/c/c7/TezerOzlu.jpg" },
        { name: "Sadegh Hedayat", img: "https://upload.wikimedia.org/wikipedia/commons/2/24/Sadegh_Hedayat.jpg" },
        { name: "Wislawa Szymborska", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Wis%C5%82awa_Szymborska_2009.10.23_%281%29.jpg/330px-Wis%C5%82awa_Szymborska_2009.10.23_%281%29.jpg" },
        { name: "Marina Tsvetaeva", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/%D0%9C%D0%B0%D1%80%D0%B8%D0%BD%D0%B0_%D0%A6%D0%B2%D0%B5%D1%82%D0%B0%D0%B5%D0%B2%D0%B0_%281925%29_%28cropped%29.jpg/500px-%D0%9C%D0%B0%D1%80%D0%B8%D0%BD%D0%B0_%D0%A6%D0%B2%D0%B5%D1%82%D0%B0%D0%B5%D0%B2%D0%B0_%281925%29_%28cropped%29.jpg" },
        { name: "Rainer Maria Rilke", img: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Rainer_Maria_Rilke_1900.jpg" },
        { name: "Toni Morrison", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Toni_Morrison.jpg/500px-Toni_Morrison.jpg" },
        { name: "Milan Kundera", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Milan_Kundera_redux.jpg/500px-Milan_Kundera_redux.jpg" }
    ];

    shuffleArray(writers);
    const titleContainerEl = document.querySelector('.title-container');

    writers.slice(0, 2).forEach((writer, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'floating-writer-wrapper';
        
        const img = document.createElement('img');
        img.className = 'floating-writer';
        img.src = writer.img;
        img.alt = writer.name;
        // Native title tooltip is removed so we can use our custom one

        const tooltip = document.createElement('div');
        tooltip.className = 'writer-name-tooltip';
        tooltip.innerText = writer.name;

        wrapper.appendChild(img);
        wrapper.appendChild(tooltip);

        wrapper.style.transform = `rotate(${(Math.random() * 20) - 10}deg)`;
        const randomTop = Math.floor(Math.random() * 80) - 20;
        const sideOffset = -150 - Math.floor(Math.random() * 60);
        
        if (index === 0) wrapper.style.left = sideOffset + 'px';
        else wrapper.style.right = sideOffset + 'px';
        wrapper.style.top = randomTop + 'px';
        
        titleContainerEl.appendChild(wrapper);
    });

    // 2. Dynamic Folder Generation
    const languages = new Set();
    const genres = new Set();
    const authors = new Set();
    const stores = new Set();

    cards.forEach(card => {
        const lang = card.getAttribute('data-language');
        if (lang) languages.add(lang.charAt(0).toUpperCase() + lang.slice(1));
        
        const genre = card.getAttribute('data-genre');
        if (genre && genre.trim() !== '') {
            genres.add(genre.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        }

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
    createFolderItems(genres, genreFoldersContainer, 'genre');
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
            const genre = card.getAttribute('data-genre') || '';

            const matchesSearch = currentSearch === '' || 
                                  title.includes(currentSearch) || 
                                  author.includes(currentSearch) || 
                                  store.includes(currentSearch);

            let matchesFolder = true;
            if (currentFolderType === 'status') {
                if (currentFolderValue === 'read' && !isRead) matchesFolder = false;
                if (currentFolderValue === 'unread' && isRead) matchesFolder = false;
            } else if (currentFolderType === 'language' && language !== currentFolderValue) matchesFolder = false;
            else if (currentFolderType === 'genre' && genre !== currentFolderValue) matchesFolder = false;
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
    function getReceiptExtras() {
        const quotes = [
            // Fyodor Dostoevsky
            { text: "What is hell? I maintain that it is the suffering of being unable to love.", author: "Fyodor Dostoevsky" },
            { text: "Pain and suffering are always inevitable for a large intelligence and a deep heart.", author: "Fyodor Dostoevsky" },
            // Karl Ove Knausgaard
            { text: "For an instant I thought of the days of my youth, and I breathed in the air, but I breathed in nothing but the wind.", author: "Karl Ove Knausgaard" },
            { text: "The only thing I have learned from life is that you have to endure it, never give up, and never let go.", author: "Karl Ove Knausgaard" },
            // Albert Camus
            { text: "In the depth of winter, I finally learned that within me there lay an invincible summer.", author: "Albert Camus" },
            { text: "There is only one really serious philosophical problem, and that is suicide.", author: "Albert Camus" },
            // W. Somerset Maugham
            { text: "It is an illusion that youth is happy, an illusion of those who have lost it.", author: "W. Somerset Maugham" },
            { text: "We are not the same persons this year as last; nor are those we love. It is a happy chance if we, changing, continue to love a changed person.", author: "W. Somerset Maugham" },
            // Marcel Proust
            { text: "The true paradises are the paradises that we have lost.", author: "Marcel Proust" },
            { text: "We do not receive wisdom, we must discover it for ourselves, after a journey through the wilderness which no one else can make for us.", author: "Marcel Proust" },
            // Sylvia Plath
            { text: "I took a deep breath and listened to the old brag of my heart: I am, I am, I am.", author: "Sylvia Plath" },
            { text: "Is there no way out of the mind?", author: "Sylvia Plath" },
            // Franz Kafka
            { text: "A book must be the axe for the frozen sea within us.", author: "Franz Kafka" },
            { text: "I have the true feeling of myself only when I am unbearably unhappy.", author: "Franz Kafka" },
            // Fernando Pessoa
            { text: "I am nothing. I'll never be anything. I couldn't want to be anything. Apart from that, I have in me all the dreams in the world.", author: "Fernando Pessoa" },
            { text: "To feel is to be distracted.", author: "Fernando Pessoa" },
            // Clarice Lispector
            { text: "I am so mysterious that I don't even understand myself.", author: "Clarice Lispector" },
            { text: "I write as if to save somebody's life. Probably my own.", author: "Clarice Lispector" },
            // Joan Didion
            { text: "We tell ourselves stories in order to live.", author: "Joan Didion" },
            { text: "I have already lost touch with a couple of people I used to be.", author: "Joan Didion" },
            // Hermann Hesse
            { text: "Art was a union of the father and mother worlds, of mind and blood.", author: "Hermann Hesse" },
            { text: "If you hate a person, you hate something in him that is part of yourself. What isn't part of ourselves doesn't disturb us.", author: "Hermann Hesse" },
            // James Baldwin
            { text: "Love takes off the masks that we fear we cannot live without and know we cannot live within.", author: "James Baldwin" },
            { text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.", author: "James Baldwin" },
            // Tezer Özlü
            { text: "Life is not something to be lived, but something to be endured.", author: "Tezer Özlü" },
            { text: "I have always been a stranger to myself and to the world.", author: "Tezer Özlü" },
            // Hisham Matar
            { text: "Exile is a kind of death. It is a separation from the self, a loss of the familiar, a displacement that can never be fully repaired.", author: "Hisham Matar" },
            { text: "Memory is a fickle thing. It can be a source of comfort, but it can also be a source of pain. It can be a way of holding on to the past, but it can also be a way of being trapped by it.", author: "Hisham Matar" },
            // Javier Marías
            { text: "Life is a very bad novelist. It is chaotic and ludicrous.", author: "Javier Marías" },
            { text: "Listening is the most dangerous thing of all, listening means knowing.", author: "Javier Marías" },
            // Marina Tsvetaeva
            { text: "This sickness is incurable and it is called soul.", author: "Marina Tsvetaeva" },
            { text: "Wings are freedom only when they are wide open in flight. On one's back they are a heavy weight.", author: "Marina Tsvetaeva" },
            // Rainer Maria Rilke
            { text: "Let everything happen to you: beauty and terror. Just keep going. No feeling is final.", author: "Rainer Maria Rilke" },
            { text: "Perhaps all the dragons in our lives are princesses who are only waiting to see us act, just once, with beauty and courage.", author: "Rainer Maria Rilke" },
            // Toni Morrison
            { text: "If you surrendered to the air, you could ride it.", author: "Toni Morrison" },
            { text: "Freeing yourself was one thing, claiming ownership of that freed self was another.", author: "Toni Morrison" },
            // Milan Kundera
            { text: "The struggle of man against power is the struggle of memory against forgetting.", author: "Milan Kundera" },
            { text: "Anyone whose goal is 'something higher' must expect someday to suffer vertigo.", author: "Milan Kundera" },
            // Natalia Ginzburg
            { text: "We must always try to be better than we are.", author: "Natalia Ginzburg" },
            { text: "A writer must be attentive and solitary, like a solitary spy.", author: "Natalia Ginzburg" },
            // Sadegh Hedayat
            { text: "In life there are wounds that, like a leprosy, silently eat away and consume the soul.", author: "Sadegh Hedayat" },
            { text: "I am like a man who has suddenly been thrown into deep water and who struggles to save himself.", author: "Sadegh Hedayat" },
            // Wisława Szymborska
            { text: "Listen, how your heart beats in me.", author: "Wisława Szymborska" },
            { text: "There is no life that couldn't be immortal if only for a moment.", author: "Wisława Szymborska" },
            // Forough Farrokhzad
            { text: "I am cold, and I know that from the illusions of the red poppies I will gather nothing but a handful of dried leaves.", author: "Forough Farrokhzad" },
            { text: "I speak out of the deep of night, out of the deep of darkness.", author: "Forough Farrokhzad" },
            // Emily Dickinson
            { text: "I'm Nobody! Who are you?<br>Are you – Nobody – too?", author: "Emily Dickinson" },
            { text: "Because I could not stop for Death –<br>He kindly stopped for me –", author: "Emily Dickinson" },
            { text: "Hope is the thing with feathers<br>That perches in the soul.", author: "Emily Dickinson" }
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        const pool = [
            // 1. ASCII Cat
            `<div class="receipt-ascii">
    /\\_/\\
    ( o.o )
    > ^ <</div>`,
            // 2. Void ID
            `<div class="receipt-void-id">VOID_ID: ${Math.random().toString(16).substring(2, 15).toUpperCase()}</div>`,
            // 3. Existential Quote
            `<div class="receipt-quote">
                "${randomQuote.text}"<br>
                <span class="receipt-quote-author">— ${randomQuote.author}</span>
            </div>`
        ];

        // Shuffle and pick 3-4 items
        const shuffled = pool.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.floor(Math.random() * 2) + 3).join('');
    }
    function showThermalReceipt(data) {
        thermalReceipt.innerHTML = `
            <div class="receipt-header">
                <h4>V:\\ARCHIVES</h4>
                <p>${data.store.toUpperCase()}</p>
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
                
                <div class="receipt-extras">
                    ${getReceiptExtras()}
                </div>

                <div class="receipt-footer">
                    <p>ALL SALES ARE AS FINAL AS DEATH.</p>
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
                const iconAlt = mobileNavToggle.querySelector('.nav-icon-alt');
                iconAlt.innerHTML = directoryPane.classList.contains('drawer-open') ? '✖' : '📖';
            };
        }

        folderTree.addEventListener('click', (e) => {
            const item = e.target.closest('.tree-item');
            if (!item) return;

            // Close drawer on mobile after selection
            if (window.innerWidth <= 900) {
                directoryPane.classList.remove('drawer-open');
                const iconAlt = mobileNavToggle.querySelector('.nav-icon-alt');
                if (iconAlt) iconAlt.innerHTML = '📖';
            }

            document.querySelectorAll('.tree-item').forEach(i => {
                i.classList.remove('active');
                const icon = i.querySelector('.folder-icon');
                if(icon && !i.getAttribute('data-view')) icon.innerText = '📁';
            });
            item.classList.add('active');
            const activeIcon = item.querySelector('.folder-icon');
            if(activeIcon && !item.getAttribute('data-view')) activeIcon.innerText = '📖';
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
                currentFolderNameEl.innerText = item.innerText.replace(/[📖📁🗺️📊]/g, '').trim();
            }
            switchView(view || 'grid');
        });

        // Thermal Receipt Listeners
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

        // Close modal when clicking the dark background overlay
        receiptModal.addEventListener('click', (e) => {
            if (e.target === receiptModal) {
                receiptModal.style.display = 'none';
            }
        });

        if (closeReceiptBtn) closeReceiptBtn.onclick = () => receiptModal.style.display = 'none';
        if (closeOverlay) closeOverlay.onclick = () => cityOverlay.classList.remove('active');

        window.onclick = (e) => {
            // Close city map overlay if clicking outside the detail box
            if (cityOverlay.classList.contains('active') && 
                !cityOverlay.contains(e.target) && 
                !e.target.closest('.city-doodle-marker')) {
                cityOverlay.classList.remove('active');
            }
            
            // Close mobile drawer when clicking outside
            if (window.innerWidth <= 900 && 
                !directoryPane.contains(e.target) && 
                e.target !== mobileNavToggle && 
                directoryPane.classList.contains('drawer-open')) {
                directoryPane.classList.remove('drawer-open');
                const iconAlt = mobileNavToggle.querySelector('.nav-icon-alt');
                if (iconAlt) iconAlt.innerHTML = '📖';
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