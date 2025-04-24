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

// Global variables to store quiz results
window.quizResults = {
    lessonTitle: '',
    quizQuestions: [],
    userAnswers: [],
    correctAnswers: [],
    score: 0,
    totalQuestions: 0,
    percentage: 0
};

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
        let userAnswers = [];
        let correctAnswers = [];
        
        window.currentQuiz.forEach((question, index) => {
            const questionType = question.type || 'multiple-choice';
            
            if (questionType === 'identification') {
                // For identification questions, check text input
                const input = document.querySelector(`textarea[name="q${index}"]`);
                if (!input || !input.value.trim()) {
                    unansweredQuestions.push(index + 1);
                } else {
                    // Case-insensitive comparison with the correct answer
                    const userAnswer = input.value.trim();
                    userAnswers.push({
                        questionIndex: index,
                        type: questionType,
                        answer: userAnswer,
                        isCorrect: userAnswer.toLowerCase() === String(question.correctAnswer).toLowerCase()
                    });
                    correctAnswers.push({
                        type: questionType,
                        answer: question.correctAnswer
                    });
                    if (userAnswer.toLowerCase() === String(question.correctAnswer).toLowerCase()) {
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
                    const correctAnswerIndices = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
                    
                    // Arrays must be the same length and contain the same elements (order doesn't matter)
                    const isCorrect = selectedOptions.length === correctAnswerIndices.length && 
                        selectedOptions.every(opt => correctAnswerIndices.includes(opt)) &&
                        correctAnswerIndices.every(opt => selectedOptions.includes(opt));
                    
                    userAnswers.push({
                        questionIndex: index,
                        type: questionType,
                        answer: selectedOptions.map(optIdx => question.options[optIdx]),
                        selectedIndices: selectedOptions,
                        isCorrect: isCorrect
                    });
                    
                    correctAnswers.push({
                        type: questionType,
                        answer: correctAnswerIndices.map(optIdx => question.options[optIdx]),
                        answerIndices: correctAnswerIndices
                    });
                    
                    if (isCorrect) {
                        score++;
                    }
                }
            } else { // multiple-choice
                // For multiple-choice questions, check radio buttons
                const selected = document.querySelector(`input[name="q${index}"]:checked`);
                if (!selected) {
                    unansweredQuestions.push(index + 1);
                } else {
                    const selectedIndex = parseInt(selected.value);
                    const isCorrect = selectedIndex === question.correctAnswer;
                    
                    userAnswers.push({
                        questionIndex: index,
                        type: questionType,
                        answer: question.options[selectedIndex],
                        selectedIndex: selectedIndex,
                        isCorrect: isCorrect
                    });
                    
                    correctAnswers.push({
                        type: questionType,
                        answer: question.options[question.correctAnswer],
                        answerIndex: question.correctAnswer
                    });
                    
                    if (isCorrect) {
                        score++;
                    }
                }
            }
        });

        if (unansweredQuestions.length > 0) {
            alert(`Please answer all questions. Unanswered questions: ${unansweredQuestions.join(', ')}`);
            return;
        }

        const percentage = Math.round((score / totalQuestions) * 100);
        
        // Get lesson title
        const lesson = await fetchLesson(window.currentLessonId);
        const lessonTitle = lesson ? lesson.title : 'Lesson';
        
        // Store results for PDF export
        window.quizResults = {
            lessonTitle,
            quizQuestions: window.currentQuiz,
            userAnswers,
            correctAnswers,
            score,
            totalQuestions,
            percentage
        };
        
        try {
            await saveQuizScore(window.currentLessonId, score, totalQuestions, percentage);
            
            // Close quiz modal
            document.getElementById('quiz-modal').style.display = 'none';
            
            // Show results modal
            displayResultsModal();
            
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

// Function to display results modal
function displayResultsModal() {
    const resultsModal = document.getElementById('results-modal');
    const quizResultsContainer = resultsModal.querySelector('.quiz-results');
    const userScoreElement = document.getElementById('user-score');
    
    // Clear previous content
    quizResultsContainer.innerHTML = '';
    
    // Set user score
    userScoreElement.textContent = `${window.quizResults.score}/${window.quizResults.totalQuestions} (${window.quizResults.percentage}%)`;
    
    // Display each question and answer
    window.quizResults.quizQuestions.forEach((question, index) => {
        const userAnswer = window.quizResults.userAnswers.find(a => a.questionIndex === index);
        if (!userAnswer) return;
        
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${userAnswer.isCorrect ? 'correct' : 'incorrect'}`;
        
        let resultHTML = `
            <div class="result-question">${index + 1}. ${question.question}</div>
            <div class="result-status ${userAnswer.isCorrect ? 'correct-status' : 'incorrect-status'}">
                ${userAnswer.isCorrect ? 'Correct' : 'Incorrect'}
            </div>
        `;
        
        // Add user's answer based on question type
        if (question.type === 'identification') {
            resultHTML += `<div class="result-answer">Your answer: ${userAnswer.answer}</div>`;
            
            if (!userAnswer.isCorrect) {
                resultHTML += `<div class="correct-answer">Correct answer: ${window.quizResults.correctAnswers[index].answer}</div>`;
            }
        } else if (question.type === 'multiple-answer') {
            resultHTML += `<div class="result-answer">Your answer: ${userAnswer.answer.join(', ')}</div>`;
            
            if (!userAnswer.isCorrect) {
                resultHTML += `<div class="correct-answer">Correct answer: ${window.quizResults.correctAnswers[index].answer.join(', ')}</div>`;
            }
        } else { // multiple-choice
            resultHTML += `<div class="result-answer">Your answer: ${userAnswer.answer}</div>`;
            
            if (!userAnswer.isCorrect) {
                resultHTML += `<div class="correct-answer">Correct answer: ${window.quizResults.correctAnswers[index].answer}</div>`;
            }
        }
        
        resultItem.innerHTML = resultHTML;
        quizResultsContainer.appendChild(resultItem);
    });
    
    // Display the modal
    resultsModal.style.display = 'block';
}

// Function to generate and export PDF
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    
    // Create a new PDF document
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // PDF styling variables
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;
    
    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Quiz Results', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Add lesson title
    doc.setFontSize(14);
    doc.text(`Lesson: ${window.quizResults.lessonTitle}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Add score summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const scoreText = `Score: ${window.quizResults.score}/${window.quizResults.totalQuestions} (${window.quizResults.percentage}%)`;
    doc.text(scoreText, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Add date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Date: ${currentDate}`, margin, yPos);
    yPos += 15;
    
    // Draw line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
    
    // Add questions and answers
    doc.setFontSize(12);
    
    window.quizResults.quizQuestions.forEach((question, index) => {
        const userAnswer = window.quizResults.userAnswers.find(a => a.questionIndex === index);
        if (!userAnswer) return;
        
        // Check if we need a new page
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = margin;
        }
        
        // Add question
        doc.setFont('helvetica', 'bold');
        const questionText = `${index + 1}. ${question.question}`;
        const questionLines = doc.splitTextToSize(questionText, contentWidth);
        doc.text(questionLines, margin, yPos);
        yPos += 7 * questionLines.length;
        
        // Add question type
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(`Type: ${formatQuestionType(question.type)}`, margin, yPos);
        yPos += 7;
        
        // Add user's answer
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        let userAnswerText = '';
        if (question.type === 'identification') {
            userAnswerText = `Your answer: ${userAnswer.answer}`;
        } else if (question.type === 'multiple-answer') {
            userAnswerText = `Your answer: ${userAnswer.answer.join(', ')}`;
        } else { // multiple-choice
            userAnswerText = `Your answer: ${userAnswer.answer}`;
        }
        
        const userAnswerLines = doc.splitTextToSize(userAnswerText, contentWidth);
        doc.text(userAnswerLines, margin, yPos);
        yPos += 7 * userAnswerLines.length;
        
        // Add correct/incorrect status
        if (userAnswer.isCorrect) {
            doc.setTextColor(76, 175, 80); // Green
            doc.text('✓ Correct', margin, yPos);
        } else {
            doc.setTextColor(244, 67, 54); // Red
            doc.text('✗ Incorrect', margin, yPos);
            yPos += 7;
            
            // Add correct answer
            let correctAnswerText = '';
            if (question.type === 'identification') {
                correctAnswerText = `Correct answer: ${window.quizResults.correctAnswers[index].answer}`;
            } else if (question.type === 'multiple-answer') {
                correctAnswerText = `Correct answer: ${window.quizResults.correctAnswers[index].answer.join(', ')}`;
            } else { // multiple-choice
                correctAnswerText = `Correct answer: ${window.quizResults.correctAnswers[index].answer}`;
            }
            
            const correctAnswerLines = doc.splitTextToSize(correctAnswerText, contentWidth);
            doc.text(correctAnswerLines, margin, yPos);
            yPos += 7 * correctAnswerLines.length;
        }
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
        yPos += 10;
    });
    
    // Add footer
    const footerText = 'Good Day Coffee - Quiz Results Report';
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Save the PDF
    const fileName = `${window.quizResults.lessonTitle.replace(/\s+/g, '_')}_Quiz_Results.pdf`;
    doc.save(fileName);
}

// Modal interactions for the results modal
function setupResultsModalInteractions() {
    const resultsModal = document.getElementById('results-modal');
    const closeButton = resultsModal.querySelector('.close-modal');
    const closeResultsButton = document.getElementById('close-results');
    const exportPdfButton = document.getElementById('export-pdf');
    
    // Close modal when clicking X
    closeButton.addEventListener('click', () => {
        resultsModal.style.display = 'none';
    });
    
    // Close modal when clicking close button
    closeResultsButton.addEventListener('click', () => {
        resultsModal.style.display = 'none';
    });
    
    // Export to PDF when clicking export button
    exportPdfButton.addEventListener('click', exportToPDF);
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === resultsModal) {
            resultsModal.style.display = 'none';
        }
    });
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
        setupResultsModalInteractions();
        
    } catch (error) {
        console.error('Error initializing workbook:', error);
        alert('Failed to load workbook content');
    }
}

// Initialize the workbook when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeWorkbook); 