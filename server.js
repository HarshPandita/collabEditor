const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const redis = require('redis');
const { promisify } = require('util');
const ACTIONS = require('./src/actions');

const server = http.createServer(app);
const io = new Server(server);

// Configure Redis connection
const redisClient = redis.createClient({
    host: 'localhost', // Your Redis host
    port: 6379, // Your Redis port
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

function getAllConnectedClients(roomId, callback) {
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    console.log(`Clients in room ${roomId}:`, clients);

    if (clients.length === 0) {
        return callback(null, []);
    }

    const clientDetails = [];
    let remaining = clients.length;

    clients.forEach((socketId) => {
        redisClient.hget('userSocketMap', socketId, (err, userName) => {
            if (err) {
                console.error('Error fetching user name:', err);
                return callback(err);
            }

            clientDetails.push({ socketId, userName });

            remaining -= 1;
            if (remaining === 0) {
                console.log(`Returning clients for room ${roomId}:`, clientDetails);
                callback(null, clientDetails);
            }
        });
    });
}

io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, userName }) => {
        redisClient.hset('userSocketMap', socket.id, userName, (err) => {
            if (err) {
                console.error('Error saving user name:', err);
                return;
            }

            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);

            getAllConnectedClients(roomId, (err, clients) => {
                if (err) {
                    console.error('Error getting clients:', err);
                    return;
                }

                clients.forEach(({ socketId }) => {
                    io.to(socketId).emit(ACTIONS.JOINED, {
                        clients,
                        userName,
                        socketId: socket.id,
                    });
                });

                console.log(`Clients after join in room ${roomId}:`, clients);
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        console.log('Receiving code:', code);
        socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        console.log(`Socket ${socket.id} disconnecting from rooms:`, rooms);

        redisClient.hget('userSocketMap', socket.id, (err, userName) => {
            if (err) {
                console.error('Error getting user name:', err);
                return;
            }

            rooms.forEach((roomId) => {
                socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
                    socketId: socket.id,
                    userName,
                });
            });

            redisClient.hdel('userSocketMap', socket.id, (err) => {
                if (err) {
                    console.error('Error deleting user name:', err);
                }
            });
        });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));