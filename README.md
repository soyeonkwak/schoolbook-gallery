# 🏫 꿈꾸는 우리반 디지털 학급 보물창고 & 미술관

태블릿/패드 사진첩 연동, 3D 디지털 책(Flipbook), 미니 NPC 성장, 구글 & 익명 로그인, 학급 6자리 입장 코드를 지원하는 초등학교 상시 학급 홈페이지 & 미술 전시장 프로젝트입니다.

---

## 🚀 GitHub 저장소 업로드 가이드

이 프로젝트 디렉토리는 이미 `git init` 및 로컬 커밋이 준비되어 있습니다.  
GitHub에 업로드하려면 터미널(Git Bash 또는 CMD)에서 아래 3개 명령어를 순서대로 실행하세요.

```bash
# 1. 변경된 모든 파일 커밋
git add .
git commit -m "Feat: 학급 상시 기록 홈페이지, 패드 업로드, Firebase Auth & Firestore, Vercel 설정 완료"

# 2. GitHub에 새 저장소(Repository) 생성 후 URL을 아래에 연결 (사용자 URL로 변경)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/elementary-class-gallery.git

# 3. main 브랜치로 푸시
git branch -M main
git push -u origin main
```

---

## 🔥 Firebase 설정 가이드 (Google 로그인, 익명 로그인, Firestore DB)

1. [Firebase Console](https://console.firebase.google.com/) 접속 ➔ **'프로젝트 추가'** 클릭
2. **Authentication (인증)** 탭 진입 ➔ **'시작하기'**:
   - **Google**: 사용 설정 ➔ 저장
   - **익명 (Anonymous)**: 사용 설정 ➔ 저장
3. **Firestore Database** 탭 진입 ➔ **'데이터베이스 만들기'** (테스트 모드로 시작)
4. **프로젝트 설정 (⚙️ 아이콘)** ➔ 하단의 **'웹 앱 추가(</>)'**:
   - 앱 등록 후 화면에 나오는 `firebaseConfig` 객체 복사.
   - 프로젝트 내 `js/firebase-config.js` 파일의 `firebaseConfig` 값을 본인의 키로 치환하세요.

---

## ⚡ Vercel 무료 클라우드 배포 가이드

1. [Vercel 공식 홈페이지](https://vercel.com/) 접속 ➔ GitHub 계정으로 로그인.
2. **'Add New...'** ➔ **'Project'** 선택.
3. GitHub 저장소 연동 후 **`elementary-class-gallery`** 저장소 **Import** 클릭.
4. Framework Preset은 **`Other`** 또는 **`Static HTML`** 선택 ➔ **Deploy** 버튼 클릭!
5. 10초 내에 전 세계 어디서든 접속 가능한 **`https://your-app.vercel.app`** 라이브 주소가 생성됩니다.
