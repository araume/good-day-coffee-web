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
    
    // Get count of each question type
    const questionCounts = {
        total: lesson.quiz ? lesson.quiz.length : 0,
        multipleChoice: 0,
        identification: 0,
        multipleAnswer: 0
    };
    
    if (lesson.quiz && lesson.quiz.length > 0) {
        lesson.quiz.forEach(q => {
            if (q.type === 'multiple-choice') {
                questionCounts.multipleChoice++;
            } else if (q.type === 'identification') {
                questionCounts.identification++;
            } else if (q.type === 'multiple-answer') {
                questionCounts.multipleAnswer++;
            }
        });
    }
    
    // Create a sanitized preview of the description
    let descriptionPreview = '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = lesson.description;
    
    // Count images and remove them from the preview
    const images = tempDiv.getElementsByTagName('img');
    const imageCount = images.length;
    
    // Remove images while keeping a note that images were present
    while (tempDiv.getElementsByTagName('img').length > 0) {
        const img = tempDiv.getElementsByTagName('img')[0];
        const imagePlaceholder = document.createElement('span');
        imagePlaceholder.className = 'image-placeholder';
        imagePlaceholder.textContent = '[Image]';
        img.parentNode.replaceChild(imagePlaceholder, img);
    }
    
    // Create text-only preview (limited to ~100 characters)
    let textContent = tempDiv.textContent.trim();
    descriptionPreview = textContent.length > 100 ? 
        textContent.substring(0, 97) + '...' : 
        textContent;
    
    // Add an indicator if there were images
    const imageIndicator = imageCount > 0 ? 
        `<div class="image-indicator">${imageCount} image${imageCount !== 1 ? 's' : ''} included</div>` : '';
    
    card.innerHTML = `
        <div class="lesson-card-header">
            <h3>${lesson.title}</h3>
            <div class="card-actions">
                <button class="edit-btn" onclick="editLesson('${lesson._id}')">Edit</button>
                <button class="delete-btn" onclick="deleteLesson('${lesson._id}')">Delete</button>
            </div>
        </div>
        <div class="lesson-card-content">
            <p>${descriptionPreview}</p>
            ${imageIndicator}
            <div class="lesson-stats">
                <span>Total Questions: ${questionCounts.total}</span>
                ${questionCounts.multipleChoice ? `<span>Multiple Choice: ${questionCounts.multipleChoice}</span>` : ''}
                ${questionCounts.identification ? `<span>Identification: ${questionCounts.identification}</span>` : ''}
                ${questionCounts.multipleAnswer ? `<span>Multiple Answer: ${questionCounts.multipleAnswer}</span>` : ''}
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
                    <div class="rich-text-container">
                        <div id="description" class="rich-text-editor" contenteditable="true" placeholder="Enter lesson description (you can paste images directly)">${lesson ? lesson.description : ''}</div>
                        <input type="hidden" name="description" id="description-hidden">
                        <div class="rich-text-toolbar">
                            <button type="button" class="toolbar-btn" id="add-image-btn">
                                <span class="btn-icon">📷</span> Add Image
                            </button>
                            <input type="file" id="image-upload" accept="image/*" style="display:none">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Quiz Questions</label>
                        <div id="quizQuestions" class="quiz-questions-container">
                        ${lesson && lesson.quiz ? lesson.quiz.map((q, i) => createQuizQuestionHTML(q, i)).join('') : ''}
                    </div>
                        <div class="add-question-container">
                            <button type="button" class="add-question-btn" onclick="addQuizQuestion('multiple-choice')">
                                <i class="plus-icon">+</i> Add Multiple Choice
                            </button>
                            <button type="button" class="add-question-btn" onclick="addQuizQuestion('identification')">
                                <i class="plus-icon">+</i> Add Identification
                            </button>
                            <button type="button" class="add-question-btn" onclick="addQuizQuestion('multiple-answer')">
                                <i class="plus-icon">+</i> Add Multiple Answer
                            </button>
                        </div>
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
    
    // Add paste event listener to rich text editor
    const richTextEditor = modal.querySelector('#description');
    
    // Setup image upload button
    const addImageBtn = modal.querySelector('#add-image-btn');
    const imageUpload = modal.querySelector('#image-upload');
    
    addImageBtn.addEventListener('click', () => {
        imageUpload.click();
    });
    
    imageUpload.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // Check file size - warn if over 500KB
            if (file.size > 500 * 1024) {
                if (!confirm('This image is large and might cause issues. Continue anyway? Consider using a smaller image for better performance.')) {
                    this.value = ''; // Clear the file input
                    return;
                }
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Create a temporary image to resize if needed
                const tempImg = new Image();
                tempImg.src = e.target.result;
                
                tempImg.onload = function() {
                    let imgSrc = e.target.result;
                    let needsResize = false;
                    
                    // If image is very large, resize it
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 600;
                    
                    if (tempImg.width > MAX_WIDTH || tempImg.height > MAX_HEIGHT) {
                        needsResize = true;
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Calculate new dimensions while preserving aspect ratio
                        let width = tempImg.width;
                        let height = tempImg.height;
                        
                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height = Math.round(height * (MAX_WIDTH / width));
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width = Math.round(width * (MAX_HEIGHT / height));
                                height = MAX_HEIGHT;
                            }
                        }
                        
                        // Resize the image
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(tempImg, 0, 0, width, height);
                        
                        // Get resized image as data URL (with reduced quality for JPEG)
                        imgSrc = canvas.toDataURL('image/jpeg', 0.7);
                    }
                    
                    // Create and insert the image
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.style.maxWidth = '100%';
                    img.alt = 'Uploaded image';
                    if (needsResize) {
                        img.title = 'This image was resized for better performance';
                    }
                    
                    // Insert image at cursor position or at the end if no selection
                    const selection = window.getSelection();
                    if (selection.rangeCount && selection.getRangeAt(0).commonAncestorContainer.contains(richTextEditor)) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(img);
                        // Move cursor after the image
                        range.setStartAfter(img);
                        range.setEndAfter(img);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } else {
                        richTextEditor.appendChild(img);
                    }
                };
            };
            
            reader.readAsDataURL(file);
            this.value = ''; // Clear the file input for future uploads
        }
    });
    
    // Paste event listener for images
    richTextEditor.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        let imageFound = false;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                imageFound = true;
                e.preventDefault();
                
                const blob = items[i].getAsFile();
                
                // Check file size - warn if over 500KB
                if (blob.size > 500 * 1024) {
                    if (!confirm('This image is large and might cause issues. Continue anyway? Consider using a smaller image for better performance.')) {
                        return;
                    }
                }
                
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    // Create a temporary image to resize if needed
                    const tempImg = new Image();
                    tempImg.src = event.target.result;
                    
                    tempImg.onload = function() {
                        let imgSrc = event.target.result;
                        let needsResize = false;
                        
                        // If image is very large, resize it
                        const MAX_WIDTH = 800;
                        const MAX_HEIGHT = 600;
                        
                        if (tempImg.width > MAX_WIDTH || tempImg.height > MAX_HEIGHT) {
                            needsResize = true;
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            
                            // Calculate new dimensions while preserving aspect ratio
                            let width = tempImg.width;
                            let height = tempImg.height;
                            
                            if (width > height) {
                                if (width > MAX_WIDTH) {
                                    height = Math.round(height * (MAX_WIDTH / width));
                                    width = MAX_WIDTH;
                                }
                            } else {
                                if (height > MAX_HEIGHT) {
                                    width = Math.round(width * (MAX_HEIGHT / height));
                                    height = MAX_HEIGHT;
                                }
                            }
                            
                            // Resize the image
                            canvas.width = width;
                            canvas.height = height;
                            ctx.drawImage(tempImg, 0, 0, width, height);
                            
                            // Get resized image as data URL (with reduced quality for JPEG)
                            imgSrc = canvas.toDataURL('image/jpeg', 0.7);
                        }
                        
                        // Create and insert the image
                        const img = document.createElement('img');
                        img.src = imgSrc;
                        img.style.maxWidth = '100%';
                        img.alt = 'Pasted image';
                        if (needsResize) {
                            img.title = 'This image was resized for better performance';
                        }
                        
                        // Insert at cursor position
                        const selection = window.getSelection();
                        if (selection.rangeCount) {
                            const range = selection.getRangeAt(0);
                            range.deleteContents();
                            range.insertNode(img);
                            // Move cursor after the image
                            range.setStartAfter(img);
                            range.setEndAfter(img);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        } else {
                            richTextEditor.appendChild(img);
                        }
                    };
                };
                
                reader.readAsDataURL(blob);
            }
        }
        
        // If no image found in clipboard, let the default paste behavior happen
        if (!imageFound) {
            return true;
        }
    });
    
    // Handle placeholders for contenteditable
    richTextEditor.addEventListener('focus', function() {
        if (this.textContent.trim() === '' && this.childNodes.length === 0) {
            this.innerHTML = '';
        }
    });
    
    richTextEditor.addEventListener('blur', function() {
        if (this.textContent.trim() === '' && this.childNodes.length === 0) {
            this.innerHTML = '';
        }
    });
    
    // Handle form submission
    modal.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get rich text content and set in hidden field
        const descriptionContent = richTextEditor.innerHTML;
        document.getElementById('description-hidden').value = descriptionContent;
        
        const formData = new FormData(e.target);
        const lessonData = {
            title: formData.get('title'),
            description: formData.get('description'),
            quiz: getQuizQuestions()
        };
        
        // Stringify and parse to ensure valid JSON
        try {
            const testJson = JSON.stringify(lessonData);
            JSON.parse(testJson); // Test if valid JSON
        } catch (error) {
            console.error('Invalid JSON data:', error);
            alert('There was an issue with the image data. Please try using smaller images or fewer images.');
            return;
        }
        
        if (lesson) {
            updateLesson(lesson._id, lessonData);
        } else {
            createLesson(lessonData);
        }
    });

    // Handle close button
    modal.querySelector('.close').addEventListener('click', closeModal);
    
    // Close modal when clicking outside
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

// Create HTML for a quiz question based on type
function createQuizQuestionHTML(question = null, index = 0) {
    // Default to multiple-choice if no type provided
    const questionType = question ? question.type : 'multiple-choice';
    
    // Common header and question input
    let html = `
        <div class="quiz-question" data-index="${index}" data-type="${questionType}">
            <div class="quiz-question-header">
                <div class="question-type-badge ${questionType}-badge">
                    ${formatQuestionType(questionType)}
                </div>
                <label>Question ${index + 1}</label>
                <button type="button" class="remove-question-btn" onclick="removeQuestion(this)" title="Remove Question">
                    <i class="remove-icon">×</i>
                </button>
            </div>
            <div class="form-group">
                <input type="text" name="question_${index}" placeholder="Enter your question" required value="${question ? question.question : ''}">
                <input type="hidden" name="question_type_${index}" value="${questionType}">
            </div>
    `;
    
    // Add type-specific content
    if (questionType === 'multiple-choice') {
        html += `
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
        `;
    } else if (questionType === 'identification') {
        html += `
            <div class="form-group">
                <label>Correct Answer</label>
                <textarea name="correct_answer_${index}" class="identification-answer" 
                    placeholder="Enter the correct answer" required rows="3">${question && question.correctAnswer ? question.correctAnswer : ''}</textarea>
            </div>
        `;
    } else if (questionType === 'multiple-answer') {
        html += `
            <div class="form-group">
                <label>Options (Select all correct answers)</label>
                <div class="options-container" data-question="${index}">
                    ${question && question.options ? question.options.map((option, i) => `
                        <div class="option">
                            <input type="checkbox" id="correct_${index}_${i}" name="correct_${index}_${i}" value="${i}" 
                                ${question.correctAnswer && question.correctAnswer.includes(i) ? 'checked' : ''}>
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
    `;
    }
    
    html += `</div>`;
    return html;
}

