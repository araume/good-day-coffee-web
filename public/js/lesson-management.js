// DOM Elements
const lessonsGrid = document.querySelector('.lessons-grid');
const addLessonBtn = document.querySelector('.add-lesson-btn');
const searchInput = document.getElementById('lesson-search');
const searchBtn = document.querySelector('.search-btn');

// Store all lessons for filtering
let allLessons = [];

// Fetch all lessons
async function fetchLessons() {
    try {
        const response = await fetch('/api/lessons', {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch lessons');
        const lessons = await response.json();
        allLessons = lessons; // Store all lessons
        displayLessons(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        alert('Failed to load lessons');
    }
}

// Display lessons in the grid
function displayLessons(lessons) {
    lessonsGrid.innerHTML = '';
    
    if (lessons.length === 0) {
        lessonsGrid.innerHTML = '<div class="no-results">No lessons found</div>';
        return;
    }
    
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
                <span>Quiz Questions: ${lesson.quiz ? lesson.quiz.length : 0}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Filter lessons based on search input
function filterLessons(searchTerm) {
    if (!searchTerm) {
        return allLessons;
    }
    
    searchTerm = searchTerm.toLowerCase();
    return allLessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchTerm) || 
        lesson.description.toLowerCase().includes(searchTerm)
    );
}

// Create a new lesson
async function createLesson(lessonData) {
    try {
        const response = await fetch('/api/lessons', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(lessonData),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }
        
        fetchLessons();
        closeModal();
    } catch (error) {
        console.error('Error creating lesson:', error);
        alert(error.message || 'Error creating lesson');
    }
}

// Edit a lesson
async function editLesson(lessonId) {
    try {
        const response = await fetch(`/api/lessons/${lessonId}`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch lesson');
        const lesson = await response.json();
        showModal('Edit Lesson', lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        alert('Failed to load lesson');
    }
}

// Update a lesson
async function updateLesson(lessonId, lessonData) {
    try {
        const response = await fetch(`/api/lessons/${lessonId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(lessonData),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }
        
        fetchLessons();
        closeModal();
    } catch (error) {
        console.error('Error updating lesson:', error);
        alert(error.message || 'Error updating lesson');
    }
}

// Delete a lesson
async function deleteLesson(lessonId) {
    if (confirm('Are you sure you want to delete this lesson?')) {
        try {
            const response = await fetch(`/api/lessons/${lessonId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            
            fetchLessons();
        } catch (error) {
            console.error('Error deleting lesson:', error);
            alert(error.message || 'Error deleting lesson');
        }
    }
}

// Show modal for creating/editing lessons
function showModal(title, lesson = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${title}</h2>
            <div class="modal-form-container">
                <form id="lessonForm">
                    <div class="form-group">
                        <label for="title">Lesson Title</label>
                        <input type="text" id="title" name="title" placeholder="Enter lesson title" required value="${lesson ? lesson.title : ''}">
                    </div>
                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea id="description" name="description" placeholder="Enter lesson description" required>${lesson ? lesson.description : ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Quiz Questions</label>
                        <div id="quizQuestions" class="quiz-questions-container">
                            ${lesson && lesson.quiz ? lesson.quiz.map((q, i) => createQuizQuestionHTML(q, i)).join('') : ''}
                        </div>
                        <button type="button" class="add-question-btn" onclick="addQuizQuestion()">
                            <i class="plus-icon">+</i> Add Question
                        </button>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="cancel-btn" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="save-btn">${lesson ? 'Update Lesson' : 'Create Lesson'}</button>
                    </div>
                </form>
            </div>
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

    // Handle close button
    modal.querySelector('.close').addEventListener('click', closeModal);
    
    // Close modal when clicking outside of content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Show the modal with animation
    document.body.classList.add('modal-open');
    setTimeout(() => {
        modal.style.display = 'block';
    }, 10);
}

// Create HTML for a quiz question
function createQuizQuestionHTML(question = null, index = 0) {
    return `
        <div class="quiz-question" data-index="${index}">
            <div class="quiz-question-header">
                <label>Question ${index + 1}</label>
                <button type="button" class="remove-question-btn" onclick="removeQuestion(this)" title="Remove Question">
                    <i class="remove-icon">×</i>
                </button>
            </div>
            <div class="form-group">
                <input type="text" name="question_${index}" placeholder="Enter your question" required value="${question ? question.question : ''}">
            </div>
            <div class="form-group">
                <label>Options (Select the correct answer)</label>
                <div class="options-container" data-question="${index}">
                    ${question && question.options ? question.options.map((option, i) => `
                        <div class="option">
                            <input type="radio" id="correct_${index}_${i}" name="correct_${index}" value="${i}" ${question.correctAnswer === i ? 'checked' : ''}>
                            <input type="text" name="option_${index}_${i}" placeholder="Option ${i + 1}" required value="${option}">
                            <button type="button" class="remove-option-btn" onclick="removeOption(this)" title="Remove Option">
                                <i class="remove-icon">×</i>
                            </button>
                        </div>
                    `).join('') : ''}
                </div>
                <button type="button" class="add-option-btn" onclick="addOption(this)" data-question="${index}">
                    <i class="plus-icon">+</i> Add Option
                </button>
            </div>
        </div>
    `;
}

// Add a new quiz question
function addQuizQuestion() {
    const quizQuestions = document.getElementById('quizQuestions');
    const index = quizQuestions.children.length;
    const questionHTML = createQuizQuestionHTML(null, index);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = questionHTML;
    const questionElement = tempDiv.firstElementChild;
    quizQuestions.appendChild(questionElement);
    
    // Add a default option
    const addOptionBtn = questionElement.querySelector('button[data-question="' + index + '"]');
    addOption(addOptionBtn);
    
    // Scroll to the new question
    questionElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Add an option to a question
function addOption(button) {
    const questionIndex = button.getAttribute('data-question');
    const optionsContainer = document.querySelector(`.options-container[data-question="${questionIndex}"]`);
    const optionIndex = optionsContainer.children.length;
    
    const option = document.createElement('div');
    option.className = 'option';
    option.innerHTML = `
        <input type="radio" id="correct_${questionIndex}_${optionIndex}" name="correct_${questionIndex}" value="${optionIndex}">
        <input type="text" name="option_${questionIndex}_${optionIndex}" placeholder="Option ${optionIndex + 1}" required>
        <button type="button" class="remove-option-btn" onclick="removeOption(this)" title="Remove Option">
            <i class="remove-icon">×</i>
        </button>
    `;
    
    optionsContainer.appendChild(option);
    
    // Focus the new input field
    option.querySelector('input[type="text"]').focus();
}

// Remove an option
function removeOption(button) {
    const option = button.closest('.option');
    const optionsContainer = option.parentNode;
    
    // Don't remove if it's the last option
    if (optionsContainer.children.length <= 1) {
        alert('A question must have at least one option');
        return;
    }
    
    // Remove the option with animation
    option.classList.add('removing');
    setTimeout(() => {
        // Remove the option
        option.remove();
        
        // Update option indices
        Array.from(optionsContainer.children).forEach((opt, i) => {
            const questionIndex = optionsContainer.getAttribute('data-question');
            const radio = opt.querySelector('input[type="radio"]');
            const input = opt.querySelector('input[type="text"]');
            
            radio.id = `correct_${questionIndex}_${i}`;
            radio.value = i;
            radio.name = `correct_${questionIndex}`;
            input.name = `option_${questionIndex}_${i}`;
            input.placeholder = `Option ${i + 1}`;
        });
    }, 300);
}

// Remove a question
function removeQuestion(button) {
    const question = button.closest('.quiz-question');
    const quizQuestions = document.getElementById('quizQuestions');
    
    // Add removal animation
    question.classList.add('removing');
    
    setTimeout(() => {
        // Remove the question
        question.remove();
        
        // Update question indices
        Array.from(quizQuestions.children).forEach((q, i) => {
            q.setAttribute('data-index', i);
            q.querySelector('.quiz-question-header label').textContent = `Question ${i + 1}`;
            
            const questionInput = q.querySelector('input[name^="question_"]');
            questionInput.name = `question_${i}`;
            
            const optionsContainer = q.querySelector('.options-container');
            optionsContainer.setAttribute('data-question', i);
            
            const addOptionBtn = q.querySelector('.add-option-btn');
            addOptionBtn.setAttribute('data-question', i);
            
            // Update option names
            Array.from(optionsContainer.children).forEach((opt, j) => {
                const radio = opt.querySelector('input[type="radio"]');
                const input = opt.querySelector('input[type="text"]');
                
                radio.id = `correct_${i}_${j}`;
                radio.name = `correct_${i}`;
                radio.value = j;
                input.name = `option_${i}_${j}`;
                input.placeholder = `Option ${j + 1}`;
            });
        });
    }, 300);
}

// Get quiz questions data from the form
function getQuizQuestions() {
    const quizQuestions = document.getElementById('quizQuestions');
    const questions = [];
    
    Array.from(quizQuestions.children).forEach((q, i) => {
        const questionText = q.querySelector(`input[name="question_${i}"]`).value;
        const optionsContainer = q.querySelector(`.options-container[data-question="${i}"]`);
        const options = [];
        let correctAnswer = 0;
        
        // Get the selected correct answer
        const radioGroup = q.querySelectorAll(`input[name="correct_${i}"]`);
        radioGroup.forEach((radio, j) => {
            if (radio.checked) {
                correctAnswer = j;
            }
            options.push(q.querySelector(`input[name="option_${i}_${j}"]`).value);
        });
        
        questions.push({
            question: questionText,
            options: options,
            correctAnswer: correctAnswer
        });
    });
    
    return questions;
}

// Close the modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        // Add closing animation
        modal.classList.add('closing');
        
        setTimeout(() => {
            document.body.classList.remove('modal-open');
            modal.remove();
        }, 300);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchLessons();
    
    // Add new lesson button click event
    addLessonBtn.addEventListener('click', () => {
        showModal('Add New Lesson');
    });
    
    // Search functionality
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        const filteredLessons = filterLessons(searchTerm);
        displayLessons(filteredLessons);
    });
    
    // Real-time search on input change
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            const filteredLessons = filterLessons(searchTerm);
            displayLessons(filteredLessons);
        }
    });
}); 