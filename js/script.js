// DOM Elements
const todoForm = document.getElementById('todoForm');
const todoText = document.getElementById('todoText');
const todoDue = document.getElementById('todoDue');
const todoTime = document.getElementById('todoTime');
const todoList = document.getElementById('todoList');
const emptyMessage = document.getElementById('emptyMessage');
const filterStatus = document.getElementById('filterStatus');
const sortBy = document.getElementById('sortBy');
const clearAllBtn = document.getElementById('clearAllBtn');
const totalCount = document.getElementById('totalCount');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');
const textError = document.getElementById('textError');
const dateError = document.getElementById('dateError');
const timeError = document.getElementById('timeError');

// State
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let currentSort = 'date-asc';

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
todoDue.setAttribute('min', today);

// Set default time to current time
const now = new Date();
const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
todoTime.value = currentTime;

// Initialize
init();

function init() {
    renderTodos();
    updateStats();
    addEventListeners();
}

// Event Listeners
function addEventListeners() {
    todoForm.addEventListener('submit', handleAddTodo);
    filterStatus.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTodos();
    });
    sortBy.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTodos();
    });
    clearAllBtn.addEventListener('click', handleClearCompleted);
    
    // Real-time validation
    todoText.addEventListener('blur', validateText);
    todoDue.addEventListener('blur', validateDate);
    todoTime.addEventListener('blur', validateTime);
}

// Validation Functions
function validateText() {
    const value = todoText.value.trim();
    if (value === '') {
        todoText.classList.add('error');
        textError.textContent = 'Task description is required';
        return false;
    } else if (value.length > 100) {
        todoText.classList.add('error');
        textError.textContent = 'Task must be 100 characters or less';
        return false;
    } else {
        todoText.classList.remove('error');
        textError.textContent = '';
        return true;
    }
}

function validateDate() {
    const value = todoDue.value;
    if (value === '') {
        todoDue.classList.add('error');
        dateError.textContent = 'Due date is required';
        return false;
    } else {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            todoDue.classList.add('error');
            dateError.textContent = 'Due date cannot be in the past';
            return false;
        } else {
            todoDue.classList.remove('error');
            dateError.textContent = '';
            return true;
        }
    }
}

function validateTime() {
    const value = todoTime.value;
    if (value === '') {
        todoTime.classList.add('error');
        timeError.textContent = 'Time is required';
        return false;
    } else {
        todoTime.classList.remove('error');
        timeError.textContent = '';
        return true;
    }
}

function validateForm() {
    const isTextValid = validateText();
    const isDateValid = validateDate();
    const isTimeValid = validateTime();
    return isTextValid && isDateValid && isTimeValid;
}

// Add Todo
function handleAddTodo(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const todo = {
        id: Date.now(),
        text: todoText.value.trim(),
        dueDate: todoDue.value,
        dueTime: todoTime.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(todo);
    saveTodos();
    renderTodos();
    updateStats();
    
    // Reset form
    todoForm.reset();
    todoText.classList.remove('error');
    todoDue.classList.remove('error');
    todoTime.classList.remove('error');
    textError.textContent = '';
    dateError.textContent = '';
    timeError.textContent = '';
    const now = new Date();
    const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    todoTime.value = currentTime;
    todoText.focus();
}

// Toggle Todo Completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Delete Todo
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Clear Completed
function handleClearCompleted() {
    const completedTodos = todos.filter(t => t.completed);
    
    if (completedTodos.length === 0) {
        alert('No completed tasks to clear');
        return;
    }

    if (confirm(`Delete ${completedTodos.length} completed task(s)?`)) {
        todos = todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
        updateStats();
    }
}

// Filter & Sort
function getFilteredAndSortedTodos() {
    let filtered = todos;

    // Filter by status
    if (currentFilter === 'pending') {
        filtered = filtered.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(t => t.completed);
    }

    // Sort
    const sorted = [...filtered];
    switch (currentSort) {
        case 'date-asc':
            sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            break;
        case 'date-desc':
            sorted.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
            break;
        case 'name-asc':
            sorted.sort((a, b) => a.text.localeCompare(b.text));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.text.localeCompare(a.text));
            break;
    }

    return sorted;
}

// Render Todos
function renderTodos() {
    const filteredTodos = getFilteredAndSortedTodos();
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        todoList.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }

    todoList.style.display = 'block';
    emptyMessage.style.display = 'none';

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const content = document.createElement('div');
        content.className = 'todo-content';

        const text = document.createElement('div');
        text.className = 'todo-text';
        text.textContent = todo.text;

        const date = document.createElement('div');
        date.className = 'todo-date';
        date.innerHTML = `📅 ${formatDate(todo.dueDate)} · 🕐 ${formatTime(todo.dueTime)}`;

        const status = document.createElement('span');
        status.className = 'todo-status';
        status.textContent = todo.completed ? '✓ Done' : '⏳ Pending';

        content.appendChild(text);
        content.appendChild(date);
        content.appendChild(status);

        const actions = document.createElement('div');
        actions.className = 'todo-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        actions.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(content);
        li.appendChild(actions);
        todoList.appendChild(li);
    });
}

// Update Stats
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;

    totalCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format Time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
}

// Save to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}
