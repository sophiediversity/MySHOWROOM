

// hier speicher ich die Vorlagen(Templates) aus der JSON-Datei

let solutionTemplates = {};

//templates.json laden

async function loadTemplates() {
    try {
        //JSON-Datei vom Server abrufen
        const response = await fetch('templates.json');
        //in ein JavaScript-Objekt umwandeln
        solutionTemplates = await response.json();
    } catch (error) {
        //Falls etwas schiefgeht, Fehler in der Konsole aneignen
        console.error("Fehler beim Laden der Templates:", error);
    }
}

//Diese Funktion erzeugt die Lösung für den User

function generateSolution() {
    //Eingabe vom Textfeld (Thema) holen
    const thema = document.getElementById('thema').value.trim();

    //Ausgewählte Radio-Option (Herausforderung) holen
    const selectedReason = document.querySelector('input[name="reason"]:checked');

    //Aufforderung, wenn kein Thema eingegeben wird
    
    if (!thema) {
        alert('Bitte geben Sie ein Lernthema ein.');
        return;
    }

    //Aufforderung, wenn keine Herausforderung eingegeben wird
    
    if (!selectedReason) {
        alert('Bitte wählen Sie eine Hauptherausforderung aus.');
        return;
    }
    // Passendes Template aus der JSON nehmen (z.B."Motivation, Zeitmangel")

    const template = solutionTemplates[selectedReason.value];

    //Platzhalter <%thema%> im Template durch das tatsächlihe Thema ersetzen

    const solution = template.replace(/<%thema%>/g, thema);

    // Wo die Lösung im HTML angezeigt wird
    
    const outputContent = document.getElementById('output-content');
    const outputSection = document.getElementById('result');

//Formatieren der Lösung
// Überschriften in h2 umwandeln
// Aufzählungspunkte in <li> setzen
// Absätze mit  <p> markieren
// Listen <ul> sauber öffnen und schließen
    
    const formattedSolution = solution
        .replace(/^\s*(.+?):/m, '<h2>$1</h2>')
        .replace(/- (.*?)(?=\n|$)/g, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^\s*<li>/gm, (match, offset, string) => {
            const prevChar = string[offset - 1];
            return (prevChar === '>' || offset === 0) ? '<ul><li>' : match;
        })
        .replace(/<\/li>\s*(?!<li>)/g, '</li></ul>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/<p><ul>/g, '<ul>')
        .replace(/<\/ul><\/p>/g, '</ul>')
        .replace(/<p>\s*<\/p>/g, '');

        //Formatierte Lösung ins HTML einfügen

    outputContent.innerHTML = formattedSolution;

    //Ergebnisbereich sichtbar machen
    outputSection.style.display = 'block';
    // Automatisch zum Ergebnis scrollen (schöne User Experience)
    outputSection.scrollIntoView({ behavior: 'smooth' });
}

// Wenn User:in im Textfeld "Enter" drückt, dann Lösung generieren

document.getElementById('thema').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generateSolution();
    }
});

// JSON beim Laden einlesen
loadTemplates();
