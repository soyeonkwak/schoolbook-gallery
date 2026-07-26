// 초등학교 학급 기록 전시관 - 미니 NPC 캐릭터 성장 및 애니메이션 모듈

class CharacterManager {
    constructor() {
        this.levels = CONFIG.LEVEL_THRESHOLDS;
    }

    // 경험치 기반 정보 반환 (현재 레벨, 칭호, 진행도 %, 다음 레벨 필요 exp)
    getCharacterStatus(exp) {
        let currentLevel = this.levels[0];
        let nextLevel = this.levels[1];

        for (let i = 0; i < this.levels.length; i++) {
            if (exp >= this.levels[i].minExp) {
                currentLevel = this.levels[i];
                nextLevel = this.levels[i + 1] || null;
            }
        }

        let progressPercent = 100;
        let expInCurrentLevel = exp - currentLevel.minExp;
        let expNeededInCurrentLevel = 100;

        if (nextLevel) {
            expNeededInCurrentLevel = nextLevel.minExp - currentLevel.minExp;
            progressPercent = Math.min(100, Math.floor((expInCurrentLevel / expNeededInCurrentLevel) * 100));
        }

        return {
            level: currentLevel.level,
            name: currentLevel.name,
            icon: currentLevel.icon,
            minExp: currentLevel.minExp,
            maxExp: currentLevel.maxExp,
            currentExp: exp,
            expInCurrentLevel,
            expNeededInCurrentLevel,
            progressPercent,
            nextLevelName: nextLevel ? nextLevel.name : "최고 레벨 달성!"
        };
    }

    // 학생별 독자적인 미니 NPC 캐릭터 SVG 생성기 (아기자기한 파스텔 몬스터/요정)
    renderCharacterSVG(studentName, exp, size = 120) {
        const status = this.getCharacterStatus(exp);
        const seed = encodeURIComponent(studentName);
        
        // 레벨별 오라 및 장식
        let auraColor = "rgba(135, 206, 235, 0.3)";
        let hatSvg = "";
        let bodyShape = "";

        if (status.level === 1) { // 씨앗 알
            auraColor = "rgba(200, 230, 200, 0.4)";
            bodyShape = `<ellipse cx="60" cy="65" rx="35" ry="42" fill="#A8E6CF" stroke="#56B893" stroke-width="4"/>
                         <path d="M 60 23 Q 65 10 75 15 Q 65 25 60 23 Z" fill="#88D8B0"/>`;
        } else if (status.level === 2) { // 아기 새싹
            auraColor = "rgba(255, 234, 167, 0.5)";
            bodyShape = `<ellipse cx="60" cy="65" rx="38" ry="38" fill="#FFEAA7" stroke="#FDCB6E" stroke-width="4"/>
                         <circle cx="60" cy="20" r="8" fill="#55E6C1"/>
                         <path d="M 60 28 L 60 38" stroke="#55E6C1" stroke-width="4"/>`;
        } else if (status.level === 3) { // 꼬미 요정
            auraColor = "rgba(255, 118, 117, 0.4)";
            bodyShape = `<path d="M 30 75 C 20 40, 100 40, 90 75 C 90 90, 30 90, 30 75 Z" fill="#FF7675" stroke="#D63031" stroke-width="4"/>
                         <polygon points="60,15 50,35 70,35" fill="#FFEAA7"/>`;
        } else if (status.level === 4) { // 마법사 요정
            auraColor = "rgba(162, 155, 254, 0.5)";
            bodyShape = `<path d="M 30 80 Q 60 30 90 80 Z" fill="#A29BFE" stroke="#6C5CE7" stroke-width="4"/>
                         <path d="M 40 40 L 60 10 L 80 40 Z" fill="#6C5CE7"/>
                         <circle cx="60" cy="10" r="5" fill="#FFEAA7"/>`;
        } else { // 전설 전사 요정
            auraColor = "rgba(253, 121, 168, 0.6)";
            bodyShape = `<circle cx="60" cy="60" r="40" fill="#FD79A8" stroke="#E84393" stroke-width="4"/>
                         <polygon points="60,5 50,25 70,25" fill="#FFD700"/>
                         <path d="M 20 60 Q 5 40 20 30 Z" fill="#FFEAA7"/>
                         <path d="M 100 60 Q 115 40 100 30 Z" fill="#FFEAA7"/>`;
        }

        return `
        <svg width="${size}" height="${size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="npc-character-svg level-${status.level}">
            <defs>
                <filter id="glow-${seed}" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <!-- 후광 오라 -->
            <circle cx="60" cy="65" r="48" fill="${auraColor}" filter="url(#glow-${seed})" class="aura-pulse"/>
            
            <!-- 몸통 -->
            ${bodyShape}

            <!-- 눈 조작 (귀여운 눈망울) -->
            <circle cx="48" cy="60" r="5" fill="#2D3436"/>
            <circle cx="72" cy="60" r="5" fill="#2D3436"/>
            <circle cx="50" cy="58" r="2" fill="#FFFFFF"/>
            <circle cx="74" cy="58" r="2" fill="#FFFFFF"/>

            <!-- 분홍 볼터치 -->
            <ellipse cx="40" cy="68" rx="4" ry="2.5" fill="#FF85A2" opacity="0.7"/>
            <ellipse cx="80" cy="68" rx="4" ry="2.5" fill="#FF85A2" opacity="0.7"/>

            <!-- 미소 -->
            <path d="M 54 68 Q 60 74 66 68" stroke="#2D3436" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        </svg>
        `;
    }

    // 레벨업 축하 Confetti 폭죽 효과 연출
    triggerConfetti() {
        const colors = ['#ff7675', '#fdcb6e', '#55e6c1', '#74b9ff', '#a29bfe', '#fd79a8'];
        const container = document.body;

        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = '-10px';
            particle.style.width = (Math.random() * 10 + 6) + 'px';
            particle.style.height = (Math.random() * 10 + 6) + 'px';
            particle.style.opacity = Math.random();
            particle.style.transform = `rotate(${Math.random() * 360}deg)`;

            container.appendChild(particle);

            const duration = Math.random() * 2 + 2;
            particle.animate([
                { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
                { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'forwards'
            });

            setTimeout(() => {
                particle.remove();
            }, duration * 1000);
        }
    }

    // 레벨업 모달 팝업 표시
    checkAndShowLevelUp(studentName, oldExp, newExp) {
        const oldStatus = this.getCharacterStatus(oldExp);
        const newStatus = this.getCharacterStatus(newExp);

        if (newStatus.level > oldStatus.level) {
            this.triggerConfetti();

            const modalHtml = `
                <div class="level-up-overlay" id="levelUpModal">
                    <div class="level-up-card animate-bounce">
                        <div class="sparkle">✨</div>
                        <h2>🎉 축하합니다! 레벨업! 🎉</h2>
                        <p class="student-highlight">${studentName} 님의 캐릭터가 성장했어요!</p>
                        <div class="npc-preview">
                            ${this.renderCharacterSVG(studentName, newExp, 160)}
                        </div>
                        <div class="level-badge">${newStatus.icon} Level ${newStatus.level} : ${newStatus.name}</div>
                        <p class="desc">새로운 경험치를 얻어 미니 NPC 캐릭터가 멋지게 변신했습니다!</p>
                        <button onclick="document.getElementById('levelUpModal').remove()" class="btn-confirm">멋져요! 확인</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
    }
}

const characterManager = new CharacterManager();
