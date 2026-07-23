// 1. Notre base de données complète
const recettesDB = [
  {
    "id": "rec-001",
    "title": "Nuggets de poulet ultra-croustillants",
    "appliance": "AirFryer",
    "ingredients": [
      { "name": "Filet de poulet", "amount": 400, "unit": "g" },
      { "name": "Chapelure panko", "amount": 100, "unit": "g" },
      { "name": "Oeuf", "amount": 1, "unit": "pièce" },
      { "name": "Farine", "amount": 50, "unit": "g" },
      { "name": "Paprika", "amount": 1, "unit": "c.à.c" },
      { "name": "Huile d'olive", "amount": 1, "unit": "c.à.s" }
    ]
  },
  {
    "id": "rec-002",
    "title": "Risotto crémeux aux champignons",
    "appliance": "Thermomix",
    "ingredients": [
      { "name": "Riz Arborio", "amount": 250, "unit": "g" },
      { "name": "Champignons de Paris", "amount": 200, "unit": "g" },
      { "name": "Echalote", "amount": 1, "unit": "pièce" },
      { "name": "Huile d'olive", "amount": 20, "unit": "g" },
      { "name": "Vin blanc sec", "amount": 50, "unit": "ml" },
      { "name": "Bouillon de légumes", "amount": 600, "unit": "ml" },
      { "name": "Parmesan râpé", "amount": 40, "unit": "g" }
    ]
  },
  {
    "id": "rec-003",
    "title": "Frites de patates douces",
    "appliance": "AirFryer",
    "ingredients": [
      { "name": "Patate douce", "amount": 600, "unit": "g" },
      { "name": "Fécule de maïs (Maïzena)", "amount": 1, "unit": "c.à.s" },
      { "name": "Huile d'olive", "amount": 1, "unit": "c.à.s" },
      { "name": "Sel fin", "amount": 1, "unit": "pincée" }
    ]
  }
];

// 2. Afficher les recettes avec le badge de l'appareil
const conteneurRecettes = document.getElementById('liste-recettes');

recettesDB.forEach(recette => {
    const div = document.createElement('div');
    div.className = 'recette-item';
    // On ajoute un petit texte pour différencier Thermomix et AirFryer
    div.innerHTML = `
        <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" value="${recette.id}" class="checkbox-recette" style="margin-right: 10px;"> 
            <div>
                <strong>${recette.title}</strong><br>
                <small style="color: #666;">♨️ ${recette.appliance}</small>
            </div>
        </label>
    `;
    conteneurRecettes.appendChild(div);
});

// 3. Gestion du clic sur le bouton
document.getElementById('bouton-copier').addEventListener('click', () => {
    const casesCochees = document.querySelectorAll('.checkbox-recette:checked');
    const recettesSelectionnees = [];

    casesCochees.forEach(caseCochee => {
        const recette = recettesDB.find(r => r.id === caseCochee.value);
        recettesSelectionnees.push(recette);
    });

    if (recettesSelectionnees.length === 0) {
        alert("Sélectionne au moins une recette !");
        return;
    }

    const ingredientsFinaux = consoliderIngredients(recettesSelectionnees);
    copierVersKeep(ingredientsFinaux);
});

// 4. Fonctions de calcul et de copie
function consoliderIngredients(recettesSelectionnees) {
  const listeCourses = {};
  recettesSelectionnees.forEach(recette => {
    recette.ingredients.forEach(ing => {
      const cle = `${ing.name}-${ing.unit}`; 
      if (listeCourses[cle]) {
        listeCourses[cle].amount += ing.amount;
      } else {
        listeCourses[cle] = { name: ing.name, amount: ing.amount, unit: ing.unit };
      }
    });
  });
  return Object.values(listeCourses);
}

function copierVersKeep(ingredientsConsolides) {
  let textePourKeep = "🛒 Liste de courses :\n\n";
  ingredientsConsolides.forEach(ing => {
    textePourKeep += `• ${ing.amount} ${ing.unit} de ${ing.name}\n`;
  });

  navigator.clipboard.writeText(textePourKeep).then(() => {
    alert("C'est copié ! Tu n'as plus qu'à coller dans ta note partagée.");
  }).catch(err => {
    alert("Erreur lors de la copie.");
  });
}