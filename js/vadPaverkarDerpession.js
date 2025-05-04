// 📋 Список колонок для анализа
let jamforcColumn = [
  "Age", "AcademicPressure", "CGPA", "StudySatisfaction",
  "WorkStudyHours", "FinancialStress", "SleepHours"
];

// 📌 Дропдауны
let faktor1 = addDropdown('Faktor 1', jamforcColumn, "Age");
let könsval = addDropdown('Kön', ['Total', 'Male', 'Female'], 'Total');

switch (faktor1) {
  case "Age":
    addMdToPage(`
### Samband mellan ålder och depression

Vi undersöker hur andelen rapporterad depression varierar med ålder. Detta hjälper oss att identifiera åldersgrupper som är särskilt utsatta.

### Vad ser vi?

- Hög andel depression bland unga vuxna (18–30 år)
- Minskning kring 30–35 års ålder
- Oregelbundet mönster efter 40 år, troligen p.g.a. färre svar
- Nära noll efter 50 – kan bero på små urval

> 💭 *Notis:* Ålder påverkar tydligt nivån av psykisk ohälsa, men resultaten i äldre grupper bör tolkas försiktigt.
    `);
    break;

  case "AcademicPressure":
    addMdToPage(`
### Samband mellan akademisk press och depression

Här undersöker vi om högre upplevd akademisk press leder till ökad psykisk ohälsa.

### Vad ser vi?

- Andelen med depression ökar gradvis med högre pressnivå
- Sambandet är tydligast i intervallen 3–5

> 💭 *Notis:* Akademisk stress är en möjlig riskfaktor för depression bland studenter.
    `);
    break;

  case "CGPA":
    addMdToPage(`
### Samband mellan betyg (CGPA) och depression

Vi analyserar om akademisk prestation har något samband med psykiskt mående.

### Vad ser vi?

- Ingen tydlig linjär trend
- Både höga och låga CGPA-nivåer förekommer bland deprimerade
- Möjlig viss ökning av depression vid mycket låga eller höga betyg

> 💭 *Notis:* Betyg verkar inte vara en stark enskild indikator på depression.
    `);
    break;

  case "StudySatisfaction":
    addMdToPage(`
### Samband mellan studietillfredsställelse och depression

Undersökningen visar hur nöjdhet med studier kan hänga ihop med psykisk hälsa.

### Vad ser vi?

- Lägre studieglädje korrelerar med högre nivåer av depression
- Positiv tillfredsställelse verkar ha skyddande effekt

> 💭 *Notis:* Låg motivation och missnöje kan vara viktiga varningssignaler.
    `);
    break;

  case "WorkStudyHours":
    addMdToPage(`
### Samband mellan arbetstid/studietid och depression

Vi tittar på om längre arbets-/studietid ökar risken för depression.

### Vad ser vi?

- Depression ökar något vid mycket höga arbetsinsatser
- Samtidigt ingen tydlig linjär trend

> 💭 *Notis:* För mycket plugg eller arbete kan vara en riskfaktor, men andra faktorer spelar också roll.
    `);
    break;

  case "FinancialStress":
    addMdToPage(`
### Samband mellan ekonomisk stress och depression

Här analyserar vi om ekonomiska svårigheter påverkar psykiskt välbefinnande.

### Vad ser vi?

- Klart samband: hög ekonomisk stress hänger ihop med hög andel depression

> 💭 *Notis:* Ekonomisk oro är en stark indikator på psykisk ohälsa i denna grupp.
    `);
    break;

  case "SleepHours":
    addMdToPage(`
### Samband mellan sömntid och depression

Hur påverkar sömnmönster den psykiska hälsan?

### Vad ser vi?

- Kort sömn (mindre än 5 timmar) är kopplad till högre depression
- Längre sömn tenderar att ha lägre andel depression

> 💭 *Notis:* Sömnbrist verkar ha tydlig koppling till psykisk ohälsa bland studenterna.
    `);
    break;

  default:
    // valfritt fallback-meddelande
    addMdToPage(`Ingen tolkning tillgänglig för den valda faktorn.`);
}


// ➕ Кнопка
addToPage(`<button id="ritaBtn">Rita diagram</button>`);

// 📈 Обработчик нажатия
document.getElementById("ritaBtn").addEventListener("click", async () => {
  let kolumn = faktor1;
  let kön = könsval;
  let könsFilter = kön !== 'Total' ? `AND Gender = '${kön}'` : '';

  let sql = `
    SELECT [${kolumn}], AVG(Depression) AS DepressionRate
    FROM results
    WHERE [${kolumn}] IS NOT NULL
    ${könsFilter}
    GROUP BY [${kolumn}]
    ORDER BY [${kolumn}]
  `;

  let stats = await dbQuery(sql);

  drawGoogleChart({
    type: 'LineChart',
    data: makeChartFriendly(stats, kolumn, 'DepressionRate'),
    options: {
      title: `Samband mellan ${kolumn} och depression (${kön})`,
      height: 400,
      curveType: 'function',
      hAxis: { title: kolumn },
      vAxis: { title: 'Andel med depression', minValue: 0 }
    }
  });
});
