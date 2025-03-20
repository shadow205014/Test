// Funcionalidad principal para la tienda

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está logueado
    checkLoggedInStatus();
    
    // Cargar productos
    loadProducts();
    
    // Configurar listeners para filtros y ordenación
    setupFilters();
    
    // Configurar eventos del carrito
    setupCartEvents();
});

// Función para verificar si el usuario está logueado (replicada de auth.js para compartir)
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
    
    // Actualizar conteo de carrito
    updateCartCount();
}

// Función para cargar productos desde "API" (simulada)
function loadProducts() {
    const productosContainer = document.getElementById('productos-container');
    if (!productosContainer) return;
    
    // Productos de ejemplo
    const productos = [
        {
            id: 1,
            titulo: 'Smartphone XZ10 Pro - 6.5" FHD+, 8GB RAM, 128GB, Cámara 108MP',
            precio: 599.99,
            precioAnterior: 699.99,
            rating: 4.5,
            reviews: 128,
            imagen: '/api/placeholder/220/180',
            envioGratis: true,
            disponible: true,
            categoria: 'electronica'
        },
        {
            id: 2,
            titulo: 'Auriculares Bluetooth con Cancelación de Ruido - 40h de Batería',
            precio: 149.99,
            precioAnterior: 179.99,
            rating: 4.8,
            reviews: 234,
            imagen: '/api/placeholder/220/180',
            envioGratis: true,
            disponible: true,
            categoria: 'electronica'
        },
        {
            id: 3,
            titulo: 'Tablet 10.5" Ultra HD - 6GB RAM, 64GB, Android 14, Batería 8000mAh',
            precio: 299.99,
            precioAnterior: null,
            rating: 4.2,
            reviews: 56,
            imagen: '/api/placeholder/220/180',
            envioGratis: true,
            disponible: true,
            categoria: 'electronica'
        },
        {
            id: 4,
            titulo: 'Zapatillas Deportivas Ultralight - Unisex, Transpirables',
            precio: 79.99,
            precioAnterior: 99.99,
            rating: 4.6,
            reviews: 89,
            imagen: '/api/placeholder/220/180',
            envioGratis: true,
            disponible: true,
            categoria: 'moda'
        },
        {
            id: 5,
            titulo: 'Cafetera Automática Programable - 12 Tazas, Filtro Permanente',
            precio: 89.99,
            precioAnterior: null,
            rating: 4.3,
            reviews: 42,
            imagen: '/api/placeholder/220/180',
            envioGratis: false,
            disponible: true,
            categoria: 'hogar'
        },
        {
            id: 6,
            titulo: 'Set de 3 Sartenes Antiadherentes - Aptas para Inducción',
            precio: 59.99,
            precioAnterior: 79.99,
            rating: 4.7,
            reviews: 103,
            imagen: '/api/placeholder/220/180',
            envioGratis: true,
            disponible: false,
            categoria: 'hogar'
        },
        {
            id: 7,
            titulo: 'Novela Bestseller: "El Último Secreto" - Tapa Dura, 450 páginas',
            precio: 24.99,
            precioAnterior: null,
            rating: 4.9,
            reviews: 211,
            imagen: '/api/placeholder/220/180',
            envioGratis: true,
            disponible: true,
            categoria: 'libros'
        },
        {
            id: 8,
            titulo: 'Bicicleta Estática Plegable - 8 Niveles de Resistencia, Pantalla LCD',
            precio: 199.99,
            precioAnterior: 249.99,
            rating: 4.4,
            reviews: 78,
            imagen: '/api/placeholder/220/180',
            envioGratis: false,
            disponible: true,
            categoria: 'deportes'
        }
    ];
    
    // Limpiar contenedor
    productosContainer.innerHTML = '';
    
    // Obtener parámetros de filtro de la URL
    const params = new URLSearchParams(window.location.search);
    const categoriaFiltro = params.get('categoria');
    const ordenar = params.get('ordenar') || 'relevancia';
    
    // Filtrar productos por categoría si es necesario
    let productosFiltrados = categoriaFiltro 
        ? productos.filter(p => p.categoria === categoriaFiltro)
        : productos;
    
    // Ordenar productos
    ordenarProductos(productosFiltrados, ordenar);
    
    // Renderizar productos
    productosFiltrados.forEach(producto => {
        productosContainer.appendChild(crearProductoCard(producto));
    });
}

