document.addEventListener('DOMContentLoaded', () => {
    let questionCounter = 1;
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('addQuestion').addEventListener('click', () => {
        const questionsContainer = document.getElementById('questions');
        questionsContainer.insertAdjacentHTML('beforeend', 
            questionTemplate.createQuestionHTML(questionCounter)
        );
        const newCard = questionsContainer.lastElementChild;
        questionTemplate.initializeEditor(newCard);
        questionCounter++;
    });
    document.getElementById('generateJson').addEventListener('click', generateJson);
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const testData = JSON.parse(e.target.result);
            loadTestData(testData);
        } catch (error) {
            alert('Fehler beim Lesen der Datei. Bitte überprüfen Sie das JSON-Format.');
            console.error('Error parsing JSON:', error);
        }
    };
    reader.readAsText(file);
}

function loadTestData(testData) {
    document.getElementById('questions').innerHTML = '';
    document.getElementById('title').value = testData.title || '';
    document.getElementById('time').value = testData.time || '';

    testData.tasks.forEach((task, index) => {
        const questionsContainer = document.getElementById('questions');
        questionsContainer.insertAdjacentHTML('beforeend', 
            questionTemplate.createQuestionHTML(index + 1)
        );

        const questionCard = questionsContainer.lastElementChild;
        questionTemplate.initializeEditor(questionCard);
        questionCard.querySelector('.question-type').value = task.type;
        
        const questionEditor = questionCard.querySelector('.rich-text-editor');
        if (questionEditor) {
            questionEditor.querySelector('.editor-content').innerHTML = 
                textFormatter.markdownToHtml(task.question);
            questionEditor.querySelector('input[type="hidden"]').value = task.question;
        }

        questionCard.querySelector('.points').value = task.points;

        if (task.type === 'single' || task.type === 'multiple') {
            const answersContainer = questionCard.querySelector('.answers-container');
            task.answers.forEach(answer => {
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
                answersContainer.appendChild(answerRow);
                const answerContainer = answerRow.querySelector('.answer-text').parentElement;
                const editor = textFormatter.createEditor(answerContainer);
                editor.setValue(answer);
            });
        }

        questionTemplate.handleTypeChange(questionCard.querySelector('.question-type'));
    });
}

function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-card');
    questions.forEach((card, index) => {
        const number = index + 1;
        card.querySelector('.question-number').textContent = `Frage ${number}`;
        card.dataset.question = number;
    });
}

function generateJson() {
    const title = document.getElementById('title').value;
    const time = parseInt(document.getElementById('time').value);

    if (!title || !time) {
        alert('Bitte Titel und Zeit ausfüllen!');
        return;
    }

    const testData = {
        title: title,
        time: time,
        tasks: []
    };

    const questionCards = document.querySelectorAll('.question-card');
    
    for (const [index, card] of questionCards.entries()) {
        const type = card.querySelector('.question-type').value;
        const questionInput = card.querySelector('.rich-text-editor input[type="hidden"]');
        const points = parseInt(card.querySelector('.points').value);

        if (!questionInput?.value || !points) {
            alert('Bitte alle Pflichtfelder ausfüllen!');
            return;
        }

        const task = {
            nr: index + 1,
            type: type,
            question: questionInput.value,
            points: points
        };

        if (type === 'single' || type === 'multiple') {
            const answers = [];
            card.querySelectorAll('.answer-row').forEach(row => {
                const answerInput = row.querySelector('.rich-text-editor input[type="hidden"]');
                if (answerInput?.value) {
                    answers.push(answerInput.value);
                }
            });

            if (answers.length < 2) {
                alert('Multiple-Choice-Fragen benötigen mindestens 2 Antworten!');
                return;
            }

            task.answers = answers;
        }

        testData.tasks.push(task);
    }

    if (testData.tasks.length === 0) {
        alert('Bitte mindestens eine Frage hinzufügen!');
        return;
    }

    const blob = new Blob([JSON.stringify(testData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}