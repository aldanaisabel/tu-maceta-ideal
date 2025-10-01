document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------------------
    // 1. Funcionalidad del Menú Lateral (Sidebar)
    // --------------------------------------------------------------------
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');


    if (hamburgerMenu && sidebar) {
        hamburgerMenu.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });


        // Opcional: Cerrar el sidebar si se hace clic fuera de él (para mejorar la UX)
        document.addEventListener('click', (event) => {
             if (!sidebar.contains(event.target) && !hamburgerMenu.contains(event.target) && sidebar.classList.contains('open')) {
                 sidebar.classList.remove('open');
             }
        });
    }


    // --------------------------------------------------------------------
    // 2. Funcionalidad de Personalización de Maceta (en personalizar.html)
    // --------------------------------------------------------------------
    const macetaPreview = document.getElementById('maceta-preview');
    const previewMaterial = document.getElementById('preview-material');
    const previewColor = document.getElementById('preview-color');
    const previewSize = document.getElementById('preview-size');
    const selectSize = document.getElementById('size');
    const quantityInput = document.getElementById('quantity');
    const colorOptions = document.querySelectorAll('.color-opcion');
    const resumenSize = document.getElementById('resumen-size');
    const resumenColor = document.getElementById('resumen-color');
    const resumenQuantity = document.getElementById('resumen-quantity');
    const costoUnidad = document.getElementById('costo-unidad');
    const precioTotal = document.getElementById('precio-total');


    let currentPrice = 0; // Para almacenar el precio base de la maceta seleccionada
    let selectedColor = "Terracota"; // Color inicial
    let selectedSize = "mediana"; // Tamaño inicial


    const prices = {
        'pequeña': 10.00,
        'mediana': 15.00,
        'grande': 20.00
    };


    function updateMacetaPersonalization() {
        const size = selectSize ? selectSize.value : 'mediana';
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        const color = selectedColor; // Ya está actualizado por el clic



        // Actualizar el precio base y total
        currentPrice = prices[size] || 0;
        const total = currentPrice * quantity;


        // Actualizar la vista previa
        if (macetaPreview) {
            // Lógica para cambiar la imagen de la maceta según el color y tamaño
            // Por ahora, solo actualizamos el placeholder o podríamos tener un mapa de imágenes
            // Ejemplo: macetaPreview.src = `images/maceta-${size}-${color}.png`;
            // Para el placeholder, solo actualizamos el texto si no tenemos imágenes reales
            macetaPreview.alt = `Maceta ${size} ${color}`;
            // Si quieres un cambio visual con el placeholder, podríamos cambiar el color de fondo:
            // macetaPreview.style.backgroundColor = color === 'Blanco' ? '#f0f0f0' : color;
        }
        if (previewMaterial) previewMaterial.textContent = "Terracota"; // Material fijo por ahora
        if (previewColor) previewColor.textContent = color;
        if (previewSize) previewSize.textContent = size.charAt(0).toUpperCase() + size.slice(1); // Capitalizar



        // Actualizar el resumen
        if (resumenSize) resumenSize.textContent = size.charAt(0).toUpperCase() + size.slice(1);
        if (resumenColor) resumenColor.textContent = color;
        if (resumenQuantity) resumenQuantity.textContent = quantity;
        if (costoUnidad) costoUnidad.textContent = `$${currentPrice.toFixed(2)}`;
        if (precioTotal) precioTotal.textContent = `$${total.toFixed(2)}`;
    }


    // Event Listeners para la personalización
    if (selectSize) {
        selectSize.addEventListener('change', updateMacetaPersonalization);
    }
    if (quantityInput) {
        quantityInput.addEventListener('change', updateMacetaPersonalization);
        quantityInput.addEventListener('input', updateMacetaPersonalization); // Para cambios mientras se escribe
    }


    if (colorOptions.length > 0) {
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remover 'selected' de todos y añadirlo al clickeado
                colorOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedColor = option.dataset.color; // Obtener el color del data-attribute
                updateMacetaPersonalization();
            });
        });
        // Seleccionar un color por defecto al cargar la página (Terracota en este caso)
        const defaultColor = document.querySelector(`.color-opcion[data-color="${selectedColor}"]`);
        if (defaultColor) {
            defaultColor.classList.add('selected');
        }
    }


    // Inicializar la personalización cuando la página carga (si estamos en personalizar.html)
    if (document.getElementById('personalizacion-maceta')) {
        updateMacetaPersonalization();


        // Si la página se carga con un parámetro de tamaño (ej. desde index.html)
        const urlParams = new URLSearchParams(window.location.search);
        const initialSize = urlParams.get('size');
        if (initialSize && selectSize) {
            selectSize.value = initialSize;
            updateMacetaPersonalization();
        }
    }



    // --------------------------------------------------------------------
    // 3. Funcionalidad de Detalle de Producto (en producto-detalle.html)
    // --------------------------------------------------------------------
    const btnCantidadMenos = document.querySelector('#producto-detalle .btn-cantidad:first-child');
    const inputCantidadDetalle = document.querySelector('#producto-detalle .input-cantidad');
    const btnCantidadMas = document.querySelector('#producto-detalle .btn-cantidad:last-child');
    const medidaOpciones = document.querySelectorAll('.medida-opcion');
    const precioProductoSpan = document.querySelector('.precio-producto span'); // El span que contiene el precio


    const basePricesDetail = {
        'chica': 20.00, // Ajusta estos precios según tu lógica real
        'mediana': 25.00,
        'grande': 30.00
    };
    let currentProductBasePrice = 20.00; // Precio inicial de la "cuadrada flor"
    let currentSelectedMeasure = 'mediana'; // Medida inicial seleccionada


    function updateProductDetailPrice() {
        if (!precioProductoSpan) return; // Salir si no estamos en la página de detalle


        const quantity = inputCantidadDetalle ? parseInt(inputCantidadDetalle.value) : 1;
        // Obtener el precio base según la medida seleccionada
        const pricePerUnit = basePricesDetail[currentSelectedMeasure] || currentProductBasePrice;
        const totalCalculatedPrice = pricePerUnit * quantity;


        precioProductoSpan.textContent = `$${totalCalculatedPrice.toFixed(2)}`; // Formato con 2 decimales
    }


    if (btnCantidadMenos && inputCantidadDetalle && btnCantidadMas) {
        btnCantidadMenos.addEventListener('click', () => {
            let currentValue = parseInt(inputCantidadDetalle.value);
            if (currentValue > 1) {
                inputCantidadDetalle.value = currentValue - 1;
                updateProductDetailPrice();
            }
        });


        btnCantidadMas.addEventListener('click', () => {
            let currentValue = parseInt(inputCantidadDetalle.value);
            inputCantidadDetalle.value = currentValue + 1;
            updateProductDetailPrice();
        });


        inputCantidadDetalle.addEventListener('change', () => {
            if (parseInt(inputCantidadDetalle.value) < 1 || isNaN(parseInt(inputCantidadDetalle.value))) {
                inputCantidadDetalle.value = 1; // Asegura al menos 1
            }
            updateProductDetailPrice();
        });
    }


    if (medidaOpciones.length > 0) {
        medidaOpciones.forEach(option => {
            option.addEventListener('click', () => {
                medidaOpciones.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                currentSelectedMeasure = option.dataset.medida;
                updateProductDetailPrice();
            });
        });
        // Seleccionar la medida por defecto al cargar la página
        const defaultMeasure = document.querySelector(`.medida-opcion[data-medida="${currentSelectedMeasure}"]`);
        if (defaultMeasure) {
            defaultMeasure.classList.add('selected');
        }
    }


    // Inicializar el precio en la página de detalle al cargar
    if (document.getElementById('producto-detalle')) {
        updateProductDetailPrice();
    }


    // --------------------------------------------------------------------
    // 4. Lógica del Carrito de Compras
    // --------------------------------------------------------------------
    // Función para obtener el carrito del localStorage
    function getCart() {
        const cart = localStorage.getItem('shoppingCart');
        return cart ? JSON.parse(cart) : [];
    }


    // Función para guardar el carrito en el localStorage
    function saveCart(cart) {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartCount(); // Actualizar el contador cada vez que se guarda el carrito
    }


    // Referencia al span del contador del carrito en el header
    const cartCountSpan = document.getElementById('cart-count');


    // Función para actualizar el contador del carrito en el header
    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountSpan) { // Solo actualizar si el elemento existe en la página
            cartCountSpan.textContent = totalItems;
            // Mostrar/ocultar el contador dependiendo si hay ítems
            cartCountSpan.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    }


    // Función para añadir un item al carrito
    function addItemToCart(product) {
        const cart = getCart();
        const existingItemIndex = cart.findIndex(item => item.id === product.id &&
            (item.size === product.size || (!item.size && !product.size)) &&
            (item.color === product.color || (!item.color && !product.color)) &&
            (item.measure === product.measure || (!item.measure && !product.measure))
        );


        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += product.quantity;
        } else {
            cart.push(product);
        }
        saveCart(cart);
        alert(`${product.name} (x${product.quantity}) añadido al carrito.`);
    }


    // Helper para obtener la cantidad actual de un item del carrito
    function getCartItemQuantity(dataset) {
        const cart = getCart();
        const item = cart.find(i => i.id === dataset.id &&
            (i.size === dataset.size || (!i.size && !dataset.size)) &&
            (i.color === dataset.color || (!i.color && !dataset.color)) &&
            (i.measure === dataset.measure || (!i.measure && !dataset.measure))
        );
        return item ? item.quantity : 0;
    }



    // Función para actualizar la cantidad de un item en el carrito
    function updateQuantity(dataset, delta, isAbsolute = false) {
        let cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === dataset.id &&
            (item.size === dataset.size || (!item.size && !dataset.size)) &&
            (item.color === dataset.color || (!item.color && !dataset.color)) &&
            (item.measure === dataset.measure || (!item.measure && !dataset.measure))
        );


        if (itemIndex > -1) {
            if (isAbsolute) {
                cart[itemIndex].quantity = Math.max(1, delta); // Delta es la nueva cantidad
            } else {
                cart[itemIndex].quantity += delta;
            }


            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
            saveCart(cart);
            renderCart(); // Volver a renderizar el carrito para reflejar los cambios
        }
    }



  // Referencias a los elementos del DOM en la página del carrito
    const cartItemsList = document.getElementById('cart-items-list');
    const summaryItemCount = document.getElementById('summary-item-count');
    const summaryTotalPrice = document.getElementById('summary-total-price');
    const emptyCartMessageContainer = document.querySelector('.empty-cart-message-container');



    // Función para renderizar los items del carrito en la página carrito.html
    function renderCart() {
        const cart = getCart();


        if (cartItemsList) { // Asegurarse de que estamos en la página del carrito
            cartItemsList.innerHTML = ''; // Limpiar la lista existente


            if (cart.length === 0) {
                if (emptyCartMessageContainer) {
                    emptyCartMessageContainer.style.display = 'block';
                }
                if (summaryItemCount) summaryItemCount.textContent = '0';
                if (summaryTotalPrice) summaryTotalPrice.textContent = '$0.00';
            } else {
                if (emptyCartMessageContainer) {
                    emptyCartMessageContainer.style.display = 'none';
                }


                let totalItems = 0;
                let totalPrice = 0;


                cart.forEach(item => {
                    totalItems += item.quantity;
                    totalPrice += item.price * item.quantity;


                    const cartItemDiv = document.createElement('div');
                    cartItemDiv.classList.add('cart-item');
                    cartItemDiv.dataset.id = item.id;
                    cartItemDiv.dataset.size = item.size || '';
                    cartItemDiv.dataset.color = item.color || '';
                    cartItemDiv.dataset.measure = item.measure || '';
                    cartItemDiv.dataset.dimension = item.dimension || '';


                    cartItemDiv.innerHTML = `
                        <div class="cart-item-image-wrapper">
                            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        </div>
                        <div class="cart-item-details">
                            <h3 class="cart-item-name">${item.name}</h3>
                            <p class="cart-item-price-per-unit">Precio unidad: $${item.price.toFixed(2)}</p>
                            <p class="cart-item-specs">
                                ${item.size ? `Tamaño: ${item.size.charAt(0).toUpperCase() + item.size.slice(1)}` : ''}
                                ${item.color ? `Color: ${item.color}` : ''}
                                ${item.measure ? `Medida: ${item.measure.charAt(0).toUpperCase() + item.measure.slice(1)}` : ''}
                                ${item.dimension ? `(${item.dimension})` : ''}
                            </p>
                        </div>
                        <div class="cart-item-quantity-controls">
                            <button class="btn-quantity-cart decrease-quantity"
                                data-id="${item.id}"
                                data-size="${item.size || ''}"
                                data-color="${item.color || ''}"
                                data-measure="${item.measure || ''}">-</button>
                            <input type="number" value="${item.quantity}" min="1" class="quantity-input-cart"
                                data-id="${item.id}"
                                data-size="${item.size || ''}"
                                data-color="${item.color || ''}"
                                data-measure="${item.measure || ''}">
                            <button class="btn-quantity-cart increase-quantity"
                                data-id="${item.id}"
                                data-size="${item.size || ''}"
                                data-color="${item.color || ''}"
                                data-measure="${item.measure || ''}">+</button>
                        </div>
                        <div class="cart-item-total">
                            <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <button class="remove-item-cart"
                                data-id="${item.id}"
                                data-size="${item.size || ''}"
                                data-color="${item.color || ''}"
                                data-measure="${item.measure || ''}"><i class="fas fa-trash"></i></button>
                    `;
                    cartItemsList.appendChild(cartItemDiv);
                });


                // Actualizar el resumen
                if (summaryItemCount) summaryItemCount.textContent = totalItems;
                if (summaryTotalPrice) summaryTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;


                // Añadir event listeners a los botones de cantidad y eliminar recién creados
                cartItemsList.querySelectorAll('.decrease-quantity').forEach(button => {
                    button.addEventListener('click', (event) => {
                        updateQuantity(event.target.dataset, -1);
                    });
                });
                cartItemsList.querySelectorAll('.increase-quantity').forEach(button => {
                    button.addEventListener('click', (event) => {
                        updateQuantity(event.target.dataset, 1);
                    });
                });
                cartItemsList.querySelectorAll('.quantity-input-cart').forEach(input => {
                    input.addEventListener('change', (event) => {
                        let newQuantity = parseInt(event.target.value);
                        if (isNaN(newQuantity) || newQuantity < 1) {
                            newQuantity = 1;
                            event.target.value = 1;
                        }
                        updateQuantity(event.target.dataset, newQuantity, true);
                    });
                });
                cartItemsList.querySelectorAll('.remove-item-cart').forEach(button => {
                    button.addEventListener('click', (event) => {
                        removeItemFromCart(event.currentTarget.dataset);
                    });
                });
            }
        }
    }


    // Función para eliminar un item del carrito
    function removeItemFromCart(dataset) {
        let cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === dataset.id &&
            (item.size === dataset.size || (!item.size && !dataset.size)) &&
            (item.color === dataset.color || (!item.color && !dataset.color)) &&
            (item.measure === dataset.measure || (!item.measure && !dataset.measure))
        );


        if (itemIndex > -1) {
            cart.splice(itemIndex, 1);
            saveCart(cart);
            renderCart();
            alert('Producto eliminado del carrito.');
        }
    }



    // --------------------------------------------------------------------
    // 5. Inicialización y Event Listeners de los botones "Agregar al Carrito"
    // --------------------------------------------------------------------
    // Botón en personalizar.html
    const addToCartPersonalizarBtn = document.querySelector('#personalizacion-maceta .boton-primario');
    if (addToCartPersonalizarBtn) {
        addToCartPersonalizarBtn.addEventListener('click', () => {
            const size = document.getElementById('size').value;
            const color = document.querySelector('.color-opcion.selected')?.dataset.color || 'Terracota';
            const quantity = parseInt(document.getElementById('quantity').value);
            const price = parseFloat(document.getElementById('costo-unidad').textContent.replace('$', ''));


            const product = {
                id: `personalized-${size}-${color}`,
                name: `Maceta Personalizada (${size}, ${color})`,
                price: price,
                quantity: quantity,
                image: 'https://via.placeholder.com/100x100?text=Maceta+Personalizada',
                size: size,
                color: color,
            };
            addItemToCart(product);
        });
    }


    // Botón en producto-detalle.html
    const addToCartProductDetailBtn = document.querySelector('#producto-detalle .add-to-cart');
    if (addToCartProductDetailBtn) {
        addToCartProductDetailBtn.addEventListener('click', () => {
            const name = document.querySelector('#producto-detalle h2').textContent;
            const quantity = parseInt(document.querySelector('#producto-detalle .input-cantidad').value);
            const currentSelectedMeasureElement = document.querySelector('#producto-detalle .medida-opcion.selected');
            const measure = currentSelectedMeasureElement ? currentSelectedMeasureElement.dataset.medida : 'mediana';
            const dimension = currentSelectedMeasureElement ? currentSelectedMeasureElement.dataset.dimension : '60x80';
            const priceSpanText = document.querySelector('#producto-detalle .precio-producto span').textContent;
            const pricePerUnit = parseFloat(priceSpanText.replace('$', '').replace(/\./g, '').trim()) / quantity;
            const image = document.querySelector('#producto-detalle .galeria-producto img').src;



            const product = {
                id: `product-${name.replace(/\s/g, '-')}-${measure}`,
                name: name,
                price: pricePerUnit,
                quantity: quantity,
                image: image,
                measure: measure,
                dimension: dimension,
            };
            addItemToCart(product);
        });
    }


    // Event listener para el icono del carrito en el header (para redirigir a carrito.html)
    const headerCartIcon = document.querySelector('.header-icons .fa-shopping-cart');
    if (headerCartIcon) {
        headerCartIcon.addEventListener('click', () => {
            window.location.href = 'carrito.html';
        });
    }



    // --------------------------------------------------------------------
    // 6. Funciones de Inicialización al Cargar la Página (Generales)
    // --------------------------------------------------------------------
    updateCartCount();


    if (document.getElementById('carrito-page')) {
        renderCart();
    }


    // --------------------------------------------------------------------
    // 7. Gestión de Productos (Admin Panel)
    // --------------------------------------------------------------------


    // Helper para obtener productos del localStorage
    function getProducts() {
        const products = localStorage.getItem('productCatalog');
        return products ? JSON.parse(products) : [];
    }


    // Helper para guardar productos en localStorage
    function saveProducts(products) {
        localStorage.setItem('productCatalog', JSON.stringify(products));
        // Si estamos en el admin panel, renderizamos la lista
        if (document.getElementById('product-list-admin')) {
            renderProductListAdmin();
        }
    }


    // Inicializar algunos productos de ejemplo si no existen
    function initializeDefaultProducts() {
        const products = getProducts();
        if (products.length === 0) {
            const defaultProducts = [
                {
                    id: 'maceta-cuadrada-flor',
                    name: 'Maceta Cuadrada Flor',
                    description: 'La maceta es ideal para plantas grandes, con un diseño floral moderno.',
                    basePrice: 20.00,
                    imageUrl: 'https://via.placeholder.com/400x400?text=Maceta+Cuadrada+Flor',
                    availableColors: ['Terracota', 'Blanco', 'Negro', 'Rojo']
                },
                {
                    id: 'jardinera-rectangular',
                    name: 'Jardinera Rectangular',
                    description: 'Perfecta para alféizares o balcones, ideal para hierbas o flores pequeñas.',
                    basePrice: 14.00,
                    imageUrl: 'https://via.placeholder.com/400x400?text=Jardinera+Rectangular',
                    availableColors: ['Terracota', 'Verde Menta', 'Gris']
                },
                {
                    id: 'maceta-minimalista-redonda',
                    name: 'Maceta Minimalista Redonda',
                    description: 'Diseño elegante y moderno para cualquier interior.',
                    basePrice: 18.00,
                    imageUrl: 'https://via.placeholder.com/400x400?text=Maceta+Minimalista+Redonda',
                    availableColors: ['Blanco', 'Negro', 'Rosa Pálido', 'Azul Cielo']
                }
            ];
            saveProducts(defaultProducts);
        }
    }



    // Referencias a elementos del formulario de añadir producto (¡ID's actualizados!)
    const addProductForm = document.getElementById('add-product-form');
    const productNameInput = document.getElementById('product-name');
    const productDescriptionInput = document.getElementById('product-description');
    const productBasePriceInput = document.getElementById('product-base-price');
    const productImageUrlInput = document.getElementById('product-image-url');
    const productColorsInput = document.getElementById('product-colors'); // Campo de colores


    const productListAdmin = document.getElementById('product-list-admin'); // Contenedor para la lista


    if (addProductForm) {
        addProductForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevenir el envío del formulario


            const name = productNameInput.value.trim();
            const description = productDescriptionInput.value.trim();
            const basePrice = parseFloat(productBasePriceInput.value);
            const imageUrl = productImageUrlInput.value.trim();
            // Procesar los colores: dividir por comas, limpiar espacios y filtrar vacíos
            const availableColors = productColorsInput.value.split(',').map(color => color.trim()).filter(color => color !== '');



            // Validación básica
            if (!name || !description || isNaN(basePrice) || basePrice < 0 || !imageUrl || availableColors.length === 0) {
                alert('Por favor, completa todos los campos correctamente, incluyendo al menos un color.');
                return;
            }


            const products = getProducts();
            const newProductId = 'product-' + Date.now(); // ID único basado en timestamp


            const newProduct = {
                id: newProductId,
                name: name,
                description: description,
                basePrice: basePrice,
                imageUrl: imageUrl,
                availableColors: availableColors // Guardamos el array de colores
            };


            products.push(newProduct);
            saveProducts(products); // Guardar y renderizar
            alert('Producto agregado con éxito!');
            addProductForm.reset(); // Limpiar el formulario
        });
    }


    // Función para renderizar la lista de productos en el panel de administración
    function renderProductListAdmin() {
        if (!productListAdmin) return; // Salir si no estamos en el admin panel


        const products = getProducts();
        productListAdmin.innerHTML = ''; // Limpiar la lista existente


        if (products.length === 0) {
            productListAdmin.innerHTML = '<p>No hay productos en el catálogo.</p>';
            return;
        }


        products.forEach(product => {
            const productItemDiv = document.createElement('div');
            productItemDiv.classList.add('product-item-admin');
            productItemDiv.dataset.productId = product.id; // Para identificar el producto al eliminar/editar


            productItemDiv.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <div class="product-item-admin-details">
                    <h4>${product.name}</h4>
                    <p>${product.description.substring(0, 70)}${product.description.length > 70 ? '...' : ''}</p>
                    <p>Precio Base: $${product.basePrice.toFixed(2)}</p>
                    <p>Colores: ${product.availableColors.join(', ')}</p>
                </div>
                <div class="product-item-admin-actions">
                    <button class="boton-eliminar" data-id="${product.id}">Eliminar</button>
                </div>
            `;
            productListAdmin.appendChild(productItemDiv);
        });


        // Añadir event listeners para los botones de eliminar
        productListAdmin.querySelectorAll('.boton-eliminar').forEach(button => {
            button.addEventListener('click', (event) => {
                const productIdToDelete = event.target.dataset.id;
                if (confirm(`¿Estás seguro de que quieres eliminar "${products.find(p => p.id === productIdToDelete)?.name}"?`)) {
                    deleteProduct(productIdToDelete);
                }
            });
        });
    }


    // Función para eliminar un producto
    function deleteProduct(idToDelete) {
        let products = getProducts();
        products = products.filter(product => product.id !== idToDelete);
        saveProducts(products); // Guardar y renderizar
        alert('Producto eliminado con éxito.');
    }


    // Inicialización del Admin Panel
    if (document.getElementById('admin-panel-page')) {
        initializeDefaultProducts(); // Cargar productos de ejemplo si no hay
        renderProductListAdmin(); // Renderizar la lista al cargar la página
    }


}); // <-- ESTA LLAVE CIERRA document.addEventListener('DOMContentLoaded')