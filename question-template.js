const questionTemplate = {
    createQuestionHTML(questionNumber) {
        return `
            <div class="question-card" data-question="${questionNumber}">
                <h3><span class="question-number">Frage ${questionNumber}</span></h3>
                
                <div class="form-group">
                    <label>Fragetyp:</label>
                    <select class="question-type" onchange="questionTemplate.handleTypeChange(this)">
                        <option value="single">Multiple Choice (eine Antwort)</option>
                        <option value="multiple">Multiple Choice (mehrere Antworten)</option>
                        <option value="short">Kurze Textantwort</option>
                        <option value="long">Lange Textantwort (Essay)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Frage:</label>
                    <div class="editor-container">
                        <input type="text" class="question-text" required>
                    </div>
                </div>

                <div class="form-group answers-section">
                    <div class="answers-container"></div>
                    <button type="button" class="btn-add add-answer" onclick="questionTemplate.addAnswer(this)">
                        Antwort hinzufügen
                    </button>
                </div>

                <div class="form-group">
                    <label>Punkte:</label>
                    <input type="number" class="points" min="1" required>
                </div>

                <button type="button" class="btn-remove" onclick="questionTemplate.removeQuestion(this)">
                    Frage entfernen
                </button>
            </div>
        `;
    },

    initializeEditor(questionCard) {
        // Initialize rich text editor for question
        const questionContainer = questionCard.querySelector('.question-text').parentElement;
        textFormatter.createEditor(questionContainer);
    },

    handleTypeChange(select) {
        const questionCard = select.closest('.question-card');
        const answersSection = questionCard.querySelector('.answers-section');
        
        if (select.value === 'short' || select.value === 'long') {
            answersSection.style.display = 'none';
        } else {
            answersSection.style.display = 'block';
        }
    },

    addAnswer(button) {
        const container = button.previousElementSibling;
        const answerRow = document.createElement('div');
        answerRow.className = 'answer-row';
        answerRow.innerHTML = `
            <div class="editor-container">
                <input type="text" class="answer-text" required>
            </div>
            <button type="button" class="btn-remove" onclick="questionTemplate.removeAnswer(this)">
                Entfernen
            </button>
        `;
        container.appendChild(answerRow);
        
        // Initialize editor for new answer
        const answerContainer = answerRow.querySelector('.answer-text').parentElement;
        textFormatter.createEditor(answerContainer);
    },

    removeAnswer(button) {
        button.closest('.answer-row').remove();
    },

    removeQuestion(button) {
        const card = button.closest('.question-card');
        card.remove();
        updateQuestionNumbers();
    }
};