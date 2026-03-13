let calendar;
    let selectedDate = new Date().toISOString().split('T')[0];
    let selectedCategory = "";
    let todoData = {}; // { "날짜": { categories: [], tasks: { "카테고리": [] } } }
    let openCategories = new Set();

    const pokemons = [
        { name: "피카츄", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" },
        { name: "이브이", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png" },
        { name: "파이리", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png" },
        { name: "꼬부기", img: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png" }
    ];

    document.addEventListener('DOMContentLoaded', () => {
        initCalendar();
        updateUI();
    });

    function initCalendar() {
        calendar = new FullCalendar.Calendar(document.getElementById('mini-calendar'), {
            initialView: 'dayGridMonth',
            headerToolbar: { left: 'prev', center: 'title', right: 'next' },
            height: 'auto',
            dateClick: (info) => {
                document.querySelectorAll('.selected-day').forEach(el => el.classList.remove('selected-day'));
                info.dayEl.classList.add('selected-day');
                selectedDate = info.dateStr;
                selectedCategory = ""; // 날짜 이동 시 선택 카테고리 초기화
                updateUI();
            },
            eventContent: (arg) => {
                const props = arg.event.extendedProps;
                let container = document.createElement('div');
                container.className = 'cat-event-wrap';
                let bar = document.createElement('div');
                bar.className = 'cat-bar-mini';
                bar.style.backgroundColor = props.color;
                container.appendChild(bar);
                if (props.statusText) {
                    let status = document.createElement('span');
                    status.className = 'mini-status-text';
                    status.innerText = props.statusText;
                    container.appendChild(status);
                }
                return { domNodes: [container] };
            }
        });
        calendar.render();
    }

    function getRandomColor() {
        return `hsl(${Math.random() * 360}, 70%, 70%)`;
    }

    function addCategory() {
        const input = document.getElementById('new-cat-name');
        if (!input.value) return;
        
        if (!todoData[selectedDate]) todoData[selectedDate] = { categories: [], tasks: {} };
        const cats = todoData[selectedDate].categories;

        if (cats.some(c => c.name === input.value)) return alert("이미 있는 카테고리입니다.");

        const newCat = { name: input.value, color: getRandomColor() };
        cats.push(newCat);
        todoData[selectedDate].tasks[newCat.name] = [];
        selectedCategory = newCat.name;
        openCategories.add(newCat.name);
        
        input.value = '';
        updateUI();
    }

    function deleteCategory(e, catName) {
        e.stopPropagation();
        if (!confirm(`'${catName}' 카테고리와 할 일을 모두 삭제할까요?`)) return;
        
        todoData[selectedDate].categories = todoData[selectedDate].categories.filter(c => c.name !== catName);
        delete todoData[selectedDate].tasks[catName];
        
        if (selectedCategory === catName) selectedCategory = "";
        updateUI();
        refreshCalendar();
    }

    function renderCategoryChips() {
        const selector = document.getElementById('cat-selector');
        const dayData = todoData[selectedDate];

        if (!dayData || dayData.categories.length === 0) {
            selector.innerHTML = '<span style="color:#ccc; font-size:0.75rem;">상단에서 카테고리를 추가하세요!</span>';
            return;
        }

        selector.innerHTML = dayData.categories.map(cat => `
            <div class="cat-chip ${cat.name === selectedCategory ? 'selected' : ''}" 
                 onclick="selectedCategory='${cat.name}'; renderCategoryChips(); updateUI();">
                ${cat.name} <span class="delete-cat" onclick="deleteCategory(event, '${cat.name}')">×</span>
            </div>
        `).join('');
    }

    function toggleCategory(catName) {
        if (openCategories.has(catName)) openCategories.delete(catName);
        else openCategories.add(catName);
        updateUI();
    }

    function updateUI() {
        document.getElementById('view-date').innerText = selectedDate;
        const container = document.getElementById('category-container');
        container.innerHTML = '';
        
        const dayData = todoData[selectedDate] || { categories: [], tasks: {} };

        dayData.categories.forEach(cat => {
            const tasks = dayData.tasks[cat.name] || [];
            const isOpen = openCategories.has(cat.name) ? 'open' : '';
            const group = document.createElement('div');
            group.className = 'category-group';
            group.innerHTML = `
                <button class="category-btn" style="background:${cat.color};" onclick="toggleCategory('${cat.name}')">
                    ${cat.name} <span>${tasks.length}</span>
                </button>
                <div class="todo-list-container ${isOpen}" id="list-${cat.name}">
                    ${tasks.map((t, i) => `
                        <div class="todo-item">
                            <div class="check-circle" 
                                 style="border-color:${t.done ? cat.color : '#ddd'}; background:${t.done ? cat.color : 'transparent'};"
                                 onclick="completeTask('${cat.name}', ${i})">
                                 ${t.done ? '<span style="color:white; font-size:10px;">✓</span>' : ''}
                            </div>
                            <span class="todo-text ${t.done ? 'done' : ''}">${t.text}</span>
                        </div>
                    `).join('')}
                    ${tasks.length === 0 ? '<p style="color:#eee; font-size:0.8rem; padding:10px;">할 일을 추가해보세요!</p>' : ''}
                </div>
            `;
            container.appendChild(group);
        });

        if (dayData.categories.length === 0) {
            container.innerHTML = '<div style="text-align:center; margin-top:50px; color:#ccc;"><p>이 날은 카테고리가 없습니다.</p></div>';
        }
        renderCategoryChips();
    }

    function addTodo() {
        const input = document.getElementById('todo-input');
        if (!input.value || !selectedCategory) return alert("카테고리를 먼저 선택해주세요!");

        todoData[selectedDate].tasks[selectedCategory].push({ text: input.value, done: false });
        input.value = '';
        updateUI();
        refreshCalendar();
    }

    function completeTask(catName, index) {
        const task = todoData[selectedDate].tasks[catName][index];
        if (task.done) return;
        task.done = true;

        const random = pokemons[Math.floor(Math.random() * pokemons.length)];
        document.getElementById('poke-img').src = random.img;
        document.getElementById('poke-name').innerText = `${random.name} 발견!`;
        document.getElementById('battle-overlay').style.display = 'flex';

        updateUI();
        refreshCalendar();
    }

    function refreshCalendar() {
        calendar.getEvents().forEach(e => e.remove());
        const todayStr = new Date().toISOString().split('T')[0];

        for (const date in todoData) {
            todoData[date].categories.forEach(cat => {
                const tasks = todoData[date].tasks[cat.name] || [];
                if (tasks.length > 0) {
                    const isAllDone = tasks.every(t => t.done);
                    const isPast = date < todayStr;
                    let statusChar = isAllDone ? '✅' : (isPast ? '❌' : '');

                    calendar.addEvent({
                        start: date,
                        allDay: true,
                        extendedProps: { color: cat.color, statusText: statusChar }
                    });
                }
            });
        }
    }

function goToday() {
    const todayStr = new Date().toISOString().split('T')[0];
    
    selectedDate = todayStr;
    selectedCategory = ""; 

    // 달력 포커스 및 선택 클래스 수동 이동
    calendar.gotoDate(todayStr); 
    
    // 달력 DOM에서 오늘 날짜를 찾아 선택 표시(selected-day)를 강제로 입힘
    setTimeout(() => {
        document.querySelectorAll('.selected-day').forEach(el => el.classList.remove('selected-day'));
        const todayEl = document.querySelector(`[data-date="${todayStr}"]`);
        if (todayEl) todayEl.classList.add('selected-day');
    }, 10);

    updateUI();
}