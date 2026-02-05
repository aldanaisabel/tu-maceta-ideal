// 🛒 CARRITO GLOBAL
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// 🛒 ➕ AGREGAR AL CARRITO (ya lo tienes, pero mejorado)
function addToCart(productId, name, basePrice) {
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, name, basePrice, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCartFromButton(button, productId, name, basePrice) {
  addToCart(productId, name, basePrice);

  // Feedback visual - Agregado de Ari/modificado
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

// ➖ RESTAR CANTIDAD
function decreaseQuantity(productId) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex !== -1) {
    if (cart[itemIndex].quantity > 1) {
      cart[itemIndex].quantity -= 1;
    } else {
      cart.splice(itemIndex, 1); // Eliminar si es 1
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartUI();
  }
}

// ➕ SUMAR CANTIDAD
function increaseQuantity(productId) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex !== -1) {
    cart[itemIndex].quantity += 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartUI();
  }
}

// 🗑️ ELIMINAR PRODUCTO
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  updateCartUI();
}

// 🔄 ACTUALIZAR UI CARRITO (NUEVA)
function updateCartUI() {
  // Actualiza carrito.html, personalizar.html, etc.
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

// Contador carrito (ya lo tienes)
function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountEls = document.querySelectorAll('#cartCount, .cart-count');
  cartCountEls.forEach(el => {
    el.textContent = totalItems;
    el.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

// 🔌 API HELPERS (UNIFICADOS)
async function getProducts() {
  try {
    const response = await fetch('/api/productos');
    if (!response.ok) throw new Error('Error cargando productos');
    return await response.json();
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
    if (!response.ok) throw new Error('Error al guardar producto');
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
    if (!response.ok) throw new Error('Error al eliminar producto');
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// 📱 INDEX.HTML - Featured Products (CON BOTÓN CARRITO) - modificado por Ari
async function renderFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) return;

  container.innerHTML = '<p>Cargando productos...</p>';

  try {
    const products = await getProducts();
    console.log('✅ Productos para index:', products);

    container.innerHTML = products.slice(0, 6).map(product => `
      <div class="product-card">
        <img 
          src="${product.imageUrl || `https://picsum.photos/400/400?random=${product._id}`}" 
          alt="${product.name}" 
          class="product-image"
        >

        <h3>${product.name}</h3>
        <p>${product.description || 'Maceta premium personalizada'}</p>

        <div class="price">
          $${product.basePrice?.toLocaleString?.() || product.basePrice}
        </div>

        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button 
            class="cta-secondary add-btn"
            onclick="addToCartFromButton(
              this, 
              '${product._id}', 
              '${product.name.replace(/'/g, "\\'")}', 
              ${product.basePrice}
            )"
            style="background:#28a745; border-color:#28a745; color:white;"
          >
            <i class="fas fa-shopping-cart"></i> Agregar
          </button>

          <a href="personalizar.html?product=${product._id}" class="cta-secondary">
            <i class="fas fa-palette"></i> Personalizar
          </a>
        </div>

        <div class="product-colors">
          <span class="colors-label">Colores disponibles:</span>
          
          ${
            Array.isArray(product.availableColors) && product.availableColors.length > 0
            ? `
            <div class="color-dots">
            ${product.availableColors.map(c => {
              const colorValue = typeof c === "string" ? c : (c.value || c.color || "#999");
              const colorName  = typeof c === "string" ? c : (c.name || colorValue);
              
              return `
              <span 
              class="color-dot"
              style="background-color: ${colorValue};"
              title="${colorName}">
              </span>
              <span style="font-size: 0.9rem; margin-right:6px;">
              ${colorName}
              </span>
            `;
          }).join('')}
        </div>
      `
      : `<span class="no-colors">Sin colores disponibles</span>`
  }
</div>

      </div>  <!-- ✅ ESTE CIERRE FALTABA -->
    `).join('');

  } catch (error) {
    console.error('Error renderizando productos:', error);
    container.innerHTML = '<p>❌ Error cargando productos</p>';
  }
}

// 👑 ADMIN PANEL - Product List
async function renderProductListAdmin() {
  const productListAdmin = document.getElementById('product-list-admin');
  if (!productListAdmin) return;

  productListAdmin.innerHTML = '<p>Cargando productos...</p>';

  try {
    const products = await getProducts();
    
    productListAdmin.innerHTML = products.length > 0 
      ? products.map(product => `
        <div class="product-item-admin">
          <img src="${product.imageUrl || `https://picsum.photos/120/120?random=${product._id}`}" alt="${product.name}">
          <div class="product-item-admin-details">
            <h4>${product.name}</h4>
            <p>$${product.basePrice?.toLocaleString?.() || product.basePrice || 0} | Stock: ${product.stock || 0}</p>
            <p>Colores: ${(product.availableColors || []).join(', ') || 'Sin colores'}</p>
          </div>
          <div class="product-item-admin-actions">
            <button class="boton-primario" style="padding: 0.6rem;">Editar</button>
            <button class="boton-eliminar" onclick="eliminar('${product._id}')">Eliminar</button>
          </div>
        </div>
      `).join('')
      : '<p>📦 No hay productos en el inventario</p>';
      
  } catch (error) {
    console.error('Error admin products:', error);
    productListAdmin.innerHTML = '<p>❌ Error cargando productos</p>';
  }
}

// 🍔 HAMBURGER MENU (UNIFICADO)
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

// 🗑️ ELIMINAR (para admin-panel)
async function eliminar(id) {
  if (confirm('¿Eliminar este producto?')) {
    const success = await deleteProduct(id);
    if (success) {
      alert('✅ Producto eliminado');
      renderProductListAdmin();
    } else {
      alert('❌ Error al eliminar');
    }
  }
}

// 🚀 INICIALIZACIÓN PRINCIPAL
document.addEventListener('DOMContentLoaded', async () => {
  // Carrito
  updateCartCount();
  
  // Menú
  initHamburgerMenu();
  
  // Admin link
  const adminLink = document.getElementById('adminLink') || document.querySelector('a[href="admin-panel.html"]');
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  if (adminLink && userData.rol !== 'admin') {
    adminLink.style.display = 'none';
  }
  
  // Admin form (solo admin-panel)
  const addProductForm = document.getElementById('add-product-form');
  if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const data = {
        name: document.getElementById('product-name').value.trim(),
        basePrice: parseFloat(document.getElementById('product-price').value),
        description: 'Maceta personalizada',
        imageUrl: '',
        availableColors: document.getElementById('product-colors').value.split(',').map(c => c.trim()).filter(c => c),
        stock: parseInt(document.getElementById('product-stock').value)
      };

      const saved = await saveProduct(data);
      if (saved) {
        alert('✅ Producto agregado!');
        addProductForm.reset();
        renderProductListAdmin();
      } else {
        alert('❌ Error al agregar producto');
      }
    });
  }
  
  // Render específico por página
  renderFeaturedProducts();      // index.html
  renderProductListAdmin();      // admin-panel.html
});