// Función para crear una tarjeta de producto
function crearProductoCard(producto) {
    const card = document.createElement('div');
    card.className = 'producto-card';
    card.dataset.id = producto.id;
    
    // Generar estrellas HTML
    const estrellas = generarEstrellas(producto.rating);
    
    // Generar HTML para la tarjeta
    card.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.titulo}">
        <div class="producto-info">
            <h3 class="producto-titulo">${producto.titulo}</h3>
            <div class="producto-rating">
                <div class="estrellas">${estrellas}</div>
                <span class="num-reviews">${producto.reviews}</span>
            </div>
            <div class="producto-precio">
                €${producto.precio.toFixed(2)}
                ${producto.precioAnterior ? `<small><del>€${producto.precioAnterior.toFixed(2)}</del></small>` : ''}
            </div>
            <div class="producto-envio">
                ${producto.envioGratis ? 'Envío GRATIS' : 'Envío no incluido'}
            </div>
            <div class="producto-disponibilidad">
                ${producto.disponible ? 'En stock' : 'Temporalmente agotado'}
            </div>
            <div class="producto-actions">
                <button class="btn-add-cart" data-id="${producto.id}">Añadir al carrito</button>
                <button class="btn-buy-now" data-id="${producto.id}">Comprar ahora</button>
            </div>
        </div>
    `;
    
    return card;
}

// Función para generar estrellas según rating
function generarEstrellas(rating) {
    const estrellasEnteras = Math.floor(rating);
    const mediaestrella = rating % 1 >= 0.5 ? 1 : 0;
    const estrellasVacias = 5 - estrellasEnteras - mediaestrella;
    
    let resultado = '';
    
    // Estrellas completas
    for (let i = 0; i < estrellasEnteras; i++) {
        resultado += '★';
    }
    
    // Media estrella si aplica
    if (mediaestrella) {
        resultado += '☆';
    }
    
    // Estrellas vacías
    for (let i = 0; i < estrellasVacias; i++) {
        resultado += '☆';
    }
    
    return resultado;
}

// Función para configurar filtros y ordenación
function setupFilters() {
    const ordenarSelect = document.getElementById('ordenar');
    const filtroBtn = document.getElementById('filtro-btn');
    
    if (ordenarSelect) {
        // Establecer valor según URL
        const params = new URLSearchParams(window.location.search);
        const ordenarParam = params.get('ordenar');
        if (ordenarParam) {
            ordenarSelect.value = ordenarParam;
        }
        
        // Escuchar cambios
        ordenarSelect.addEventListener('change', function() {
            const params = new URLSearchParams(window.location.search);
            params.set('ordenar', this.value);
            window.location.search = params.toString();
        });
    }
    
    if (filtroBtn) {
        // Implementar modal de filtros (simplificado)
        filtroBtn.addEventListener('click', function() {
            alert('Función de filtros avanzados no implementada en esta demo');
        });
    }
}

// Función para ordenar productos
function ordenarProductos(productos, criterio) {
    switch (criterio) {
        case 'precio-asc':
            productos.sort((a, b) => a.precio - b.precio);
            break;
        case 'precio-desc':
            productos.sort((a, b) => b.precio - a.precio);
            break;
        case 'calificacion':
            productos.sort((a, b) => b.rating - a.rating);
            break;
        case 'relevancia':
        default:
            // Por defecto no ordenamos (asumimos que vienen ordenados por relevancia)
            break;
    }
    return productos;
}

// Función para configurar eventos del carrito
function setupCartEvents() {
    // Delegar eventos a cualquier botón de añadir al carrito
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-add-cart')) {
            const productId = e.target.dataset.id;
            addToCart(productId);
        } else if (e.target.classList.contains('btn-buy-now')) {
            const productId = e.target.dataset.id;
            buyNow(productId);
        }
    });
}

// Función para añadir al carrito
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Verificar si el producto ya está en el carrito
    const existingProduct = cart.find(item => item.id === productId);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1,
            added: new Date().getTime()
        });
    }
    
    // Guardar carrito actualizado
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar contador del carrito
    updateCartCount();
    
    // Mostrar mensaje de confirmación
    alert('Producto añadido al carrito');
}

// Función para comprar ahora (simplificada)
function buyNow(productId) {
    // Primero añadimos al carrito
    addToCart(productId);
    
    // Luego redirigimos al checkout
    window.location.href = 'carrito.html?checkout=true';
}

// Función para actualizar contador del carrito
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Calcular cantidad total de items
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Actualizar contador en UI
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}
