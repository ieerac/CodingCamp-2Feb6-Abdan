// ============================================
// TO-DO LIST APPLICATION
// ============================================

// Data storage (menggunakan localStorage untuk persist data)
let todos = [];

// DOM Elements
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoDate = document.getElementById('todoDate');
const todoTime = document.getElementById('todoTime');
const todoList = document.getElementById('todoList');
const taskCount = document.getElementById('taskCount');
const filterButtons = document.querySelectorAll('.filter-btn');
const filterDateInput = document.getElementById('filterDate');
const currentTimeDisplay = document.getElementById('currentTime');

// Filter state
let currentFilter = 'all';
let currentDateFilter = '';

// ============================================
// INITIALIZATION
// ============================================

// Load data dari localStorage saat page load
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
    renderTodos();
}

// Save todos ke localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// ============================================
// FORM VALIDATION & SUBMISSION
// ============================================

todoForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Validasi input
    if (!todoInput.value.trim()) {
        alert('❌ Task tidak boleh kosong!');
        return;
    }

    if (!todoDate.value) {
        alert('❌ Tanggal harus dipilih!');
        return;
    }

    if (!todoTime.value) {
        alert('❌ Jam harus dipilih!');
        return;
    }

    // Validasi tanggal (tidak boleh tanggal kemarin)
    const selectedDate = new Date(todoDate.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        alert('❌ Tanggal tidak boleh lebih awal dari hari ini!');
        return;
    }

    // Tambah todo baru
    addTodo();
});

// ============================================
// ADD TODO
// ============================================

function addTodo() {
    const newTodo = {
        id: Date.now(),
        text: todoInput.value.trim(),
        date: todoDate.value,
        time: todoTime.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.unshift(newTodo);
    saveTodos();
    renderTodos();

    // Reset form
    todoForm.reset();
    setTodayDate();
    setCurrentTime();

    // Show success message
    showNotification('✅ Task berhasil ditambahkan!');
}

// ============================================
// DELETE TODO
// ============================================

function deleteTodo(id) {
    if (confirm('Apakah kamu yakin ingin menghapus task ini?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        showNotification('🗑️ Task berhasil dihapus!');
    }
}

// ============================================
// TOGGLE COMPLETED STATUS
// ============================================

function toggleTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// ============================================
// FILTER & DISPLAY
// ============================================

function getFilteredTodos() {
    let filtered = todos;

    // Filter berdasarkan status
    if (currentFilter === 'completed') {
        filtered = filtered.filter(todo => todo.completed);
    } else if (currentFilter === 'pending') {
        filtered = filtered.filter(todo => !todo.completed);
    }

    // Filter berdasarkan tanggal
    if (currentDateFilter) {
        filtered = filtered.filter(todo => todo.date === currentDateFilter);
    }

    return filtered;
}

function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    // Update task count
    taskCount.textContent = todos.length;

    // Clear list
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        todoList.innerHTML = '<p class="empty-message">Tidak ada task sesuai filter. 🎯</p>';
        return;
    }

    // Render each todo
    filteredTodos.forEach(todo => {
        const todoItem = createTodoElement(todo);
        todoList.appendChild(todoItem);
    });
}

// ============================================
// CREATE TODO ELEMENT
// ============================================

function createTodoElement(todo) {
    const todoItem = document.createElement('div');
    todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    // Format date
    const dateObj = new Date(todo.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('id-ID', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Format time
    const timeParts = todo.time.split(':');
    const formattedTime = `${timeParts[0]}:${timeParts[1]}`;

    // Status text
    const statusText = todo.completed ? 'Selesai' : 'Belum Selesai';
    const statusClass = todo.completed ? 'completed' : 'pending';

    todoItem.innerHTML = `
        <input 
            type="checkbox" 
            class="todo-checkbox" 
            ${todo.completed ? 'checked' : ''}
            onchange="toggleTodo(${todo.id})"
        >
        <div class="todo-content">
            <div class="todo-text">${escapeHtml(todo.text)}</div>
            <div class="todo-date">📅 ${formattedDate} <span class="todo-time">🕐 ${formattedTime}</span></div>
        </div>
        <span class="todo-status ${statusClass}">${statusText}</span>
        <button class="btn-delete" onclick="deleteTodo(${todo.id})">🗑️ Hapus</button>
    `;

    return todoItem;
}

// ============================================
// FILTER BUTTONS
// ============================================

filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Update filter
        currentFilter = this.dataset.filter;
        
        // Re-render todos
        renderTodos();
    });
});

// ============================================
// FILTER BY DATE
// ============================================

filterDateInput.addEventListener('change', function() {
    currentDateFilter = this.value;
    renderTodos();
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Set today's date as default in input
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    todoDate.value = today;
}

// Set current time as default in input
function setCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    todoTime.value = `${hours}:${minutes}`;
}

// Update jam digital di header
function updateCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentTimeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        font-weight: 600;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// PAGE LOAD
// ============================================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTodayDate();
    setCurrentTime();
    loadTodos();
    
    // Update jam digital setiap detik
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
});
