// 초등학교 학급 홈페이지 - 구글 로그인 & 세션 유지 및 로그인/로그아웃 체계 모듈

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initAuth();
    }

    initAuth() {
        // localStorage와 sessionStorage에서 세션 정보 복원 시도
        const savedAuth = localStorage.getItem("CURRENT_AUTH_SESSION") || sessionStorage.getItem("CURRENT_AUTH_SESSION");
        if (savedAuth) {
            try {
                this.currentUser = JSON.parse(savedAuth);
                console.log("🔑 저장된 구글 로그인 세션이 성공적으로 불러와졌습니다:", this.currentUser);
            } catch (e) {
                console.error("세션 파싱 실패", e);
            }
        }

        // Firebase 서비스 초기화
        setTimeout(() => {
            if (typeof initFirebaseServices === 'function') {
                initFirebaseServices();
            }
        }, 300);
    }

    // 🔥 Firebase 구글 팝업 로그인
    async loginWithFirebaseGoogle() {
        try {
            if (typeof firebaseAuth !== 'undefined' && firebaseAuth) {
                const user = await firebaseGoogleSignIn();
                this.promptRoleSelection(user.displayName || "구글 사용자", user.email, user.uid);
            } else {
                // Firebase 미설정 시 직관적 구글 이메일 접속 지원
                const email = prompt("구글 이메일 주소를 입력하세요 (예: myname@gmail.com):");
                if (email && email.trim() !== "") {
                    const name = prompt("성함/이름을 입력하세요:", "사용자") || "사용자";
                    this.loginWithGoogleAccount(name.trim(), email.trim());
                }
            }
        } catch (e) {
            console.error("Firebase 구글 로그인 오류:", e);
            alert("구글 로그인 처리 중 오류가 발생했습니다: " + e.message);
        }
    }

    // 👤 Firebase 익명 로그인 (Anonymous Auth)
    async loginAnonymously() {
        try {
            if (typeof firebaseAuth !== 'undefined' && firebaseAuth) {
                const user = await firebaseAnonymousSignIn();
                const anonName = "익명 게스트_" + user.uid.substring(0, 4);
                this.promptRoleSelection(anonName, `guest_${user.uid.substring(0, 6)}@anonymous.com`, user.uid);
            } else {
                const anonName = "익명 친구_" + Math.floor(Math.random() * 1000);
                this.promptRoleSelection(anonName, `guest_${Date.now()}@anonymous.com`, "anon_" + Date.now());
            }
        } catch (e) {
            console.error("Firebase 익명 로그인 오류:", e);
            alert("익명 로그인 오류: " + e.message);
        }
    }

    loginWithGoogleAccount(googleName, googleEmail) {
        if (!googleName || !googleEmail) {
            alert("이름과 구글 이메일을 정확히 입력해주세요!");
            return;
        }
        const mockSub = "google_user_" + Date.now();
        this.promptRoleSelection(googleName.trim(), googleEmail.trim(), mockSub);
    }

    promptRoleSelection(name, email, googleId) {
        app.closeLoginModal();
        
        const isTeacher = confirm(`[Schoolbook 학급 홈페이지]\n\n반갑습니다, ${name} (${email}) 님!\n\n'교사(선생님)'로 학급을 개설하시려면 [확인]을,\n'학생'으로 학급 코드를 입력하여 가입하시려면 [취소]를 누르세요.`);
        
        if (isTeacher) {
            app.openCreateClassModal(name, email);
        } else {
            app.openJoinCodeModal(name, email, googleId);
        }
    }

    setTeacherSession(teacherName, teacherEmail) {
        this.currentUser = {
            role: "teacher",
            name: teacherName,
            email: teacherEmail
        };
        const sessionStr = JSON.stringify(this.currentUser);
        localStorage.setItem("CURRENT_AUTH_SESSION", sessionStr);
        sessionStorage.setItem("CURRENT_AUTH_SESSION", sessionStr);
        app.onAuthStatusChanged();
    }

    setStudentSession(studentObj) {
        this.currentUser = {
            role: "student",
            id: studentObj.id,
            name: studentObj.name,
            email: studentObj.googleEmail,
            exp: studentObj.exp
        };
        const sessionStr = JSON.stringify(this.currentUser);
        localStorage.setItem("CURRENT_AUTH_SESSION", sessionStr);
        sessionStorage.setItem("CURRENT_AUTH_SESSION", sessionStr);
        app.onAuthStatusChanged();
    }

    // 🔒 완전한 로그아웃 체계
    logout() {
        if (confirm("로그아웃 하시겠습니까?")) {
            this.currentUser = null;
            localStorage.removeItem("CURRENT_AUTH_SESSION");
            sessionStorage.removeItem("CURRENT_AUTH_SESSION");
            alert("정상적으로 로그아웃되었습니다.");
            app.onAuthStatusChanged();
        }
    }
}

const authManager = new AuthManager();
