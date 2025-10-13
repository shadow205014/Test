// Configuración - REEMPLAZA ESTA URL CON TU WEB APP URL DE GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyE3hNfHSwlQqcla7fU985nz1g8GbES_G8b8uqQbgl1KWYZS7F-9wqYgcztJ6YpgZw0/exec';

// Función para mostrar/ocultar fecha de fin
function toggleFechaFin() {
    const duracion = document.getElementById('duracion').value;
    const fechaFinGroup = document.getElementById('fechaFinGroup');
    const fechaFin = document.getElementById('fechaFin');
    
    if (duracion === 'varios') {
        fechaFinGroup.style.display = 'block';
        fechaFin.required = true;
    } else {
        fechaFinGroup.style.display = 'none';
        fechaFin.required = false;
        fechaFin.value = '';
    }
}

// Función para generar un número aleatorio dentro de un rango
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Función para crear estrellas aleatorias
function createStars() {
    const container = document.getElementById('starsContainer');
    const containerWidth = window.innerWidth;
    const containerHeight = document.body.scrollHeight;
    
    if (container.children.length > 0) return;
    
    const starCount = Math.floor(containerWidth * containerHeight / 2000);
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${randomInRange(0, containerWidth)}px`;
        star.style.top = `${randomInRange(0, containerHeight)}px`;
        
        const size = randomInRange(1, 3);
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        const baseOpacity = randomInRange(0.5, 1);
        star.style.opacity = baseOpacity;
        
        container.appendChild(star);
        
        if (Math.random() > 0.3) {
            const minOpacity = 0.5;
            const maxOpacity = baseOpacity;
            const animationName = `twinkle${i}`;
            const duration = randomInRange(1, 5);
            
            const styleEl = document.createElement('style');
            styleEl.innerHTML = `
                @keyframes ${animationName} {
                    0% { opacity: ${maxOpacity}; }
                    50% { opacity: ${minOpacity}; }
                    100% { opacity: ${maxOpacity}; }
                }
            `;
            document.head.appendChild(styleEl);
            
            star.style.animation = `${animationName} ${duration}s infinite alternate`;
        }
    }
}

// Función para mostrar mensajes
function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.textContent = message;
    messageContainer.className = `message-container show ${type}`;
    
    setTimeout(() => {
        messageContainer.classList.remove('show');
    }, 5000);
}

// Función para validar el formulario
function validateForm(formData) {
    if (!formData.get('nombre').trim()) {
        showMessage('Por favor ingresa tu nombre completo', 'error');
        return false;
    }
    
    const email = formData.get('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Por favor ingresa un correo electrónico válido', 'error');
        return false;
    }
    
    if (!formData.get('discord').trim()) {
        showMessage('Por favor ingresa tu usuario de Discord', 'error');
        return false;
    }
    
    if (!formData.get('evento')) {
        showMessage('Por favor selecciona un tipo de evento', 'error');
        return false;
    }
    
    if (!formData.get('nombreEvento').trim()) {
        showMessage('Por favor ingresa el nombre del evento', 'error');
        return false;
    }
    
    if (!formData.get('duracion')) {
        showMessage('Por favor selecciona la duración del evento', 'error');
        return false;
    }
    
    if (!formData.get('fechaInicio')) {
        showMessage('Por favor ingresa la fecha de inicio', 'error');
        return false;
    }
    
    const fechaInicio = new Date(formData.get('fechaInicio'));
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaInicio < hoy) {
        showMessage('La fecha de inicio debe ser posterior a hoy', 'error');
        return false;
    }
    
    if (formData.get('duracion') === 'varios') {
        if (!formData.get('fechaFin')) {
            showMessage('Por favor ingresa la fecha de fin', 'error');
            return false;
        }
        
        const fechaFin = new Date(formData.get('fechaFin'));
        if (fechaFin < fechaInicio) {
            showMessage('La fecha de fin debe ser posterior o igual a la fecha de inicio', 'error');
            return false;
        }
    }
    
    if (!formData.get('hora')) {
        showMessage('Por favor ingresa la hora del evento', 'error');
        return false;
    }
    
    const participantes = parseInt(formData.get('participantes'));
    if (participantes < 1) {
        showMessage('El número de participantes debe ser mayor a 0', 'error');
        return false;
    }
    
    if (!formData.get('descripcion').trim()) {
        showMessage('Por favor describe tu evento', 'error');
        return false;
    }
    
    if (!document.getElementById('terminos').checked) {
        showMessage('Debes aceptar los términos y condiciones', 'error');
        return false;
    }
    
    return true;
}

// Función para enviar el formulario
async function submitForm(e) {
    e.preventDefault();
    
    const form = document.getElementById('eventForm');
    const submitButton = form.querySelector('.submit-button');
    const formData = new FormData(form);
    
    // Validar formulario
    if (!validateForm(formData)) {
        return;
    }
    
    // Deshabilitar botón y mostrar estado de carga
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    
    // Convertir FormData a objeto
    const data = {};
    formData.forEach((value, key) => {
        if (key !== 'terminos') {
            data[key] = value;
        }
    });
    
    // Si es 1 día, la fecha fin es igual a la de inicio
    if (data.duracion === '1dia') {
        data.fechaFin = data.fechaInicio;
    }
    
    // Agregar timestamp
    data.timestamp = new Date().toLocaleString('es-MX');
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Con mode: 'no-cors' no podemos leer la respuesta, pero si no hay error, asumimos éxito
        showMessage('¡Registro enviado exitosamente! Nos pondremos en contacto contigo pronto.', 'success');
        form.reset();
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Hubo un error al enviar el formulario. Por favor intenta nuevamente.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
    }
}

// Función para establecer las fechas mínimas
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fechaInicio').setAttribute('min', today);
    document.getElementById('fechaFin').setAttribute('min', today);
    
    // Actualizar fecha mínima de fin cuando cambia la de inicio
    document.getElementById('fechaInicio').addEventListener('change', function() {
        document.getElementById('fechaFin').setAttribute('min', this.value);
    });
}

// Inicializar cuando se carga la página
window.addEventListener('load', function() {
    createStars();
    setMinDate();
    
    const form = document.getElementById('eventForm');
    form.addEventListener('submit', submitForm);
});

// Recrear estrellas al cambiar tamaño
window.addEventListener('resize', function() {
    document.getElementById('starsContainer').innerHTML = '';
    createStars();
});