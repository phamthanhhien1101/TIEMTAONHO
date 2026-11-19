let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
        countEl.textContent = totalQty;
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart"><h3>🛒 Giỏ hàng trống</h3><p>Hãy quay lại trang chủ để chọn sản phẩm nhé!</p><a href="index.html" class="btn-primary">Mua sắm ngay</a></div>`;
        totalEl.textContent = '0 VNĐ';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }

    if (checkoutBtn) checkoutBtn.style.display = 'block';
    container.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const priceNum = parseInt(item.price.replace(/\D/g, ''));
        const subtotal = priceNum * item.quantity;
        total += subtotal;
        
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-variant">🎨 ${item.color} | 💾 ${item.capacity}</p>
                    <p class="cart-item-price">${item.price}</p>
                    <div class="cart-item-qty">
                        <button onclick="changeQty(${index}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)">+</button>
                    </div>
                    <p class="cart-item-subtotal">Thành tiền: ${subtotal.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <button class="remove-item" onclick="removeItem(${index})">🗑️</button>
            </div>
        `;
    });
    
    totalEl.textContent = total.toLocaleString('vi-VN') + ' VNĐ';
}

function changeQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    renderCart();
    updateCartCount();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
    updateCartCount();
}

if (document.getElementById('cart-items')) renderCart();
if (typeof updateUserUI === 'function' && document.getElementById('user-info')) updateUserUI();
updateCartCount();