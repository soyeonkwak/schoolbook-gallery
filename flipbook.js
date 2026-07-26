// 초등학교 학급 기록 전시관 - 디지털 Flipbook 책 넘기기 & Canvas Drawing 모듈 (업로드 파일 렌더링 포함)

class FlipbookEngine {
    constructor() {
        this.currentPageIndex = 0;
        this.currentStudent = null;
        this.filteredPosts = [];
    }

    renderBook(student, activeCategory = "전체") {
        this.currentStudent = student;
        this.currentPageIndex = 0;

        if (activeCategory === "전체") {
            this.filteredPosts = student.posts;
        } else {
            this.filteredPosts = student.posts.filter(p => p.category === activeCategory);
        }

        const bookContainer = document.getElementById("flipbookContainer");
        if (!bookContainer) return;

        if (this.filteredPosts.length === 0) {
            bookContainer.innerHTML = `
                <div class="empty-book-page">
                    <div class="book-spine"></div>
                    <div class="empty-content">
                        <span>📖</span>
                        <h3>아직 작성된 기록이 없어요</h3>
                        <p>'새 기록 올리기' 버튼을 눌러 나만의 첫 페이지를 채워보세요!</p>
                    </div>
                </div>
            `;
            return;
        }

        this.updateBookPages();
    }

    updateBookPages() {
        const bookContainer = document.getElementById("flipbookContainer");
        if (!bookContainer) return;

        const totalPosts = this.filteredPosts.length;
        const totalPagePairs = Math.ceil((totalPosts + 1) / 2);

        const leftPost = this.filteredPosts[this.currentPageIndex * 2];
        const rightPost = this.filteredPosts[this.currentPageIndex * 2 + 1];

        const isCover = this.currentPageIndex === 0;

        let leftPageHtml = "";
        let rightPageHtml = "";

        if (isCover) {
            leftPageHtml = `
                <div class="book-page page-cover left-cover">
                    <div class="cover-border">
                        <div class="cover-badge">🏫 우리반 디지털 책</div>
                        <h1 class="cover-title">${this.currentStudent.name}의<br>꿈꾸는 기록집</h1>
                        <div class="cover-character">
                            ${characterManager.renderCharacterSVG(this.currentStudent.name, this.currentStudent.exp, 100)}
                        </div>
                        <div class="cover-author">지은이: ${this.currentStudent.name}</div>
                        <div class="cover-date">작성된 기록: 총 ${this.currentStudent.posts.length}개</div>
                    </div>
                </div>
            `;
            rightPageHtml = `
                <div class="book-page page-right page-toc">
                    <h2 class="toc-header">📜 목차 (Contents)</h2>
                    <ul class="toc-list">
                        ${this.filteredPosts.slice(0, 6).map((p, idx) => `
                            <li>
                                <span class="toc-idx">Page ${idx + 1}</span>
                                <span class="toc-title">${p.title}</span>
                                <span class="toc-cat">${p.category}</span>
                            </li>
                        `).join('')}
                    </ul>
                    <div class="toc-footer">
                        👈 오른쪽 아래의 <b>'다음 페이지 ▸'</b> 버튼을 눌러 읽어보세요!
                    </div>
                </div>
            `;
        } else {
            const pageNumLeft = (this.currentPageIndex - 1) * 2 + 1;
            const pageNumRight = (this.currentPageIndex - 1) * 2 + 2;

            leftPageHtml = this.renderSinglePageContent(leftPost, pageNumLeft, "left");
            rightPageHtml = this.renderSinglePageContent(rightPost, pageNumRight, "right");
        }

        bookContainer.innerHTML = `
            <div class="flipbook-wrapper">
                <div class="book-spine"></div>
                ${leftPageHtml}
                ${rightPageHtml}
            </div>
            
            <div class="book-navigation">
                <button class="nav-btn prev-btn" ${this.currentPageIndex === 0 ? 'disabled' : ''} onclick="flipbookEngine.prevPage()">
                    ◂ 이전 페이지
                </button>
                <span class="page-indicator">${this.currentPageIndex + 1} / ${totalPagePairs} (총 ${totalPosts}개 기록)</span>
                <button class="nav-btn next-btn" ${this.currentPageIndex >= totalPagePairs - 1 ? 'disabled' : ''} onclick="flipbookEngine.nextPage()">
                    다음 페이지 ▸
                </button>
            </div>
        `;
    }