// Format question type for display
function formatQuestionType(type) {
    switch(type) {
        case 'multiple-choice':
            return 'Multiple Choice';
        case 'identification':
            return 'Identification';
        case 'multiple-answer':
            return 'Multiple Answer';
        default:
            return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
    }
}

// Add a new quiz question
function addQuizQuestion(type = 'multiple-choice') {
    const quizQuestions = document.getElementById('quizQuestions');
    const index = quizQuestions.children.length;
    
    // Create dummy question object with type
    const questionObj = {
        type: type,
        question: '',
        options: type !== 'identification' ? ['', ''] : undefined,
        correctAnswer: type === 'multiple-choice' ? 0 : (type === 'multiple-answer' ? [0] : '')
    };
    
    const questionHTML = createQuizQuestionHTML(questionObj, index);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = questionHTML;
    const questionElement = tempDiv.firstElementChild;
    quizQuestions.appendChild(questionElement);
    
    // For question types with options, add default options
    if (type === 'multiple-choice' || type === 'multiple-answer') {
        const addOptionBtn = questionElement.querySelector('button[data-question="' + index + '"]');
        // Add default options if needed
        const optionsContainer = questionElement.querySelector(`.options-container[data-question="${index}"]`);
        if (optionsContainer.children.length === 0) {
            // Add two default options
            addOption(addOptionBtn);
            addOption(addOptionBtn);
        }
    }
    
    // Focus on the question input field
    questionElement.querySelector('input[name^="question_"]').focus();
    
    // Scroll to the new question
    questionElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Add an option to a question
function addOption(button) {
    const questionIndex = button.getAttribute('data-question');
    const optionsContainer = document.querySelector(`.options-container[data-question="${questionIndex}"]`);
    const questionElement = button.closest('.quiz-question');
    const questionType = questionElement.getAttribute('data-type');
    const optionIndex = optionsContainer.children.length;
    
    const option = document.createElement('div');
    option.className = 'option';
    
    if (questionType === 'multiple-choice') {
        option.innerHTML = `
            <input type="radio" id="correct_${questionIndex}_${optionIndex}" name="correct_${questionIndex}" value="${optionIndex}">
            <input type="text" name="option_${questionIndex}_${optionIndex}" placeholder="Option ${optionIndex + 1}" required>
            <button type="button" class="remove-option-btn" onclick="removeOption(this)" title="Remove Option">
                <i class="remove-icon">×</i>
            </button>
    `;
    } else if (questionType === 'multiple-answer') {
        option.innerHTML = `
            <input type="checkbox" id="correct_${questionIndex}_${optionIndex}" name="correct_${questionIndex}_${optionIndex}" value="${optionIndex}">
            <input type="text" name="option_${questionIndex}_${optionIndex}" placeholder="Option ${optionIndex + 1}" required>
            <button type="button" class="remove-option-btn" onclick="removeOption(this)" title="Remove Option">
                <i class="remove-icon">×</i>
            </button>
        `;
}

    optionsContainer.appendChild(option);
    
    // Focus the new input field
    option.querySelector('input[type="text"]').focus();
}

// Remove an option
function removeOption(button) {
    const option = button.closest('.option');
    const optionsContainer = option.parentNode;
    const questionElement = option.closest('.quiz-question');
    const questionType = questionElement.getAttribute('data-type');
    
    // Don't remove if it's the last option for multiple choice (need at least 2)
    const minOptions = questionType === 'multiple-choice' || questionType === 'multiple-answer' ? 2 : 1;
    
    if (optionsContainer.children.length <= minOptions) {
        alert(`A ${formatQuestionType(questionType)} question must have at least ${minOptions} options`);
        return;
    }
    
    // Remove the option with animation
    option.classList.add('removing');
    setTimeout(() => {
        // Remove the option
        option.remove();
        
        // Update option indices
        if (questionType === 'multiple-choice') {
            updateRadioOptions(optionsContainer);
        } else if (questionType === 'multiple-answer') {
            updateCheckboxOptions(optionsContainer);
        }
    }, 300);
}

// Update radio button options after removal
function updateRadioOptions(optionsContainer) {
    const questionIndex = optionsContainer.getAttribute('data-question');
    Array.from(optionsContainer.children).forEach((opt, i) => {
        const radio = opt.querySelector('input[type="radio"]');
        const input = opt.querySelector('input[type="text"]');
        
        radio.id = `correct_${questionIndex}_${i}`;
        radio.value = i;
        radio.name = `correct_${questionIndex}`;
        input.name = `option_${questionIndex}_${i}`;
        input.placeholder = `Option ${i + 1}`;
        });
}

// Update checkbox options after removal
function updateCheckboxOptions(optionsContainer) {
    const questionIndex = optionsContainer.getAttribute('data-question');
    Array.from(optionsContainer.children).forEach((opt, i) => {
        const checkbox = opt.querySelector('input[type="checkbox"]');
        const input = opt.querySelector('input[type="text"]');
        
        checkbox.id = `correct_${questionIndex}_${i}`;
        checkbox.value = i;
        checkbox.name = `correct_${questionIndex}_${i}`;
        input.name = `option_${questionIndex}_${i}`;
        input.placeholder = `Option ${i + 1}`;
    });
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
            const questionType = q.getAttribute('data-type');
            q.setAttribute('data-index', i);
            q.querySelector('.quiz-question-header label').textContent = `Question ${i + 1}`;
            
            const questionInput = q.querySelector('input[name^="question_"]');
            questionInput.name = `question_${i}`;
            
            const typeInput = q.querySelector('input[name^="question_type_"]');
            typeInput.name = `question_type_${i}`;
            
            if (questionType === 'identification') {
                const answerInput = q.querySelector('textarea[name^="correct_answer_"]');
                answerInput.name = `correct_answer_${i}`;
            } else {
                const optionsContainer = q.querySelector('.options-container');
                optionsContainer.setAttribute('data-question', i);
                
                const addOptionBtn = q.querySelector('.add-option-btn');
                addOptionBtn.setAttribute('data-question', i);
                
                // Update options based on question type
                if (questionType === 'multiple-choice') {
                    updateRadioOptions(optionsContainer);
                } else if (questionType === 'multiple-answer') {
                    updateCheckboxOptions(optionsContainer);
    }
            }
        });
    }, 300);
}

