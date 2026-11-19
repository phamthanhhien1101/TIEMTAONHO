let cart = JSON.parse(localStorage.getItem('cart')) || [];
const ADMIN_PHONE = '0386442179';
const ADMIN_EMAIL = 'thhienju@gmail.com';

// === Kiểm tra đăng nhập ===
if (!getCurrentUser()) {
    alert('🔒 Vui lòng đăng nhập trước khi thanh toán!');
    window.location.href = 'login.html';
}

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

// === Tạo nội dung đơn hàng ===
function createOrderMessage(customerInfo, paymentMethod, total) {
    const paymentNames = {
        cod: '💵 Tiền mặt khi nhận hàng',
        bank: '🏦 Chuyển khoản ngân hàng',
        card: '💳 Thẻ tín dụng / Ghi nợ'
    };
    
    let orderDetails = `🎉 Đặt hàng thành công!

📦 ĐƠN HÀNG MỚI
══════════════════
👤 Người nhận: ${customerInfo.name}
📞 SĐT: ${customerInfo.phone}
📍 Địa chỉ: ${customerInfo.address}
💳 Thanh toán: ${paymentNames[paymentMethod]}
📝 Ghi chú: ${customerInfo.note || 'Không có'}
══════════════════
🛒 Chi tiết:
`;
    
    cart.forEach(item => {
        orderDetails += `• ${item.name}
  └ ${item.color} | ${item.capacity} | ${item.price} × ${item.quantity}
`;
    });
    
    orderDetails += `══════════════════
💰 TỔNG TIỀN: ${total.toLocaleString('vi-VN')} VNĐ
🕐 Thời gian: ${new Date().toLocaleString('vi-VN')}`;
    
    return orderDetails;
}

// === Lưu đơn hàng vào localStorage ===
function saveOrderToHistory(customerInfo, paymentMethod, total, orderText) {
    const order = {
        id: Date.now(),
        time: new Date().toLocaleString('vi-VN'),
        customer: customerInfo,
        paymentMethod: paymentMethod,
        items: [...cart],
        total: total,
        fullText: orderText
    };
    
    let orders = JSON.parse(localStorage.getItem('orderHistory')) || [];
    orders.unshift(order);
    localStorage.setItem('orderHistory', JSON.stringify(orders));
    return order;
}

// === Xử lý đặt hàng ===
document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert('❌ Giỏ hàng trống! Vui lòng chọn sản phẩm trước.');
        return;
    }
    
    // Lấy thông tin khách hàng
    const customerInfo = {
        name: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value,
        note: document.getElementById('order-note').value || 'Không có'
    };
    
    // Lấy phương thức thanh toán
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    // Tính tổng tiền
    let total = cart.reduce((sum, item) => sum + parseInt(item.price.replace(/\D/g, '')) * item.quantity, 0);
    
    // Tạo nội dung đơn hàng
    const orderText = createOrderMessage(customerInfo, paymentMethod, total);
    
    // Lưu đơn hàng vào lịch sử
    saveOrderToHistory(customerInfo, paymentMethod, total, orderText);
    
    // ✅ HIỂN THỊ THÔNG BÁO THÀNH CÔNG — KHÔNG CÓ EMAIL
    alert(orderText);
    
    // Xóa giỏ hàng
    cart = [];
    localStorage.removeItem('cart');
    
    // Cập nhật giao diện
    displayOrder();
    if (typeof updateCartCount === 'function') updateCartCount();
    
    e.target.reset();
    // Reset về mặc định tiền mặt
    document.querySelector('input[value="cod"]').checked = true;
    document.getElementById('bank-info').style.display = 'none';
    document.getElementById('card-info').style.display = 'none';
    
    // Chuyển về trang chủ sau khi nhấn OK
    window.location.href = 'index.html';
});

// === Khởi động ===
displayOrder();
if (typeof updateUserUI === 'function') updateUserUI();
