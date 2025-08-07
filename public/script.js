class CommentApp {
    constructor() {
        this.form = document.getElementById('commentForm');
        this.commentsContainer = document.getElementById('commentsContainer');
        this.commentCount = document.getElementById('commentCount');
        this.submitBtn = document.getElementById('submitBtn');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.loadComments();
        this.updateCommentCount();
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const author = formData.get('author').trim();
        const message = formData.get('message').trim();

        if (!this.validateInput(author, message)) {
            return;
        }

        this.setLoading(true);

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ author, message })
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('¡Comentario publicado exitosamente!', 'success');
                this.form.reset();
                this.loadComments();
                this.updateCommentCount();
            } else {
                this.showMessage(result.error || 'Error al publicar el comentario', 'error');
            }
        } catch (error) {
            this.showMessage('Error de conexión. Intenta nuevamente.', 'error');
            console.error('Error:', error);
        } finally {
            this.setLoading(false);
        }
    }

    validateInput(author, message) {
        if (author.length < 2) {
            this.showMessage('El nombre debe tener al menos 2 caracteres', 'error');
            return false;
        }

        if (message.length < 5) {
            this.showMessage('El comentario debe tener al menos 5 caracteres', 'error');
            return false;
        }

        return true;
    }

    async loadComments() {
        try {
            const response = await fetch('/api/comments');
            const comments = await response.json();

            this.renderComments(comments);
        } catch (error) {
            console.error('Error loading comments:', error);
            this.commentsContainer.innerHTML = '<div class="error">Error al cargar los comentarios</div>';
        }
    }

    renderComments(comments) {
        if (comments.length === 0) {
            this.commentsContainer.innerHTML = `
                <div class="no-comments">
                    <h3>¡Sé el primero en comentar!</h3>
                    <p>No hay comentarios todavía. Comparte tu opinión arriba.</p>
                </div>
            `;
            return;
        }

        // Ordenar comentarios por fecha (más recientes primero)
        comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const commentsHtml = comments.map(comment => this.createCommentHtml(comment)).join('');
        this.commentsContainer.innerHTML = commentsHtml;

        // Agregar event listeners para los botones de eliminar
        this.attachDeleteListeners();
    }

    createCommentHtml(comment) {
        const date = new Date(comment.timestamp).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="comment" data-id="${comment.id}">
                <div class="comment-header">
                    <span class="comment-author">${this.escapeHtml(comment.author)}</span>
                    <span class="comment-date">${date}</span>
                </div>
                <div class="comment-message">${this.escapeHtml(comment.message)}</div>
                <div class="comment-actions">
                    <button class="delete-btn" data-id="${comment.id}">Eliminar</button>
                </div>
            </div>
        `;
    }

    attachDeleteListeners() {
        const deleteButtons = this.commentsContainer.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', this.handleDelete.bind(this));
        });
    }

    async handleDelete(e) {
        const commentId = e.target.dataset.id;
        
        if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
            return;
        }

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Comentario eliminado exitosamente', 'success');
                this.loadComments();
                this.updateCommentCount();
            } else {
                this.showMessage(result.error || 'Error al eliminar el comentario', 'error');
            }
        } catch (error) {
            this.showMessage('Error de conexión. Intenta nuevamente.', 'error');
            console.error('Error:', error);
        }
    }

    async updateCommentCount() {
        try {
            const response = await fetch('/api/comments/count');
            const result = await response.json();
            
            const count = result.count;
            this.commentCount.textContent = `${count} ${count === 1 ? 'comentario' : 'comentarios'}`;
        } catch (error) {
            console.error('Error updating comment count:', error);
        }
    }

    setLoading(isLoading) {
        this.submitBtn.disabled = isLoading;
        this.submitBtn.textContent = isLoading ? 'Publicando...' : 'Publicar Comentario';
    }

    showMessage(message, type) {
        // Remover mensajes anteriores
        const existingMessages = document.querySelectorAll('.error, .success');
        existingMessages.forEach(msg => msg.remove());

        // Crear nuevo mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;

        // Insertar antes del formulario
        const formSection = document.querySelector('.comment-form-section');
        formSection.insertBefore(messageDiv, formSection.firstChild);

        // Remover mensaje después de 5 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CommentApp();
});

// Función para verificar el estado de la API
async function checkApiStatus() {
    try {
        const response = await fetch('/api/status');
        const status = await response.json();
        console.log('API Status:', status);
        return status;
    } catch (error) {
        console.error('API not available:', error);
        return null;
    }
}

// Verificar estado de la API al cargar
checkApiStatus();
