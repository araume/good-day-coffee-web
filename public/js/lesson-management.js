// DOM Elements
const lessonsGrid = document.querySelector('.lessons-grid');
const addLessonBtn = document.querySelector('.add-lesson-btn');

// Fetch all lessons
async function fetchLessons() {
    try {
        const response = await fetch('/api/lessons');
        const lessons = await response.json();
        displayLessons(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
    }
}

// Display lessons in the grid
function displayLessons(lessons) {
    lessonsGrid.innerHTML = '';
    lessons.forEach(lesson => {
        const lessonCard = createLessonCard(lesson);
        lessonsGrid.appendChild(lessonCard);
    });
}

// Create a lesson card element
function createLessonCard(lesson) {
    const card = document.createElement('div');
    card.className = 'lesson-card';
    
    card.innerHTML = `
        <div class="lesson-card-header">
            <h3>${lesson.title}</h3>
            <div class="card-actions">
                <button class="edit-btn" onclick="editLesson('${lesson._id}')">Edit</button>
                <button class="delete-btn" onclick="deleteLesson('${lesson._id}')">Delete</button>
            </div>
        </div>
        <div class="lesson-card-content">
            <p>${lesson.description}</p>
            <div class="lesson-stats">
                <span>Quiz Questions: ${lesson.quiz.length}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Create a new lesson
async function createLesson(lessonData) {
    try {
        const response = await fetch('/api/lessons', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(lessonData)
        });
        
        if (response.ok) {
            fetchLessons();
            closeModal();
        } else {
            const error = await response.json();
            alert(error.message);
        }
    } catch (error) {
        console.error('Error creating lesson:', error);
        alert('Error creating lesson');
    }
}

// Edit a lesson
async function editLesson(lessonId) {
    try {
        const response = await fetch(`/api/lessons/${lessonId}`);
        const lesson = await response.json();
        showEditModal(lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
    }
}

// Delete a lesson
async function deleteLesson(lessonId) {
    if (confirm('Are you sure you want to delete this lesson?')) {
        try {
            const response = await fetch(`/api/lessons/${lessonId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchLessons();
            } else {
                const error = await response.json();
                alert(error.message);
            }
        } catch (error) {
            console.error('Error deleting lesson:', error);
            alert('Error deleting lesson');
        }
    }
}

// Show modal for creating/editing lessons
function showModal(title, lesson = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${title}</h2>
            <form id="lessonForm">
                <div class="form-group">
                    <label for="title">Lesson Title</label>
                    <input type="text" id="title" name="title" required value="${lesson ? lesson.title : ''}">
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" required>${lesson ? lesson.description : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Quiz Questions</label>
                    <div id="quizQuestions">
                        ${lesson ? lesson.quiz.map((q, i) => createQuizQuestionHTML(q, i)).join('') : ''}
                    </div>
                    <button type="button" onclick="addQuizQuestion()">Add Question</button>
                </div>
                <div class="modal-actions">
                    <button type="submit">${lesson ? 'Update' : 'Create'}</button>
                    <button type="button" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    modal.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const lessonData = {
            title: formData.get('title'),
            description: formData.get('description'),
            quiz: getQuizQuestions()
        };
        
        if (lesson) {
            updateLesson(lesson._id, lessonData);
        } else {
            createLesson(lessonData);
        }
    });
}

// Create HTML for a quiz question
function createQuizQuestionHTML(question = null, index = 0) {
    return `
        <div class="quiz-question" data-index="${index}">
            <div class="form-group">
                <label>Question ${index + 1}</label>
                <input type="text" name="question${index}" value="${question ? question.question : ''}" required>
            </div>
            <div class="options-container">
                ${question ? question.options.map((opt, i) => `
                    <div class="option">
                        <input type="radio" name="correct${index}" value="${i}" ${i === question.correctAnswer ? 'checked' : ''}>
                        <input type="text" name="option${index}${i}" value="${opt}" required>
                        <button type="button" onclick="removeOption(this)">Remove</button>
                    </div>
                `).join('') : `
                    <div class="option">
                        <input type="radio" name="correct${index}" value="0">
                        <input type="text" name="option${index}0" required>
                        <button type="button" onclick="removeOption(this)">Remove</button>
                    </div>
                    <div class="option">
                        <input type="radio" name="correct${index}" value="1">
                        <input type="text" name="option${index}1" required>
                        <button type="button" onclick="removeOption(this)">Remove</button>
                    </div>
                `}
            </div>
            <button type="button" onclick="addOption(this)">Add Option</button>
            <button type="button" onclick="removeQuestion(this)">Remove Question</button>
        </div>
    `;
}

// Add a new quiz question
function addQuizQuestion() {
    const container = document.getElementById('quizQuestions');
    const index = container.children.length;
    container.insertAdjacentHTML('beforeend', createQuizQuestionHTML(null, index));
}

// Add a new option to a question
function addOption(button) {
    const question = button.closest('.quiz-question');
    const index = question.dataset.index;
    const optionsContainer = question.querySelector('.options-container');
    const optionCount = optionsContainer.children.length;
    
    const optionHTML = `
        <div class="option">
            <input type="radio" name="correct${index}" value="${optionCount}">
            <input type="text" name="option${index}${optionCount}" required>
            <button type="button" onclick="removeOption(this)">Remove</button>
        </div>
    `;
    
    optionsContainer.insertAdjacentHTML('beforeend', optionHTML);
}

// Remove an option from a question
function removeOption(button) {
    const option = button.closest('.option');
    const question = option.closest('.quiz-question');
    const optionsContainer = question.querySelector('.options-container');
    
    if (optionsContainer.children.length > 2) {
        option.remove();
        // Update radio button values
        optionsContainer.querySelectorAll('.option').forEach((opt, i) => {
            opt.querySelector('input[type="radio"]').value = i;
        });
    } else {
        alert('A question must have at least 2 options');
    }
}

// Remove a question
function removeQuestion(button) {
    const question = button.closest('.quiz-question');
    const container = question.parentElement;
    
    if (container.children.length > 1) {
        question.remove();
        // Update question numbers
        container.querySelectorAll('.quiz-question').forEach((q, i) => {
            q.dataset.index = i;
            q.querySelector('label').textContent = `Question ${i + 1}`;
        });
    } else {
        alert('A lesson must have at least one question');
    }
}

// Get quiz questions from the form
function getQuizQuestions() {
    const questions = [];
    document.querySelectorAll('.quiz-question').forEach((q, qIndex) => {
        const options = [];
        q.querySelectorAll('.option input[type="text"]').forEach(opt => {
            options.push(opt.value);
        });
        
        const correctAnswer = parseInt(q.querySelector(`input[name="correct${qIndex}"]:checked`).value);
        
        questions.push({
            question: q.querySelector(`input[name="question${qIndex}"]`).value,
            options,
            correctAnswer
        });
    });
    return questions;
}

// Close the modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchLessons();
    
    addLessonBtn.addEventListener('click', () => {
        showModal('Create New Lesson');
    });
}); 