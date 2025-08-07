pipeline {
    agent any

    tools {
        nodejs "Node24" // Configura una instalación de Node.js en Jenkins
        dockerTool 'Dockertool'  // Cambia el nombre de la herramienta según tu configuración en Jenkins
    }

    triggers {
        pollSCM('* * * * *') // Revisa cambios en Git cada minuto
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo 'Descargando código del repositorio...'
                    checkout scm
                }
            }
        }

        stage('Instalar Dependencias') {
            steps {
                script {
                    echo 'Instalando dependencias de Node.js...'
                    sh 'npm install'
                }
            }
        }

        stage('Ejecutar Tests') {
            steps {
                script {
                    echo 'Ejecutando suite de tests...'
                    sh 'npm test'
                }
            }
            post {
                always {
                    // Publicar resultados de tests si Jenkins tiene el plugin
                    script {
                        if (fileExists('coverage/')) {
                            echo 'Tests completados. Coverage generado.'
                        }
                    }
                }
                failure {
                    error 'Los tests fallaron. No se procederá con el despliegue.'
                }
            }
        }

        stage('Construir Imagen Docker') {
            steps {
                script {
                    echo 'Construyendo imagen Docker...'
                    sh 'docker build -t comments-app:latest .'
                    sh 'docker build -t comments-app:${BUILD_NUMBER} .'
                }
            }
        }

        stage('Detener Contenedor Anterior') {
            steps {
                script {
                    echo 'Deteniendo y eliminando contenedor anterior si existe...'
                    sh '''
                        # Detener y eliminar cualquier contenedor previo
                        docker stop comments-app || true
                        docker rm comments-app || true
                        
                        # Limpiar imágenes no utilizadas
                        docker image prune -f
                    '''
                }
            }
        }

        stage('Desplegar Aplicación') {
            steps {
                script {
                    echo 'Desplegando nueva versión de la aplicación...'
                    sh '''
                        # Ejecutar el contenedor de la aplicación
                        docker run -d \
                            --name comments-app \
                            -p 3000:3000 \
                            --restart unless-stopped \
                            comments-app:latest
                        
                        # Esperar un momento para que la aplicación se inicie
                        sleep 10
                        
                        # Verificar que el contenedor esté corriendo
                        docker ps | grep comments-app
                    '''
                }
            }
        }

        stage('Test de Integración') {
            steps {
                script {
                    echo 'Verificando que la aplicación responda correctamente...'
                    sh '''
                        # Esperar hasta que la aplicación responda
                        for i in {1..30}; do
                            if curl -f http://localhost:3000/api/status; then
                                echo "✅ Aplicación funcionando correctamente"
                                break
                            fi
                            echo "Esperando que la aplicación se inicie... ($i/30)"
                            sleep 2
                        done
                        
                        # Verificar endpoint principal
                        curl -f http://localhost:3000/ || exit 1
                        
                        # Verificar API de comentarios
                        curl -f http://localhost:3000/api/comments || exit 1
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '🎉 ¡Despliegue exitoso! La aplicación está funcionando en http://localhost:3000'
            script {
                sh '''
                    echo "=== ESTADO DEL DESPLIEGUE ==="
                    echo "✅ Build: ${BUILD_NUMBER}"
                    echo "✅ Imagen: comments-app:${BUILD_NUMBER}"
                    echo "✅ URL: http://localhost:3000"
                    echo "✅ Estado del contenedor:"
                    docker ps | grep comments-app
                '''
            }
        }
        failure {
            echo '❌ El despliegue falló. Revisa los logs para más detalles.'
            script {
                sh '''
                    echo "=== INFORMACIÓN DE DEBUG ==="
                    echo "❌ Build fallido: ${BUILD_NUMBER}"
                    echo "Contenedores activos:"
                    docker ps -a | grep comments-app || echo "No hay contenedores comments-app"
                    echo "Logs del contenedor (si existe):"
                    docker logs comments-app || echo "No se pueden obtener logs"
                '''
            }
        }
        always {
            script {
                echo 'Limpiando workspace...'
                // Limpiar archivos temporales pero mantener node_modules para cache
                sh 'rm -f *.log'
            }
        }
    }
}