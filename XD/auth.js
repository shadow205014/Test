// Funcionalidad para la autenticación (login y registro)

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario ya está logueado
    checkLoggedInStatus();
    
    // Obtener referencias a los formularios
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Event listener para el formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener los valores del formulario
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember') ? document.getElementById('remember').checked : false;
            
            // Validación básica
            if (!email || !password) {
                showError('Por favor, completa todos los campos');
                return;
            }
            
            // Simular una petición al servidor para autenticar
            // En una aplicación real, esto sería una petición AJAX a un endpoint del servidor
            setTimeout(function() {
                // Simulamos una autenticación exitosa
                // En una aplicación real, esto vendría del servidor tras validar las credenciales
                
                // Usuarios de prueba (simulado)
                const usuariosPrueba = [
                    { email: 'usuario@ejemplo.com', password: 'Password1' },
                    { email: 'admin@mitienda.com', password: 'Admin123' }
                ];
                
                const usuarioEncontrado = usuariosPrueba.find(u => 
                    u.email === email && u.password === password);
                
                if (usuarioEncontrado) {
                    // Login exitoso
                    const userData = {
                        email: email,
                        nombre: email.split('@')[0], // Simulamos obtener el nombre
                        loggedIn: true,
                        timestamp: new Date().getTime()
                    };
                    
                    // Guardar en sessionStorage o localStorage según remember
                    if (remember) {
                        localStorage.setItem('userData', JSON.stringify(userData));
                    } else {
                        sessionStorage.setItem('userData', JSON.stringify(userData));
                    }
                    
                    // Redireccionar a la página principal
                    window.location.href = 'index.html';
                } else {
                    // Login fallido
                    showError('Email o contraseña incorrectos');
                }
            }, 1000); // Simulamos un delay de red
        });
    }
    
    // Event listener para el formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener los valores del formulario
            const nombre = document.getElementById('nombre').value;
            const apellidos = document.getElementById('apellidos').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms').checked;
            
            // Validación básica
            if (!nombre || !apellidos || !email || !password) {
                showError('Por favor, completa todos los campos');
                return;
            }
            
            if (password !== confirmPassword) {
                showError('Las contraseñas no coinciden');
                return;
            }
            
            if (!terms) {
                showError('Debes aceptar los términos y condiciones');
                return;
            }
            
            // Validar formato de contraseña
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
            if (!passwordRegex.test(password)) {
                showError('La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula y un número');
                return;
            }
            
            // Simular registro exitoso
            setTimeout(function() {
                // En una aplicación real, aquí enviaríamos los datos al servidor
                
                // Simular usuario registrado
                const userData = {
                    email: email,
                    nombre: nombre,
                    apellidos: apellidos,
                    loggedIn: true,
                    timestamp: new Date().getTime()
                };
                
                // Guardar en sessionStorage
                sessionStorage.setItem('userData', JSON.stringify(userData));
                
                // Redireccionar a la página principal
                window.location.href = 'index.html';
            }, 1000); // Simulamos un delay de red
        });
    }
    
    // Listener para el botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Eliminar datos de sesión
            localStorage.removeItem('userData');
            sessionStorage.removeItem('userData');
            
            // Actualizar UI o redireccionar
            window.location.href = 'index.html';
        });
    }
});

// Función para verificar si el usuario está logueado
function checkLoggedInStatus() {
    // Verificar si hay datos de usuario en localStorage o sessionStorage
    const userDataStorage = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    
    if (userDataStorage) {
        const userData = JSON.parse(userDataStorage);
        
        // Verificar si los datos son válidos y no han expirado
        const now = new Date().getTime();
        const loginTime = userData.timestamp || 0;
        const hoursElapsed = (now - loginTime) / (1000 * 60 * 60);
        
        // Si han pasado más de 24 horas, forzar logout
        if (hoursElapsed > 24) {
            localStorage.removeItem('userData');
            sessionStorage.removeItem('userData');
            return false;
        }
        
        // El usuario está logueado, actualizar UI según corresponda
        updateUIForLoggedInUser(userData);
        return true;
    }
    
    return false;
}

// Función para actualizar la interfaz según el estado de login
function updateUIForLoggedInUser(userData) {
    const loggedInMenu = document.getElementById('logged-in-menu');
    const loggedOutMenu = document.getElementById('logged-out-menu');
    const userMenu = document.getElementById('user-menu');
    
    if (loggedInMenu && loggedOutMenu) {
        loggedInMenu.style.display = 'block';
        loggedOutMenu.style.display = 'none';
    }
    
    if (userMenu) {
        userMenu.textContent = userData.nombre || 'Mi Cuenta';
    }
}

// Función para mostrar mensajes de error
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Ocultar el mensaje después de 5 segundos
        setTimeout(function() {
            errorElement.style.display = 'none';
        }, 5000);
    }
}
