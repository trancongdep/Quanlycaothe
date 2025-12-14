// auth.js - PHIÊN BẢN V2 (CHỐNG LOOP)

const firebaseConfig = {
    apiKey: "AIzaSyBAKgjfwqPcYhUxLo__ISxd7xax3GYZDkk",
    authDomain: "das-2025.firebaseapp.com",
    databaseURL: "https://das-2025-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "das-2025", 
    storageBucket: "das-2025.firebasestorage.app", 
    messagingSenderId: "911247179996", 
    appId: "1:911247179996:web:ecce7b5227266573807419"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const dbAuth = firebase.database();

// Lấy tên file hiện tại (ví dụ: index.html)
const currentPage = window.location.pathname.split("/").pop();

function checkLogin() {
    auth.onAuthStateChanged(user => {
        // 1. TRƯỜNG HỢP CHƯA ĐĂNG NHẬP
        if (!user) {
            // Nếu đang ở trang login thì thôi, không chuyển nữa (Chống loop)
            if (currentPage !== 'login.html') {
                window.location.href = 'login.html';
            }
            return;
        }

        // 2. TRƯỜNG HỢP ĐÃ ĐĂNG NHẬP
        // Nếu đang ở trang login, đá sang trang chủ
        if (currentPage === 'login.html') {
            window.location.href = 'index.html';
            return;
        }

        // 3. KIỂM TRA QUYỀN TRONG DATABASE
        dbAuth.ref('users/' + user.uid).once('value').then(snapshot => {
            const userData = snapshot.val();
            
            // Tài khoản chưa duyệt -> Đá về login
            if (!userData || !userData.isApproved) {
                alert("Tài khoản chưa được duyệt!");
                auth.signOut();
                return;
            }

            // Lưu cache
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Hiển thị tên (nếu có chỗ để hiển thị)
            const displayEl = document.getElementById('user-display-name');
            if(displayEl) displayEl.innerText = userData.fullName + " (" + userData.role + ")";
        });
    });
}

function requireAdmin() {
    // Chỉ check khi đã có thông tin user
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        const user = JSON.parse(userJson);
        if (user.role !== 'admin') {
            alert("BẠN KHÔNG CÓ QUYỀN TRUY CẬP TRANG NÀY!");
            // Chuyển về index để an toàn
            if (currentPage !== 'index.html') {
                window.location.href = 'index.html';
            }
        }
    } else {
        // Chưa load xong user, thử lại sau 500ms
        setTimeout(requireAdmin, 500);
    }
}

function logout() {
    auth.signOut().then(() => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}
