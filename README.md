# 💬 Aplicación de Comentarios - Foro de Discusión

Una aplicación web completa desarrollada con Node.js y Express que permite a los usuarios crear, ver y eliminar comentarios en tiempo real. Incluye dockerización completa y pipeline de CI/CD con Jenkins.

## 🚀 Características

- **Interfaz Moderna**: Página web responsiva con diseño atractivo
- **CRUD Completo**: Crear, leer, actualizar y eliminar comentarios y usuarios
- **API RESTful**: Endpoints bien estructurados para todas las operaciones
- **Validación**: Validación robusta de datos tanto en frontend como backend
- **Tests Completos**: Suite de 10 tests que cubren todas las funcionalidades
- **Dockerización**: Configuración completa para contenedores Docker
- **CI/CD**: Pipeline automatizado con Jenkins que se ejecuta cada minuto

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Base de Datos**: JSON files (comentarios y usuarios)
- **Testing**: Jest, Supertest
- **Containerización**: Docker
- **CI/CD**: Jenkins
- **Monitoreo**: Polling automático de Git cada minuto

## 📁 Estructura del Proyecto

```
practica_despliegue/
├── public/
│   ├── index.html          # Página principal de la aplicación
│   ├── style.css           # Estilos de la aplicación
│   └── script.js           # Lógica del frontend
├── tests/
│   └── app.test.js         # Suite completa de tests
├── index.js                # Servidor principal de Express
├── package.json            # Dependencias y scripts
├── Dockerfile             # Configuración de Docker
├── Jenkinsfile            # Pipeline de CI/CD
├── .dockerignore          # Archivos ignorados por Docker
├── users.json             # Base de datos de usuarios
├── comments.json          # Base de datos de comentarios
└── README.md              # Este archivo
```

## 🏃‍♂️ Inicio Rápido

### 1. Ejecutar Localmente

```bash
# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Iniciar aplicación
npm start
```

La aplicación estará disponible en: http://localhost:3000

### 2. Ejecutar con Docker

```bash
# Construir imagen
docker build -t comments-app:latest .

# Ejecutar contenedor
docker run -d --name comments-app -p 3000:3000 comments-app:latest
```

## 🧪 Tests

La aplicación incluye 10 tests organizados en 3 grupos:

### Test 1: API Status y Configuración Básica
- ✅ Verificación del endpoint `/api/status`
- ✅ Servir página principal
- ✅ Obtener lista vacía de comentarios

### Test 2: Funcionalidad de Comentarios CRUD
- ✅ Crear comentarios nuevos
- ✅ Validar campos requeridos
- ✅ Obtener y contar comentarios
- ✅ Eliminar comentarios

### Test 3: Funcionalidad de Usuarios y Robustez
- ✅ Operaciones CRUD de usuarios
- ✅ Validación de datos de usuario
- ✅ Manejo de errores y casos extremos

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch
```

## 🌐 API Endpoints

### Comentarios
- `GET /api/comments` - Obtener todos los comentarios
- `POST /api/comments` - Crear nuevo comentario
- `DELETE /api/comments/:id` - Eliminar comentario
- `GET /api/comments/count` - Contar comentarios

### Usuarios
- `GET /users` - Obtener todos los usuarios
- `POST /users` - Crear nuevo usuario
- `GET /users/:id` - Obtener usuario específico
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### Sistema
- `GET /api/status` - Estado de la API
- `GET /` - Página principal

## 🔧 Configuración de Jenkins

### Prerrequisitos
- Jenkins corriendo en contenedor Docker
- Git configurado en Jenkins
- Node.js plugin instalado
- Docker plugin instalado

### Paso a Paso para Configurar Jenkins

#### 1. Acceder a Jenkins
- Abrir navegador y ir a: `http://localhost:8080` (o el puerto donde esté Jenkins)
- Iniciar sesión con tus credenciales

#### 2. Configurar Herramientas Globales
1. Ir a **Administrar Jenkins** → **Global Tool Configuration**
2. **Configurar Node.js**:
   - Nombre: `Node24`
   - Versión: `NodeJS 24.x` (o la más reciente)
   - ✅ Marcar "Install automatically"
3. **Configurar Docker**:
   - Nombre: `Dockertool`
   - ✅ Marcar "Install automatically"
   - Versión: "latest"

#### 3. Crear Nuevo Trabajo
1. Desde el dashboard, hacer clic en **"Nuevo Trabajo"**
2. Introducir nombre: `comments-app-pipeline`
3. Seleccionar **"Pipeline"**
4. Hacer clic en **"OK"**

