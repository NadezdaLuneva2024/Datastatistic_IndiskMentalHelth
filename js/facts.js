
let data = await dbQuery(
  "SELECT * FROM results"
);
let antalKvinnor = data.filter(x => x.Gender == "Female").length
let antalMan = data.filter(x => x.Gender == "Male").length
let allCities = await dbQuery(`
  SELECT City, COUNT(*) AS antal_personer
  FROM results
  GROUP BY City
  ORDER BY antal_personer DESC
`);

addMdToPage(`
  ## Några faktum om undersökning
`);

addToPage(`<pre>

  I indersökning deltog: ${antalKvinnor} kvinnor och ${antalMan} man
  i ålder mellan ${s.min(data.map(x => x.Age))} till ${s.max(data.map(x => x.Age))} fron olika städer:
</pre>`);

drawGoogleChart({
  type: 'PieChart',
  data: makeChartFriendly(allCities),
  options: {
    title: 'Städer i undersökning',
    responsive: true,
    height: 400,
    is3D: true,
    chartArea: { left: "0%" }
  }
});



// Numeriska mätvärden
let numericColumns = [
  "Age",
  "AcademicPressure",
  "CGPA",
  "StudySatisfaction",
  "WorkStudyHours",
  "FinancialStress"
];

let numericResults = numericColumns.map(col => {
  // Filtrera värden för kvinnor och män
  let femaleValues = data.filter(x => x.Gender === "Female").map(x => x[col]).filter(x => !isNaN(x));;
  let maleValues = data.filter(x => x.Gender === "Male").map(x => x[col]).filter(x => !isNaN(x));;

  // Beräkna medelvärdet med s.mean och avrunda till 1 decimal
  let kvinnorsResult = s.mean(femaleValues);
  let mansResult = s.mean(maleValues);

  return {
    kolumnnamn: col,
    kvinnor: Number(kvinnorsResult.toFixed(1)),
    man: Number(mansResult.toFixed(1))
  };
});

tableFromData({
  data: numericResults,
  columnNames: ['kolumnnamn', 'Meddelvärde för kvinnor', 'Meddelvärde för man']
});

// Ycke Numeriska mätvärden
let nonNumericColumns = [
  "SleepDuration",
  "DietaryHabits",
  "Degree",
  "HaveYouEverHadSuicidalThoughts",
  "FamilyHistoryMentalIllness",
  "Depression"
];

let nonNumericResults = nonNumericColumns.map(col => {
  // Filtrera kvinnliga och manliga värden
  let femaleValues = data.filter(x => x.Gender === "Female").map(x => x[col]).filter(x => x != null && x !== "");
  let maleValues = data.filter(x => x.Gender === "Male").map(x => x[col]).filter(x => x != null && x !== "");

  // Om värden saknas, visa t.ex. "Ingen data"
  let kvinnorsResult = femaleValues.length > 0 ? s.mode(femaleValues) : "Ingen data";
  let mansResult = maleValues.length > 0 ? s.mode(maleValues) : "Ingen data";

  return {
    kolumnnamn: col,
    kvinnor: kvinnorsResult,
    man: mansResult
  };
});

tableFromData({
  data: nonNumericResults,
  columnNames: ['kolumnnamn', 'Typvärde för kvinnor', 'Typvärde för man']
});

addToPage(`

  Det verkar att famijler med psikiska problem födder mer pojkar än flickor)))

`);
