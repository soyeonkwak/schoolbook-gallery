// 초등학교 학급 상시 기록 홈페이지 & 미술관 - 팝업 모달 크기 조절 & 이미지 2차 확대 라이트박스 모듈

class ClassGalleryView {
    constructor() {
        this.containerId = "classGalleryGrid";
    }

    renderMainFeed() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const activeClass = store.getActiveClassroom();
        const classrooms = store.data.classrooms;

        if (!activeClass || classrooms.length === 0) {
            this.renderEmptyHero(container);
            return;
        }

        const students = activeClass.students;
        const isTeacher = authManager.currentUser && authManager.currentUser.role === 'teacher';

        let allPosts = [];
        students.forEach(student => {
            student.posts.forEach(post => {
                allPosts.push({
                    ...post,
                    studentId: student.id,
                    studentName: student.name,
                    studentNumber: student.number,
                    studentExp: student.exp
                });
            });
        });

        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        const heroHtml = `
            <div class="class-main-hero">
                <span class="hero-class-badge">🏫 학급 상시 기록 동산</span>
                <h1 class="hero-class-title">${activeClass.name}</h1>
                <p class="hero-class-desc">${activeClass.theme}</p>
                
                <div class="hero-stats-row">
                    <div class="stat-chip">🎒 학급 멤버: <span>${students.length}명</span></div>
                    <div class="stat-chip">📚 누적 기록물: <span>${allPosts.length}개</span></div>
                    <div class="stat-chip" onclick="app.copyClassCode('${activeClass.code}')" style="cursor:pointer;" title="클릭시 복사">
                        🔑 학급 코드: <span>${activeClass.code}</span>
                    </div>
                </div>
            </div>
        `;

        let feedCardsHtml = "";

