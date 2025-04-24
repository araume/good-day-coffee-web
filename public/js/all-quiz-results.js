document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderResults();
    document.querySelector('.search-btn').addEventListener('click', handleSearch);
    document.getElementById('result-search').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
});

async function fetchAndRenderResults(query = '') {
    const tbody = document.getElementById('results-tbody');
    tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
    try {
        const res = await fetch(`/api/quiz-scores/all${query ? '?q=' + encodeURIComponent(query) : ''}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch results');
        const results = await res.json();
        if (!Array.isArray(results) || results.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No results found.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        results.forEach((result, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${result.userId?.name || result.userId?.email || 'Unknown'}</td>
                <td>${result.lessonId?.title || 'Unknown'}</td>
                <td>${new Date(result.createdAt || result.completedAt).toLocaleString()}</td>
                <td>${result.score}/${result.totalQuestions} (${result.percentage}%)</td>
                <td><button class="view-details-btn" data-idx="${idx}">View Details</button></td>
            `;
            tbody.appendChild(tr);
        });
        // Attach event listeners for all view details buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                showQuizDetailsModal(results[idx]);
            });
        });
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5">Error: ${err.message}</td></tr>`;
    }
}

function showQuizDetailsModal(result) {
    const modal = document.getElementById('quiz-details-modal');
    document.getElementById('modal-user').textContent = `User: ${result.userId?.name || result.userId?.email || 'Unknown'}`;
    document.getElementById('modal-lesson').textContent = `Lesson: ${result.lessonId?.title || 'Unknown'}`;
    document.getElementById('modal-score').textContent = `Score: ${result.score}/${result.totalQuestions} (${result.percentage}%)`;
    document.getElementById('modal-date').textContent = `Date: ${new Date(result.createdAt || result.completedAt).toLocaleString()}`;
    const answersDiv = document.getElementById('modal-answers');
    answersDiv.innerHTML = '';
    if (!Array.isArray(result.answers) || !Array.isArray(result.lessonId?.quiz)) {
        answersDiv.textContent = 'No answer details.';
    } else {
        result.lessonId.quiz.forEach((q, i) => {
            const userAns = result.answers[i];
            const wrapper = document.createElement('div');
            wrapper.className = 'result-item ' + (userAns?.isCorrect ? 'correct' : 'incorrect');
            let html = `<div class="result-question">Q${i+1}: ${q.question}</div>`;
            html += `<div class="result-status ${userAns?.isCorrect ? 'correct-status' : 'incorrect-status'}">${userAns?.isCorrect ? 'Correct' : 'Incorrect'}</div>`;
            // Render answers for all types
            let userAnswerDisplay = '—';
            let correctAnswerDisplay = '—';
            if (q.type === 'multiple-answer') {
                userAnswerDisplay = Array.isArray(userAns?.userAnswer) ? userAns.userAnswer.join(', ') : (userAns?.userAnswer ?? '—');
                correctAnswerDisplay = Array.isArray(userAns?.correctAnswer) ? userAns.correctAnswer.join(', ') : (userAns?.correctAnswer ?? '—');
            } else {
                userAnswerDisplay = (userAns?.userAnswer ?? '—').toString();
                correctAnswerDisplay = (userAns?.correctAnswer ?? '—').toString();
            }
            html += `<div class="result-answer">Your answer: ${userAnswerDisplay}</div>`;
            if (!userAns?.isCorrect) {
                html += `<div class="correct-answer">Correct answer: ${correctAnswerDisplay}</div>`;
            }
            wrapper.innerHTML = html;
            answersDiv.appendChild(wrapper);
        });
    }
    modal.style.display = 'block';
    // Close modal logic
    modal.querySelector('.close-modal').onclick = () => { modal.style.display = 'none'; };
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = 'none';
    };
}

function handleSearch() {
    const q = document.getElementById('result-search').value.trim();
    fetchAndRenderResults(q);
} 