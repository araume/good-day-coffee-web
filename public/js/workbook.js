// Function to fetch lessons from the backend
async function fetchLessons() {
    try {
        const response = await fetch('/api/lessons', {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Failed to fetch lessons');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return [];
    }
}

// Function to fetch user's quiz scores
async function fetchQuizScores() {
    try {
        const response = await fetch('/api/quiz-scores', {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Failed to fetch quiz scores');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching quiz scores:', error);
        return [];
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
    const dropdown = document.getElementById('lessondrop');
    dropdown.innerHTML = ''; // Clear existing options
    
    const lessons = await fetchLessons();
    const scores = await fetchQuizScores();
    
    if (lessons.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No lessons available';
        dropdown.appendChild(option);
        return;
    }
    
    lessons.forEach(lesson => {
        const option = document.createElement('option');
        option.value = lesson._id;
        const score = scores.find(s => s.lessonId._id === lesson._id);
        option.textContent = `${lesson.title}${score ? ` (Score: ${score.percentage}%)` : ''}`;
        dropdown.appendChild(option);
    });
}

// Function to fetch a single lesson
async function fetchLesson(lessonId) {
    try {
        const response = await fetch(`/api/lessons/${lessonId}`, {
            credentials: 'include'
        });
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
    const quizSection = document.querySelector('.quiz-questions');
    
    if (!lessonId) {
        contentArea.innerHTML = '<p>Please select a lesson</p>';
        quizSection.innerHTML = '';
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
        displayQuiz(lesson.quiz, lessonId);
    } else {
        contentArea.innerHTML = '<p>Error loading lesson content</p>';
        quizSection.innerHTML = '';
    }
}

// Function to display quiz questions
async function displayQuiz(quiz, lessonId) {
    const quizSection = document.querySelector('.quiz-questions');
    quizSection.innerHTML = '';
    
    if (!quiz || quiz.length === 0) {
        quizSection.innerHTML = '<p>No quiz available for this lesson</p>';
        return;
    }

    // Fetch previous score if exists
    try {
        const response = await fetch(`/api/quiz-scores/${lessonId}`);
        if (response.ok) {
            const score = await response.json();
            quizSection.innerHTML += `
                <div class="previous-score">
                    <h4>Previous Score: ${score.percentage}%</h4>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching previous score:', error);
    }
    
    quiz.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        questionDiv.innerHTML = `
            <p>${index + 1}. ${question.question}</p>
            ${question.options.map((option, optIndex) => `
                <label>
                    <input type="radio" name="q${index}" value="${optIndex}">
                    ${option}
                </label>
            `).join('')}
        `;
        quizSection.appendChild(questionDiv);
    });
}

// Function to handle quiz submission
function handleQuizSubmit() {
    const submitBtn = document.getElementById('submit-quiz');
    submitBtn.addEventListener('click', async () => {
        try {
            const currentLesson = document.getElementById('lessondrop').value;
            if (!currentLesson) {
                alert('Please select a lesson first');
                return;
            }
            
            const lesson = await fetchLesson(currentLesson);
            if (!lesson || !lesson.quiz) {
                alert('No quiz available for this lesson');
                return;
            }
            
            let score = 0;
            const totalQuestions = lesson.quiz.length;
            
            // Check if all questions are answered
            let unansweredQuestions = [];
            lesson.quiz.forEach((question, index) => {
                const selected = document.querySelector(`input[name="q${index}"]:checked`);
                if (!selected) {
                    unansweredQuestions.push(index + 1);
                } else if (parseInt(selected.value) === question.correctAnswer) {
                    score++;
                }
            });

            if (unansweredQuestions.length > 0) {
                alert(`Please answer all questions before submitting. Unanswered questions: ${unansweredQuestions.join(', ')}`);
                return;
            }
            
            const percentage = (score / totalQuestions) * 100;
            
            // Save the quiz score
            const savedScore = await saveQuizScore(currentLesson, score, totalQuestions, percentage);
            
            if (savedScore) {
                alert(`Your score: ${score}/${totalQuestions} (${percentage.toFixed(1)}%)\nScore saved successfully!`);
                // Refresh the dropdown to show updated scores
                await populateLessonDropdown();
                // Refresh the quiz display to show the new score
                displayQuiz(lesson.quiz, currentLesson);
            }
        } catch (error) {
            if (error.message.includes('not authenticated')) {
                alert('Please log in to save your quiz score');
                window.location.href = '/index.html';
            } else if (error.message.includes('already exists')) {
                alert('You have already completed this quiz');
            } else {
                alert(`Error saving your score: ${error.message}`);
            }
        }
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    await populateLessonDropdown();
    
    // Add event listener for lesson selection
    document.getElementById('lessondrop').addEventListener('change', (e) => {
        displayLessonContent(e.target.value);
    });
    
    // Add event listener for quiz submission
    handleQuizSubmit();
    
    // Display first lesson by default if available
    const firstLesson = document.getElementById('lessondrop').value;
    if (firstLesson) {
        displayLessonContent(firstLesson);
    }
}); 