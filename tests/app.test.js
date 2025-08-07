const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Crear una app independiente para testing
const express = require('express');
const testApp = express();

// Archivos de prueba únicos para cada test
const TEST_COMMENTS_FILE = './test_comments.json';
const TEST_USERS_FILE = './test_users.json';

// Configurar la app de testing
testApp.use(express.json());
testApp.use(express.static('public'));

// Función para leer archivos JSON para testing
const readTestDatabase = (filename) => {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Función para escribir en archivos JSON para testing
const writeTestDatabase = (filename, data) => {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
};

// Configurar rutas de testing
testApp.get('/api/status', (req, res) => {
    const msg = {
        message: 'API de Comentarios funcionando correctamente',
        status: 200,
        timestamp: new Date().toISOString()
    }
    res.json(msg);
});

testApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

testApp.get('/api/comments', (req, res) => {
    const comments = readTestDatabase(TEST_COMMENTS_FILE);
    res.json(comments);
});

testApp.post('/api/comments', (req, res) => {
    const comments = readTestDatabase(TEST_COMMENTS_FILE);
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
    writeTestDatabase(TEST_COMMENTS_FILE, comments);

    res.status(201).json({ message: 'Comment created successfully', comment: newComment });
});

testApp.delete('/api/comments/:id', (req, res) => {
    const comments = readTestDatabase(TEST_COMMENTS_FILE);
    const commentId = req.params.id;

    const filteredComments = comments.filter((comment) => comment.id !== commentId);

    if (filteredComments.length === comments.length) {
        return res.status(404).json({ error: 'Comment not found' });
    }

    writeTestDatabase(TEST_COMMENTS_FILE, filteredComments);

    res.json({ message: 'Comment deleted successfully' });
});

testApp.get('/api/comments/count', (req, res) => {
    const comments = readTestDatabase(TEST_COMMENTS_FILE);
    res.json({ count: comments.length });
});

testApp.get('/users', (req, res) => {
    const users = readTestDatabase(TEST_USERS_FILE);
    res.json(users);
});

testApp.post('/users', (req, res) => {
    const users = readTestDatabase(TEST_USERS_FILE);
    const newUser = req.body;

    if (!newUser.id || !newUser.name || !newUser.email) {
        return res.status(400).json({ error: 'ID, name, and email are required' });
    }

    if (users.some((user) => user.id === newUser.id)) {
        return res.status(400).json({ error: 'User with the same ID already exists' });
    }

    users.push(newUser);
    writeTestDatabase(TEST_USERS_FILE, users);

    res.status(201).json({ message: 'User created successfully', user: newUser });
});

testApp.put('/users/:id', (req, res) => {
    const users = readTestDatabase(TEST_USERS_FILE);
    const userId = req.params.id;
    const updatedUser = req.body;

    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex] = { ...users[userIndex], ...updatedUser };
    writeTestDatabase(TEST_USERS_FILE, users);

    res.json({ message: 'User updated successfully', user: users[userIndex] });
});

testApp.delete('/users/:id', (req, res) => {
    const users = readTestDatabase(TEST_USERS_FILE);
    const userId = req.params.id;

    const filteredUsers = users.filter((user) => user.id !== userId);

    if (filteredUsers.length === users.length) {
        return res.status(404).json({ error: 'User not found' });
    }

    writeTestDatabase(TEST_USERS_FILE, filteredUsers);

    res.json({ message: 'User deleted successfully' });
});

testApp.get('/users/:id', (req, res) => {
    const users = readTestDatabase(TEST_USERS_FILE);
    const userId = req.params.id;

    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    const user = users[userIndex]

    res.json({ user });
});

