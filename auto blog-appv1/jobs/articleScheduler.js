const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Publish scheduled articles that are due
 */
async function publishScheduledArticles() {
    try {
        const now = new Date().toISOString();

        // Find articles scheduled for publication
        const { data: scheduledArticles, error } = await supabase
            .from('articles')
            .select('id, title, scheduled_at, status')
            .eq('status', 'draft')
            .not('scheduled_at', 'is', null)
            .lte('scheduled_at', now);

        if (error) {
            console.error('Error fetching scheduled articles:', error);
            return;
        }

        if (!scheduledArticles || scheduledArticles.length === 0) {
            console.log('No scheduled articles to publish');
            return;
        }

        console.log(`Found ${scheduledArticles.length} article(s) scheduled for publication`);

        // Publish each scheduled article
        for (const article of scheduledArticles) {
            try {
                const { error: updateError } = await supabase
                    .from('articles')
                    .update({
                        status: 'published',
                        published_at: article.scheduled_at || new Date().toISOString(),
                        scheduled_at: null, // Clear scheduled_at after publishing
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', article.id);

                if (updateError) {
                    console.error(`Error publishing article ${article.id}:`, updateError);
                } else {
                    console.log(`✅ Published article: "${article.title}" (ID: ${article.id})`);
                }
            } catch (err) {
                console.error(`Error processing article ${article.id}:`, err);
            }
        }
    } catch (error) {
        console.error('Error in publishScheduledArticles:', error);
    }
}

/**
 * Start the scheduler
 * Runs every minute to check for scheduled articles
 */
function startScheduler() {
    console.log('📅 Article Scheduler started - checking every minute for scheduled articles');

    // Run every minute
    cron.schedule('* * * * *', async () => {
        await publishScheduledArticles();
    });

    // Also run immediately on startup
    publishScheduledArticles();
}

module.exports = {
    startScheduler,
    publishScheduledArticles
};

