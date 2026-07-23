require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs'); // Le module pour lire et écrire dans les fichiers

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function explorerThermoRecetas() {
    console.log("🤖 Démarrage du robot sur ThermoRecetas...");

    try {
        const urlSite = 'https://fr.thermorecetas.com/';
        const reponse = await axios.get(urlSite, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const $ = cheerio.load(reponse.data);
        const liensRecettes = [];

        $('article a').each((index, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('thermorecetas.com') && !liensRecettes.includes(href)) {
                liensRecettes.push(href);
            }
        });

        const premierLien = liensRecettes[0];
        console.log(`🔗 Lien ciblé : ${premierLien}`);

        console.log("📖 Aspiration ciblée du contenu de la recette...");
        const reponseRecette = await axios.get(premierLien, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $recette = cheerio.load(reponseRecette.data);

        const texteRecette = $recette('article').text().replace(/\s+/g, ' ').trim();

        console.log("🧠 Envoi de la recette à l'IA Gemini pour formatage...");

        const prompt = `
        Tu es un assistant culinaire. Voici le texte brut extrait d'une page de recette.
        Extrais les informations pertinentes et renvoie UNIQUEMENT un objet JSON strictement valide avec cette structure exacte. Ne mets AUCUNE balise markdown comme \`\`\`json.
        {
          "id": "A_REMPLACER",
          "title": "Nom de la recette",
          "appliance": "Thermomix",
          "ingredients": [
            { "name": "nom de l'ingrédient", "amount": 100, "unit": "g" }
          ]
        }
        
        Règles : amount doit être un nombre (convertis les fractions en décimales si besoin). Si pas d'unité (ex: 2 oeufs), mets une chaîne vide "".
        Texte à analyser : ${texteRecette.substring(0, 4500)}
        `;

        const reponseIA = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        let jsonPropre = reponseIA.text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // --- NOUVELLE ÉTAPE : ENREGISTREMENT DANS LE FICHIER ---
        console.log("💾 Sauvegarde de la recette dans recettes.json...");
        
        // 1. On transforme le texte JSON en véritable objet Javascript
        const nouvelleRecette = JSON.parse(jsonPropre);
        
        // 2. On lui donne un ID unique basé sur la date et l'heure
        nouvelleRecette.id = "rec-auto-" + Date.now();

        // 3. On ouvre ton fichier recettes.json actuel
        const rawData = fs.readFileSync('recettes.json', 'utf8');
        const listeRecettes = JSON.parse(rawData);

        // 4. On ajoute la nouvelle recette à la liste
        listeRecettes.push(nouvelleRecette);

        // 5. On réécrit le fichier avec la liste mise à jour
        fs.writeFileSync('recettes.json', JSON.stringify(listeRecettes, null, 2));

        console.log("✅ Terminé ! La recette a été ajoutée avec succès à ton site.");

    } catch (erreur) {
        console.error("❌ Erreur :", erreur.message);
    }
}

explorerThermoRecetas();