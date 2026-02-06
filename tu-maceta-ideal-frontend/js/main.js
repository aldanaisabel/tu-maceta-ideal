// 🛒 CARRITO GLOBAL
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// 🔒 HELPER SEGURO - FIX CRÍTICO (evita el error .replace)
const safeString = (str) => (str || '').toString().replace(/[^\w\s]/gi, '').replace(/'/g, "\\'");

// 🛒 ➕ AGREGAR AL CARRITO (mejorado + seguro)
function addToCart(productId, name, basePrice, configuracion = {}) {
  const safeName = safeString(name);
  const existing = cart.find(item => item.id === productId);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ 
      id: productId, 
      name: safeName, 
      basePrice: basePrice || 2500, 
      quantity: 1,
      configuracion // color, tamaño, plazo, extras
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCartFromButton(button, productId, name, basePrice) {
  addToCart(productId, name, basePrice);
  
  // Feedback visual (sin cambios)
  const originalHTML = button.innerHTML;
  const originalBg = button.style.background;
  
  button.innerHTML = '<i class="fas fa-check"></i> Agregado';
  button.style.background = '#218838';
  button.disabled = true;
  
  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.style.background = originalBg;
    button.disabled = false;
  }, 1200);
}

// ➖➕ RESTAR/SUMAR CANTIDAD (sin cambios)
function decreaseQuantity(productId) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex !== -1) {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1;
    } else {
      cart.splice(itemIndex, 1);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartUI();
  }
}

function increaseQuantity(productId) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex !== -1) {
    cart[itemIndex].quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartUI();
  }
}

// 🗑️ ELIMINAR PRODUCTO (sin cambios)
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  updateCartUI();
}

// 🔄 ACTUALIZAR UI CARRITO (sin cambios)
function updateCartUI() {
  const cartItems = document.querySelectorAll('.cart-item');
  cartItems.forEach(item => {
    const productId = item.dataset.productId;
    const cartItem = cart.find(c => c.id === productId);
    if (cartItem) {
      item.querySelector('.quantity').textContent = cartItem.quantity;
      item.querySelector('.price').textContent = `$${(cartItem.basePrice * cartItem.quantity).toLocaleString()}`;
    }
  });
}

