import axios from 'axios';

import { downloadMediaMessage } from 'baileys';

import { fileTypeFromBuffer } from 'file-type';

import FormData from 'form-data';

/**

 * Fonction d'upload vers ton serveur personnel sur Render

 * Gère la réponse JSON pour extraire le lien réel

 */

async function uploadToDevHackers(buffer, fileName) {

    const form = new FormData();

    // Utilisation du champ 'file' (vérifie si ton serveur attend un autre nom de champ)

    form.append('file', buffer, { filename: fileName });

    const res = await axios.post('https://devhackers-link-generator.onrender.com/upload', form, {

        headers: {

            ...form.getHeaders(),

        },

        maxContentLength: Infinity,

        maxBodyLength: Infinity

    });

    // --- CORRECTION DU [object Object] ---

    // On vérifie si la réponse est un objet et on extrait la clé contenant le lien

    if (typeof res.data === 'object') {

        // Cherche par priorité 'url', 'link', 'result' ou 'link_url'

        return res.data.url || res.data.link || res.data.result || res.data.link_url || JSON.stringify(res.data);

    }

    

    // Si c'est déjà du texte, on le nettoie

    return res.data.trim();

}

export async function url(client, message) {

    const jid = message.key.remoteJid;

    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    

    if (!quoted) {

        return client.sendMessage(jid, { text: 

`﹝╎🔗 𝐔𝐑𝐋 𝐔𝐏𝐋𝐎𝐀𝐃𝐄𝐑 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 ⚠️ 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

⸙﹝ Répondez à un média (Image, Vidéo, Audio, Doc) ﹞✴︎

> *© AKANE MD 🌹*` });

    }

    try {

        // Détection du média

        const mediaData = quoted.imageMessage || quoted.videoMessage || quoted.audioMessage || quoted.documentMessage;

        if (!mediaData) return client.sendMessage(jid, { text: "❌ *Média non supporté.*" });

        await client.sendMessage(jid, { text: "⏳ *AKANE MD téléverse vers DevHackers...*" });

        // Téléchargement en mémoire (Buffer)

        const buffer = await downloadMediaMessage(

            { message: quoted },

            'buffer',

            {},

            { logger: console }

        );

        if (!buffer) throw new Error("Erreur de téléchargement");

        // Déterminer l'extension

        const type = await fileTypeFromBuffer(buffer);

        const extension = type ? type.ext : (quoted.documentMessage?.fileName?.split('.').pop() || 'bin');

        const fileName = `akane_${Date.now()}.${extension}`;

        // Envoi vers ton site Render

        const link = await uploadToDevHackers(buffer, fileName);

        // Réponse finale avec le lien corrigé

        await client.sendMessage(jid, { 

            text: 

`﹝╎🔗 𝐔𝐑𝐋 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃 ╎˼

⎔ــﮩ٨ـﮩﮩـ٨ •﹝ 𐰁 ✅ 𐰁 ﹞• ٨ـﮩ–ﮩ٨⎔

✨ *Lien de votre fichier :*

${link}

📂 *Hébergeur :* DevHackers Cloud

⚖️ *Taille :* ${(buffer.length / 1024 / 1024).toFixed(2)} MB

> *© AKANE MD 🌹*` 

        }, { quoted: message });

    } catch (error) {

        console.error("Erreur DevHackers:", error);

        await client.sendMessage(jid, { text: "❌ *Échec de l'upload vers ton serveur Render.*" });

    }

}

export default url;

