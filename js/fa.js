
let data = await dbQuery("SELECT * FROM results");
console.log("Raw data from DB:", data);
// 1. RUBRIK
addMdToPage(`## Psykisk ohälsa bland studerande - analys av en enkätundersökning`);


// 2. LADDA DATA
//let data = await dbQuery("SELECT * FROM results");
let antalKvinnor = data.filter(x => x.Gender == "Female").length;
let antalMan = data.filter(x => x.Gender == "Male").length;
let antalDepression = data.filter(x => x.Depression == 1).length;
let prosentDepression = ((antalDepression * 100) / (data.length)).toFixed(1);

let allCities = await dbQuery(`
  SELECT city AS City, COUNT(*) AS antal_personer
  FROM results
  GROUP BY city
`);
console.log("AllCities raw data:", allCities);
console.table(allCities);

// 3. SAMMANFATTNING (visas före diagram)
addMdToPage(`
## Psykisk ohälsa bland indiska studenter – en första analys

Psykisk ohälsa är ett växande problem bland unga människor världen över, och indiska studenter är inget undantag. Studier under hög press, sociala förväntningar och framtidsoro skapar en vardag som för många känns tung.

För att undersöka hur utbredd psykisk ohälsa är bland studenter i Indien genomförde vi en enkätundersökning. I denna deltog **${antalKvinnor} kvinnor** och **${antalMan} män**, i åldrar mellan **${s.min(data.map(x => x.Age))}** och **${s.max(data.map(x => x.Age))}**, från olika städer i Indien.

### Vad visar resultaten?

Av alla deltagare uppger **${prosentDepression}%** att de känner sig deprimerade – en siffra som visar på ett utbrett psykiskt lidande bland unga vuxna.

Diagrammet nedan visar hur deltagarna är fördelade över olika städer i Indien.
`);
addMdToPage(`
Syftet med att visa fördelningen per stad är att ge en överblick över vilka geografiska områden som är representerade i undersökningen. 

Det hjälper oss att bedöma om resultaten är jämnt spridda över olika delar av landet, eller om vissa städer är överrepresenterade – något som kan påverka tolkningen av datan. 

En bred geografisk spridning stärker trovärdigheten i undersökningen och kan även ge oss möjlighet att identifiera lokala skillnader i psykisk ohälsa.
`);




// 4. PIE DIAGRAM ÖVER STÄDER
drawGoogleChart({
  type: 'PieChart',
  data: makeChartFriendly(allCities, 'City', 'antal_personer'),
  options: {
    title: 'Städer i undersökning',
    responsive: true,
    height: 400,
    is3D: true,
    chartArea: { left: "0%" },
    pieSliceText: 'percentage-and-label',
    tooltip: { trigger: 'focus' }
  }
});


// 5. VISUALISERA MÄTVÄRDEN (TABELLER)

// 5a. Numeriska kolumner – medelvärde
let numericColumns = [
  "Age", "AcademicPressure", "CGPA",
  "StudySatisfaction", "WorkStudyHours", "FinancialStress"
];

let numericResults = numericColumns.map(col => {
  let femaleValues = data.filter(x => x.Gender === "Female").map(x => x[col]).filter(x => !isNaN(x));
  let maleValues = data.filter(x => x.Gender === "Male").map(x => x[col]).filter(x => !isNaN(x));

  let kvinnorsResult = s.mean(femaleValues);
  let mansResult = s.mean(maleValues);

  return {
    kolumnnamn: `${col} (${s.min(data.map(x => x[col]))} – ${s.max(data.map(x => x[col]))})`,
    kvinnor: Number(kvinnorsResult.toFixed(1)),
    man: Number(mansResult.toFixed(1))
  };
});

// Добавляем пояснение
addMdToPage(`
### Könsskillnader i genomsnittliga värden

För att få en djupare förståelse för hur män och kvinnor upplever sin studiesituation har vi jämfört genomsnittsvärden inom flera relevanta områden.

I tabellen nedan visas **både genomsnitt** för kvinnor och män, samt **möjligt värdeintervall** i varje kategori (inom parentes).
`);

tableFromData({
  data: numericResults,
  columnNames: ['Kategori (värdeintervall)', 'Meddelvärde för kvinnor', 'Meddelvärde för man']
});

