/**
 * Social Authentication Service
 * Supports Google, Facebook, and Twitter OAuth
 */

const jwt = require('jsonwebtoken');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Google OAuth verification
const verifyGoogleToken = async (idToken) => {
    try {
        const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        const userInfo = response.data;

        if (userInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
            throw new Error('Invalid Google token audience');
        }

        return {
            provider: 'google',
            providerId: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            verified: userInfo.email_verified === 'true'
        };
    } catch (error) {
        console.error('Google token verification error:', error);
        throw new Error('Invalid Google token');
    }
};

// Facebook OAuth verification
const verifyFacebookToken = async (accessToken) => {
    try {
        const response = await axios.get(`https://graph.facebook.com/me`, {
            params: {
                access_token: accessToken,
                fields: 'id,name,email,picture'
            }
        });

        const userInfo = response.data;

        return {
            provider: 'facebook',
            providerId: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture?.data?.url,
            verified: true
        };
    } catch (error) {
        console.error('Facebook token verification error:', error);
        throw new Error('Invalid Facebook token');
    }
};

// Twitter OAuth verification (Twitter OAuth 2.0)
const verifyTwitterToken = async (accessToken) => {
    try {
        const response = await axios.get('https://api.twitter.com/2/users/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                'user.fields': 'id,name,username,profile_image_url'
            }
        });

        const userInfo = response.data.data;

        return {
            provider: 'twitter',
            providerId: userInfo.id,
            email: null, // Twitter OAuth 2.0 doesn't provide email by default
            name: userInfo.name,
            username: userInfo.username,
            picture: userInfo.profile_image_url,
            verified: true
        };
    } catch (error) {
        console.error('Twitter token verification error:', error);
        throw new Error('Invalid Twitter token');
    }
};

// Find or create user from social auth
const findOrCreateSocialUser = async (socialUserInfo) => {
    try {
        // Check if user exists with this provider ID
        const { data: existingUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('social_provider', socialUserInfo.provider)
            .eq('social_provider_id', socialUserInfo.providerId)
            .single();

        if (existingUser) {
            // Update last login
            await supabase
                .from('admin_users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', existingUser.id);

            return existingUser;
        }

        // Check if email exists (for account linking)
        if (socialUserInfo.email) {
            const { data: emailUser } = await supabase
                .from('admin_users')
                .select('*')
                .eq('email', socialUserInfo.email)
                .single();

            if (emailUser) {
                // Link social account to existing user
                await supabase
                    .from('admin_users')
                    .update({
                        social_provider: socialUserInfo.provider,
                        social_provider_id: socialUserInfo.providerId,
                        avatar_url: socialUserInfo.picture || emailUser.avatar_url,
                        last_login: new Date().toISOString()
                    })
                    .eq('id', emailUser.id);

                return emailUser;
            }
        }

        // Create new user (with editor role by default)
        const { data: newUser, error } = await supabase
            .from('admin_users')
            .insert([{
                email: socialUserInfo.email || `${socialUserInfo.providerId}@${socialUserInfo.provider}.local`,
                name: socialUserInfo.name || socialUserInfo.username || 'User',
                role: 'editor', // Default role for social signups
                social_provider: socialUserInfo.provider,
                social_provider_id: socialUserInfo.providerId,
                avatar_url: socialUserInfo.picture,
                is_active: true,
                email_verified: socialUserInfo.verified || false,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        return newUser;
    } catch (error) {
        console.error('Error finding/creating social user:', error);
        throw error;
    }
};

// Generate JWT token for social auth user
const generateSocialAuthToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Social login handler
const handleSocialLogin = async (provider, token) => {
    let socialUserInfo;

    switch (provider) {
        case 'google':
            socialUserInfo = await verifyGoogleToken(token);
            break;
        case 'facebook':
            socialUserInfo = await verifyFacebookToken(token);
            break;
        case 'twitter':
            socialUserInfo = await verifyTwitterToken(token);
            break;
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }

    const user = await findOrCreateSocialUser(socialUserInfo);
    const jwtToken = generateSocialAuthToken(user);

    return {
        success: true,
        token: jwtToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar_url: user.avatar_url
        }
    };
};

module.exports = {
    verifyGoogleToken,
    verifyFacebookToken,
    verifyTwitterToken,
    handleSocialLogin,
    findOrCreateSocialUser
};

