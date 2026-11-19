let cart = JSON.parse(localStorage.getItem('cart')) || [];

function displayOrder() {
    const itemsContainer = document.getElementById('order-items');
    const totalEl = document.getElementById('final-total');
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p style="text-align:center; padding:20px;">Giỏ hàng trống. <a href="index.html">Mua sắm ngay</a></p>';
        totalEl.textContent = '0 VNĐ';
        return;
    }

    let total = 0;
    itemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const priceNum = parseInt(item.price.replace(/\D/g, ''));
        const subtotal = priceNum * item.quantity;
        total += subtotal;
        
        itemsContainer.innerHTML += `
            <div class="payment-item">
                <p><strong>${item.name}</strong></p>
                <p>🎨 ${item.color} | 💾 ${item.capacity}</p>
                <p>${item.price} × ${item.quantity} = ${subtotal.toLocaleString('vi-VN')} VNĐ</p>
                <hr>
            </div>
        `;
    });
    
    totalEl.textContent = total.toLocaleString('vi-VN') + ' VNĐ';
}

function saveOrder(customerInfo, paymentMethod, total) {
    const order = {
        id: Date.now(),
        time: new Date().toLocaleString('vi-VN'),
        customer: customerInfo,
        paymentMethod: paymentMethod,
        items: [...cart],
        total: total
    };
    
    let orders = JSON.parse(localStorage.getItem('orderHistory')) || [];
    orders.unshift(order);
    localStorage.setItem('orderHistory', JSON.stringify(orders));
}

document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert('❌ Giỏ hàng trống!');
        return;
    }
    
    const customerInfo = {
        name: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value,
        note: document.getElementById('order-note').value
    };
    
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const total = cart.reduce((sum, item) => sum + parseInt(item.price.replace(/\D/g, '')) * item.quantity, 0);
    
    saveOrder(customerInfo, paymentMethod, total);
    
    alert('✅ Đặt hàng thành công!');
    
    cart = [];
    localStorage.removeItem('cart');
    e.target.reset();
    
    window.location.href = 'index.html';
});

displayOrder();
