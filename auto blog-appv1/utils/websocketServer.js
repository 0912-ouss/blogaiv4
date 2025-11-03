/**
 * WebSocket Server for Real-time Updates
 * Provides real-time notifications for articles, comments, and activity
 */

const { Server } = require('socket.io');

let io = null;
const connectedUsers = new Map(); // Map of userId -> socketId

// Initialize WebSocket server
const initializeWebSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.NODE_ENV === 'production' 
                ? process.env.ALLOWED_ORIGINS?.split(',') || []
                : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
        console.log('✅ Client connected:', socket.id);

        // User authentication
        socket.on('authenticate', (data) => {
            if (data.userId) {
                connectedUsers.set(data.userId, socket.id);
                socket.userId = data.userId;
                socket.join(`user:${data.userId}`);
                console.log(`✅ User ${data.userId} authenticated`);
                
                // Notify user is online
                socket.broadcast.emit('user-online', { userId: data.userId });
            }
        });

        // Join article room for real-time updates
        socket.on('join-article', (articleId) => {
            socket.join(`article:${articleId}`);
            console.log(`Socket ${socket.id} joined article:${articleId}`);
        });

        // Leave article room
        socket.on('leave-article', (articleId) => {
            socket.leave(`article:${articleId}`);
        });

        // Join admin room
        socket.on('join-admin', () => {
            socket.join('admin');
            console.log(`Socket ${socket.id} joined admin room`);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            if (socket.userId) {
                connectedUsers.delete(socket.userId);
                socket.broadcast.emit('user-offline', { userId: socket.userId });
                console.log(`User ${socket.userId} disconnected`);
            }
            console.log('❌ Client disconnected:', socket.id);
        });
    });

    console.log('✅ WebSocket server initialized');
    return io;
};

// Broadcast article update
const broadcastArticleUpdate = (article) => {
    if (!io) return;
    io.to(`article:${article.id}`).emit('article-updated', article);
    io.to('admin').emit('article-updated', article);
};

// Broadcast new comment
const broadcastNewComment = (comment, articleId) => {
    if (!io) return;
    io.to(`article:${articleId}`).emit('new-comment', comment);
    io.to('admin').emit('new-comment', comment);
};

// Broadcast comment update
const broadcastCommentUpdate = (comment, articleId) => {
    if (!io) return;
    io.to(`article:${articleId}`).emit('comment-updated', comment);
    io.to('admin').emit('comment-updated', comment);
};

// Broadcast activity log
const broadcastActivity = (activity) => {
    if (!io) return;
    io.to('admin').emit('new-activity', activity);
};

// Notify user
const notifyUser = (userId, notification) => {
    if (!io) return;
    io.to(`user:${userId}`).emit('notification', notification);
};

// Get online users
const getOnlineUsers = () => {
    return Array.from(connectedUsers.keys());
};

// Check if user is online
const isUserOnline = (userId) => {
    return connectedUsers.has(userId);
};

module.exports = {
    initializeWebSocket,
    broadcastArticleUpdate,
    broadcastNewComment,
    broadcastCommentUpdate,
    broadcastActivity,
    notifyUser,
    getOnlineUsers,
    isUserOnline,
    getIO: () => io
};