    renderSinglePageContent(post, pageNum, side) {
        if (!post) {
            return `
                <div class="book-page page-${side} page-empty-end">
                    <div class="page-corner"></div>
                    <div class="empty-end-msg">
                        <span>🌟</span>
                        <p>이야기는 여기서 계속됩니다!</p>
                    </div>
                    <div class="page-number">- ${pageNum} -</div>
                </div>
            `;
        }

        let mediaHtml = "";
        if (post.type === "image") {
            mediaHtml = `<div class="page-media-img"><img src="${post.content}" alt="${post.title}" loading="lazy"/></div>`;
        } else if (post.type === "video") {
            if (post.content.startsWith('data:video')) {
                mediaHtml = `
                    <div class="page-media-video">
                        <video src="${post.content}" controls style="width:100%; max-height:240px;"></video>
                    </div>
                `;
            } else {
                mediaHtml = `
                    <div class="page-media-video">
                        <iframe src="${post.content}" frameborder="0" allowfullscreen></iframe>
                    </div>
                `;
            }
        } else {
            mediaHtml = `<div class="page-text-paper"><pre class="story-text">${post.content}</pre></div>`;
        }

        const isWeeklyPick = post.id === this.currentStudent.weeklyPickId;

        return `
            <div class="book-page page-${side} animate-turn">
                <div class="page-corner"></div>
                <div class="page-header">
                    <span class="page-cat-badge">${post.category}</span>
                    <span class="page-date">${post.date}</span>
                </div>
                <h2 class="page-title">${post.title}</h2>
                
                ${mediaHtml}

                <div class="page-description">
                    ${post.description || ""}
                </div>

                <div class="page-footer">
                    <div class="pick-status">
                        ${isWeeklyPick ? `<span class="pick-tag">🖼️ 학급 미술관 대표작</span>` : 
                          `<button class="btn-set-pick" onclick="app.setWeeklyPick('${post.id}')">🖼️ 미술관 대표작 설정</button>`}
                    </div>
                    <div class="page-number">- Page ${pageNum} -</div>
                </div>
            </div>
        `;
    }

    nextPage() {
        const totalPagePairs = Math.ceil((this.filteredPosts.length + 1) / 2);
        if (this.currentPageIndex < totalPagePairs - 1) {
            this.currentPageIndex++;
            this.updateBookPages();
        }
    }

    prevPage() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.updateBookPages();
        }
    }
}

class CanvasPainter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.color = "#000000";
        this.lineWidth = 5;

        this.initEvents();
    }

    initEvents() {
        if (!this.canvas) return;

        const startDraw = (e) => {
            this.isDrawing = true;
            this.ctx.beginPath();
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            this.ctx.moveTo(x, y);
        };

        const draw = (e) => {
            if (!this.isDrawing) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        };

        const stopDraw = () => {
            this.isDrawing = false;
        };

        this.canvas.addEventListener('mousedown', startDraw);
        this.canvas.addEventListener('mousemove', draw);
        this.canvas.addEventListener('mouseup', stopDraw);
        this.canvas.addEventListener('mouseleave', stopDraw);

        this.canvas.addEventListener('touchstart', startDraw);
        this.canvas.addEventListener('touchmove', draw);
        this.canvas.addEventListener('touchend', stopDraw);

        this.clearCanvas();
    }

    setColor(c) {
        this.color = c;
    }

    setLineWidth(w) {
        this.lineWidth = w;
    }

    clearCanvas() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getImageDataUrl() {
        return this.canvas.toDataURL('image/png');
    }
}

const flipbookEngine = new FlipbookEngine();
let canvasPainter = null;
