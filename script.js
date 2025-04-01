// Función para generar un número aleatorio dentro de un rango
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Función para verificar si un punto está dentro de un círculo
function isPointInCircle(pointX, pointY, circleX, circleY, radius) {
    const dx = pointX - circleX;
    const dy = pointY - circleY;
    return dx * dx + dy * dy <= radius * radius;
}

// Función para obtener la posición y el radio de un planeta
function getPlanetInfo(planetElement) {
    const rect = planetElement.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        radius: rect.width / 2 + 20 // Añadimos un margen alrededor
    };
}

// Función para crear estrellas aleatorias con distancia mínima y evitando planetas
function createStars() {
    const container = document.getElementById('starsContainer');
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    // Solo creamos estrellas si el contenedor está vacío
    if (container.children.length > 0) return;
    
    // Obtenemos información de los planetas para evitar colocar estrellas sobre ellos
    const planet1 = document.getElementById('planet1');
    const planet2 = document.getElementById('planet2');
    const planet1Info = getPlanetInfo(planet1);
    const planet2Info = getPlanetInfo(planet2);
    
    // Configuración de estrellas
    const starCount = Math.floor(containerWidth * containerHeight / 2000);
    const minDistance = 30; // Distancia mínima entre estrellas
    
    const stars = [];
    
    // Intentamos crear estrellas con distancia mínima entre ellas
    for (let i = 0; i < starCount; i++) {
        let attempts = 0;
        let valid = false;
        let x, y;
        
        // Intentamos encontrar una posición válida
        while (!valid && attempts < 10) {
            attempts++;
            x = randomInRange(0, containerWidth);
            y = randomInRange(0, containerHeight);
            
            // Verificamos que no esté sobre ningún planeta
            if (isPointInCircle(x, y, planet1Info.x, planet1Info.y, planet1Info.radius) ||
                isPointInCircle(x, y, planet2Info.x, planet2Info.y, planet2Info.radius)) {
                continue;
            }
            
            valid = true;
            // Verificamos la distancia con otras estrellas
            for (const star of stars) {
                const dx = star.x - x;
                const dy = star.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minDistance) {
                    valid = false;
                    break;
                }
            }
        }
        
        // Si encontramos una posición válida, creamos la estrella
        if (valid) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${x}px`;
            star.style.top = `${y}px`;
            
            // Variamos el tamaño y brillo para dar más realismo
            const size = randomInRange(1, 3);
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            
            // Aseguramos que la opacidad base nunca sea menor al 50%
            const baseOpacity = randomInRange(0.5, 1);
            star.style.opacity = baseOpacity;
            
            // Guardamos la posición para la verificación de distancia
            stars.push({ x, y });
            container.appendChild(star);
            
            // Añadimos un destello aleatorio para el 70% de las estrellas
            if (Math.random() > 0.3) {
                // Creamos una animación personalizada para cada estrella que nunca baje del 50% de opacidad
                const minOpacity = 0.5;
                const maxOpacity = baseOpacity;
                const animationName = `twinkle${i}`;
                const duration = randomInRange(1, 5);
                
                // Creamos un estilo para la animación personalizada
                const styleEl = document.createElement('style');
                styleEl.innerHTML = `
                    @keyframes ${animationName} {
                        0% { opacity: ${maxOpacity}; }
                        50% { opacity: ${minOpacity}; }
                        100% { opacity: ${maxOpacity}; }
                    }
                `;
                document.head.appendChild(styleEl);
                
                // Aplicamos la animación personalizada
                star.style.animation = `${animationName} ${duration}s infinite alternate`;
            }
        }
    }
}

// Función para calcular nueva posición del cometa con trayectoria recta aleatoria
function calculateCometTrajectory() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Generamos un ángulo aleatorio (en radianes)
    const angle = randomInRange(0, Math.PI * 2);
    
    // Calculamos las coordenadas iniciales y finales
    let startX, startY, endX, endY;
    
    // Determinamos si empieza en horizontal o vertical
    if (Math.random() > 0.5) {
        // Empieza en los bordes horizontales (arriba o abajo)
        startX = randomInRange(0, windowWidth);
        startY = Math.random() > 0.5 ? -20 : windowHeight + 20;
        
        // La dirección es opuesta al punto de inicio
        endX = startX + Math.cos(angle) * windowWidth * 2;
        endY = startY + Math.sin(angle) * windowHeight * 2;
    } else {
        // Empieza en los bordes verticales (izquierda o derecha)
        startX = Math.random() > 0.5 ? -20 : windowWidth + 20;
        startY = randomInRange(0, windowHeight);
        
        // La dirección es opuesta al punto de inicio
        endX = startX + Math.cos(angle) * windowWidth * 2;
        endY = startY + Math.sin(angle) * windowHeight * 2;
    }
    
    // Aseguramos que la trayectoria atraviese la pantalla
    // Extendemos la línea para garantizar que cruce completamente la pantalla
    const dx = endX - startX;
    const dy = endY - startY;
    
    // Calculamos la duración de la animación (entre 3 y 6 segundos)
    const duration = randomInRange(3, 6);
    
    return { startX, startY, endX, endY, angle, duration };
}

// Función para animar el cometa
function animateComet() {
    const comet = document.getElementById('comet');
    const trajectory = calculateCometTrajectory();
    
    // Posicionamos el cometa en su punto inicial
    comet.style.left = `${trajectory.startX}px`;
    comet.style.top = `${trajectory.startY}px`;
    comet.style.opacity = '1';
    
    // Calculamos la rotación para que la cola siempre apunte en la dirección correcta
    const radiansToDegrees = (rad) => rad * (180 / Math.PI);
    const rotation = radiansToDegrees(Math.atan2(trajectory.endY - trajectory.startY, trajectory.endX - trajectory.startX)) + 180;
    
    // Ajustamos la rotación de la cola
    comet.style.boxShadow = `${10 * Math.cos(trajectory.angle + Math.PI)}px ${10 * Math.sin(trajectory.angle + Math.PI)}px 15px 5px rgba(30, 144, 255, 0.8)`;
    
    // Creamos y aplicamos la animación usando keyframes
    const animationName = `cometPath${Date.now()}`;
    
    // Creamos un estilo para la animación
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        @keyframes ${animationName} {
            0% {
                left: ${trajectory.startX}px;
                top: ${trajectory.startY}px;
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                left: ${trajectory.endX}px;
                top: ${trajectory.endY}px;
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styleEl);
    
    // Aplicamos la animación
    comet.style.animation = `${animationName} ${trajectory.duration}s linear forwards`;
    
    // Limpiamos y programamos el próximo cometa
    setTimeout(() => {
        comet.style.opacity = '0';
        comet.style.animation = '';
        document.head.removeChild(styleEl);
        
        // Programamos el próximo cometa
        scheduleNextComet();
    }, trajectory.duration * 1000);
}

// Función para programar el próximo cometa
function scheduleNextComet() {
    // Entre 30 segundos y 10 minutos (en milisegundos)
    const minDelay = 30 * 1000;
    const maxDelay = 10 * 60 * 1000;
    const delay = randomInRange(minDelay, maxDelay);
    
    setTimeout(animateComet, delay);
}

// Configuramos el comportamiento del cometa
function setupComet() {
    const comet = document.getElementById('comet');
    const clickMessage = document.getElementById('clickMessage');
    
    // Mostramos un mensaje al pasar el ratón por encima
    comet.addEventListener('mouseover', function(e) {
        clickMessage.style.left = (e.clientX + 10) + 'px';
        clickMessage.style.top = (e.clientY + 10) + 'px';
        clickMessage.style.opacity = '1';
    });
    
    comet.addEventListener('mouseout', function() {
        clickMessage.style.opacity = '0';
    });
    
    // Al hacer clic, redirigimos a index.html
    comet.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    // Actualizamos la posición del mensaje al mover el ratón sobre el cometa
    comet.addEventListener('mousemove', function(e) {
        clickMessage.style.left = (e.clientX + 10) + 'px';
        clickMessage.style.top = (e.clientY + 10) + 'px';
    });
    
    // Iniciamos la secuencia de aparición de cometas
    scheduleNextComet();
}

// Inicializamos todo cuando se carga la página
window.addEventListener('load', function() {
    createStars();
    setupComet();
});

// Solo recreamos las estrellas al cambiar el tamaño de la ventana
window.addEventListener('resize', function() {
    // Limpiamos todas las estrellas existentes
    document.getElementById('starsContainer').innerHTML = '';
    // Creamos nuevas estrellas ajustadas al nuevo tamaño
    createStars();
});
