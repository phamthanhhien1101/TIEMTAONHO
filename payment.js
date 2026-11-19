let cart = JSON.parse(localStorage.getItem('cart')) || [];

// === Hiển thị đơn hàng ===
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

// === Tạo thông báo đơn hàng ===
function createOrderMessage(customerInfo, paymentMethod, total) {
    const paymentNames = {
        cod: '💵 Tiền mặt khi nhận hàng',
        bank: '🏦 Chuyển khoản ngân hàng',
        card: '💳 Thẻ tín dụng / Ghi nợ'
    };
    
    return `🎉 Đặt hàng thành công!

📦 ĐƠN HÀNG MỚI
══════════════════
👤 Người nhận: ${customerInfo.name}
📞 SĐT: ${customerInfo.phone}
📍 Địa chỉ: ${customerInfo.address}
💳 Thanh toán: ${paymentNames[paymentMethod]}
📝 Ghi chú: ${customerInfo.note || 'Không có'}
══════════════════
🛒 Chi tiết:
${cart.map(item => `• ${item.name}
  └ ${item.color} | ${item.capacity} | ${item.price} × ${item.quantity}`).join('\n')}
══════════════════
💰 TỔNG TIỀN: ${total.toLocaleString('vi-VN')} VNĐ
🕐 Thời gian: ${new Date().toLocaleString('vi-VN')}`;
}

// === Lưu đơn hàng vào localStorage ===
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

// === Xử lý đặt hàng ===
document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert('❌ Giỏ hàng trống!');
        return;
    }
    
    // Lấy thông tin
    const customerInfo = {
        name: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value,
        note: document.getElementById('order-note').value
    };
    
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const total = cart.reduce((sum, item) => sum + parseInt(item.price.replace(/\D/g, '')) * item.quantity, 0);
    
    // ✅ Chỉ LƯU đơn hàng — KHÔNG chuyển trang
    saveOrder(customerInfo, paymentMethod, total);
    
    // ✅ Chỉ hiện thông báo
    alert(createOrderMessage(customerInfo, paymentMethod, total));
    
    // ✅ Xóa giỏ hàng & reset form — VỀ TRANG CHỦ
    cart = [];
    localStorage.removeItem('cart');
    e.target.reset();
    document.querySelector('input[value="cod"]').checked = true;
    
    // ✅ Về trang chủ — KHÔNG mở orders.html
    window.location.href = 'index.html';
});

// === Khởi động ===
displayOrder();
