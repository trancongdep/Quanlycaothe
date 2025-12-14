// auth.js - HỆ THỐNG BẢO MẬT TRUNG TÂM

// 1. CONFIG FIREBASE (Dùng chung cho toàn hệ thống)
const firebaseConfig = {
    apiKey: "AIzaSyBAKgjfwqPcYhUxLo__ISxd7xax3GYZDkk",
    authDomain: "das-2025.firebaseapp.com",
    databaseURL: "https://das-2025-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "das-2025", 
    storageBucket: "das-2025.firebasestorage.app", 
    messagingSenderId: "911247179996", 
    appId: "1:911247179996:web:ecce7b5227266573807419"
};

// Kiểm tra xem Firebase đã được khởi tạo chưa để tránh lỗi
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const dbAuth = firebase.database();

// 2. HÀM KIỂM TRA ĐĂNG NHẬP (Dùng ở đầu các trang nội bộ)
function checkLogin() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // Đã đăng nhập -> Kiểm tra trạng thái duyệt trong Database
            dbAuth.ref('users/' + user.uid).once('value').then(snapshot => {
                const userData = snapshot.val();
                if (!userData || !userData.isApproved) {
                    alert("Tài khoản của bạn CHƯA ĐƯỢC DUYỆT hoặc ĐÃ BỊ KHÓA. Vui lòng liên hệ Admin.");
                    auth.signOut().then(() => {
                        window.location.href = 'login.html';
                    });
                } else {
                    // Đã duyệt -> Lưu thông tin vào LocalStorage để dùng nhanh
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                    console.log("Logged in as: " + userData.email + " (" + userData.role + ")");
                    
                    // Hiển thị tên người dùng nếu có element id='user-display-name'
                    const displayEl = document.getElementById('user-display-name');
                    if(displayEl) displayEl.innerText = userData.fullName + " (" + userData.role + ")";
                }
            });
        } else {
            // Chưa đăng nhập -> Đá về trang Login
            window.location.href = 'login.html';
        }
    });
}

// 3. HÀM KIỂM TRA QUYỀN ADMIN (Dùng cho các trang admin)
function requireAdmin() {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        const user = JSON.parse(userJson);
        if (user.role !== 'admin') {
            alert("BẠN KHÔNG CÓ QUYỀN TRUY CẬP TRANG NÀY!");
            window.location.href = 'index.html'; // Quay về trang chủ
        }
    }
}

// 4. HÀM ĐĂNG XUẤT
function logout() {
    auth.signOut().then(() => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}
