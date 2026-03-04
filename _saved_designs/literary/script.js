document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const bookEntries = document.querySelectorAll('.book-entry');

    let currentFilter = 'all';
    let currentSearch = '';

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        applyFilters();
    });

    // Sidebar Filter buttons functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state on buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Set filter state and apply
            currentFilter = e.target.getAttribute('data-filter');
            applyFilters();
        });
    });

    function applyFilters() {
        bookEntries.forEach(entry => {
            // Get data from the article tags
            const title = entry.getAttribute('data-title') || '';
            const author = entry.getAttribute('data-author') || '';
            const store = entry.getAttribute('data-store') || '';
            const location = entry.getAttribute('data-location') || '';
            const isRead = entry.getAttribute('data-read') === 'true';

            // 1. Check Search Match
            const matchesSearch = currentSearch === '' || 
                                  title.includes(currentSearch) || 
                                  author.includes(currentSearch) || 
                                  store.includes(currentSearch) || 
                                  location.includes(currentSearch);

            // 2. Check Read/Unread Filter Match
            let matchesFilter = true;
            if (currentFilter === 'read' && !isRead) {
                matchesFilter = false;
            } else if (currentFilter === 'unread' && isRead) {
                matchesFilter = false;
            }

            // Apply visibility
            if (matchesSearch && matchesFilter) {
                entry.style.display = 'flex'; // Restore the flex layout
            } else {
                entry.style.display = 'none';
            }
        });
    }
});