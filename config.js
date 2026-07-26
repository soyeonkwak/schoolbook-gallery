// 초등학교 학급 기록 전시관 - 설정 및 데이터 정의

const CONFIG = {
    APP_NAME: "Schoolbook",
    GOOGLE_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    MAX_STUDENTS: 30,
    EXP_TABLE: {
        CREATE_POST: 50,
        CREATE_CATEGORY: 30,
        DRAW_PICTURE: 70
    },
    LEVEL_THRESHOLDS: [
        { level: 1, name: "신비한 씨앗", minExp: 0, maxExp: 100, icon: "🌱" },
        { level: 2, name: "아기 새싹 요정", minExp: 100, maxExp: 300, icon: "🌿" },
        { level: 3, name: "꿈꾸는 꼬미", minExp: 300, maxExp: 600, icon: "🐥" },
        { level: 4, name: "학급의 마법사", minExp: 600, maxExp: 1000, icon: "🧙‍♂️" },
        { level: 5, name: "찬란한 전설 요정", minExp: 1000, maxExp: Infinity, icon: "👑" }
    ],
    STICKERS: [
        { id: "like", icon: "👍", label: "참 잘했어요!" },
        { id: "heart", icon: "💖", label: "감동이에요!" },
        { id: "artist", icon: "🎨", label: "멋진 예술가!" },
        { id: "idea", icon: "💡", label: "기발한 아이디어!" },
        { id: "star", icon: "🌟", label: "최고로 빛나요!" }
    ],
    DEFAULT_THEME: "🎨 [Schoolbook] 꿈을 담은 학급 보물창고 & 전시관"
};

// 6자리 학급 코드 생성 유틸리티 (예: CLASS-7A9B)
function generateClassCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CLASS-';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