addMdToPage(`
### Vad kan vi utläsa av tabellen?

Skillnaderna mellan könen är generellt sett små, men vissa mönster kan ändå noteras:

- **Kvinnor rapporterar något högre akademisk press** (*3,2 jämfört med 3,1*), vilket kan tyda på större upplevd prestationsstress.
- **Studieglädjen är marginellt högre hos kvinnor** (*3,0 jämfört med 2,9*), vilket kan visa på en något större tillfredsställelse trots press.
- **Män har något högre CGPA** (*7,7 jämfört med 7,6*), men skillnaden är liten.
- **WorkStudyHours är nästan lika för båda grupperna**, med ett mycket litet övertag för män.
- **Ekonomisk stress är likvärdig** för båda könen (*3,1*), vilket tyder på att det är ett gemensamt problem oavsett kön.

Sammanfattningsvis visar tabellen att könsskillnaderna är små men ändå värda att uppmärksamma – särskilt när det gäller upplevd akademisk press.
`);


// 5b. Icke-numeriska kolumner – typvärde
let nonNumericColumns = [
  "SleepDuration", "DietaryHabits", "Degree",
  "HaveYouEverHadSuicidalThoughts", "FamilyHistoryMentalIllness", "Depression"
];

let nonNumericResults = nonNumericColumns.map(col => {
  let femaleValues = data.filter(x => x.Gender === "Female").map(x => x[col]).filter(x => x != null && x !== "");
  let maleValues = data.filter(x => x.Gender === "Male").map(x => x[col]).filter(x => x != null && x !== "");

  let kvinnorsResult = femaleValues.length > 0 ? s.mode(femaleValues) : "Ingen data";
  let mansResult = maleValues.length > 0 ? s.mode(maleValues) : "Ingen data";

  return {
    kolumnnamn: col,
    kvinnor: kvinnorsResult,
    man: mansResult
  };
});

addMdToPage(`
### Typvärden för kategoriska variabler

Förutom de numeriska värdena är det också viktigt att analysera de vanligaste svaren i kategoriska variabler – till exempel sömnvanor, kosthållning och självmordstankar.

I tabellen nedan visas **typvärden (det vanligaste svaret)** för kvinnor och män inom respektive kategori. Det hjälper oss att identifiera könsspecifika mönster i livsstil, tidigare erfarenheter och psykisk hälsa.
`);


tableFromData({
  data: nonNumericResults,
  columnNames: ['kolumnnamn', 'Typvärde för kvinnor', 'Typvärde för man']
});


// 6. REFLEKTION & SAMMANFATTNING
addMdToPage(`
### Vad kan vi utläsa av typvärdena?

- **Sömnvanor skiljer sig något mellan könen:** kvinnor uppger oftast att de sover *mindre än 5 timmar*, medan män oftare svarar *5–6 timmar*. Det kan tyda på något högre sömnbrist bland kvinnor.
  
- **Kosthållning (DietaryHabits) och utbildningsnivå (Degree)** är lika för båda könen – majoriteten har *måttliga kostvanor* och uppger utbildningsnivån *'Class 12'*.

- **Självmordstankar (HaveYouEverHadSuicidalThoughts)** är lika vanliga i båda grupperna – en allvarlig signal som pekar på ett utbrett psykiskt lidande bland både män och kvinnor.

- **Familjehistorik med psykisk ohälsa (FamilyHistoryMentallIllness)** skiljer sig däremot: kvinnor svarar oftare *nej*, medan män svarar *ja*. Detta kan påverka individens sårbarhet.

  > 💭 * Observera:* Större ärftlig belastning hos män?
Det kan tyda på att fler män än kvinnor i undersökningen har nära anhöriga (t.ex. föräldrar eller syskon) som lidit av psykisk ohälsa, vilket i sin tur kan innebära genetisk eller social sårbarhet.

Större öppenhet att svara ärligt bland män?
Det är också möjligt att män i just detta urval i högre grad erkänner eller känner till sin familjehistoria, medan kvinnor kanske inte känner till lika mycket eller uppger "nej" av osäkerhet eller stigma.

Sociokulturella skillnader i hur man ser på psykisk ohälsa
I vissa familjer kan psykisk ohälsa vara mer synlig eller diskuterad (t.ex. hos män), medan det i andra är mer tabubelagt (t.ex. hos kvinnor), vilket påverkar vad respondenterna svarar.


- **Depression förekommer hos båda könen i lika hög grad**, vilket bekräftar tidigare resultat från undersökningen.

Sammantaget ger typvärdena en översiktlig bild av skillnader och likheter mellan könen inom flera centrala faktorer som kan relatera till psykisk ohälsa.
`);


