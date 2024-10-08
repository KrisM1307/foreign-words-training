const studyMode = document.querySelector('#study-mode');
const examMode = document.querySelector('#exam-mode');
const studyCards = document.querySelector('.study-cards');
const examCards = document.querySelector('#exam-cards');
const flipCard = document.querySelector('.flip-card');
const nextBtn = document.querySelector('#next');
const backBtn = document.querySelector('#back');
const examBtn = document.querySelector('#exam');
const currentWord = document.querySelector('#current-word');
const totalWord = document.querySelector('#total-word');
const wordsProgress = document.querySelector('#words-progress');
const examProgress = document.querySelector('#exam-progress');
const correctPercent = document.querySelector('#correct-percent');
const resultsModal = document.querySelector('.results-modal');
const resultsContent = document.querySelector('.results-content');
const template = document.querySelector('#word-stats');
const shuffleWordsBtn = document.querySelector('#shuffle-words');
const examTimer = document.querySelector('#time');
const timeResult = document.querySelector('#timer');
const words = [
    { foreign: 'Flower', translation: 'Цветок', example: 'The flower has seven petals.' },
    { foreign: 'Plane', translation: 'Самолёт', example: 'The plane landed in Istanbul.' },
    { foreign: 'Night', translation: 'Ночь', example: 'We talked all night long.' },
    { foreign: 'Pronunciation', translation: 'Произношение', example: 'Correct my pronunciation if it is wrong.' },
    { foreign: 'Success', translation: 'Успех', example: 'Success waits on effort.' },
];
let currentIndex = 0;
let timerInterval;
let elapsedTime = 0;
let isStarted = false;
let selectedWord;
let correctAnswers = 0;
let attempts = {};

function init() {
    totalWord.textContent = words.length;
    updateCard();
    createDictionary();
    initializeAttempts();
};

function createDictionary() {
    dictionary = {};
    words.forEach(word => {
        dictionary[word.foreign] = word.translation;
        dictionary[word.translation] = word.foreign;
    });
};

function initializeAttempts() {
    words.forEach(word => {
        attempts[word.foreign] = 0;
    });
};

function updateCard() {
    const word = words[currentIndex];
    document.querySelector('#card-front h1').textContent = word.foreign;
    document.querySelector('#card-back h1').textContent = word.translation;
    document.querySelector('#card-back span').textContent = word.example;
    currentWord.textContent = currentIndex + 1;

    wordsProgress.value = ((currentIndex + 1) / words.length) * 100;

    backBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === words.length - 1;
};

nextBtn.addEventListener('click', () => {
    if (currentIndex < words.length - 1) {
        currentIndex++;
        updateCard();
    }
});

backBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCard();
    }
});

flipCard.addEventListener('click', () => {
    flipCard.classList.toggle('active');
});

shuffleWordsBtn.addEventListener('click', () => {
    words.sort(() => Math.random() - 0.5);
    currentIndex = 0;
    updateCard();
});

examBtn.addEventListener('click', () => {
    studyMode.classList.add('hidden');
    examMode.classList.remove('hidden');
    studyCards.classList.add('hidden');
    examCards.classList.remove('hidden');
    startExamMode();
    if (!isStarted) {
        isStarted = true;
        startExamTimer();
    }
});

function startExamTimer() {
    timerInterval = setInterval(() => {
        elapsedTime++;
        examTimer.textContent = formatTime(elapsedTime);
    }, 1000);
};

function formatTime(totalSeconds) {
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
};

function startExamMode() {
    const shuffledTranslations = [...words].sort(() => Math.random() - 0.5);
    const shuffledForeigns = [...words].sort(() => Math.random() - 0.5);

    examCards.innerHTML = '';
    shuffledTranslations.forEach(word => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.textContent = word.translation;

        card.addEventListener('click', () => {
            if (!card.classList.contains('correct') && !card.classList.contains('wrong')) {
                attempts[word.foreign]++;
                checkMatch(card);
            }
        });

        examCards.append(card);
    });

    shuffledForeigns.forEach(word => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.textContent = word.foreign;

        card.addEventListener('click', () => {
            if (!card.classList.contains('correct') && !card.classList.contains('wrong')) {
                attempts[word.foreign]++;
                checkMatch(card);
            }
        });

        examCards.append(card);
    });
};

function checkMatch(card) {
    if (!selectedWord) {
        selectedWord = card;
        card.classList.add('correct');
    } else {
        if (dictionary[selectedWord.textContent] === card.textContent) {
            card.classList.add('correct');
            selectedWord.classList.add('fade-out');
            card.classList.add('fade-out');
            correctAnswers++;
            updateCorrectPercent();
            selectedWord = null;
            checkCompletion();
        } else {
            card.classList.add('wrong');
            setTimeout(() => {
                selectedWord.classList.remove('correct');
                card.classList.remove('wrong');
                selectedWord = null;
            }, 1000);
        }
    }
};

function checkCompletion() {
    const remainingCards = examCards.querySelectorAll('.card:not(.fade-out)');
    if (remainingCards.length === 0) {
        setTimeout(() => {
            clearInterval(timerInterval);
            isStarted = false;
            showNotification('Поздравляем! Вы успешно завершили проверку знаний!');
            studyMode.classList.add('hidden');
            studyCards.classList.add('hidden');
            examCards.classList.add('hidden');
            showResults();
        }, 1000);
    }
};

function showNotification(message) {
    const notification = document.createElement("div");
    notification.classList.add('notification');
    notification.textContent = message;
    notification.classList.add('success');

    document.body.append(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
};

function updateCorrectPercent() {
    const percents = (correctAnswers / words.length) * 100;
    correctPercent.textContent = `${percents}%`;
    examProgress.value = percents;
};

function showResults() {
    resultsContent.innerHTML = '';
    words.forEach(word => {
        const stats = template.content.cloneNode(true);
        stats.querySelector('.word span').textContent = word.foreign;
        stats.querySelector('.attempts span').textContent = attempts[word.foreign];
        resultsContent.append(stats);
    });
    timeResult.textContent = formatTime(elapsedTime);
    resultsModal.classList.remove('hidden');
};

init();