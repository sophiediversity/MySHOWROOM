"use strict";

const { jsPDF } = window.jspdf;

// Cookie-Funktionen
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
}

// Elemente
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const levelTitleEl = document.getElementById("level-title");
const userNameInput = document.getElementById("userName");
const downloadCertBtn = document.getElementById("downloadCertBtn");

// Quizstatus
let quizData = [];
let currentLevel = 1;
let currentQuestion = 0;
let score = 0; // Gesamtpunktzahl (für alle Levels)
let levelScore = 0; // Punktzahl im aktuellen Level

//diese zusammenfassende Funktion wartet nur darauf, dass quizData später (beim Laden der JSON-Datei) mit Inhalt gefüllt wird. Deswegen kann sie ganz oben stehen, 
//obwohl wie erst ganz am Ende ausgeführt wird:

function getTotalQuestions() {
    return quizData.reduce((sum, level) => sum + level.questions.length, 0);
}

function updateProgressBar() {
    const totalQuestions = getTotalQuestions();
    const currentQuestionNumber = quizData
        .slice(0, currentLevel - 1)
        .reduce((sum, level) => sum + level.questions.length, 0) + currentQuestion + 1;

    const progressPercent = (currentQuestionNumber / totalQuestions) * 100;

    document.getElementById("progress-bar").style.width = `${progressPercent}%`;
    document.getElementById("score-display").innerText = `Frage ${currentQuestionNumber} von ${totalQuestions}`;
}



//Ab hier sind die Funktionen für das Quiz gelistet. Die Quizdaten werden dynamisch über AJAX geladen.

function loadQuizData(callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "abschluss_quiz_2.json", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            quizData = JSON.parse(xhr.responseText);
            callback();
        }
    };
    xhr.send();
}

function loadQuestion() {
    const level = quizData.find(l => l.level === currentLevel);
    const questionData = level.questions[currentQuestion];

    levelTitleEl.innerText = `Level ${level.level}: ${level.title}`;
    questionEl.innerText = questionData.question;
    optionsEl.innerHTML = "";
    nextBtn.disabled = true;

    questionData.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.classList.add("option-btn");
        btn.onclick = () => selectAnswer(index);
        optionsEl.appendChild(btn);
    });
}

function selectAnswer(index) {
    const level = quizData.find(l => l.level === currentLevel);
    const questionData = level.questions[currentQuestion];
    const isCorrect = index === questionData.answer;
    const buttons = document.querySelectorAll(".option-btn");

    buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === questionData.answer) {
            btn.classList.add("correct");
        } else if (i === index) {
            btn.classList.add("wrong");
        }
    });

    if (isCorrect) {
        score++;
        levelScore++;
    }

    nextBtn.disabled = false;

}

function showCustomAlert(message, avatarUrl = "avatar.png", callback = null) {
    const modal = document.getElementById("custom-alert");
    const avatarImg = document.getElementById("avatar-img");
    const messageText = document.getElementById("modal-message");
    const okBtn = document.getElementById("modal-ok-btn");

    avatarImg.src = avatarUrl;
    messageText.innerText = message;
    modal.classList.remove("hidden");

    okBtn.onclick = () => {
        modal.classList.add("hidden");
        if (callback) callback(); // ✅ WICHTIG: mach erst dann weiter
    };
}

function showFinalCompletion() {
    const modal = document.getElementById("custom-alert");
    const avatarImg = document.getElementById("avatar-img");
    const messageText = document.getElementById("modal-message");

    avatarImg.src = "avatar_final.png";
    messageText.innerHTML = `
        🎉 <strong>Herzlichen Glückwunsch!</strong><br>
        Du hast alle Levels erfolgreich abgeschlossen.<br><br>
        Du kannst jetzt dein Zertifikat herunterladen.
    `;

    // ✅ Zertifikatsbereich dauerhaft sichtbar machen
    document.getElementById("certificate-section").classList.remove("hidden");

    modal.classList.remove("hidden");

    // OK-Button schließt nur das Fenster – nicht den Zertifikatszugang
    const okBtn = document.getElementById("modal-ok-btn");
    okBtn.onclick = () => {
        modal.classList.add("hidden");

        // Scrolle zum Zertifikatsformular
        document.getElementById("certificate-section").scrollIntoView({ behavior: "smooth" });
    };
}


// Diesen EventListener habe ich nachträglich überarbeitet. Das nächste Level sollte erst starten, 
// wenn die Hälfte der Antworten richtig ist. Falsche Antworten sollten dann wiederholt werden.

