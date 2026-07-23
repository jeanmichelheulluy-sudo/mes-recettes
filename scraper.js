require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function explorerThermoRecetas() {
    console.log("🤖 Démarrage du robot sur ThermoRecetas...");

    try {
        // 1. Récupération des liens sur la page d'accueil
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

        // 2. On isole les 3 premiers liens pour ne pas surcharger l'IA
        const liensAExplorer = liensRecettes.slice(0, 3);
        console.log(`🎯 J'ai isolé les ${liensAExplorer.length} dernières recettes à analyser.`);

        // 3. On charge ta liste actuelle de recettes pour vérifier les doublons
        const rawData = fs.readFileSync('recettes.json', 'utf8');
        let listeRecettes = JSON.parse(rawData);
        let nbAjouts = 0;

        // 4. On lance une boucle pour analyser chaque lien un par un
        for (const lien of liensAExplorer) {
            console.log(`\n🔗 Aspiration ciblée : ${lien}`);
            
            const reponseRecette = await axios.get(lien, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $recette = cheerio.load(reponseRecette.data);
            const texteRecette = $recette('article').text().replace(/\s+/g, ' ').trim();

            console.log("🧠 Formatage par l'IA en cours...");
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
            Règles : amount doit être un nombre. Si pas d'unité (ex: 2 oeufs), mets une chaîne vide "".
            Texte à analyser : ${texteRecette.substring(0, 4500)}
            `;

            const reponseIA = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            });

            let jsonPropre = reponseIA.text.replace(/```json/g, '').replace(/```/g, '').trim();
            const nouvelleRecette = JSON.parse(jsonPropre);
            nouvelleRecette.id = "rec-auto-" + Date.now() + Math.floor(Math.random() * 1000);

            // 5. Vérification anti-doublon : La recette existe-t-elle déjà dans ton fichier ?
            const existeDeja = listeRecettes.find(r => r.title.toLowerCase() === nouvelleRecette.title.toLowerCase());
            
            if (existeDeja) {
                console.log(`⏩ Ignorée : "${nouvelleRecette.title}" est déjà dans ton menu.`);
            } else {
                listeRecettes.push(nouvelleRecette);
                nbAjouts++;
                console.log(`✅ Ajoutée : "${nouvelleRecette.title}"`);
            }
        }

        // 6. On sauvegarde le fichier une seule fois à la fin s'il y a eu des nouveautés
        if (nbAjouts > 0) {
            fs.writeFileSync('recettes.json', JSON.stringify(listeRecettes, null, 2));
            console.log(`\n💾 Fichier mis à jour avec ${nbAjouts} nouvelle(s) recette(s) !`);
        } else {
            console.log(`\n🤷‍♂️ Aucune nouvelle recette à ajouter pour le moment.`);
        }

    } catch (erreur) {
        console.error("\n❌ Erreur :", erreur.message);
    }
}

explorerThermoRecetas();