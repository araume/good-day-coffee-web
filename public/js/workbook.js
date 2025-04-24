// Function to fetch lessons from the backend
async function fetchLessons() {
    try {
        const response = await fetch('/api/lessons');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch lessons');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching lessons:', error);
        throw error;
    }
}

// Function to fetch user's quiz scores
async function fetchQuizScores() {
    try {
        const response = await fetch('/api/quiz-scores', {
            credentials: 'include'
        });
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Please log in to view quiz scores');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch quiz scores');
            }
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching quiz scores:', error);
        throw error;
    }
}

// Function to save a quiz score
async function saveQuizScore(lessonId, score, totalQuestions, percentage) {
    try {
        const response = await fetch('/api/quiz-scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                lessonId,
                score,
                totalQuestions,
                percentage
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save quiz score');
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving quiz score:', error);
        throw error;
    }
}

// Function to populate the lesson dropdown
async function populateLessonDropdown() {
    try {
        const dropdown = document.getElementById('lessondrop');
        if (!dropdown) {
            console.error('Lesson dropdown element not found');
            return;
        }
        
        dropdown.innerHTML = ''; // Clear existing options
        
        const lessons = await fetchLessons();
        if (!Array.isArray(lessons)) {
            console.error('Invalid lessons data received:', lessons);
            dropdown.innerHTML = '<option value="">Error loading lessons</option>';
            return;
        }
        
        const scores = await fetchQuizScores();
        if (!Array.isArray(scores)) {
            console.error('Invalid scores data received:', scores);
            scores = [];
        }
        
        if (lessons.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No lessons available';
            dropdown.appendChild(option);
            return;
        }
        
        lessons.forEach(lesson => {
            if (!lesson || !lesson._id) {
                console.error('Invalid lesson object:', lesson);
                return;
            }
            
            const option = document.createElement('option');
            option.value = lesson._id;
            
            // Find matching score with null checks
            const score = scores.find(s => s && s.lessonId && s.lessonId._id === lesson._id);
            option.textContent = `${lesson.title}${score ? ` (Score: ${score.percentage}%)` : ''}`;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating lesson dropdown:', error);
        const dropdown = document.getElementById('lessondrop');
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Error loading lessons</option>';
        }
        throw error;
    }
}

// Function to fetch a single lesson
async function fetchLesson(lessonId) {
    try {
        const response = await fetch(`/api/lessons/${lessonId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch lesson');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching lesson:', error);
        return null;
    }
}

// Function to display lesson content
async function displayLessonContent(lessonId) {
    const contentArea = document.querySelector('.content-area');
    const quizBtn = document.getElementById('take-quiz-btn');
    
    // Reset scroll tracking and quiz button state
    resetScrollTracking();
    quizBtn.disabled = true;
    
    if (!lessonId) {
        contentArea.innerHTML = '<p>Please select a lesson</p>';
        quizBtn.style.display = 'none';
        document.getElementById('scroll-indicator').style.display = 'none';
        return;
    }
    
    const lesson = await fetchLesson(lessonId);
    
    if (lesson) {
        contentArea.innerHTML = `
            <h3>${lesson.title}</h3>
            <div class="lesson-description">
                ${lesson.description}
            </div>
        `;
        
        // Initialize scroll tracking for the new content
        initScrollTracking();
        
        // Show quiz button and scroll indicator
        quizBtn.style.display = 'block';
        document.getElementById('scroll-indicator').style.display = 'flex';
        
        // Check if there's a quiz
        if (!lesson.quiz || lesson.quiz.length === 0) {
            quizBtn.disabled = true;
            quizBtn.textContent = 'No Quiz Available';
            document.getElementById('scroll-indicator').style.display = 'none';
        } else {
            quizBtn.disabled = true;
            quizBtn.textContent = 'Take Quiz';
            
            // Pre-fetch and store quiz questions for later use
            window.currentQuiz = lesson.quiz;
            window.currentLessonId = lessonId;
        }
    } else {
        contentArea.innerHTML = '<p>Error loading lesson content</p>';
        quizBtn.style.display = 'none';
        document.getElementById('scroll-indicator').style.display = 'none';
    }
}

// Function to initialize scroll tracking
function initScrollTracking() {
    const contentArea = document.querySelector('.content-area');
    const quizBtn = document.getElementById('take-quiz-btn');
    const progressBar = document.querySelector('.progress');
    
    if (!contentArea || !quizBtn || !progressBar) return;
    
    contentArea.addEventListener('scroll', function() {
        // Calculate scroll percentage
        const scrollable = contentArea.scrollHeight - contentArea.clientHeight;
        const scrolled = contentArea.scrollTop;
        const scrollPercentage = (scrolled / scrollable) * 100;
        
        // Update progress bar
        progressBar.style.width = `${Math.min(scrollPercentage, 100)}%`;
        
        // Enable quiz button when scrolled to the bottom (or near bottom)
        if (scrollPercentage >= 90) {
            quizBtn.disabled = false;
            document.getElementById('scroll-indicator').querySelector('span').textContent = 'Quiz is now available!';
        }
    });
}

// Function to reset scroll tracking
function resetScrollTracking() {
    const progressBar = document.querySelector('.progress');
    if (progressBar) progressBar.style.width = '0%';
    
    // Reset the indicator text
    const indicatorText = document.getElementById('scroll-indicator').querySelector('span');
    if (indicatorText) indicatorText.textContent = 'Please read the entire lesson to unlock the quiz';
}

// Function to display quiz in modal
function displayQuizModal() {
    const quizModal = document.getElementById('quiz-modal');
    const quizQuestionsContainer = quizModal.querySelector('.quiz-questions');
    const previousScoreContainer = quizModal.querySelector('.previous-score-container');
    
    // Clear previous content
    quizQuestionsContainer.innerHTML = '';
    previousScoreContainer.innerHTML = '';
    previousScoreContainer.style.display = 'none';
    
    if (!window.currentQuiz || window.currentQuiz.length === 0) {
        quizQuestionsContainer.innerHTML = '<p>No quiz available for this lesson</p>';
        return;
    }

    // Fetch previous score if exists
    fetchPreviousScore(window.currentLessonId)
        .then(score => {
            if (score) {
                previousScoreContainer.innerHTML = `<h4>Previous Score: ${score.percentage}%</h4>`;
                previousScoreContainer.style.display = 'block';
            }
        })
        .catch(error => console.error('Error fetching previous score:', error));
    
    // Display quiz questions based on their type
    window.currentQuiz.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        
        // Add question header with question number and text
        let questionHTML = `<p>${index + 1}. ${question.question}</p>`;
        
        // Add question type-specific inputs
        const questionType = question.type || 'multiple-choice'; // Default to multiple-choice if no type
        
        if (questionType === 'identification') {
            questionHTML += `
                <div class="identification-answer-container">
                    <textarea name="q${index}" class="identification-answer" placeholder="Type your answer here" rows="3"></textarea>
                </div>
            `;
        } else if (questionType === 'multiple-answer') {
            questionHTML += question.options.map((option, optIndex) => `
                <label class="checkbox-label">
                    <input type="checkbox" name="q${index}_opt${optIndex}" value="${optIndex}">
                    ${option}
                </label>
            `).join('');
        } else { // multiple-choice
            questionHTML += question.options.map((option, optIndex) => `
                <label class="radio-label">
                    <input type="radio" name="q${index}" value="${optIndex}">
                    ${option}
                </label>
            `).join('');
        }
        
        // Add badge for question type
        questionHTML += `<div class="question-type-badge ${questionType}-badge">${formatQuestionType(questionType)}</div>`;
        
        questionDiv.innerHTML = questionHTML;
        quizQuestionsContainer.appendChild(questionDiv);
    });
    
    // Display the modal
    quizModal.style.display = 'block';
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

// Function to fetch previous score
async function fetchPreviousScore(lessonId) {
    try {
        const response = await fetch(`/api/quiz-scores/${lessonId}`);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Error fetching previous score:', error);
        return null;
    }
}

// Function to handle quiz submission
async function handleQuizSubmit() {
    try {
        if (!window.currentLessonId || !window.currentQuiz) {
            alert('No quiz available');
            return;
        }
        
        let score = 0;
        const totalQuestions = window.currentQuiz.length;
        
        // Check if all questions are answered
        let unansweredQuestions = [];
        
        window.currentQuiz.forEach((question, index) => {
            const questionType = question.type || 'multiple-choice';
            
            if (questionType === 'identification') {
                // For identification questions, check text input
                const input = document.querySelector(`textarea[name="q${index}"]`);
                if (!input || !input.value.trim()) {
                    unansweredQuestions.push(index + 1);
                } else {
                    // Case-insensitive comparison with the correct answer
                    const userAnswer = input.value.trim().toLowerCase();
                    const correctAnswer = String(question.correctAnswer).toLowerCase();
                    if (userAnswer === correctAnswer) {
                        score++;
                    }
                }
            } else if (questionType === 'multiple-answer') {
                // For multiple-answer questions, check checkboxes
                const checkboxes = document.querySelectorAll(`input[name^="q${index}_opt"]`);
                const selectedOptions = [];
                let hasSelection = false;
                
                checkboxes.forEach((checkbox, optIndex) => {
                    if (checkbox.checked) {
                        hasSelection = true;
                        selectedOptions.push(optIndex);
                    }
                });
                
                if (!hasSelection) {
                    unansweredQuestions.push(index + 1);
                } else {
                    // Check if selected options match correct answers
                    const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                    
                    // Arrays must be the same length and contain the same elements (order doesn't matter)
                    const isCorrect = selectedOptions.length === correctAnswers.length && 
                        selectedOptions.every(opt => correctAnswers.includes(opt)) &&
                        correctAnswers.every(opt => selectedOptions.includes(opt));
                    
                    if (isCorrect) {
                        score++;
                    }
                }
            } else { // multiple-choice
                // For multiple-choice questions, check radio buttons
                const selected = document.querySelector(`input[name="q${index}"]:checked`);
                if (!selected) {
                    unansweredQuestions.push(index + 1);
                } else if (parseInt(selected.value) === question.correctAnswer) {
                    score++;
                }
            }
        });

        if (unansweredQuestions.length > 0) {
            alert(`Please answer all questions. Unanswered questions: ${unansweredQuestions.join(', ')}`);
            return;
        }

        const percentage = Math.round((score / totalQuestions) * 100);
        
        try {
            await saveQuizScore(window.currentLessonId, score, totalQuestions, percentage);
            alert(`Quiz submitted! Your score: ${percentage}%`);
            
            // Close modal
            document.getElementById('quiz-modal').style.display = 'none';
            
            // Refresh the dropdown to show updated score
            await populateLessonDropdown();
            
            // Refresh the lesson display
            const lessonSelector = document.getElementById('lessondrop');
            if (lessonSelector) {
                displayLessonContent(lessonSelector.value);
            }
        } catch (error) {
            alert(error.message || 'Error saving your score');
        }
    } catch (error) {
        console.error('Error handling quiz submission:', error);
        alert('An error occurred while submitting the quiz');
    }
}

// Modal interactions
function setupModalInteractions() {
    const modal = document.getElementById('quiz-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    // Close modal when clicking X
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Function to initialize workbook
async function initializeWorkbook() {
    try {
        // Set up lesson selector
        await populateLessonDropdown();
        
        // Set up lesson selection change
        const lessonSelector = document.getElementById('lessondrop');
        lessonSelector.addEventListener('change', function() {
            displayLessonContent(this.value);
        });
        
        // Display initial lesson if available
        if (lessonSelector.value) {
            displayLessonContent(lessonSelector.value);
        }
        
        // Set up quiz button
        const quizBtn = document.getElementById('take-quiz-btn');
        quizBtn.addEventListener('click', displayQuizModal);
        
        // Set up quiz submission
        const submitBtn = document.getElementById('submit-quiz');
        submitBtn.addEventListener('click', handleQuizSubmit);
        
        // Set up modal interactions
        setupModalInteractions();
        
    } catch (error) {
        console.error('Error initializing workbook:', error);
        alert('Failed to load workbook content');
    }
}

// Initialize the workbook when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeWorkbook); 