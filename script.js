// On crée une variable vide qui va recevoir nos recettes
let recettesDB = [];

// Le site va "chercher" (fetch) le fichier JSON sur le serveur
fetch('recettes.json')
    .then(reponse => reponse.json())
    .then(donnees => {
        recettesDB = donnees;
        afficherRecettes(); // On lance l'affichage une fois les données chargées
    })
    .catch(erreur => console.error("Erreur lors du chargement des recettes :", erreur));

// La fonction pour afficher les cases à cocher
function afficherRecettes() {
    const conteneurRecettes = document.getElementById('liste-recettes');
    
    recettesDB.forEach(recette => {
        const div = document.createElement('div');
        div.className = 'recette-item';
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
}

// Gestion du clic sur le bouton de copie
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

// Les fonctions de calcul
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