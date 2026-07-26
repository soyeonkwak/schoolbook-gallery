// 초등학교 학급 홈페이지 - 메인 App 컨트롤러 (서재방 카테고리 추가 & 스크롤 여백 레이아웃 보강)

class App {
    constructor() {
        this.currentView = "feed";
        this.activeStudentId = null;
        this.activeCategory = "전체";
        this.isParentMode = false;
        
        this.uploadedFileContent = null;
        this.uploadedFileType = null;

        this.init();
    }

    get currentUser() {
        return authManager.currentUser;
    }

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'parent') {
            this.isParentMode = true;
            document.body.classList.add('parent-view-mode');
        }

        const targetStudent = urlParams.get('student');
        if (targetStudent) {
            this.activeStudentId = targetStudent;
            this.currentView = 'room';
        }

        this.renderHeaderNav();
        this.renderView();

        setTimeout(() => {
            canvasPainter = new CanvasPainter('drawingCanvas');
        }, 500);
    }

    renderHeaderNav() {
        const userArea = document.getElementById("headerUserArea");
        if (!userArea) return;

        if (this.isParentMode) {
            userArea.innerHTML = `
                <div class="button-category-cluster">
                    <span>👨‍👩‍👧 학부모 관람 모드</span>
                    <button onclick="app.exitParentMode()" class="btn-logout">일반 모드</button>
                </div>
            `;
            return;
        }

        const activeClass = store.getActiveClassroom();

        if (this.currentUser) {
            if (this.currentUser.role === 'teacher') {
                userArea.innerHTML = `
                    <div class="user-status-card">
                        <span class="user-name">👩‍🏫 ${this.currentUser.name}</span>
                        ${activeClass ? `<span class="user-char-badge">코드: ${activeClass.code}</span>` : ''}
                    </div>
                    <div class="button-category-cluster">
                        <button onclick="app.openCreateClassModal()" class="btn-my-room">+ 학급 개설</button>
                        <button onclick="authManager.logout()" class="btn-logout">로그아웃</button>
                    </div>
                `;
            } else {
                const studentObj = store.getStudentById(this.currentUser.id);
                const charStatus = studentObj ? characterManager.getCharacterStatus(studentObj.exp) : { icon: '🌱', level: 1 };
                userArea.innerHTML = `
                    <div class="user-status-card">
                        <span class="user-name">🎒 ${this.currentUser.name}</span>
                        <span class="user-char-badge">${charStatus.icon} Lv.${charStatus.level}</span>
                    </div>
                    <div class="button-category-cluster">
                        <button onclick="app.navigateToMyRoom()" class="btn-my-room">🏠 내 서재방</button>
                        <button onclick="authManager.logout()" class="btn-logout">로그아웃</button>
                    </div>
                `;
            }
        } else {
            userArea.innerHTML = `
                <div class="button-category-cluster">
                    <button onclick="app.openLoginModal()" class="btn-login-google">🔑 구글 로그인</button>
                    <button onclick="app.openJoinCodeModal()" class="btn-join-code">🔑 6자리 학급코드 입력</button>
                </div>
            `;
        }
    }

    renderView() {
        const mainContent = document.getElementById("mainContentArea");
        if (!mainContent) return;

        document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));

        if (this.currentView === "feed") {
            mainContent.innerHTML = `<div id="classGalleryGrid"></div>`;
            classGalleryView.renderMainFeed();
            const btn = document.getElementById("tabBtnFeed");
            if (btn) btn.classList.add("active");
        } else if (this.currentView === "exhibition") {
            mainContent.innerHTML = `<div id="classGalleryGrid"></div>`;
            classGalleryView.renderExhibitionTab();
            const btn = document.getElementById("tabBtnExhibition");
            if (btn) btn.classList.add("active");
        } else if (this.currentView === "farm") {
            mainContent.innerHTML = `<div id="classGalleryGrid"></div>`;
            classGalleryView.renderCharacterFarm();
            const btn = document.getElementById("tabBtnFarm");
            if (btn) btn.classList.add("active");
        } else {
            this.renderStudentRoomView(mainContent);
        }
        this.renderHeaderNav();
    }

    switchTab(tabName) {
        this.currentView = tabName;
        this.renderView();
    }

    // 🌿 서재방 레이아웃: 여유있는 세로 스크롤 간격 & 직관적인 카테고리 추가
    renderStudentRoomView(container) {
        const student = store.getStudentById(this.activeStudentId);
        if (!student) {
            this.currentView = "feed";
            this.renderView();
            return;
        }

        const isMyRoom = this.currentUser && this.currentUser.role === 'student' && this.currentUser.id === student.id;
        const isTeacher = this.currentUser && this.currentUser.role === 'teacher';
        const charStatus = characterManager.getCharacterStatus(student.exp);

        const categoryTabsHtml = student.categories.map(cat => `
            <button class="cat-tab ${this.activeCategory === cat ? 'active' : ''}" 
                    onclick="app.selectCategory('${cat}')">
                ${cat}
            </button>
        `).join('');

        container.innerHTML = `
            <div class="student-room-wrapper">
                <!-- 1. 상단 네비게이션 & 타이틀 바 -->
                <div class="room-top-bar" style="margin-bottom: 3.5rem;">
                    <button onclick="app.switchTab('feed')" class="btn-back-gallery">🏠 학급 메인 피드로 돌아가기</button>
                    
                    <div class="room-title" style="margin: 10px 0;">
                        <h2>${student.name}의 디지털 서재방</h2>
                        ${isMyRoom ? '<span class="hero-class-badge" style="background:#e8f5e9; color:#2e7d32; font-size:1.3rem;">내 방</span>' : ''}
                    </div>

                    <div class="room-action-category-group">
                        ${isMyRoom ? `<button onclick="app.openNewPostModal()" class="btn-add-post">✨ 새 기록 올리기 (+EXP)</button>` : ''}
                        <button onclick="app.copyRoomShareLink('${student.id}')" class="btn-share">🔗 서재방 링크 공유</button>
                        ${isTeacher ? `<button onclick="app.deleteStudent('${student.id}')" class="btn-teacher-del-student">🗑️ 학생 계정 삭제</button>` : ''}
                    </div>
                </div>

                <!-- 2. 캐릭터 NPC 성장 현황 보드 (여유 있는 간격) -->
                <div class="npc-status-banner" style="margin-bottom: 4rem; padding: 2.5rem;">
                    <div class="npc-svg-box">
                        ${characterManager.renderCharacterSVG(student.name, student.exp, 140)}
                    </div>
                    <div class="npc-info-box">
                        <div class="npc-header">
                            <span class="npc-level">${charStatus.icon} Level ${charStatus.level}</span>
                            <h3 class="npc-title-name">${charStatus.name}</h3>
                        </div>
                        <p class="npc-rule-notice" style="font-size:1.3rem; margin:12px 0;">
                            💡 <b>성장 규칙</b>: 오직 스스로 상시 글, 그림, 사진을 올릴 때에만 레벨업합니다!
                        </p>
                        <div class="exp-bar-container" style="height:26px;">
                            <div class="exp-bar-fill" style="width: ${charStatus.progressPercent}%;"></div>
                            <span class="exp-text" style="font-size:1.2rem;">${student.exp} EXP (${charStatus.progressPercent}% - 다음: ${charStatus.nextLevelName})</span>
                        </div>
                    </div>
                </div>

                <!-- 3. 서재 목차 및 내 카테고리 관리 바 (여유 있는 간격) -->
                <div class="room-section-card" style="margin-bottom: 4rem; width:100%; text-align:center;">
                    <h3 style="font-family:'Gaegu'; font-size:2.4rem; color:var(--text-main); margin-bottom:14px;">📚 서재 목차 카테고리</h3>
                    <div class="category-bar" style="display:flex; justify-content:center; align-items:center; gap:14px; flex-wrap:wrap;">
                        <div class="cat-tabs-list" style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                            ${categoryTabsHtml}
                        </div>
                        ${isMyRoom ? `<button onclick="app.openCategoryModal()" class="btn-add-cat" style="border-color:#3b82f6; color:#2563eb; font-weight:800;">➕ 새 카테고리 만들기</button>` : ''}
                    </div>
                </div>

                <!-- 4. 디지털 Flipbook 책 뷰어 (여유 있는 간격) -->
                <div class="flipbook-section" style="margin-bottom: 5rem; width:100%;">
                    <div id="flipbookContainer"></div>
                </div>

                <!-- 5. 칭찬 스티커 보관함 & 방명록 소통 코너 (시원시원한 세로 분리 스크롤) -->
                <div class="room-social-section" style="display:flex; flex-direction:column; gap:4rem; width:100%; margin-bottom: 5rem;">
                    <!-- 칭찬 스티커 상자 -->
                    <div class="social-box stickers-box" style="padding: 2.5rem; border-radius: 28px;">
                        <h3 style="font-size:2.2rem; font-family:'Gaegu'; color:var(--text-main); margin-bottom:16px;">👏 친구와 학부모가 보낸 칭찬 스티커 (${student.stickers.length}개)</h3>
                        <div class="sticker-buttons" style="display:flex; justify-content:center; gap:14px; flex-wrap:wrap; margin-bottom:1.5rem;">
                            ${CONFIG.STICKERS.map(s => `
                                <button class="sticker-send-btn" onclick="commentStickerManager.sendSticker('${student.id}', '${s.id}')">
                                    <span class="st-icon">${s.icon}</span>
                                    <span class="st-label">${s.label}</span>
                                </button>
                            `).join('')}
                        </div>
                        <div class="received-stickers-list" style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap; padding-top:1rem; border-top:1px dashed #ffd8a8;">
                            ${student.stickers.length === 0 ? '<p class="empty-st-msg" style="font-size:1.3rem; color:#888;">아직 스티커가 없어요. 첫 번째 칭찬 스티커를 날려보세요!</p>' : 
                              student.stickers.map(st => {
                                  const stObj = CONFIG.STICKERS.find(s => s.id === st.stickerId);
                                  return `<span class="st-bubble" style="font-size:1.3rem; padding:8px 18px;" title="${st.from}">${stObj ? stObj.icon : '👍'} ${st.from}</span>`;
                              }).join('')}
                        </div>
                    </div>

                    <!-- 방명록 응원 코너 -->
                    <div class="social-box guestbook-box" style="padding: 2.5rem; border-radius: 28px;">
                        <h3 style="font-size:2.2rem; font-family:'Gaegu'; color:var(--text-main); margin-bottom:16px;">💬 칭찬 한마디 방명록</h3>
                        <div class="gb-form" style="display:flex; justify-content:center; gap:12px; margin-bottom:1.5rem;">
                            <input type="text" id="gbInputText" placeholder="따뜻한 응원과 칭찬 한마디를 적어주세요..." style="flex:1; max-width:500px;" />
                            <button onclick="app.submitGuestbook('${student.id}')" class="btn-gb-submit">등록</button>
                            <button onclick="app.submitParentGuestbook('${student.id}')" class="btn-gb-parent">👨‍👩‍👧 학부모 응원</button>
                        </div>
                        <div class="gb-list" style="display:flex; flex-direction:column; gap:14px; align-items:center;">
                            ${student.guestbook.length === 0 ? '<p class="empty-st-msg" style="font-size:1.3rem; color:#888;">첫 칭찬 방명록을 남겨주세요!</p>' : 
                              student.guestbook.map(gb => `
                                <div class="gb-item ${gb.isParent ? 'gb-parent-item' : ''}" style="width:100%; max-width:700px; font-size:1.3rem; text-align:left;">
                                    <div class="gb-meta" style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                        <span class="gb-author" style="font-weight:800; color:var(--primary-color);">${gb.author}</span>
                                        <span class="gb-date" style="color:#999; font-size:1.1rem;">${gb.date}</span>
                                    </div>
                                    <p class="gb-content" style="color:#444; line-height:1.5;">${gb.content}</p>
                                </div>
                              `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        flipbookEngine.renderBook(student, this.activeCategory);
    }

    openCategoryModal() {
        const catName = prompt("📂 추가할 새 카테고리 이름을 입력하세요 (예: 🎨 미술작품, 📚 독후감, 🔬 관찰일기):");
        if (catName && catName.trim() !== "") {
            const success = store.addCategory(this.currentUser.id, catName.trim());
            if (success) {
                alert(`🎉 '${catName.trim()}' 카테고리가 생성되었습니다! (+30 EXP 레벨업)`);
                this.renderView();
            } else {
                alert("이미 존재하는 카테고리명이거나 추가할 수 없습니다.");
            }
        }
    }

    editPost(studentId, postId) {
        const student = store.getStudentById(studentId);
        if (!student) return;
        const post = student.posts.find(p => p.id === postId);
        if (!post) return;

        const newTitle = prompt("수정할 작품 제목을 입력하세요:", post.title);
        if (newTitle === null) return;

        const newDesc = prompt("수정할 작품 설명을 입력하세요:", post.description || "");

        store.updatePost(studentId, postId, { title: newTitle.trim(), description: newDesc !== null ? newDesc.trim() : "" });
        alert("👩‍🏫 교사 권한으로 작품 정보가 수정되었습니다.");
        this.renderView();
    }

    deletePost(studentId, postId) {
        if (confirm("👩‍🏫 [교사 관리자] 정말로 이 작품을 삭제하시겠습니까?")) {
            const success = store.deletePost(studentId, postId);
            if (success) {
                alert("작품이 삭제되었습니다.");
                this.renderView();
            }
        }
    }

    deleteStudent(studentId) {
        const student = store.getStudentById(studentId);
        if (!student) return;

        if (confirm(`👩‍🏫 [교사 관리자] 정말로 '${student.name}' 학생 계정을 삭제하시겠습니까?\n해당 학생의 모든 게시물과 방이 삭제됩니다.`)) {
            const success = store.deleteStudent(studentId);
            if (success) {
                alert("학생 계정이 정상적으로 삭제되었습니다.");
                this.navigateToGallery();
            }
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        const previewContainer = document.getElementById("filePreviewContainer");

        reader.onload = (e) => {
            this.uploadedFileContent = e.target.result;
            
            if (file.type.startsWith('image/')) {
                this.uploadedFileType = 'image';
                previewContainer.innerHTML = `<img src="${this.uploadedFileContent}" alt="업로드 미리보기" />`;
            } else if (file.type.startsWith('video/')) {
                this.uploadedFileType = 'video';
                previewContainer.innerHTML = `<video src="${this.uploadedFileContent}" controls width="100%"></video>`;
            }
            previewContainer.style.display = "block";
        };

        reader.readAsDataURL(file);
    }

    handleVideoFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        const previewBox = document.getElementById("videoPreviewBox");

        reader.onload = (e) => {
            this.uploadedFileContent = e.target.result;
            this.uploadedFileType = 'video';
            previewBox.innerHTML = `<video src="${this.uploadedFileContent}" controls style="max-height:200px; border-radius:12px;"></video>`;
            previewBox.style.display = "block";
        };

        reader.readAsDataURL(file);
    }

    selectCategory(categoryName) {
        this.activeCategory = categoryName;
        this.renderView();
    }

    navigateToMyRoom() {
        if (!this.currentUser || this.currentUser.role !== 'student') {
            this.openJoinCodeModal();
            return;
        }
        this.activeStudentId = this.currentUser.id;
        this.activeCategory = "전체";
        this.currentView = "room";
        this.renderView();
    }

    navigateToStudentRoom(studentId) {
        this.activeStudentId = studentId;
        this.activeCategory = "전체";
        this.currentView = "room";
        this.renderView();
    }

    refreshCurrentRoom() {
        if (this.currentView === 'room') {
            this.renderView();
        }
    }

    openCreateClassModal(defaultName = "", defaultEmail = "") {
        document.getElementById("createClassModal").style.display = "flex";
        if (defaultName) document.getElementById("teacherNameInput").value = defaultName;
        if (defaultEmail) document.getElementById("teacherEmailInput").value = defaultEmail;
    }

    closeCreateClassModal() {
        document.getElementById("createClassModal").style.display = "none";
    }

    submitCreateClass() {
        const teacherName = document.getElementById("teacherNameInput").value.trim();
        const teacherEmail = document.getElementById("teacherEmailInput").value.trim();
        const className = document.getElementById("classNameInput").value.trim();
        const theme = document.getElementById("classThemeInput").value.trim();

        if (!teacherName || !className) {
            alert("선생님 성함과 학급 명칭을 입력해주세요!");
            return;
        }

        const newClass = store.createClassroom(teacherName, teacherEmail, className, theme);
        authManager.setTeacherSession(teacherName, teacherEmail);
        this.closeCreateClassModal();

        alert(`🎉 축하합니다! 학급이 성공적으로 개설되었습니다!\n\n🔑 학급 코드: [ ${newClass.code} ]\n학생들에게 이 6자리 코드를 안내해 주세요!`);
        this.renderView();
    }

    openJoinCodeModal(defaultName = "", defaultEmail = "", googleId = null) {
        document.getElementById("joinCodeModal").style.display = "flex";
        if (defaultName) document.getElementById("studentNameInput").value = defaultName;
        if (defaultEmail) document.getElementById("studentEmailInput").value = defaultEmail;
        this.tempGoogleId = googleId;
    }

    closeJoinCodeModal() {
        document.getElementById("joinCodeModal").style.display = "none";
    }

    submitJoinCode() {
        const code = document.getElementById("joinCodeInput").value.trim();
        const name = document.getElementById("studentNameInput").value.trim();
        const email = document.getElementById("studentEmailInput").value.trim();

        if (!code || !name) {
            alert("학급 코드와 학생 이름을 입력해주세요!");
            return;
        }

        const result = store.joinStudentWithCode(code, name, email || `${Date.now()}@student.es.kr`, this.tempGoogleId);
        
        if (result.success) {
            store.setActiveClassroom(result.classroom.id);
            authManager.setStudentSession(result.student);
            this.closeJoinCodeModal();

            if (result.isNew) {
                alert(`🎉 ${result.classroom.name} 학급 가입 성공!\n${result.student.name}의 디지털 서재 방이 배정되었습니다.`);
            } else {
                alert(`환영합니다, ${result.student.name}님! 이전 방으로 접속합니다.`);
            }

            this.navigateToMyRoom();
        } else {
            alert(result.message);
        }
    }

    copyClassCode(code) {
        navigator.clipboard.writeText(code).then(() => {
            alert(`🔑 학급 입장 코드 [ ${code} ]가 클립보드에 복사되었습니다!\n학생들에게 안내해 주세요.`);
        });
    }

    openLoginModal() {
        document.getElementById("loginModal").style.display = "flex";
    }

    closeLoginModal() {
        document.getElementById("loginModal").style.display = "none";
    }

    openNewPostModal() {
        if (!this.currentUser || this.currentUser.role !== 'student') {
            this.openJoinCodeModal();
            return;
        }
        this.uploadedFileContent = null;
        this.uploadedFileType = null;

        const modal = document.getElementById("postModal");
        modal.style.display = "flex";
        
        const card = modal.querySelector('.modal-card');
        if (card) card.scrollTop = 0;

        const catSelect = document.getElementById("postCategorySelect");
        if (catSelect) {
            const student = store.getStudentById(this.currentUser.id);
            if (student) {
                catSelect.innerHTML = student.categories.filter(c => c !== "전체").map(c => `
                    <option value="${c}">${c}</option>
                `).join('');
            }
        }
    }

    closePostModal() {
        document.getElementById("postModal").style.display = "none";
    }

    submitNewPost() {
        const title = document.getElementById("postTitleInput").value.trim();
        const category = document.getElementById("postCategorySelect").value;
        const type = document.querySelector('input[name="postType"]:checked').value;
        const desc = document.getElementById("postDescInput").value.trim();

        if (!title) {
            alert("제목을 입력해주세요!");
            return;
        }

        let content = "";
        let expReward = CONFIG.EXP_TABLE.CREATE_POST;
        let actualType = type;

        if (type === "image") {
            const imgOption = document.querySelector('input[name="imgOption"]:checked').value;
            if (imgOption === "upload") {
                if (this.uploadedFileContent) {
                    content = this.uploadedFileContent;
                    if (this.uploadedFileType === 'video') actualType = 'video';
                } else {
                    alert("사진첩에서 업로드할 파일을 선택해주세요!");
                    return;
                }
            } else if (imgOption === "draw") {
                content = canvasPainter.getImageDataUrl();
                expReward = CONFIG.EXP_TABLE.DRAW_PICTURE;
            } else {
                content = document.getElementById("postImageUrlInput").value.trim();
                if (!content) {
                    content = "https://picsum.photos/seed/" + Date.now() + "/600/400";
                }
            }
        } else if (type === "video") {
            if (this.uploadedFileContent && this.uploadedFileType === 'video') {
                content = this.uploadedFileContent;
            } else {
                content = document.getElementById("postVideoUrlInput").value.trim();
                if (!content) content = "https://www.youtube.com/embed/dQw4w9WgXcQ";
            }
        } else {
            content = document.getElementById("postTextInput").value.trim();
            if (!content) {
                alert("글 내용을 작성해주세요!");
                return;
            }
        }

        const result = store.addPost(this.currentUser.id, {
            title, category, type: actualType, content, description: desc
        }, expReward);

        this.closePostModal();
        characterManager.checkAndShowLevelUp(this.currentUser.name, result.oldExp, result.newExp);
        this.renderView();
    }

    submitGuestbook(studentId) {
        const input = document.getElementById("gbInputText");
        if (input) {
            commentStickerManager.submitGuestbook(studentId, input.value, false);
            input.value = "";
        }
    }

    submitParentGuestbook(studentId) {
        const input = document.getElementById("gbInputText");
        if (input) {
            commentStickerManager.submitGuestbook(studentId, input.value, true);
            input.value = "";
        }
    }

    onAuthStatusChanged() {
        this.renderHeaderNav();
        this.renderView();
    }
}

const app = new App();