        if (allPosts.length === 0) {
            feedCardsHtml = `
                <div style="text-align: center; padding: 4rem; grid-column: 1 / -1; background: #fff; border-radius: 20px;">
                    <span style="font-size: 3rem; display: block; margin-bottom: 12px;">✏️</span>
                    <h3>아직 올라온 상시 기록이 없습니다</h3>
                    <p style="color: #7f8c8d; margin-top: 6px;">'✨ 새 기록 작성하기' 버튼을 눌러 첫 사진과 글을 남겨보세요!</p>
                </div>
            `;
        } else {
            feedCardsHtml = allPosts.map(post => {
                const charStatus = characterManager.getCharacterStatus(post.studentExp);

                let mediaHtml = "";
                if (post.type === "image") {
                    mediaHtml = `<img src="${post.content}" alt="${post.title}" class="feed-media-img" />`;
                } else if (post.type === "video") {
                    if (post.content.startsWith('data:video')) {
                        mediaHtml = `<video src="${post.content}" controls style="width:100%; max-height:230px; object-fit:cover;"></video>`;
                    } else {
                        mediaHtml = `<div style="height:100%; display:flex; align-items:center; justify-content:center; background:#eef5fc; color:#2980b9; font-weight:700;">🎬 ${post.title}</div>`;
                    }
                } else {
                    mediaHtml = `<div style="height:100%; padding:1.2rem; background:#fffde7; font-family:'Sunflower'; overflow:hidden;">"${post.content.substring(0, 80)}..."</div>`;
                }

                const teacherControlsHtml = isTeacher ? `
                    <div class="teacher-post-controls">
                        <button onclick="app.editPost('${post.studentId}', '${post.id}')" class="btn-teacher-edit" title="교사 권한 작품 수정">✏️ 수정</button>
                        <button onclick="app.deletePost('${post.studentId}', '${post.id}')" class="btn-teacher-del" title="교사 권한 작품 삭제">🗑️ 삭제</button>
                    </div>
                ` : '';

                return `
                    <div class="feed-card">
                        <div class="feed-card-header">
                            <div class="feed-author-info">
                                <span>${post.studentName}</span>
                                <span>${charStatus.icon}</span>
                            </div>
                            <span class="feed-cat-tag">${post.category}</span>
                        </div>

                        <div class="feed-media-box" onclick="classGalleryView.openDetailModal('${post.studentId}', '${post.id}')">
                            ${mediaHtml}
                        </div>

                        <div class="feed-card-body">
                            <h3 class="feed-title">${post.title}</h3>
                            <p class="feed-desc">${post.description || "상시 기록 코멘트가 있습니다."}</p>
                            ${teacherControlsHtml}
                            <div class="feed-footer">
                                <span>📅 ${post.date}</span>
                                <button onclick="app.navigateToStudentRoom('${post.studentId}')" style="background:none; border:none; color:var(--primary-color); font-weight:700; cursor:pointer;">📖 서재방 방문</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        container.innerHTML = `
            ${heroHtml}
            
            <div class="class-feed-section">
                <div class="feed-header-bar">
                    <h2>🏠 우리 반 상시 기록 보물창고 (${allPosts.length}개)</h2>
                    <button onclick="app.openNewPostModal()" class="btn-upload-feed">✨ 새 기록 작성하기 (+EXP)</button>
                </div>

                <div class="feed-card-grid">
                    ${feedCardsHtml}
                </div>
            </div>
        `;
    }

    renderCharacterFarm() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const activeClass = store.getActiveClassroom();
        if (!activeClass) return;

        const students = activeClass.students;
        const sortedStudents = [...students].sort((a, b) => b.exp - a.exp);

        const farmHeaderHtml = `
            <div class="class-main-hero farm-hero-bg">
                <span class="hero-class-badge" style="background:#e8f5e9; color:#2e7d32;">🌾 캐릭터 동산 & 성취 랭킹</span>
                <h1 class="hero-class-title">${activeClass.name} 요정 농장</h1>
                <p class="hero-class-desc">기록을 열심히 남긴 친구일수록 미니 NPC 캐릭터가 더 크게 성장합니다! 친구 방에 들러 칭찬 스티커를 날려보세요.</p>
            </div>
        `;

        let farmItemsHtml = "";

        if (sortedStudents.length === 0) {
            farmItemsHtml = `
                <div style="text-align:center; padding:4rem; width:100%; background:#fff; border-radius:20px;">
                    <span style="font-size:3rem;">🌱</span>
                    <h3>아직 농장에 모인 캐릭터가 없습니다</h3>
                    <p style="color:#666;">학생들이 학급 코드로 가입하면 이 곳 잔디밭에 캐릭터들이 하나둘 생겨납니다!</p>
                </div>
            `;
        } else {
            farmItemsHtml = sortedStudents.map((student, rankIdx) => {
                const charStatus = characterManager.getCharacterStatus(student.exp);

                let crown = "";
                if (rankIdx === 0) crown = "🥇 1등 ";
                else if (rankIdx === 1) crown = "🥈 2등 ";
                else if (rankIdx === 2) crown = "🥉 3등 ";

                return `
                    <div class="farm-character-node animate-float-${(rankIdx % 3) + 1}" onclick="app.navigateToStudentRoom('${student.id}')">
                        <div class="farm-rank-tag">${crown}${student.name}</div>
                        <div class="farm-svg-container">
                            ${characterManager.renderCharacterSVG(student.name, student.exp, 110)}
                        </div>
                        <div class="farm-char-info">
                            <div class="farm-lvl-badge">${charStatus.icon} Lv.${charStatus.level} ${charStatus.name}</div>
                            <div class="farm-exp-bar">
                                <div class="farm-exp-fill" style="width: ${charStatus.progressPercent}%;"></div>
                            </div>
                            <span class="farm-exp-text">${student.exp} EXP</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        container.innerHTML = `
            ${farmHeaderHtml}
            
            <div class="farm-stage-container">
                <div class="farm-grass-field">
                    <div class="farm-nodes-grid">
                        ${farmItemsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    renderExhibitionTab() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const activeClass = store.getActiveClassroom();
        if (!activeClass) return;

        const students = activeClass.students;
        const isTeacher = authManager.currentUser && authManager.currentUser.role === 'teacher';

        let framesHtml = students.map(student => {
            let pickPost = student.weeklyPickId ? student.posts.find(p => p.id === student.weeklyPickId) : (student.posts[0] || null);

            let thumbHtml = "";
            if (pickPost) {
                if (pickPost.type === "video" && pickPost.content.startsWith('data:video')) {
                    thumbHtml = `<video src="${pickPost.content}" style="width:100%; height:100%; object-fit:cover;"></video>`;
                } else if (pickPost.type === "image") {
                    thumbHtml = `<img src="${pickPost.content}" class="ws-card-art"/>`;
                } else {
                    thumbHtml = `<div class="ws-card-empty">📝 ${pickPost.title}</div>`;
                }
            } else {
                thumbHtml = `<div class="ws-card-empty">🖼️ 대표작 준비 중</div>`;
            }

            const teacherStudentControl = isTeacher ? `
                <button onclick="app.deleteStudent('${student.id}')" class="btn-teacher-del-student" title="교사 권한 학생 계정 삭제">🗑️ 학생 계정 삭제</button>
            ` : '';

            return `
                <div class="ws-gallery-card">
                    <div class="ws-card-thumb-box" onclick="classGalleryView.openDetailModal('${student.id}', '${pickPost ? pickPost.id : ''}')">
                        ${thumbHtml}
                        <div class="ws-card-zoom-badge">🔍 상세보기</div>
                    </div>
                    <div class="ws-card-body">
                        <h4 class="ws-art-title">${pickPost ? pickPost.title : "기록 감상 중"}</h4>
                        <p style="font-size:0.85rem; color:#666;">지은이: ${student.name}</p>
                        ${teacherStudentControl}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="class-main-hero">
                <span class="hero-class-badge">🏛️ 주간 대표 미술관</span>
                <h1 class="hero-class-title">${activeClass.name} 미술 전시장</h1>
                <p class="hero-class-desc">학생들이 선택한 이번 주 최고의 대표 작품들입니다.</p>
            </div>
            
            <div class="exhibition-light-section">
                <div class="ws-card-grid">
                    ${framesHtml}
                </div>
            </div>
        `;
    }

    renderEmptyHero(container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 5rem 2rem;">
                <span style="font-size: 4rem; display: block; margin-bottom: 1rem;">🏫</span>
                <h1 style="font-family: 'Gaegu', cursive; font-size: 3rem; color: #2c3e50;">Schoolbook 학급 홈페이지</h1>
                <p style="color: #7f8c8d; font-size: 1.1rem; margin-bottom: 2rem;">
                    아직 개설된 학급이 없습니다. 교사로 개설하거나 학생 코드로 입장해 보세요!
                </p>
                <div style="display: flex; justify-content: center; gap: 16px;">
                    <button onclick="app.openCreateClassModal()" style="padding: 14px 28px; border-radius: 25px; border: none; background: #2ecc71; color: #fff; font-weight: 700; font-size: 1.05rem; cursor: pointer;">👩‍🏫 교사 권한 학급 개설</button>
                    <button onclick="app.openJoinCodeModal()" style="padding: 14px 28px; border-radius: 25px; border: none; background: #fecb2e; color: #5d4037; font-weight: 700; font-size: 1.05rem; cursor: pointer;">🔑 학생 6자리 코드로 가입</button>
                </div>
            </div>
        `;
    }

    // 🔍 팝업 모달: 그림 크기를 240px로 아담하게 조정하여 설명과 닫기버튼이 잘 보이게 개선 + 그림 터치 시 라이트박스 2차 대형 확대
    openDetailModal(studentId, postId) {
        const student = store.getStudentById(studentId);
        if (!student) return;

        let post = student.posts.find(p => p.id === postId);
        if (!post && student.posts.length > 0) post = student.posts[0];

        if (!post) {
            alert(`${student.name} 님이 아직 작성한 작품이 없습니다.`);
            return;
        }

        const isTeacher = authManager.currentUser && authManager.currentUser.role === 'teacher';

        let mediaViewHtml = "";
        if (post.type === 'image') {
            mediaViewHtml = `
                <div class="ws-detail-media-wrap" onclick="classGalleryView.openImageZoomModal('${post.content}', '${post.title}')" title="클릭시 크게 확대보기">
                    <img src="${post.content}" alt="${post.title}" class="ws-zoom-img-thumb" />
                    <span class="zoom-hint-badge">🔍 누르면 화면 가득 확대</span>
                </div>
            `;
        } else if (post.type === 'video') {
            if (post.content.startsWith('data:video')) {
                mediaViewHtml = `<video src="${post.content}" controls style="max-width:100%; max-height:220px; border-radius:14px;"></video>`;
            } else {
                mediaViewHtml = `<iframe src="${post.content}" frameborder="0" allowfullscreen style="width:100%; height:220px; border-radius:14px;"></iframe>`;
            }
        } else {
            mediaViewHtml = `<div class="ws-detail-text-paper" style="max-height:220px; overflow-y:auto;"><pre>${post.content}</pre></div>`;
        }

        const teacherDetailControls = isTeacher ? `
            <div style="display:flex; justify-content:center; gap:10px; margin-top:10px;">
                <button onclick="app.editPost('${studentId}', '${post.id}'); document.getElementById('wsDetailModal').remove();" class="btn-teacher-edit">✏️ 수정</button>
                <button onclick="app.deletePost('${studentId}', '${post.id}'); document.getElementById('wsDetailModal').remove();" class="btn-teacher-del">🗑️ 삭제</button>
            </div>
        ` : '';

        const modalHtml = `
            <div class="modal-overlay" id="wsDetailModal">
                <div class="ws-detail-card animate-fadeIn" style="max-width:640px; text-align:center; padding:2rem;">
                    <!-- 닫기 버튼 헤더 -->
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:8px;">
                        <span style="font-weight:800; color:var(--primary-color); font-size:1.3rem;">📌 ${post.category}</span>
                        <button onclick="document.getElementById('wsDetailModal').remove()" 
                                style="background:#ff7675; color:#fff; border:none; padding:6px 16px; border-radius:14px; font-weight:800; font-size:1.1rem; cursor:pointer;">
                            ❌ 닫기
                        </button>
                    </div>
                    
                    <h2 class="ws-detail-title" style="font-family:'Gaegu'; font-size:2.5rem; color:var(--text-main); margin-bottom:10px;">${post.title}</h2>
                    
                    <!-- 그림 썸네일 박스 (작게 조정) -->
                    <div style="display:flex; justify-content:center; margin-bottom:14px;">
                        ${mediaViewHtml}
                    </div>

                    <div style="font-size:1.3rem; font-weight:800; color:#555; margin-bottom:10px;">
                        지은이: <span style="color:var(--primary-color);">${student.name}</span> | <span style="color:#888;">${post.date}</span>
                    </div>

                    ${teacherDetailControls}

                    <div style="background:#f9f9f9; padding:1.2rem; border-radius:16px; border:1px solid #eee; margin:12px 0; text-align:center;">
                        <h4 style="font-size:1.3rem; color:var(--text-main); margin-bottom:6px;">💬 작품 / 기록 설명</h4>
                        <p style="font-size:1.3rem; color:#666; line-height:1.5;">${post.description || "소개가 작성되어 있지 않습니다."}</p>
                    </div>

                    <div style="display:flex; justify-content:center; gap:12px; margin-top:16px;">
                        <button onclick="app.navigateToStudentRoom('${student.id}'); document.getElementById('wsDetailModal').remove();" 
                                class="btn-add-post" style="padding:12px 24px; font-size:1.3rem;">
                            📖 ${student.name} 서재방 방문하기
                        </button>
                        <button onclick="document.getElementById('wsDetailModal').remove()" 
                                style="background:#e0e0e0; color:#444; border:none; padding:12px 24px; border-radius:25px; font-weight:800; font-size:1.3rem; cursor:pointer;">
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // 🔎 라이트박스 대형 전체화면 이미지 확대 모달
    openImageZoomModal(imgSrc, title) {
        const zoomHtml = `
            <div class="modal-overlay" id="fullscreenZoomModal" onclick="document.getElementById('fullscreenZoomModal').remove()" style="z-index:2000; background:rgba(0,0,0,0.85);">
                <div style="position:relative; max-width:90vw; max-height:90vh; display:flex; flex-direction:column; align-items:center; justify-content:center;" onclick="event.stopPropagation();">
                    <button onclick="document.getElementById('fullscreenZoomModal').remove()" 
                            style="position:absolute; top:-45px; right:0; background:#ff7675; color:#fff; border:none; padding:8px 20px; border-radius:20px; font-weight:800; font-size:1.3rem; cursor:pointer;">
                        ✕ 크게보기 닫기
                    </button>
                    <img src="${imgSrc}" alt="${title}" style="max-width:90vw; max-height:80vh; object-fit:contain; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.5);" />
                    <p style="color:#fff; font-size:1.5rem; font-weight:800; margin-top:14px; font-family:'Gaegu';">${title}</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', zoomHtml);
    }
}

const classGalleryView = new ClassGalleryView();
