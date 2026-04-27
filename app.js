// Data Storage Keys
const STORAGE_KEY = 'eduManage_students';

// DOM Elements
const studentsTable = document.getElementById('studentsTable');
const studentsBody = document.getElementById('studentsBody');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');

// Modals
const studentModal = document.getElementById('studentModal');
const deleteModal = document.getElementById('deleteModal');

// Form Elements
const studentForm = document.getElementById('studentForm');
const formMode = document.getElementById('formMode');
const originalId = document.getElementById('originalId');
const studentIdInput = document.getElementById('studentId');
const studentNameInput = document.getElementById('studentName');
const studentAgeInput = document.getElementById('studentAge');
const studentGradeInput = document.getElementById('studentGrade');
const idError = document.getElementById('idError');
const modalTitle = document.getElementById('modalTitle');

// Buttons
const addStudentBtn = document.getElementById('addStudentBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');

// State
let students = {};
let studentToDelete = null;

// Initialize
function init() {
    loadData();
    renderTable();
    setupEventListeners();
}

// Data Management
function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            students = JSON.parse(data);
        } catch (e) {
            console.error("Error parsing stored data", e);
            students = {};
        }
    } else {
        // Seed with some dummy data if completely empty
        students = {
            "S1001": { name: "Alex Johnson", age: 19, grade: "Sophomore" },
            "S1002": { name: "Maria Garcia", age: 20, grade: "Junior" },
            "S1003": { name: "James Smith", age: 18, grade: "Freshman" }
        };
        saveData();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// Rendering
function renderTable(filterText = '') {
    studentsBody.innerHTML = '';
    
    const studentKeys = Object.keys(students);
    
    // Filter logic
    const filteredKeys = studentKeys.filter(id => {
        const student = students[id];
        const searchStr = `${id} ${student.name} ${student.grade}`.toLowerCase();
        return searchStr.includes(filterText.toLowerCase());
    });

    if (filteredKeys.length === 0) {
        studentsTable.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    studentsTable.style.display = 'table';
    emptyState.style.display = 'none';

    filteredKeys.forEach(id => {
        const student = students[id];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><span class="student-id">${id}</span></td>
            <td><strong>${student.name}</strong></td>
            <td>${student.age}</td>
            <td>${student.grade}</td>
            <td>
                <div class="table-actions">
                    <button class="icon-btn action-btn-edit" onclick="openEditModal('${id}')" title="Edit">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="icon-btn action-btn-delete" onclick="openDeleteModal('${id}')" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        studentsBody.appendChild(row);
    });
}

// Event Listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        renderTable(e.target.value);
    });

    // Modals
    addStudentBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeModals);
    cancelBtn.addEventListener('click', closeModals);
    cancelDeleteBtn.addEventListener('click', closeModals);

    // Close on overlay click
    studentModal.addEventListener('click', (e) => {
        if(e.target === studentModal) closeModals();
    });
    deleteModal.addEventListener('click', (e) => {
        if(e.target === deleteModal) closeModals();
    });

    // Form Submit
    studentForm.addEventListener('submit', handleFormSubmit);

    // Delete Confirm
    confirmDeleteBtn.addEventListener('click', deleteStudent);

    // Import / Export
    exportBtn.addEventListener('click', exportJSON);
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', importJSON);
}

// Modal Operations
function openAddModal() {
    formMode.value = 'add';
    originalId.value = '';
    modalTitle.textContent = 'Add New Student';
    studentForm.reset();
    idError.textContent = '';
    studentIdInput.readOnly = false;
    
    studentModal.classList.add('active');
    studentIdInput.focus();
}

window.openEditModal = function(id) {
    const student = students[id];
    if(!student) return;

    formMode.value = 'edit';
    originalId.value = id;
    modalTitle.textContent = 'Edit Student';
    idError.textContent = '';
    
    studentIdInput.value = id;
    studentIdInput.readOnly = true; // Prevent changing ID during edit to simplify things
    studentNameInput.value = student.name;
    studentAgeInput.value = student.age;
    studentGradeInput.value = student.grade;

    studentModal.classList.add('active');
};

window.openDeleteModal = function(id) {
    const student = students[id];
    if(!student) return;

    studentToDelete = id;
    document.getElementById('deleteStudentName').textContent = student.name;
    deleteModal.classList.add('active');
};

function closeModals() {
    studentModal.classList.remove('active');
    deleteModal.classList.remove('active');
    studentToDelete = null;
}

// CRUD Operations
function handleFormSubmit(e) {
    e.preventDefault();
    
    const mode = formMode.value;
    const id = studentIdInput.value.trim();
    
    // Validation
    if(mode === 'add' && students[id]) {
        idError.textContent = 'This Student ID already exists.';
        return;
    }

    const studentData = {
        name: studentNameInput.value.trim(),
        age: parseInt(studentAgeInput.value),
        grade: studentGradeInput.value.trim()
    };

    if (mode === 'add') {
        students[id] = studentData;
    } else if (mode === 'edit') {
        const oldId = originalId.value;
        // In this simplified version, ID cannot be changed during edit.
        // If we allowed ID change, we would delete oldId and add newId.
        students[oldId] = studentData;
    }

    saveData();
    renderTable(searchInput.value);
    closeModals();
}

function deleteStudent() {
    if (studentToDelete && students[studentToDelete]) {
        delete students[studentToDelete];
        saveData();
        renderTable(searchInput.value);
    }
    closeModals();
}

// Import / Export JSON
function exportJSON() {
    const dataStr = JSON.stringify(students, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const parsedData = JSON.parse(event.target.result);
            
            // Basic validation
            if (typeof parsedData === 'object' && parsedData !== null) {
                // Merge or replace? We'll ask user conceptually, but here we just merge/overwrite existing keys
                if (confirm("Do you want to merge imported data? (Cancel will replace entirely)")) {
                    students = { ...students, ...parsedData };
                } else {
                    students = parsedData;
                }
                saveData();
                renderTable(searchInput.value);
                alert("Data imported successfully!");
            } else {
                throw new Error("Invalid format");
            }
        } catch (error) {
            alert("Error importing file. Please ensure it's a valid JSON format matching the system structure.");
            console.error(error);
        }
        
        // Reset input
        fileInput.value = '';
    };
    reader.readAsText(file);
}

// Start App
document.addEventListener('DOMContentLoaded', init);
