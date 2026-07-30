// ============ CẤU HÌNH FIREBASE ============
const firebaseConfig = {
    apiKey: "AIzaSyCWKh2PbqVtf3vOZptH1N-pWLXjRTT_YTw",
    authDomain: "tranducduy-dfdcd.firebaseapp.com",
    projectId: "tranducduy-dfdcd",
    storageBucket: "tranducduy-dfdcd.firebasestorage.app",
    messagingSenderId: "1058324395419",
    appId: "1:1058324395419:web:d4d6e4893f9162e0269d3e",
    measurementId: "G-NM4YQYZ7P0"
};

// Khởi tạo Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase init error:', error);
}

const db = firebase.firestore();