describe('API Tests', () => {
  beforeEach(() => {
    // Limpiar archivos de prueba antes de cada test
    if (fs.existsSync(TEST_COMMENTS_FILE)) {
      fs.unlinkSync(TEST_COMMENTS_FILE);
    }
    if (fs.existsSync(TEST_USERS_FILE)) {
      fs.unlinkSync(TEST_USERS_FILE);
    }
    // Crear archivos vacíos
    writeTestDatabase(TEST_COMMENTS_FILE, []);
    writeTestDatabase(TEST_USERS_FILE, []);
  });

  afterAll(() => {
    // Limpiar archivos de prueba después de todos los tests
    if (fs.existsSync(TEST_COMMENTS_FILE)) {
      fs.unlinkSync(TEST_COMMENTS_FILE);
    }
    if (fs.existsSync(TEST_USERS_FILE)) {
      fs.unlinkSync(TEST_USERS_FILE);
    }
  });

  describe('Test 1: API Status y Configuración Básica', () => {
    test('debería responder con status 200 en /api/status', async () => {
      const response = await request(testApp)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.message).toContain('API de Comentarios funcionando');
    });

    test('debería servir la página principal en /', async () => {
      const response = await request(testApp)
        .get('/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/html/);
    });

    test('debería obtener lista vacía de comentarios inicialmente', async () => {
      const response = await request(testApp)
        .get('/api/comments')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('Test 2: Funcionalidad de Comentarios CRUD', () => {
    test('debería crear un comentario nuevo correctamente', async () => {
      const newComment = {
        author: 'Test User',
        message: 'Este es un comentario de prueba'
      };

      const response = await request(testApp)
        .post('/api/comments')
        .send(newComment)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Comment created successfully');
      expect(response.body).toHaveProperty('comment');
      expect(response.body.comment).toHaveProperty('id');
      expect(response.body.comment).toHaveProperty('author', newComment.author);
      expect(response.body.comment).toHaveProperty('message', newComment.message);
      expect(response.body.comment).toHaveProperty('timestamp');
    });

    test('debería validar campos requeridos al crear comentario', async () => {
      // Test sin author
      await request(testApp)
        .post('/api/comments')
        .send({ message: 'Solo mensaje' })
        .expect(400);

      // Test sin message
      await request(testApp)
        .post('/api/comments')
        .send({ author: 'Solo autor' })
        .expect(400);

      // Test con author muy corto
      await request(testApp)
        .post('/api/comments')
        .send({ author: 'A', message: 'Mensaje válido' })
        .expect(400);

      // Test con message muy corto
      await request(testApp)
        .post('/api/comments')
        .send({ author: 'Autor válido', message: 'MSG' })
        .expect(400);
    });

    test('debería obtener y contar comentarios correctamente', async () => {
      // Crear algunos comentarios
      const comments = [
        { author: 'Usuario 1', message: 'Primer comentario de prueba' },
        { author: 'Usuario 2', message: 'Segundo comentario de prueba' },
        { author: 'Usuario 3', message: 'Tercer comentario de prueba' }
      ];

      for (const comment of comments) {
        await request(testApp)
          .post('/api/comments')
          .send(comment)
          .expect(201);
      }

      // Verificar que se obtienen todos los comentarios
      const getResponse = await request(testApp)
        .get('/api/comments')
        .expect(200);

      expect(getResponse.body).toHaveLength(3);

      // Verificar el contador
      const countResponse = await request(testApp)
        .get('/api/comments/count')
        .expect(200);

      expect(countResponse.body).toHaveProperty('count', 3);
    });

    test('debería eliminar comentarios correctamente', async () => {
      // Crear un comentario
      const newComment = {
        author: 'Test User',
        message: 'Comentario para eliminar'
      };

      const createResponse = await request(testApp)
        .post('/api/comments')
        .send(newComment)
        .expect(201);

      const commentId = createResponse.body.comment.id;

      // Eliminar el comentario
      await request(testApp)
        .delete(`/api/comments/${commentId}`)
        .expect(200);

      // Verificar que ya no existe
      const getResponse = await request(testApp)
        .get('/api/comments')
        .expect(200);

      expect(getResponse.body).toHaveLength(0);

      // Intentar eliminar un comentario que no existe
      await request(testApp)
        .delete('/api/comments/nonexistent')
        .expect(404);
    });
  });

  describe('Test 3: Funcionalidad de Usuarios y Robustez', () => {
    test('debería manejar operaciones CRUD de usuarios', async () => {
      const newUser = {
        id: 'test-user-1',
        name: 'Test User',
        email: 'test@example.com'
      };

      // Crear usuario
      const createResponse = await request(testApp)
        .post('/users')
        .send(newUser)
        .expect(201);

      expect(createResponse.body).toHaveProperty('message', 'User created successfully');

      // Obtener usuarios
      const getUsersResponse = await request(testApp)
        .get('/users')
        .expect(200);

      expect(getUsersResponse.body).toHaveLength(1);
      expect(getUsersResponse.body[0]).toHaveProperty('id', newUser.id);

      // Buscar usuario específico
      const getUserResponse = await request(testApp)
        .get(`/users/${newUser.id}`)
        .expect(200);

      expect(getUserResponse.body).toHaveProperty('user');
      expect(getUserResponse.body.user).toHaveProperty('id', newUser.id);

      // Actualizar usuario
      const updatedData = { name: 'Updated Name' };
      const updateResponse = await request(testApp)
        .put(`/users/${newUser.id}`)
        .send(updatedData)
        .expect(200);

      expect(updateResponse.body.user).toHaveProperty('name', 'Updated Name');

      // Eliminar usuario
      await request(testApp)
        .delete(`/users/${newUser.id}`)
        .expect(200);

      // Verificar que fue eliminado
      await request(testApp)
        .get(`/users/${newUser.id}`)
        .expect(404);
    });

    test('debería validar datos de usuario', async () => {
      // Test sin campos requeridos
      await request(testApp)
        .post('/users')
        .send({ name: 'Solo nombre' })
        .expect(400);

      await request(testApp)
        .post('/users')
        .send({ id: 'solo-id' })
        .expect(400);

      // Test con usuario duplicado
      const user = {
        id: 'duplicate-test',
        name: 'Duplicate User',
        email: 'duplicate@test.com'
      };

      await request(testApp)
        .post('/users')
        .send(user)
        .expect(201);

      // Intentar crear el mismo usuario otra vez
      await request(testApp)
        .post('/users')
        .send(user)
        .expect(400);
    });

    test('debería manejar errores y casos extremos', async () => {
      // Test de comentarios con caracteres especiales
      const specialComment = {
        author: 'User with éñáéíóú',
        message: 'Mensaje con caracteres especiales: <>"\' & emojis 🚀🎉'
      };

      const response = await request(testApp)
        .post('/api/comments')
        .send(specialComment)
        .expect(201);

      expect(response.body.comment.author).toBe(specialComment.author);
      expect(response.body.comment.message).toBe(specialComment.message);

      // Test de eliminación con ID inválido
      await request(testApp)
        .delete('/api/comments/invalid-id')
        .expect(404);

      // Test de actualización de usuario inexistente
      await request(testApp)
        .put('/users/nonexistent-user')
        .send({ name: 'New Name' })
        .expect(404);

      // Test de obtención de usuario inexistente
      await request(testApp)
        .get('/users/nonexistent-user')
        .expect(404);
    });
  });
});
