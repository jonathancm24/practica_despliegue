const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Archivos JSON que actúan como base de datos
const USERS_FILE = './users.json';
const COMMENTS_FILE = './comments.json';

// Middleware para manejar JSON y archivos estáticos
app.use(express.json());
app.use(express.static('public'));

// Función para leer archivos JSON
const readDatabase = (filename) => {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // Si el archivo no existe, retorna un array vacío
        return [];
    }
};

// Función para escribir en archivos JSON
const writeDatabase = (filename, data) => {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
};

// Ruta principal - servir la página de comentarios
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Status
app.get('/api/status', (req, res) => {
    const msg = {
        message: 'API de Comentarios funcionando correctamente',
        status: 200,
        timestamp: new Date().toISOString()
    }
    res.json(msg);
});

// CRUD de usuarios
// 1. Obtener todos los usuarios
app.get('/users', (req, res) => {
    const users = readDatabase(USERS_FILE);
    res.json(users);
});

// 2. Crear un nuevo usuario
app.post('/users', (req, res) => {
    const users = readDatabase(USERS_FILE);
    const newUser = req.body;

    if (!newUser.id || !newUser.name || !newUser.email) {
        return res.status(400).json({ error: 'ID, name, and email are required' });
    }

    // Verifica si el usuario ya existe
    if (users.some((user) => user.id === newUser.id)) {
        return res.status(400).json({ error: 'User with the same ID already exists' });
    }

    users.push(newUser);
    writeDatabase(USERS_FILE, users);

    res.status(201).json({ message: 'User created successfully', user: newUser });
});

// 3. Actualizar un usuario
app.put('/users/:id', (req, res) => {
    const users = readDatabase(USERS_FILE);
    const userId = req.params.id;
    const updatedUser = req.body;

    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex] = { ...users[userIndex], ...updatedUser };
    writeDatabase(USERS_FILE, users);

    res.json({ message: 'User updated successfully', user: users[userIndex] });
});

// 4. Eliminar un usuario
app.delete('/users/:id', (req, res) => {
    const users = readDatabase(USERS_FILE);
    const userId = req.params.id;

    const filteredUsers = users.filter((user) => user.id !== userId);

    if (filteredUsers.length === users.length) {
        return res.status(404).json({ error: 'User not found' });
    }

    writeDatabase(USERS_FILE, filteredUsers);

    res.json({ message: 'User deleted successfully' });
});

// 5. Buscar un usuario
app.get('/users/:id', (req, res) => {
    const users = readDatabase(USERS_FILE);
    const userId = req.params.id;

    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex]

    res.json({ user });
});

// CRUD de Comentarios
// 1. Obtener todos los comentarios
app.get('/api/comments', (req, res) => {
    const comments = readDatabase(COMMENTS_FILE);
    res.json(comments);
});

// 2. Crear un nuevo comentario
app.post('/api/comments', (req, res) => {
    const comments = readDatabase(COMMENTS_FILE);
    const { author, message } = req.body;

    if (!author || !message) {
        return res.status(400).json({ error: 'Author and message are required' });
    }

    if (author.trim().length < 2) {
        return res.status(400).json({ error: 'Author name must be at least 2 characters' });
    }

    if (message.trim().length < 5) {
        return res.status(400).json({ error: 'Message must be at least 5 characters' });
    }

    const newComment = {
        id: Date.now().toString(),
        author: author.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString()
    };

    comments.push(newComment);
    writeDatabase(COMMENTS_FILE, comments);

    res.status(201).json({ message: 'Comment created successfully', comment: newComment });
});

// 3. Eliminar un comentario
app.delete('/api/comments/:id', (req, res) => {
    const comments = readDatabase(COMMENTS_FILE);
    const commentId = req.params.id;

    const filteredComments = comments.filter((comment) => comment.id !== commentId);

    if (filteredComments.length === comments.length) {
        return res.status(404).json({ error: 'Comment not found' });
    }

    writeDatabase(COMMENTS_FILE, filteredComments);

    res.json({ message: 'Comment deleted successfully' });
});

// 4. Contar comentarios
app.get('/api/comments/count', (req, res) => {
    const comments = readDatabase(COMMENTS_FILE);
    res.json({ count: comments.length });
});

// Iniciar el servidor
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
    });
}

module.exports = app;