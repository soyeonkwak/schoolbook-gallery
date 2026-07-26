// 초등학교 학급 기록 전시관 - 칭찬 스티커 & 칭찬 방명록 모듈

class CommentStickerManager {
    // 칭찬 스티커 쏘기 애니메이션 및 저장
    sendSticker(targetStudentId, stickerId) {
        const currentUser = app.currentUser;
        const senderName = currentUser ? currentUser.name : (app.isParentMode ? "👨‍👩‍👧 학부모님" : "익명 친구");

        const success = store.addSticker(targetStudentId, stickerId, senderName);
        if (success) {
            const stickerObj = CONFIG.STICKERS.find(s => s.id === stickerId);
            this.animateFloatingSticker(stickerObj ? stickerObj.icon : "👍");
            app.refreshCurrentRoom();
        }
    }

    // 칭찬 방명록 추가
    submitGuestbook(targetStudentId, contentText, isParent = false) {
        if (!contentText || contentText.trim() === "") {
            alert("칭찬 한마디를 입력해주세요!");
            return;
        }

        const currentUser = app.currentUser;
        let author = currentUser ? currentUser.name : "익명 친구";
        if (isParent) {
            author = "👨‍👩‍👧 " + (prompt("학부모님 성함을 입력해주세요 (예: 김꿈돌 학부모님):", "학부모님") || "학부모님");
        }

        store.addGuestbookEntry(targetStudentId, author, contentText.trim(), isParent);
        app.refreshCurrentRoom();
    }

    // 화면 위로 스티커가 퐁퐁 떠오르는 FX
    animateFloatingSticker(emojiIcon) {
        const floatElem = document.createElement('div');
        floatElem.className = 'floating-sticker-fx';
        floatElem.innerText = emojiIcon;
        
        // 클릭 위치나 화면 중앙 근처
        floatElem.style.left = (window.innerWidth / 2 + (Math.random() * 200 - 100)) + 'px';
        floatElem.style.bottom = '100px';

        document.body.appendChild(floatElem);

        floatElem.animate([
            { transform: 'translateY(0) scale(1)', opacity: 1 },
            { transform: 'translateY(-300px) scale(1.8)', opacity: 0 }
        ], {
            duration: 1800,
            easing: 'ease-out',
            fill: 'forwards'
        });

        setTimeout(() => {
            floatElem.remove();
        }, 1800);
    }
}

const commentStickerManager = new CommentStickerManager();