// Contador carrito (sin cambios)
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountEls = document.querySelectorAll('#cartCount, .cart-count');
  cartCountEls.forEach(el => {
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

// 🔌 API HELPERS (FORTALECIDOS)
async function getProducts() {
  try {
    const response = await fetch('/api/productos');
    if (!response.ok) throw new Error('Error API');
    const products = await response.json();
    // ✅ FIX: Validar productos antes de retornar
    return Array.isArray(products) ? products.filter(p => p && p._id) : [];
  } catch (error) {
    console.error('Error getProducts:', error);
    return [];
  }
}

async function saveProduct(product) {
  try {
    const response = await fetch('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin': 'true' },
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Error al guardar');
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function deleteProduct(id) {
  try {
    const response = await fetch(`/api/productos/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin': 'true' }
    });
    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// 📱 INDEX.HTML - Featured Products (FIX CRÍTICO LÍNEA 165)
async function renderFeaturedProducts() {
  const container = document.getElementById('featured-products') || document.getElementById('productos-container');
  if (!container) return;

  container.innerHTML = '<p>Cargando productos...</p>';

  try {
    const products = await getProducts();
    console.log('✅ Productos:', products);

    // ✅ FIX: Validación completa ANTES del map
    const safeProducts = (products || []).filter(p => p && p.name && p._id).slice(0, 6);

    container.innerHTML = safeProducts.length > 0 
      ? safeProducts.map(product => `
        <div class="product-card">
          <img 
            src="${product.imageUrl || `https://via.placeholder.com/400/400?text=${safeString(product.name)}`}" 
            alt="${safeString(product.name)}"
            class="product-image"
          >
          <h3>${safeString(product.name)}</h3>
          <p>${safeString(product.description || 'Maceta premium')}</p>
          <div class="price">
            $${(product.basePrice || 0).toLocaleString()}
          </div>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button 
              class="cta-secondary add-btn"
              onclick="addToCartFromButton(this, '${product._id}', '${safeString(product.name)}', ${product.basePrice || 2500})"
              style="background:#28a745; border-color:#28a745; color:white;"
            >
              <i class="fas fa-shopping-cart"></i> Agregar
            </button>
            <a href="personalizar.html?product=${product._id}" class="cta-secondary">
              <i class="fas fa-palette"></i> Personalizar
            </a>
          </div>
          <div class="product-colors">
            <span class="colors-label">Colores:</span>
            ${
              Array.isArray(product.availableColors) && product.availableColors.length > 0
                ? `<div class="color-dots">${
                    product.availableColors.map(c => {
                      const colorValue = typeof c === "string" ? c : (c.value || c.color || "#999");
                      return `<span class="color-dot" style="background-color: ${colorValue};" title="${safeString(colorValue)}"></span>`;
                    }).join('')
                  }</div>`
                : '<span class="no-colors">Varios colores</span>'
            }
          </div>
        </div>
      `).join('')
      : '<div class="product-card"><p>📦 ¡Primera maceta gratis esta semana! <a href="personalizar.html">Personalizar</a></p></div>';
      
  } catch (error) {
    console.error('Error renderizando productos:', error);
    container.innerHTML = '<div class="product-card"><p>⏳ Cargando inventario...</p></div>';
  }
}

// 👑 ADMIN PANEL (mejorado)
async function renderProductListAdmin() {
  const productListAdmin = document.getElementById('product-list-admin');
  if (!productListAdmin) return;

  productListAdmin.innerHTML = '<p>Cargando...</p>';

  try {
    const products = await getProducts();
    productListAdmin.innerHTML = products.length > 0 
      ? products.map(product => `
        <div class="product-item-admin">
          <img src="${product.imageUrl || 'https://via.placeholder.com/120?text=?'}">
          <div class="product-item-admin-details">
            <h4>${safeString(product.name)}</h4>
            <p>$${product.basePrice?.toLocaleString?.() || 0} | Stock: ${product.stock || 0}</p>
          </div>
          <div class="product-item-admin-actions">
            <button class="boton-primario">Editar</button>
            <button class="boton-eliminar" onclick="eliminar('${product._id}')">Eliminar</button>
          </div>
        </div>
      `).join('')
      : '<p>📦 No hay productos. ¡Agregar el primero!</p>';
  } catch (error) {
    productListAdmin.innerHTML = '<p>❌ Error cargando productos</p>';
  }
}

// 🍔 HAMBURGER MENU (sin cambios)
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger') || document.getElementById('hamburger-menu');
  const sidebar = document.getElementById('sidebar');
  
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !hamburger.contains(e.target) && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
    document.querySelectorAll('.sidebar-nav a, .sidebar a').forEach(link => {
      link.addEventListener('click', () => sidebar.classList.remove('open'));
    });
  }
}

// 🗑️ ELIMINAR (sin cambios)
async function eliminar(id) {
  if (confirm('¿Eliminar este producto?')) {
    const success = await deleteProduct(id);
    if (success) {
      alert('✅ Producto eliminado');
      renderProductListAdmin();
    }
  }
}

// 🚀 INICIALIZACIÓN (mejorada)
document.addEventListener('DOMContentLoaded', async () => {
  updateCartCount();
  initHamburgerMenu();
  
  // Admin visibility
  const adminLink = document.querySelector('a[href="admin-panel.html"]');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  if (adminLink && userData.rol !== 'admin') {
    adminLink.style.display = 'none';
  }
  
  // Auto-render por página
  if (document.getElementById('featured-products') || document.getElementById('productos-container')) {
    renderFeaturedProducts();
  }
  if (document.getElementById('product-list-admin')) {
    renderProductListAdmin();
  }
});