// Get quiz questions data from the form
function getQuizQuestions() {
    const quizQuestions = document.getElementById('quizQuestions');
    const questions = [];
    
    Array.from(quizQuestions.children).forEach((q, i) => {
        const questionText = q.querySelector(`input[name="question_${i}"]`).value;
        const questionType = q.querySelector(`input[name="question_type_${i}"]`).value;
        
        let questionData = {
            question: questionText,
            type: questionType
        };
        
        if (questionType === 'identification') {
            // Get the correct answer for identification questions
            questionData.correctAnswer = q.querySelector(`textarea[name="correct_answer_${i}"]`).value;
        } else if (questionType === 'multiple-choice') {
            // Get options and the selected correct answer for multiple choice
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
            
            questionData.options = options;
            questionData.correctAnswer = correctAnswer;
        } else if (questionType === 'multiple-answer') {
            // Get options and the selected correct answers for multiple answer
            const optionsContainer = q.querySelector(`.options-container[data-question="${i}"]`);
            const options = [];
            const correctAnswers = [];
            
            // Get all selected correct answers
            Array.from(optionsContainer.children).forEach((opt, j) => {
                const checkbox = opt.querySelector(`input[name="correct_${i}_${j}"]`);
                if (checkbox.checked) {
                    correctAnswers.push(j);
                }
                options.push(opt.querySelector(`input[name="option_${i}_${j}"]`).value);
        });
            
            questionData.options = options;
            questionData.correctAnswer = correctAnswers;
        }
        
        questions.push(questionData);
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