#### 4. Configurar el Pipeline
1. En la configuración del trabajo:
   
   **General**:
   - ✅ Marcar "GitHub project"
   - Project url: `https://github.com/jonathancm24/practica_despliegue`
   
   **Build Triggers**:
   - ✅ Marcar "Poll SCM"
   - Schedule: `* * * * *` (revisa cada minuto)
   
   **Pipeline**:
   - Definition: "Pipeline script from SCM"
   - SCM: "Git"
   - Repository URL: `https://github.com/jonathancm24/practica_despliegue.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

2. Hacer clic en **"Guardar"**

#### 5. Configurar Credenciales Git (si es repositorio privado)
1. Ir a **Administrar Jenkins** → **Manage Credentials**
2. Agregar credenciales de GitHub si el repositorio es privado

#### 6. Ejecutar Pipeline
1. Desde el trabajo, hacer clic en **"Construir ahora"**
2. Monitorear la ejecución en **"Console Output"**

### Pipeline Automatizado

El pipeline de Jenkins realiza automáticamente:

1. **🔄 Checkout**: Descarga el código del repositorio
2. **📦 Instalar Dependencias**: Ejecuta `npm install`
3. **🧪 Ejecutar Tests**: Ejecuta la suite completa de tests
   - Si algún test falla, el pipeline se detiene
4. **🐳 Construir Docker**: Crea la imagen Docker
5. **🗑️ Limpiar**: Detiene y elimina contenedores anteriores
6. **🚀 Desplegar**: Ejecuta el nuevo contenedor
7. **✅ Verificar**: Comprueba que la aplicación responda correctamente

### Monitoreo del Pipeline

- **Trigger**: Se ejecuta automáticamente cada minuto si hay cambios en Git
- **Logs**: Ver progreso en tiempo real en "Console Output"
- **Estado**: Dashboard muestra el estado de cada build
- **Notificaciones**: Éxito ✅ o fallo ❌ de cada etapa

## 📊 Funcionalidades de la Aplicación Web

### Página Principal
- Formulario para agregar comentarios con validación
- Lista de comentarios ordenados por fecha (más recientes primero)
- Contador de comentarios en tiempo real
- Botones para eliminar comentarios individuales

### Validaciones
- **Autor**: Mínimo 2 caracteres
- **Mensaje**: Mínimo 5 caracteres
- **Campos requeridos**: No se permiten campos vacíos
- **Caracteres especiales**: Soporte completo para emojis y caracteres especiales

### Características UX/UI
- **Diseño Responsivo**: Funciona en móviles y escritorio
- **Feedback Visual**: Mensajes de éxito y error
- **Animaciones**: Transiciones suaves y efectos hover
- **Accesibilidad**: Formularios bien etiquetados

## 🔄 Flujo de Trabajo Completo

1. **Desarrollo**: Modificar código en tu editor favorito
2. **Testing**: Ejecutar `npm test` para verificar que todo funciona
3. **Commit**: Hacer commit y push a GitHub
4. **Automatización**: Jenkins detecta el cambio automáticamente
5. **Validación**: Pipeline ejecuta tests automáticamente
6. **Despliegue**: Si tests pasan, se despliega nueva versión
7. **Verificación**: Pipeline verifica que la aplicación funcione

## 🛡️ Seguridad y Validación

- Validación de entrada tanto en frontend como backend
- Sanitización de datos para prevenir XSS
- Manejo robusto de errores
- Tests que cubren casos extremos y validaciones

## 📈 Monitoreo y Logs

- Logs detallados en cada etapa del pipeline
- Verificación automática de salud de la aplicación
- Reinicio automático del contenedor si es necesario
- Limpieza automática de recursos no utilizados

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

Si tienes problemas:

1. **Verificar que Docker esté corriendo**: `docker ps`
2. **Verificar logs del contenedor**: `docker logs comments-app`
3. **Revisar logs de Jenkins**: En el dashboard de Jenkins
4. **Ejecutar tests localmente**: `npm test`

## 🎯 Próximas Funcionalidades

- [ ] Autenticación de usuarios
- [ ] Edición de comentarios
- [ ] Respuestas a comentarios (hilos)
- [ ] Likes/dislikes
- [ ] Moderación de contenido
- [ ] Base de datos persistente (PostgreSQL/MongoDB)
- [ ] Notificaciones en tiempo real
- [ ] Búsqueda y filtros

---

## 🏆 Estado del Proyecto

✅ **Aplicación funcionando**  
✅ **Tests pasando (10/10)**  
✅ **Docker funcionando**  
✅ **Pipeline Jenkins configurado**  
✅ **Despliegue automatizado**  

**🚀 ¡La aplicación está lista para usar en http://localhost:3000!**