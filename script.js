document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const folderTree = document.getElementById('folderTree');
    const languageFoldersContainer = document.getElementById('languageFolders');
    const authorFoldersContainer = document.getElementById('authorFolders');
    const storeFoldersContainer = document.getElementById('storeFolders');
    const cards = Array.from(document.querySelectorAll('.fragment-card'));
    const currentFolderNameEl = document.getElementById('currentFolderName');
    const folderStatsEl = document.getElementById('folderStats');
    
    let currentFolderType = 'all'; // 'all', 'status', 'language', 'author', 'store'
    let currentFolderValue = 'all';
    let currentSearch = '';

    // --- Randomize the Initial Order of Cards ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Shuffle the array of DOM elements
    shuffleArray(cards);
    
    // Actually reorder them in the DOM so tab-indexing and flex-grid flows correctly
    const gridContainer = document.getElementById('gridContainer');
    cards.forEach(card => gridContainer.appendChild(card));

    // --- Floating Writer Caricatures (Real Photos) ---
    const writers = [
        {
            name: "Fernando Pessoa",
            img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Pessoa_chapeu.jpg/500px-Pessoa_chapeu.jpg"
        },
        {
            name: "Clarice Lispector",
            img: "https://upload.wikimedia.org/wikipedia/commons/7/75/Clarice_Lispector_%28cropped%29.jpg"
        },
        {
            name: "Fyodor Dostoevsky",
            img: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg/500px-Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg"
        },
        {
            name: "Sylvia Plath",
            img: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Sylvia_Plath.jpg"
        },
        {
            name: "Karl Ove Knausgaard",
            img: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Karl_Ove_Knausg%C3%A5rd_2024_in_M%C3%BCnchen_02.jpg/500px-Karl_Ove_Knausg%C3%A5rd_2024_in_M%C3%BCnchen_02.jpg"
        },
        {
            name: "Javier Marías",
            img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Javier_Mar%C3%ADas_%28Feria_del_Libro_de_Madrid%2C_31_de_mayo_de_2008%29.jpg/500px-Javier_Mar%C3%ADas_%28Feria_del_Libro_de_Madrid%2C_31_de_mayo_de_2008%29.jpg"
        }
    ];

    // Pick 2 random writers
    shuffleArray(writers);
    const selectedWriters = writers.slice(0, 2);
    // Append to body instead of header so they can use the full width of the screen
    const bodyEl = document.querySelector('body');

    selectedWriters.forEach((writer, index) => {
        const img = document.createElement('img');
        img.className = 'floating-writer';
        img.src = writer.img;
        img.alt = writer.name;
        img.title = writer.name; // Hover tooltip
        
        // Randomly tilt them
        const rot = (Math.random() * 20) - 10;
        img.style.transform = `rotate(${rot}deg)`;
        
        // Place them far out in the margins (between 2% and 15% from the edges of the screen)
        // Set their vertical position to be somewhere in the top 300px
        const randomTop = Math.floor(Math.random() * 200) + 20; 
        
        if (index === 0) {
            // Left side margin
            img.style.left = Math.floor(Math.random() * 10) + 2 + '%';
            img.style.top = randomTop + 'px';
        } else {
            // Right side margin
            img.style.right = Math.floor(Math.random() * 10) + 2 + '%';
            img.style.top = randomTop + 'px';
        }
        
        bodyEl.appendChild(img);
    });


    // 1. Automatically generate folders based on actual data
    const languages = new Set();
    const authors = new Set();
    const stores = new Set();

    cards.forEach(card => {
        const lang = card.getAttribute('data-language');
        if (lang) languages.add(lang.charAt(0).toUpperCase() + lang.slice(1));
        
        // Use the raw exact value (except lowercased for data-attribute) for authors and stores
        const author = card.getAttribute('data-author');
        if (author && author !== 'unknown' && author.trim() !== '') {
            authors.add(author.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        }

        const store = card.getAttribute('data-store');
        if (store && store !== 'unknown' && store.trim() !== '') {
            stores.add(store.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
        }
    });

    function createFolderItems(set, container, prefix) {
        Array.from(set).sort().forEach(item => {
            const li = document.createElement('div');
            li.className = 'tree-item';
            li.setAttribute('data-folder', `${prefix}-${item.toLowerCase()}`);
            li.innerHTML = `<span class="folder-icon">📁</span> ${item}`;
            container.appendChild(li);
        });
    }

    createFolderItems(languages, languageFoldersContainer, 'language');
    createFolderItems(authors, authorFoldersContainer, 'author');
    createFolderItems(stores, storeFoldersContainer, 'store');

    // Setup Collapsible Sections
    const collapsibleSections = document.querySelectorAll('.tree-section.collapsible');
    collapsibleSections.forEach(section => {
        section.addEventListener('click', () => {
            const targetId = section.getAttribute('data-target');
            const targetGroup = document.getElementById(targetId);
            const icon = section.querySelector('.collapse-icon');
            
            if (targetGroup.classList.contains('collapsed')) {
                targetGroup.classList.remove('collapsed');
                icon.innerText = '−';
            } else {
                targetGroup.classList.add('collapsed');
                icon.innerText = '+';
            }
        });
    });

    // Re-select all tree items now that dynamic ones are added
    const treeItems = document.querySelectorAll('.tree-item');

    // 2. Main Rendering Function
    function renderView() {
        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.getAttribute('data-title') || '';
            const author = card.getAttribute('data-author') || '';
            const store = card.getAttribute('data-store') || '';
            const isRead = card.getAttribute('data-read') === 'true';
            const language = card.getAttribute('data-language') || '';

            // Search Filter
            const matchesSearch = currentSearch === '' || 
                                  title.includes(currentSearch) || 
                                  author.includes(currentSearch) || 
                                  store.includes(currentSearch);

            // Folder Filter
            let matchesFolder = true;
            
            if (currentFolderType === 'status') {
                if (currentFolderValue === 'read' && !isRead) matchesFolder = false;
                if (currentFolderValue === 'unread' && isRead) matchesFolder = false;
            } else if (currentFolderType === 'language') {
                if (language !== currentFolderValue) matchesFolder = false;
            } else if (currentFolderType === 'author') {
                if (author !== currentFolderValue) matchesFolder = false;
            } else if (currentFolderType === 'store') {
                if (store !== currentFolderValue) matchesFolder = false;
            }

            // Apply Display
            if (matchesSearch && matchesFolder) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update Stats UI
        folderStatsEl.innerText = `${visibleCount} item${visibleCount !== 1 ? 's' : ''}`;
    }

    // 3. Event Listeners for Folders
    treeItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Update active state in UI
            treeItems.forEach(i => {
                i.classList.remove('active');
                const icon = i.querySelector('.folder-icon');
                if(icon) icon.innerText = '📁';
            });
            
            const target = e.currentTarget;
            target.classList.add('active');
            
            const activeIcon = target.querySelector('.folder-icon');
            if(activeIcon) activeIcon.innerText = '📂';

            const folderData = target.getAttribute('data-folder'); 
            
            if (folderData === 'all') {
                currentFolderType = 'all';
                currentFolderValue = 'all';
                currentFolderNameEl.innerText = 'All Fragments';
            } else {
                // Because names can have hyphens, we only want to split off the prefix
                const hyphenIndex = folderData.indexOf('-');
                currentFolderType = folderData.substring(0, hyphenIndex);
                currentFolderValue = folderData.substring(hyphenIndex + 1);
                
                let displayName = target.innerText.replace('📂', '').replace('📁', '').trim();
                if (currentFolderType === 'language') displayName += ' Fragments';
                else if (currentFolderType === 'author') displayName = 'Writer: ' + displayName;
                else if (currentFolderType === 'store') displayName = 'Store: ' + displayName;
                
                currentFolderNameEl.innerText = displayName;
            }

            searchInput.value = '';
            currentSearch = '';
            
            document.getElementById('gridContainer').scrollTop = 0;

            renderView();
        });
    });

    // 4. Event Listener for Search
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        
        if (currentSearch !== '' && currentFolderType !== 'all') {
            const allFolder = document.querySelector('[data-folder="all"]');
            allFolder.click(); 
            searchInput.value = currentSearch; 
        } else {
            renderView();
        }
    });

    // Initialize
    renderView();
});