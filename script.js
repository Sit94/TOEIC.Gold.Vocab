let vocabData = [];
let currentPage = 1;
const itemsPerPage = 20;
let showOnlyStarred = false; // Star ပြသမလား စစ်ဖို့

// JSONファイルのリスト
const jsonFiles = [
    'data/vocab-001-050.json',
    'data/vocab-051-100.json',
    'data/vocab-101-150.json',
    'data/vocab-151-200.json',
    'data/vocab-201-250.json',
    'data/vocab-251-300.json',
    'data/vocab-301-350.json',
    'data/vocab-351-400.json',
    'data/vocab-401-450.json',
    'data/vocab-451-500.json',
    'data/vocab-501-550.json',
    'data/vocab-551-600.json',
    'data/vocab-601-650.json',
    'data/vocab-651-700.json',
    'data/vocab-701-750.json',
    'data/vocab-751-800.json',
    'data/vocab-801-850.json',
    'data/vocab-851-900.json',
    'data/vocab-901-950.json',
    'data/vocab-951-1000.json',
    'data/vocab-part1-1001-1100.json',
    'data/vocab-part1-1101-1188.json',
];

// 全ファイルを読み込んで結合
Promise.all(
    jsonFiles.map(file => 
        fetch(file)
            .then(res => res.ok ? res.json() : [])
            .catch(() => [])
    )
)
.then(results => {
    vocabData = results.flat();
    displayVocab(vocabData, currentPage);
    displayPagination(vocabData.length);
})
.catch(err => console.error('Error:', err));

// localStorageからStarを取得
function getStarredWords() {
    return JSON.parse(localStorage.getItem('starredWords')) || [];
}

// Starを保存
function saveStarredWords(starred) {
    localStorage.setItem('starredWords', JSON.stringify(starred));
}

// 単語を表示
function displayVocab(data, page) {
    const list = document.getElementById('vocabList');
    list.innerHTML = '';

    let filtered = data;

    // Starフィルター
    if (showOnlyStarred) {
        const starred = getStarredWords();
        filtered = data.filter(item => starred.includes(item.number));
    }

    if (filtered.length === 0) {
        list.innerHTML = '<p style="color:white;text-align:center;">該当する単語がありません。</p>';
        return;
    }

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filtered.slice(start, end);
    const starredWords = getStarredWords();

    pageItems.forEach(item => {
        const isStarred = starredWords.includes(item.number);
        const card = document.createElement('div');
        card.className = 'vocab-card';
        card.innerHTML = `
            <div class="vocab-header">
                <div class="vocab-number">No.${item.number}</div>
                <button class="star-btn ${isStarred ? 'starred' : ''}" data-number="${item.number}">
                    ${isStarred ? '⭐' : '☆'}
                </button>
            </div>
            <div class="vocab-word">${item.word}</div>
            <div class="vocab-meaning">
                <span class="meaning-jp"> ${item.meaning_jp}</span>
                <span class="meaning-mm"> ${item.meaning_mm}</span>
            </div>
            <div class="vocab-example">
                <div class="example-en">📝 ${item.example}</div>
                <div class="example-jp"> ${item.example_jp}</div>
                <div class="example-mm"> ${item.example_mm}</div>
            </div>
        `;
        list.appendChild(card);
    });

    // Star Button Event
    document.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const num = e.target.dataset.number;
            let starred = getStarredWords();
            if (starred.includes(num)) {
                starred = starred.filter(n => n !== num);
            } else {
                starred.push(num);
            }
            saveStarredWords(starred);
            
            // UI Update
            const isNowStarred = starred.includes(num);
            e.target.textContent = isNowStarred ? '⭐' : '☆';
            e.target.classList.toggle('starred', isNowStarred);
        });
    });
}

// ページネーション
function displayPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    let filtered = vocabData;
    if (showOnlyStarred) {
        const starred = getStarredWords();
        filtered = vocabData.filter(item => starred.includes(item.number));
    }

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (totalPages <= 1) return;

    const backBtn = document.createElement('button');
    backBtn.textContent = '« Back';
    backBtn.className = 'page-btn nav-btn';
    backBtn.disabled = currentPage === 1;
    backBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateDisplay();
        }
    });
    pagination.appendChild(backBtn);

    for (let i = 1; i <= totalPages; i++) {
        if (totalPages > 10) {
            if (i !== 1 && i !== totalPages && Math.abs(i - currentPage) > 2) {
                if (i === 2 || i === totalPages - 1) {
                    const dots = document.createElement('span');
                    dots.textContent = '...';
                    dots.className = 'page-dots';
                    pagination.appendChild(dots);
                }
                continue;
            }
        }
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'page-btn';
        if (i === currentPage) btn.classList.add('active');
        btn.addEventListener('click', () => {
            currentPage = i;
            updateDisplay();
        });
        pagination.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next »';
    nextBtn.className = 'page-btn nav-btn';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateDisplay();
        }
    });
    pagination.appendChild(nextBtn);
}

// Display Update
function updateDisplay() {
    displayVocab(vocabData, currentPage);
    displayPagination(vocabData.length);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 検索
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = vocabData.filter(item => 
        item.word.toLowerCase().includes(query) ||
        item.meaning_jp.includes(query) ||
        item.meaning_mm.includes(query)
    );
    currentPage = 1;
    displayVocab(filtered, currentPage);
    displayPagination(filtered.length);
});

// Star Filter Buttons
document.getElementById('showAllBtn').addEventListener('click', () => {
    showOnlyStarred = false;
    currentPage = 1;
    document.getElementById('showAllBtn').classList.add('active');
    document.getElementById('showStarredBtn').classList.remove('active');
    updateDisplay();
});

document.getElementById('showStarredBtn').addEventListener('click', () => {
    showOnlyStarred = true;
    currentPage = 1;
    document.getElementById('showStarredBtn').classList.add('active');
    document.getElementById('showAllBtn').classList.remove('active');
    updateDisplay();
});
