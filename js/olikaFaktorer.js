
let jamforcColumn = [
  "Age", "AcademicPressure", "CGPA", "StudySatisfaction", "WorkStudyHours", "FinancialStress"
];

let jamforcColumn2 = [
  "SleepDuration", "DietaryHabits", "Degree",
  "HaveYouEverHadSuicidalThoughts", "FamilyHistoryMentalIllness"
];

addMdToPage(`
### Sambandsanalys mellan två faktorer

För att bättre förstå vilka faktorer som eventuellt hänger samman med varandra, jämför vi två och två variabler visuellt i så kallade scatterplots (punktdiagram).

Syftet är att identifiera **eventuella samband** – till exempel: påverkar akademisk press betygen (CGPA)? Finns det något mönster mellan ålder och studietid?

Om ett tydligt samband finns bör det synas som ett **lutande mönster i punkterna** – till exempel att högre värde på en axel leder till högre (eller lägre) värde på den andra.
`);

let faktor1 = addDropdown('Faktor 1', jamforcColumn, "Age");
let faktor2 = addDropdown('faktor 2', jamforcColumn, "CGPA");

addMdToPage(`
  ## Sannolikt beroende mellan  ${faktor1} och år ${faktor2}
`);


let dataForChart = await dbQuery(`
  SELECT ${faktor1}, ${faktor2} FROM results
`);

drawGoogleChart({
  type: 'ScatterChart',
  data: makeChartFriendly(dataForChart, `${faktor1}`, `${faktor2}`),
  options: {
    title: 'Age vs. Weight comparison',
    hAxis: { title: faktor1, minValue: 0 },
    vAxis: { title: faktor2, minValue: 0 },
    legend: 'none',
    title: `Sannolikt beroende mellan  ${faktor1} och år ${faktor2}`
  }
});

addMdToPage(`
### Slutsatser från jämförelsen mellan ${faktor1} och ${faktor2}

Oavsett vilka två faktorer vi jämför ser vi liknande mönster: **punkterna är grupperade i vertikala eller horisontella band**, snarare än att bilda ett sammanhängande mönster.

Detta tyder på att:

- **Inga tydliga linjära samband** syns mellan dessa två faktorer.
- Det är möjligt att vissa relationer finns, men de är **icke-linjära eller mer komplexa**, och syns inte i detta diagramformat.

> 💭 *Notis:* För mer avancerad analys kan statistiska metoder som korrelationsberäkning eller regressionsanalys vara nödvändiga.
`);

addMdToPage(`
### Fördelning av kategoriska variabler

För att förstå hur olika livsstils- och bakgrundsfaktorer ser ut bland studenterna analyserar vi deras **fördelning** med hjälp av cirkeldiagram.

Denna typ av visualisering gör det lättare att se:

- Vilket alternativ som är vanligast inom varje kategori
- Om det finns tydliga dominanser eller spridda svar
- Möjliga riskfaktorer (t.ex. mycket kort sömn eller förekomst av självmordstankar)

Välj en faktor i listan för att se hur svaren fördelar sig.
`);

let spridning = addDropdown('Spridning av', jamforcColumn2, "SleepDuration");

let pieSpridning = await dbQuery(`
  SELECT ${spridning}, COUNT(*) AS antal_personer
  FROM results
  GROUP BY ${spridning}
`);


// 4. PIE DIAGRAM ÖVER STÄDER
drawGoogleChart({
  type: 'PieChart',
  data: makeChartFriendly(pieSpridning),
  options: {
    responsive: true,
    height: 400,
    is3D: true,
    chartArea: { left: "0%" }
  }
});

addMdToPage(`
### Vad visar fördelningen?

Vid analys av flera kategoriska faktorer ser vi att de flesta är ganska **jämnt fördelade** – till exempel kostvanor, arbetstid eller familjehistorik.

Men det finns två tydliga undantag:

- 🧠 **Självmordstankar (HaveYouEverHadSuicidalThoughts):**  
  Här uppger **63,3% av deltagarna att de haft självmordstankar**. Det är en mycket hög andel och visar på allvarliga psykologiska påfrestningar bland studenterna.

- 🎓 **Utbildningsnivå (Degree)**

Deltagarna kommer från ett stort antal utbildningsprogram – allt från yrkesutbildningar till högre akademiska examina. Den mest rapporterade nivån är *'Class 12'* (21,8%).

Med tanke på att medelåldern i undersökningen ligger runt **25 år**, är det troligt att många deltagare redan har påbörjat eller avslutat vidareutbildning efter *Class 12*. Det kan därför vara så att:

- Antingen är detta det **senast avslutade programmet** som respondenten valt att ange  
- Eller så är datan begränsad till **förifyllda alternativ** som inte fångar in aktuell utbildning

> 💭 *Notis:* Det är alltså svårt att dra en tydlig slutsats om faktisk utbildningsnivå baserat på denna variabel.

För övriga variabler, såsom sömntid och matvanor, är svaren mer spridda men relativt jämnt fördelade.

> 💭 *Kommentar:* Kombinationen av hög förekomst av självmordstankar och kort sömn kan vara viktiga indikatorer på psykisk ohälsa och bör undersökas vidare.
`);
