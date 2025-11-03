const express = require('express');
const router = express.Router();
const axios = require('axios');

// Import middleware (will be passed from main file)
let verifyToken;

module.exports = (supabase, middleware) => {
    verifyToken = middleware.verifyToken;

    // ============================================
    // CHAT ASSISTANT ENDPOINT
    // ============================================
    router.post('/chat', verifyToken, async (req, res) => {
        try {
            const { message } = req.body;

            if (!message || !message.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Message is required'
                });
            }

            // Get context about the blog
            const { data: stats } = await supabase
                .from('articles')
                .select('id, title, category_id, status')
                .limit(5);

            const { data: categories } = await supabase
                .from('categories')
                .select('id, name, slug');

            // Build context for AI
            const context = {
                blogStats: {
                    totalArticles: stats?.length || 0,
                    recentArticles: stats?.map(a => a.title) || [],
                    categories: categories?.map(c => c.name) || []
                },
                categoryMap: categories?.reduce((acc, cat) => {
                    acc[cat.name.toLowerCase()] = cat.id;
                    acc[cat.slug.toLowerCase()] = cat.id;
                    return acc;
                }, {}) || {}
            };

            // Check if user wants to generate an article
            const lowerMessage = message.toLowerCase();
            if (lowerMessage.includes('generate') || lowerMessage.includes('erstellen') || lowerMessage.includes('erstelle') || lowerMessage.includes('genrte')) {
                // Extract category from message
                let categoryId = null;
                let categoryName = null;
                
                for (const [key, id] of Object.entries(context.categoryMap)) {
                    if (lowerMessage.includes(key)) {
                        categoryId = id;
                        categoryName = categories.find(c => c.id === id)?.name;
                        break;
                    }
                }
                
                // Default to Technology if no category specified
                if (!categoryId) {
                    categoryId = context.categoryMap['technology'] || context.categoryMap['technologie'] || 1;
                    categoryName = 'Technology';
                }
                
                response = `🚀 Ich kann dir helfen, einen Artikel zu erstellen!
                
Um einen Artikel in der Kategorie "${categoryName}" zu erstellen:
1. Gehe zu "Artikel" → "Neuer Artikel"
2. Klicke auf "KI-generieren" (wenn verfügbar)
3. Oder verwende die API zum automatischen Generieren

Möchtest du, dass ich dir die genauen Schritte zeige?`;
            } else {
                // Simple rule-based responses (you can replace this with OpenAI API)
                response = generateResponse(message, context);
            }

            // If OpenAI API is available, use it for better responses
            if (process.env.OPENAI_API_KEY) {
                try {
                    const aiResponse = await axios.post(
                        'https://api.openai.com/v1/chat/completions',
                        {
                            model: 'gpt-4o-mini',
                            messages: [
                                {
                                    role: 'system',
                                    content: `Du bist ein hilfreicher Admin-Assistent für einen Blog-Verwaltungssystem. 
                                    Antworte auf Deutsch und hilf bei Fragen zu:
                                    - Artikel-Verwaltung
                                    - Kategorien
                                    - Benutzer-Verwaltung
                                    - Einstellungen
                                    - Allgemeine Fragen zum Blog
                                    
                                    Aktuelle Blog-Statistiken:
                                    - Artikel: ${context.blogStats.totalArticles}
                                    - Kategorien: ${context.blogStats.categories.join(', ')}
                                    
                                    Sei freundlich, präzise und hilfreich.`
                                },
                                {
                                    role: 'user',
                                    content: message
                                }
                            ],
                            max_tokens: 500,
                            temperature: 0.7
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                                'Content-Type': 'application/json'
                            },
                            timeout: 10000
                        }
                    );

                    if (aiResponse.data.choices && aiResponse.data.choices[0]) {
                        response = aiResponse.data.choices[0].message.content.trim();
                    }
                } catch (aiError) {
                    console.error('OpenAI API error, using fallback:', aiError.message);
                    // Fall back to rule-based response
                }
            }

            res.json({
                success: true,
                data: {
                    message: message,
                    response: response
                }
            });

        } catch (error) {
            console.error('Chat error:', error);
            res.status(500).json({
                success: false,
                error: 'Fehler beim Verarbeiten der Nachricht'
            });
        }
    });

    return router;
};

// Rule-based response generator (fallback)
function generateResponse(message, context) {
    const lowerMessage = message.toLowerCase();

    // Article management
    if (lowerMessage.includes('artikel erstellen') || lowerMessage.includes('wie erstelle ich')) {
        return `📝 So erstellst du einen Artikel:
1. Gehe zu "Artikel" → "Neuer Artikel"
2. Fülle Titel, Inhalt und Kategorie aus
3. Lade ein Titelbild hoch
4. Klicke auf "Veröffentlichen"

Du kannst auch KI-generierte Artikel verwenden!`;
    }

    if (lowerMessage.includes('artikel löschen') || lowerMessage.includes('löschen')) {
        return `🗑️ Artikel löschen:
1. Gehe zu "Artikel"
2. Klicke auf den Artikel
3. Klicke auf "Löschen" im Menü
4. Bestätige die Löschung`;
    }

    if (lowerMessage.includes('bild') || lowerMessage.includes('image')) {
        return `🖼️ Bilder hinzufügen:
1. Im Artikel-Editor: "Titelbild" → "Hochladen"
2. Du kannst Dateien hochladen oder URLs verwenden
3. Unterstützte Formate: JPG, PNG, WebP
4. Bilder werden automatisch optimiert`;
    }

    if (lowerMessage.includes('kategorie') || lowerMessage.includes('category')) {
        return `📂 Kategorien verwalten:
1. Gehe zu "Kategorien"
2. Erstelle neue Kategorien oder bearbeite bestehende
3. Verfügbare Kategorien: ${context.blogStats.categories.join(', ')}
4. Jeder Artikel benötigt eine Kategorie`;
    }

    if (lowerMessage.includes('statistik') || lowerMessage.includes('analytics')) {
        return `📊 Blog-Statistiken:
- Artikel gesamt: ${context.blogStats.totalArticles}
- Kategorien: ${context.blogStats.categories.length}
- Siehe "Analytics" für detaillierte Statistiken`;
    }

    if (lowerMessage.includes('hilfe') || lowerMessage.includes('help')) {
        return `🆘 Wie kann ich dir helfen?
Ich kann dir bei Fragen zu:
- Artikel-Verwaltung
- Kategorien & Tags
- Bilder hochladen
- Statistiken
- Einstellungen
helfen!

Stelle einfach eine Frage! 😊`;
    }

    // Default response
    return `🤔 Ich habe deine Frage erhalten: "${message}"

Ich bin noch dabei zu lernen! Für spezifische Fragen zu:
- Artikel-Verwaltung
- Kategorien
- Bilder
- Statistiken

Stelle gerne eine konkrete Frage! 💡`;
}

