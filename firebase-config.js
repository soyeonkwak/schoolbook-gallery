// Firebase Authentication (Google 로그인, 익명 로그인) & Firestore 연동 설정 파일

const firebaseConfig = {
  apiKey: "AIzaSyAbtGvWrb0sVfPHIihNf2QMp595nPOBJxw",
  authDomain: "hodumaru-72d6a.firebaseapp.com",
  projectId: "hodumaru-72d6a",
  storageBucket: "hodumaru-72d6a.firebasestorage.app",
  messagingSenderId: "927275820530",
  appId: "1:927275820530:web:b8091e319cca0a2d66376b",
  measurementId: "G-1Y9NCWVLJV"
};

// Firebase 초기화 (CDN Compat 라이브러리 연동)
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let googleAuthProvider = null;

function initFirebaseServices() {
    if (typeof firebase !== 'undefined') {
        try {
            if (!firebase.apps.length) {
                firebaseApp = firebase.initializeApp(firebaseConfig);
            } else {
                firebaseApp = firebase.app();
            }
            firebaseAuth = firebase.auth();
            firebaseDb = firebase.firestore();
            googleAuthProvider = new firebase.auth.GoogleAuthProvider();
            console.log("🔥 Firebase 'hodumaru-72d6a' 인증 및 DB가 성공적으로 연동되었습니다.");
            return true;
        } catch (e) {
            console.warn("Firebase 초기화 예외 (LocalStorage 호환 모드 유지):", e);
        }
    }
    return false;
}

// 🔑 Firebase 구글 팝업 로그인
async function firebaseGoogleSignIn() {
    if (!firebaseAuth || !googleAuthProvider) {
        throw new Error("Firebase가 초기화되지 않았습니다.");
    }
    const result = await firebaseAuth.signInWithPopup(googleAuthProvider);
    return result.user; // { displayName, email, uid, photoURL }
}

// 👤 Firebase 익명 로그인 (Anonymous Auth)
async function firebaseAnonymousSignIn() {
    if (!firebaseAuth) {
        throw new Error("Firebase가 초기화되지 않았습니다.");
    }
    const result = await firebaseAuth.signInAnonymously();
    return result.user; // { isAnonymous: true, uid }
}
