const STORAGE_KEY = 'everyday-tasks-v1';
const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelEditButton = document.querySelector('#cancel-edit');
const formHint = document.querySelector('#form-hint');
const filterButtons = [...document.querySelectorAll('.filter-button')];
let tasks = loadTasks();
let currentFilter = 'all';
let editingId = null;

document.querySelector('#today-label').textContent = new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date());

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.warn('Saved tasks could not be read:', error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function visibleTasks() {
  if (currentFilter === 'active') return tasks.filter((task) => !task.completed);
  if (currentFilter === 'completed') return tasks.filter((task) => task.completed);
  return tasks;
}

function render() {
  const completed = tasks.filter((task) => task.completed).length;
  document.querySelector('#total-count').textContent = tasks.length;
  document.querySelector('#active-count').textContent = tasks.length - completed;
  document.querySelector('#done-count').textContent = completed;

  taskList.replaceChildren();
  visibleTasks().forEach((task) => {
    const item = document.createElement('li');
    item.className = `task-item${task.completed ? ' completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark ${task.title} as ${task.completed ? 'not completed' : 'completed'}`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.title;

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => startEditing(task));
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteTask(task.id));
    actions.append(editButton, deleteButton);

    item.append(checkbox, text, actions);
    taskList.append(item);
  });
  emptyState.hidden = visibleTasks().length > 0;
}

function resetEditor() {
  editingId = null;
  taskForm.reset();
  saveButton.textContent = 'Add task';
  cancelEditButton.hidden = true;
  document.querySelector('#form-title').textContent = 'Add a task';
  formHint.textContent = 'Your tasks stay in this browser on this device.';
}

function startEditing(task) {
  editingId = task.id;
  taskInput.value = task.title;
  taskInput.focus();
  saveButton.textContent = 'Save changes';
  cancelEditButton.hidden = false;
  document.querySelector('#form-title').textContent = 'Edit task';
  formHint.textContent = 'Update the text and save your change.';
}

function toggleTask(id) {
  tasks = tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  if (editingId === id) resetEditor();
  saveTasks();
  render();
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  if (editingId) {
    tasks = tasks.map((task) => task.id === editingId ? { ...task, title } : task);
    formHint.textContent = 'Task updated.';
  } else {
    tasks.unshift({ id: createId(), title, completed: false, createdAt: new Date().toISOString() });
    formHint.textContent = 'Task added.';
  }
  saveTasks();
  resetEditor();
  render();
  taskInput.focus();
});

cancelEditButton.addEventListener('click', resetEditor);

document.querySelector('#clear-completed').addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    render();
  });
});

render();
