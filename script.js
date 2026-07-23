// 1. Notre base de données (le JSON de tout à l'heure)
const recettesDB = [
    {
      "id": "rec-001",
      "title": "Nuggets de poulet (AirFryer)",
      "ingredients": [
        { "name": "Filet de poulet", "amount": 400, "unit": "g" },
        { "name": "Chapelure panko", "amount": 100, "unit": "g" }
      ]
    },
    {
      "id": "rec-002",
      "title": "Risotto aux champignons (Thermomix)",
      "ingredients": [
        { "name": "Riz Arborio", "amount": 250, "unit": "g" },
        { "name": "Champignons de Paris", "amount": 200, "unit": "g" }
      ]
    },
    {
      "id": "rec-003",
      "title": "Frites de patates douces (AirFryer)",
      "ingredients": [
        { "name": "Patate douce", "amount": 600, "unit": "g" },
        { "name": "Huile d'olive", "amount": 1, "unit": "c.à.s" }
      ]
    }
  ]; // J'ai raccourci les ingrédients ici pour l'exemple, tu pourras coller la version complète plus tard.
  
  // 2. Afficher les recettes sur la page HTML
  const conteneurRecettes = document.getElementById('liste-recettes');
  
  recettesDB.forEach(recette => {
      // Pour chaque recette, on crée une case à cocher
      const div = document.createElement('div');
      div.className = 'recette-item';
      div.innerHTML = `
          <label>
              <input type="checkbox" value="${recette.id}" class="checkbox-recette"> 
              <strong>${recette.title}</strong>
          </label>
      `;
      conteneurRecettes.appendChild(div);
  });
  
  // 3. Que se passe-t-il quand on clique sur le bouton ?
  document.getElementById('bouton-copier').addEventListener('click', () => {
      // On regarde quelles cases sont cochées
      const casesCochees = document.querySelectorAll('.checkbox-recette:checked');
      const recettesSelectionnees = [];
  
      casesCochees.forEach(caseCochee => {
          // On retrouve la recette complète grâce à son ID
          const recette = recettesDB.find(r => r.id === caseCochee.value);
          recettesSelectionnees.push(recette);
      });
  
      if (recettesSelectionnees.length === 0) {
          alert("Sélectionne au moins une recette !");
          return;
      }
  
      // On consolide les ingrédients (la fonction de tout à l'heure)
      const ingredientsFinaux = consoliderIngredients(recettesSelectionnees);
      
      // On copie dans le presse-papiers
      copierVersKeep(ingredientsFinaux);
  });
  
  // 4. Nos deux fonctions de calcul
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