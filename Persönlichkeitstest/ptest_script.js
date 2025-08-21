document.addEventListener("DOMContentLoaded", () => {
    const jsonURL = "ptest_json.json";

    let quizData = null;
    let userAnswers = {};

    const quizContainer = document.getElementById("quiz-container");
    const resultDiv = document.getElementById("result");
    const summaryDiv = document.getElementById("answer-summary");
    const emailSection = document.getElementById("email-section");
    const emailInput = document.getElementById("email");
    const emailConfirmation = document.getElementById("email-confirmation");
    const resetBtn = document.getElementById("reset-btn");

    // Quizdaten laden
    function loadQuizData() {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", jsonURL, true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                quizData = JSON.parse(xhr.responseText);
                buildQuiz();
                loadSavedAnswers();
            } else {
                quizContainer.innerHTML = "<p>Fehler beim Laden der Fragen.</p>";
                console.error("Fehler beim Laden der JSON-Datei:", xhr.status);
            }
        };
        xhr.onerror = function() {
            quizContainer.innerHTML = "<p>Netzwerkfehler beim Laden der Fragen.</p>";
            console.error("Netzwerkfehler");
        };
        xhr.send();
    }

    function buildQuiz() {
        quizContainer.innerHTML = "";

        quizData.questions.forEach((q, index) => {
            const questionBlock = document.createElement("div");
            questionBlock.classList.add("question-block");

            const questionText = document.createElement("p");
            questionText.textContent = `${index + 1}. ${q.question}`;
            questionBlock.appendChild(questionText);

            q.answers.forEach((answer) => {
                const label = document.createElement("label");
                label.style.display = "block";

                const input = document.createElement("input");
                input.type = "radio";
                input.name = "question" + index;
                input.value = answer.type;

                input.addEventListener("change", () => {
                    userAnswers[index] = answer.type;
                    saveAnswers();
                });

                label.appendChild(input);
                label.appendChild(document.createTextNode(" " + answer.text));
                questionBlock.appendChild(label);
            });

            quizContainer.appendChild(questionBlock);
        });

        const submitBtn = document.createElement("button");
        submitBtn.textContent = "Test auswerten";
        submitBtn.addEventListener("click", evaluateQuiz);
        quizContainer.appendChild(submitBtn);
    }

    function saveAnswers() {
        localStorage.setItem("lerntypAnswers", JSON.stringify(userAnswers));
    }

    function loadSavedAnswers() {
        const saved = localStorage.getItem("lerntypAnswers");
        if (!saved) return;
        userAnswers = JSON.parse(saved);

        Object.entries(userAnswers).forEach(([qIndex, answerType]) => {
            const selector = `input[name=question${qIndex}][value="${answerType}"]`;
            const input = quizContainer.querySelector(selector);
            if (input) input.checked = true;
        });
    }

    function evaluateQuiz() {
        if (Object.keys(userAnswers).length < quizData.questions.length) {
            alert("Bitte beantworte alle Fragen!");
            return;
        }

        const counts = {};
        Object.values(userAnswers).forEach(type => {
            counts[type] = (counts[type] || 0) + 1;
        });

        let maxType = null;
        let maxCount = 0;
        for (const type in counts) {
            if (counts[type] > maxCount) {
                maxCount = counts[type];
                maxType = type;
            }
        }

        const resultText = quizData.results[maxType] || "Keine eindeutige Zuordnung möglich.";
        resultDiv.textContent = resultText;
        resultDiv.classList.remove("hidden");

        summaryDiv.innerHTML = "<h3>Deine Antworten:</h3><ul>";
        quizData.questions.forEach((q, index) => {
            const selectedType = userAnswers[index];
            const selectedAnswer = q.answers.find(a => a.type === selectedType);
            if (selectedAnswer) {
                summaryDiv.innerHTML += `<li><strong>${q.question}</strong><br>${selectedAnswer.text} (${selectedType})</li>`;
            }
        });
        summaryDiv.innerHTML += "</ul>";
        summaryDiv.classList.remove("hidden");

        emailSection.classList.remove("hidden");
        resetBtn.classList.remove("hidden");
    }

    // E-Mail absenden
    document.getElementById("submit-email").addEventListener("click", () => {
        const email = emailInput.value;
        if (email.includes("@")) {
            emailConfirmation.classList.remove("hidden");
            localStorage.setItem("userEmail", email);
        } else {
            alert("Bitte gib eine gültige E-Mail-Adresse ein.");
        }
    });

    // Zurücksetzen
    resetBtn.addEventListener("click", () => {
        userAnswers = {};
        localStorage.removeItem("lerntypAnswers");
        localStorage.removeItem("userEmail");

        resultDiv.classList.add("hidden");
        resultDiv.textContent = "";

        summaryDiv.classList.add("hidden");
        summaryDiv.innerHTML = "";

        emailSection.classList.add("hidden");
        emailInput.value = "";
        emailConfirmation.classList.add("hidden");

        resetBtn.classList.add("hidden");

        buildQuiz();
    });

    // Modal-Leadmagnet bei Zurück-zur-Startseite
    document.getElementById("btn-back").addEventListener("click", () => {
        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) {
            document.getElementById("lead-modal").classList.remove("hidden");
        } else {
            window.location.href = "../index.html"; // Pfad zur Startseite anpassen
        }
    });

    document.getElementById("send-lead").addEventListener("click", () => {
        const email = document.getElementById("lead-email").value;
        if (email.includes("@")) {
            localStorage.setItem("userEmail", email);
            alert("Danke! Du erhältst bald dein individuelles Lern-Ergebnis.");
            window.location.href = "../index.html";
        } else {
            alert("Bitte gültige E-Mail eingeben.");
        }
    });

    document.getElementById("skip-lead").addEventListener("click", () => {
        window.location.href = "../index.html";
    });

    loadQuizData();
});