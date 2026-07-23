// On crée une variable vide qui va recevoir nos recettes
let recettesDB = [];
const recettesGlobales = recettesDB

// Fonction pour ouvrir et remplir la modale
function ouvrirRecette(idRecette) {
    // 1. On cherche la bonne recette dans la liste téléchargée
    const recette = recettesDB.find(r => r.id === idRecette);
    if (!recette) return;

    // 2. On remplit les textes et l'image
    document.getElementById('modal-titre').innerText = recette.title;
    
    const imgElement = document.getElementById('modal-image');
    if (recette.imageUrl) {
        imgElement.src = recette.imageUrl;
        imgElement.style.display = 'block';
    } else {
        imgElement.style.display = 'none';
    }

    // 3. On remplit la liste des ingrédients
    const ulIngredients = document.getElementById('modal-ingredients');
    ulIngredients.innerHTML = '';
    recette.ingredients.forEach(ing => {
        ulIngredients.innerHTML += `<li><strong>${ing.amount} ${ing.unit}</strong> ${ing.name}</li>`;
    });

    // 4. On remplit les instructions (si elles existent)
    const olInstructions = document.getElementById('modal-instructions');
    olInstructions.innerHTML = '';
    if (recette.instructions && recette.instructions.length > 0) {
        recette.instructions.forEach(etape => {
            olInstructions.innerHTML += `<li>${etape}</li>`;
        });
    } else {
        olInstructions.innerHTML = `<li><em>Les étapes de préparation ne sont pas encore disponibles pour cette recette.</em></li>`;
    }

    // 5. On gère le lien original
    const lienElement = document.getElementById('modal-lien');
    if (recette.url) {
        lienElement.href = recette.url;
        lienElement.style.display = 'inline-block';
    } else {
        lienElement.style.display = 'none';
    }

    // 6. On affiche la fenêtre complète
    document.getElementById('modal-recette').style.display = 'block';
}

// Fonction pour fermer la modale
function fermerModal() {
    document.getElementById('modal-recette').style.display = 'none';
}

// Optionnel : fermer la modale si on clique à l'extérieur de la boite blanche
window.onclick = function(event) {
    const modal = document.getElementById('modal-recette');
    if (event.target === modal) {
        fermerModal();
    }
}
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
    conteneurRecettes.innerHTML = ''; // Nettoyage propre
    
    recettesDB.forEach(recette => {
        const div = document.createElement('div');
        div.className = 'recette-item';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.marginBottom = '10px';
        
        div.innerHTML = `
            <!-- La case à cocher reste indépendante -->
            <input type="checkbox" value="${recette.id}" class="checkbox-recette" style="margin-right: 12px; transform: scale(1.2);"> 
            
            <div>
                <!-- Le titre devient cliquable pour ouvrir la modale -->
                <span class="titre-recette" onclick="ouvrirRecette('${recette.id}')">${recette.title}</span><br>
                <span class="appareil-tag ${recette.appliance === 'Thermomix' ? 'tag-thermomix' : 'tag-airfryer'}">${recette.appliance}</span>
            </div>
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
