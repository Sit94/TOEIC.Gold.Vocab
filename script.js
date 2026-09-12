let vocabData = [];
let currentPage = 1;
const itemsPerPage = 20;

// 読み込むJSONファイルのリスト
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

// 全ファイルを読み込んで結合する
Promise.all(
    jsonFiles.map(file => 
        fetch(file)
            .then(response => {
                if (!response.ok) {
                    console.warn(`ファイルが見つかりません: ${file}`);
                    return [];
                }
                return response.json();
            })
            .catch(() => {
                console.warn(`読み込み失敗: ${file}`);
                return [];
            })
    )
)
.then(results => {
    vocabData = results.flat();
    console.log(`合計 ${vocabData.length} 単語を読み込みました`);
    
    displayVocab(vocabData, currentPage);
    displayPagination(vocabData.length);
})
.catch(error => {
    console.error('Error:', error);
    document.getElementById('vocabList').innerHTML = 
        '<p style="color:white;text-align:center;">データの読み込みに失敗しました。</p>';
});

// 単語を表示する
function displayVocab(data, page) {
    const list = document.getElementById('vocabList');
    list.innerHTML = '';

    if (data.length === 0) {
        list.innerHTML = '<p style="color:white;text-align:center;">該当する単語がありません。</p>';
        return;
    }

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = data.slice(start, end);

    pageItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'vocab-card';
        card.innerHTML = `
            <div class="vocab-number">No.${item.number}</div>
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
}

// ページネーションボタンを表示する
function displayPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return;

    // « Back ボタン
    const backBtn = document.createElement('button');
    backBtn.textContent = '« Back';
    backBtn.className = 'page-btn nav-btn';
    backBtn.disabled = currentPage === 1;
    backBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayVocab(vocabData, currentPage);
            displayPagination(vocabData.length);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    pagination.appendChild(backBtn);

    // ページ番号ボタン
    for (let i = 1; i <= totalPages; i++) {
        // ページが多すぎる場合は省略
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
            displayVocab(vocabData, currentPage);
            displayPagination(vocabData.length);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        pagination.appendChild(btn);
    }

    // Next » ボタン
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next »';
    nextBtn.className = 'page-btn nav-btn';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayVocab(vocabData, currentPage);
            displayPagination(vocabData.length);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    pagination.appendChild(nextBtn);
}

// 検索機能
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