let allProducts = [];
let currentPage = 1;
const itemsPerPage = 6;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let pendingProduct = null;

// === Lưu & cập nhật giỏ hàng ===
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

// === Mở popup chọn biến thể trước khi thêm vào giỏ ===
function openAddToCartModal(productId) {
    fetch('products.json')
        .then(res => res.json())
        .then(products => {
            pendingProduct = products.find(p => p.id === productId);
            const addModal = document.getElementById('add-cart-modal');
            const productNameEl = document.getElementById('ac-product-name');
            const colorSelect = document.getElementById('ac-color-select');
            const capacitySelect = document.getElementById('ac-capacity-select');
            const priceDisplay = document.getElementById('ac-price-display');
            
            // Tên sản phẩm
            productNameEl.textContent = pendingProduct.name;
            
            // Tạo danh sách màu
            colorSelect.innerHTML = pendingProduct.colors.map((c, i) => 
                `<option value="${i}">${c.name}</option>`
            ).join('');
            
            // Tạo danh sách dung lượng
            const firstColor = pendingProduct.colors[0];
            const capacities = Object.keys(firstColor.prices);
            capacitySelect.innerHTML = capacities.map(cap => 
                `<option value="${cap}">${cap}</option>`
            ).join('');
            
            // Cập nhật giá ban đầu
            priceDisplay.textContent = firstColor.prices[capacities[0]];
            
            addModal.style.display = 'block';
        });
}

// === Cập nhật giá khi đổi màu/dung lượng trong popup thêm giỏ ===
function updateAddCartPrice() {
    if (!pendingProduct) return;
    const colorIndex = parseInt(document.getElementById('ac-color-select').value);
    const capacity = document.getElementById('ac-capacity-select').value;
    const selectedColor = pendingProduct.colors[colorIndex];
    const price = selectedColor.prices[capacity];
    document.getElementById('ac-price-display').textContent = price;
}

// === Xác nhận thêm vào giỏ hàng ===
function confirmAddToCart() {
    if (!pendingProduct) return;
    
    const colorIndex = parseInt(document.getElementById('ac-color-select').value);
    const capacity = document.getElementById('ac-capacity-select').value;
    const selectedColor = pendingProduct.colors[colorIndex];
    const price = selectedColor.prices[capacity];
    
    const itemKey = `${pendingProduct.id}-${colorIndex}-${capacity}`;
    const existingItem = cart.find(item => item.key === itemKey);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            key: itemKey,
            id: pendingProduct.id,
            name: pendingProduct.name,
            image: pendingProduct.image,
            color: selectedColor.name,
            capacity: capacity,
            price: price,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    document.getElementById('add-cart-modal').style.display = 'none';
    alert(`✅ Đã thêm:\n${pendingProduct.name}\n🎨 ${selectedColor.name}\n💾 ${capacity}\n💰 ${price}`);
    pendingProduct = null;
}

// === Đóng popup thêm giỏ ===
function closeAddCartModal() {
    document.getElementById('add-cart-modal').style.display = 'none';
    pendingProduct = null;
}

window.onload = function() {
    loadProducts();
    if (typeof updateUserUI === 'function') updateUserUI();
    updateCartCount();
    
    // Gắn sự kiện cho popup thêm giỏ
    const colorSelect = document.getElementById('ac-color-select');
    const capSelect = document.getElementById('ac-capacity-select');
    if (colorSelect) colorSelect.addEventListener('change', updateAddCartPrice);
    if (capSelect) capSelect.addEventListener('change', updateAddCartPrice);
    
    const confirmBtn = document.getElementById('ac-confirm-btn');
    const cancelBtn = document.getElementById('ac-cancel-btn');
    if (confirmBtn) confirmBtn.onclick = confirmAddToCart;
    if (cancelBtn) cancelBtn.onclick = closeAddCartModal;
};

// === Tải dữ liệu ===
function loadProducts() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'products.json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            allProducts = JSON.parse(xhr.responseText);
            displayProducts(allProducts);
        }
    };
    xhr.send();
}

