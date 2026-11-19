// === Quản lý người dùng ===
const CURRENT_USER_KEY = 'currentUser';

// Lấy danh sách tài khoản
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Lưu danh sách tài khoản
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// === Đăng ký ===
function register(name, email, phone, password) {
    const users = getUsers();
    
    // Kiểm tra email/SĐT đã tồn tại chưa
    const exists = users.find(u => u.email === email || u.phone === phone);
    if (exists) {
        return { success: false, message: 'Email hoặc số điện thoại đã được đăng ký!' };
    }
    
    // Thêm tài khoản mới
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password // Trong môi trường thực tế nên mã hóa mật khẩu
    };
    
    users.push(newUser);
    saveUsers(users);
    return { success: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.' };
}

// === Đăng nhập ===
function login(emailOrPhone, password) {
    const users = getUsers();
    const user = users.find(u => 
        (u.email === emailOrPhone || u.phone === emailOrPhone) && 
        u.password === password
    );
    
    if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return { success: true, message: 'Đăng nhập thành công!', user: user };
    }
    return { success: false, message: 'Thông tin đăng nhập không đúng!' };
}

// === Đăng xuất ===
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'login.html';
}

// === Lấy thông tin người dùng hiện tại ===
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

// === Kiểm tra đã đăng nhập chưa ===
function requireLogin() {
    if (!getCurrentUser()) {
        alert('Vui lòng đăng nhập trước!');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// === Cập nhật giao diện hiển thị tên người dùng ===
function updateUserUI() {
    const user = getCurrentUser();
    const userArea = document.getElementById('user-info');
    if (!userArea) return;
    
    if (user) {
        userArea.innerHTML = `
            <span>👋 Xin chào, <strong>${user.name}</strong></span>
            <button class="btn-logout" onclick="logout()">Đăng xuất</button>
        `;
    } else {
        userArea.innerHTML = `
            <a href="login.html" class="btn-login">🔑 Đăng nhập</a>
        `;
    }
}

// === Xử lý sự kiện trang Đăng ký ===
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const errorEl = document.getElementById('register-error');
        
        if (password !== confirmPassword) {
            errorEl.textContent = '❌ Mật khẩu xác nhận không khớp!';
            return;
        }
        
        const result = register(name, email, phone, password);
        if (result.success) {
            alert('✅ ' + result.message);
            window.location.href = 'login.html';
        } else {
            errorEl.textContent = '❌ ' + result.message;
        }
    });
}

// === Xử lý sự kiện trang Đăng nhập ===
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailOrPhone = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        
        const result = login(emailOrPhone, password);
        if (result.success) {
            alert('✅ ' + result.message);
            window.location.href = 'index.html';
        } else {
            errorEl.textContent = '❌ ' + result.message;
        }
    });
}

// Cập nhật giao diện khi tải trang
if (typeof updateUserUI !== 'undefined' && !registerForm && !loginForm) {
    updateUserUI();
}