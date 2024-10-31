let currentStage = 0;
let correctAnswers = 0;
let stages = [];
let currentBubbleIndex = 0;
let selectedGender = '';
let maleStages = [];
let femaleStages = [];

fetch('scenarios.json')
    .then(response => response.json())
    .then(data => {
        maleStages = data.maleStages;
        femaleStages = data.femaleStages;
    })
    .catch(error => {
        console.error("JSONファイルの読み込みに失敗しました:", error);
    });

document.getElementById('maleButton').onclick = () => {
    selectedGender = 'male';
    updateSelectedButton('maleButton', 'femaleButton');
};

document.getElementById('femaleButton').onclick = () => {
    selectedGender = 'female';
    updateSelectedButton('femaleButton', 'maleButton');
};

function updateSelectedButton(selectedId, otherId) {
    const selectedButton = document.getElementById(selectedId);
    const otherButton = document.getElementById(otherId);

    selectedButton.classList.add('selected');
    otherButton.classList.remove('selected');
}


document.getElementById('startButton').onclick = () => {
    if (selectedGender === 'male') {
        stages = maleStages;
    } else if (selectedGender === 'female') {
        stages = femaleStages;
    }
    switchScreen('startScreen', 'gameScreen');
    loadStage(stages[currentStage]);
};

function switchScreen(hideScreenId, showScreenId) {
    document.getElementById(hideScreenId).classList.remove('active');
    document.getElementById(showScreenId).classList.add('active');
}

function loadStage(stage) {
    document.getElementById('scenarioTitle').textContent = stage.title;
    document.getElementById('scenarioDescription').textContent = stage.description;
    document.getElementById('characterImage').src = stage.image;
    
    const playerName = document.getElementById('playerName').value;
    const responseText = stage.response.replace("{name}", playerName);
    document.getElementById('response').textContent = responseText;

    document.getElementById('stageNumber').textContent = `ステージ ${currentStage + 1}`;
    
    const bubbles = [document.getElementById('bubble1'), document.getElementById('bubble2'), document.getElementById('bubble3')];
    bubbles.forEach((bubble, index) => {
        const bubbleText = stage.bubbles[index].replace("{name}", playerName);
        bubble.textContent = bubbleText;
        bubble.style.display = 'none';
    });
    currentBubbleIndex = 0;

    document.getElementById('feedback').textContent = '';
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    const randomizedOptions = [...stage.options].sort(() => Math.random() - 0.5);
    randomizedOptions.forEach((optionText, index) => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = optionText;
        button.onclick = () => selectOption(index, stage.feedback[stage.options.indexOf(optionText)]);
        optionsContainer.appendChild(button);
    });

    resetEventHandlers();
}



document.getElementById('imageArea').onclick = () => {
    const bubbles = [document.getElementById('bubble1'), document.getElementById('bubble2'), document.getElementById('bubble3')];
    if (currentBubbleIndex < bubbles.length) {
        bubbles[currentBubbleIndex].style.display = 'block';
        currentBubbleIndex++;
    }
};

function selectOption(optionIndex, feedback) {
    const options = document.querySelectorAll('.option');
    const currentCorrectAnswers = stages[currentStage].correctAnswer;
    const selectedAnswer = options[optionIndex].textContent;

    const correctMark = document.getElementById('correctMark');
    const incorrectMark = document.getElementById('incorrectMark');

    const stage = stages[currentStage];
    correctMark.src = stage.correctImage;
    incorrectMark.src = stage.incorrectImage;

    options.forEach((option, idx) => {
        if (idx === optionIndex) {
            if (currentCorrectAnswers.includes(selectedAnswer)) {
                option.classList.add('correct-animation');
                correctMark.style.display = 'block';
                correctMark.classList.add('correct-animation-mark');
                
                setTimeout(() => {
                    correctMark.style.display = 'none';
                    correctMark.classList.remove('correct-animation-mark');
                }, 1000);

                if (!option.classList.contains('counted')) {
                    correctAnswers++;
                    option.classList.add('counted');
                }
            } else {
                option.classList.add('incorrect-animation');
                incorrectMark.style.display = 'block';
                incorrectMark.classList.add('incorrect-animation-mark');
                
                setTimeout(() => {
                    incorrectMark.style.display = 'none';
                    incorrectMark.classList.remove('incorrect-animation-mark');
                }, 1000);
            }
        }
    });

    document.getElementById('feedback').textContent = feedback;
    document.getElementById('nextStageButton').style.display = 'block';
}





document.getElementById('backButton').onclick = () => {
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('correct-animation', 'incorrect-animation');
        option.disabled = false;
    });

    document.getElementById('feedback').textContent = '';
    document.getElementById('nextStageButton').style.display = 'none';

    const bubbles = [document.getElementById('bubble1'), document.getElementById('bubble2'), document.getElementById('bubble3')];
    bubbles.forEach(bubble => {
        bubble.style.display = 'none';
    });

    currentBubbleIndex = 0; 
};


document.getElementById('nextStageButton').onclick = () => {
    currentStage++;
    if (currentStage < stages.length) {
        loadStage(stages[currentStage]);
        document.getElementById('nextStageButton').style.display = 'none';
    } else {
        showEndingScreen();
    }
};

function showEndingScreen() {
    switchScreen('gameScreen', 'endingScreen');
    const totalStages = stages.length;
    const scoreSummary = `全 ${totalStages} ステージ中、${correctAnswers} ステージ正解しました。`;
    document.getElementById('scoreSummary').textContent = scoreSummary;
}



document.getElementById('retryButton').onclick = () => {
    currentStage = 0;
    correctAnswers = 0;
    currentBubbleIndex = 0;

    switchScreen('endingScreen', 'startScreen');
    document.getElementById('nextStageButton').style.display = 'none';
    document.getElementById('feedback').textContent = '';
};


function resetEventHandlers() {
    document.getElementById('imageArea').onclick = () => {
        const bubbles = [document.getElementById('bubble1'), document.getElementById('bubble2'), document.getElementById('bubble3')];
        if (currentBubbleIndex < bubbles.length) {
            const bubble = bubbles[currentBubbleIndex];
            bubble.style.display = 'block';

            const isLeft = currentBubbleIndex % 2 === 0;
            bubble.classList.toggle('left', isLeft);
            bubble.classList.toggle('right', !isLeft);

            const topOffset = currentBubbleIndex * 80;
            bubble.style.top = `${topOffset}px`;

            currentBubbleIndex++;
        }
    };
}