// === Hiển thị danh sách ===
function displayProducts(products) {
    const searchKeyword = document.getElementById('search-input') ? 
        document.getElementById('search-input').value.toLowerCase().trim() : '';
    
    let filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchKeyword) ||
        p.description.toLowerCase().includes(searchKeyword)
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pagedProducts = filtered.slice(start, end);

    const container = document.getElementById('product-list');
    
    if (pagedProducts.length === 0) {
        container.innerHTML = `<div class="loading">🔍 Không tìm thấy sản phẩm phù hợp</div>`;
        renderPagination(totalPages, filtered.length);
        return;
    }

    container.innerHTML = '';
    pagedProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <div class="product-info">
                <h3>${p.name}</h3>
                <div class="price-tag">💰 Từ ${p.defaultPrice}</div>
                <div class="spec-row"><strong>🎨 Màu:</strong> ${p.colors.map(c => c.name).join(', ')}</div>
                <button class="detail-btn" data-id="${p.id}">👁️ Xem chi tiết</button>
                <button class="add-cart-btn" data-id="${p.id}">🛒 Thêm vào giỏ</button>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.detail-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showProductDetail(parseInt(this.getAttribute('data-id')), products);
        });
    });
    
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            openAddToCartModal(parseInt(this.getAttribute('data-id')));
        });
    });

    renderPagination(totalPages, filtered.length);
}

// === Phân trang ===
function renderPagination(totalPages, totalItems) {
    const pagingContainer = document.getElementById('pagination');
    if (!pagingContainer) return;
    
    if (totalPages <= 1) {
        pagingContainer.innerHTML = `<p class="total-items">Tổng: ${totalItems} sản phẩm</p>`;
        return;
    }

    let html = `<p class="total-items">Tổng: ${totalItems} sản phẩm — Trang ${currentPage}/${totalPages}</p><div class="page-buttons">`;
    html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>← Trước</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Sau →</button>`;
    html += `</div>`;
    pagingContainer.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    displayProducts(allProducts);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// === Tìm kiếm ===
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        currentPage = 1;
        displayProducts(allProducts);
    });
}

// === Chi tiết sản phẩm — Xem thôi ===
function showProductDetail(id, products) {
    const product = products.find(p => p.id === id);
    const modal = document.getElementById('detail-modal');
    const detailDiv = document.getElementById('product-detail');

    let colorOptions = product.colors.map((c, i) => 
        `<option value="${i}">${c.name}</option>`
    ).join('');

    const firstColor = product.colors[0];
    const capacities = Object.keys(firstColor.prices);
    let capacityOptions = capacities.map(cap => 
        `<option value="${cap}">${cap}</option>`
    ).join('');

    let initialPrice = firstColor.prices[capacities[0]];

    detailDiv.innerHTML = `
        <div class="detail-compact">
            <img class="detail-image" src="${product.image}" alt="${product.name}">
            <div class="detail-body-compact">
                <h3>${product.name}</h3>
                <p class="detail-price" id="selected-price">💰 ${initialPrice}</p>
                
                <div class="selector-group">
                    <label>🎨 Chọn màu:</label>
                    <select id="color-select">${colorOptions}</select>
                </div>
                
                <div class="selector-group">
                    <label>💾 Chọn dung lượng:</label>
                    <select id="capacity-select">${capacityOptions}</select>
                </div>
                
                <div class="price-table-compact">
                    <h4>📋 Bảng giá:</h4>
                    <div id="price-list">
                        ${capacities.map(cap => 
                            `<div class="price-row">
                                <span>${cap}</span>
                                <span>${firstColor.prices[cap]}</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>
                
                <p class="detail-desc-compact">${product.description}</p>
            </div>
        </div>
    `;

    modal.style.display = 'block';

    function updatePriceDisplay() {
        const colorIndex = parseInt(document.getElementById('color-select').value);
        const capacity = document.getElementById('capacity-select').value;
        const selectedColor = product.colors[colorIndex];
        const price = selectedColor.prices[capacity];
        
        document.getElementById('selected-price').textContent = `💰 ${price}`;
        document.getElementById('price-list').innerHTML = 
            Object.entries(selectedColor.prices).map(([cap, p]) => 
                `<div class="price-row">
                    <span>${cap}</span>
                    <span>${p}</span>
                </div>`
            ).join('');
    }

    document.getElementById('color-select').addEventListener('change', updatePriceDisplay);
    document.getElementById('capacity-select').addEventListener('change', updatePriceDisplay);
}

// === Đóng modal chi tiết ===
document.querySelector('.close-btn').onclick = function() {
    document.getElementById('detail-modal').style.display = 'none';
};
window.onclick = function(e) {
    const modal = document.getElementById('detail-modal');
    const addModal = document.getElementById('add-cart-modal');
    if (e.target === modal) modal.style.display = 'none';
    if (e.target === addModal) closeAddCartModal();
};