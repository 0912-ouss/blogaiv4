// Newsletter subscription handler
(function() {
    const API_URL = window.API_URL || (window.location.origin + '/api');
    
    function initNewsletterSubscription() {
        const subscribeForm = document.getElementById('subscribe');
        const subscribeEmail = document.getElementById('subscribe-email');
        const subscribeButton = document.getElementById('subscribe-button');
        const subscribeMessage = document.querySelector('.subscribe-message');
        
        if (!subscribeForm || !subscribeEmail) return;
        
        subscribeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = subscribeEmail.value.trim();
            
            if (!email || !email.includes('@')) {
                showMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
                return;
            }
            
            // Disable button
            if (subscribeButton) {
                subscribeButton.disabled = true;
                subscribeButton.textContent = 'Wird gesendet...';
            }
            
            try {
                const response = await fetch(`${API_URL}/newsletter/subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage('✅ Erfolgreich angemeldet! Vielen Dank für Ihr Interesse.', 'success');
                    subscribeEmail.value = '';
                } else {
                    showMessage(data.error || 'Fehler beim Abonnieren. Bitte versuchen Sie es erneut.', 'error');
                }
            } catch (error) {
                console.error('Newsletter subscription error:', error);
                showMessage('Fehler beim Abonnieren. Bitte versuchen Sie es später erneut.', 'error');
            } finally {
                // Re-enable button
                if (subscribeButton) {
                    subscribeButton.disabled = false;
                    subscribeButton.textContent = 'Senden';
                }
            }
        });
        
        function showMessage(message, type) {
            if (subscribeMessage) {
                subscribeMessage.textContent = message;
                subscribeMessage.className = `subscribe-message ${type}`;
                subscribeMessage.style.display = 'block';
                
                // Hide after 5 seconds
                setTimeout(() => {
                    subscribeMessage.style.display = 'none';
                }, 5000);
            } else {
                alert(message);
            }
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNewsletterSubscription);
    } else {
        initNewsletterSubscription();
    }
})();