nextBtn.addEventListener("click", () => {
    const level = quizData.find(l => l.level === currentLevel);
    const avatar = level.avatar;
    const happyAvatar = level.avatarSuccess;
    const sadAvatar = level.avatarFail;

    currentQuestion++;

    if (currentQuestion < level.questions.length) {
        loadQuestion();
    } else {
        const total = level.questions.length;
        const correct = levelScore;
        const passed = correct >= Math.ceil(total / 2);

        if (passed) {
            showCustomAlert(`✅ Level ${currentLevel} abgeschlossen! Du hast ${correct} von ${total} richtig.`, happyAvatar);

            levelScore = 0;
            currentLevel++;
            currentQuestion = 0;

            const nextLevel = quizData.find(l => l.level === currentLevel);
            if (nextLevel) {
                loadQuestion();
            } else {
                // ✅ Letztes Level bestanden → Finaler Abschluss
                showCustomAlert(
                    `✅ Level ${currentLevel} abgeschlossen! Du hast ${correct} von ${total} richtig.`,
                    happyAvatar,
                    () => {
                        showFinalCompletion();
                    }
                );
            }


        } else {
            showCustomAlert(`❌ Nur ${correct} von ${total} richtig. Versuche es nochmal.`, sadAvatar);

            levelScore = 0;
            currentQuestion = 0;
            loadQuestion(); // Level neu starten
        }
    }
});

//hier war eine doppelte Funktion




// Zertifikat anzeigen
function showCertificate() {
    alert("Alle Levels abgeschlossen! Du kannst jetzt dein Zertifikat herunterladen.");
    document.getElementById("certificate-section").scrollIntoView({ behavior: "smooth" });
}

// Zertifikat generieren
downloadCertBtn.addEventListener("click", () => {
    const name = userNameInput.value.trim();
    if (!name) {
        alert("Bitte gib deinen Namen ein.");
        return;
    }

    setCookie("quizName", name, 30);
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Zertifikat für selbstorganisiertes Lernen", 20, 30);
    doc.setFontSize(16);
    doc.text(`Dieses Zertifikat bestätigt, dass`, 20, 50);
    doc.setFontSize(20);
    doc.text(name, 20, 70);
    doc.setFontSize(16);
    doc.text("erfolgreich das Level-Up Quiz absolviert hat.", 20, 90);
    doc.setFontSize(12);
    doc.text(`Ausgestellt am: ${new Date().toLocaleDateString()}`, 20, 110);
    doc.setFontSize(14);
    doc.text("Individuelle Lernempfehlungen:", 20, 130);
    doc.setFontSize(12);
    doc.text("- Nutze Mindmaps, Lernvideos und Farbcodes", 20, 140);
    doc.text("- Wiederhole Inhalte regelmäßig", 20, 150);
    doc.text("- Plane Pausen für das Langzeitgedächtnis ein", 20, 160);
    doc.save("Zertifikat.pdf");
});

// Cookie beim Laden vorfüllen und Quiz starten
window.addEventListener("DOMContentLoaded", () => {
    const savedName = getCookie("quizName");
    if (savedName) {
        userNameInput.value = savedName;
    }

    loadQuizData(() => loadQuestion());
});
//Zurückbutton nachträglich eingefügt

document.getElementById("restart-btn").addEventListener("click", () => {
    currentLevel = 1;
    currentQuestion = 0;
    score = 0;
    levelScore = 0;

    document.getElementById("certificate-section").classList.add("hidden");
    document.getElementById("quiz-container").classList.remove("hidden");

    loadQuestion();

    function loadQuestion() {
        // ...
        nextBtn.disabled = true;
        // ...
        updateProgressBar(); // 👈 Am Ende aufrufen
    }



});

function updateProgressBar() {
    const totalQuestions = getTotalQuestions();
    const currentQuestionNumber = quizData
        .slice(0, currentLevel - 1)
        .reduce((sum, level) => sum + level.questions.length, 0) + currentQuestion + 1;

    const progressPercent = (currentQuestionNumber / totalQuestions) * 100;

    document.getElementById("progress-bar").style.width = `${progressPercent}%`;
    document.getElementById("score-display").innerText = `Frage ${currentQuestionNumber} von ${totalQuestions}`;
}

function loadQuestion() {
    const level = quizData.find(l => l.level === currentLevel);
    const questionData = level.questions[currentQuestion];

    levelTitleEl.innerText = `Level ${level.level}: ${level.title}`;
    questionEl.innerText = questionData.question;
    optionsEl.innerHTML = "";
    nextBtn.disabled = true;

    questionData.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.classList.add("option-btn");
        btn.onclick = () => selectAnswer(index);
        optionsEl.appendChild(btn);
    });

    // 👉 Fortschrittsbalken aktualisieren
    updateProgressBar();
}