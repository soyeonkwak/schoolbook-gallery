// 초등학교 학급 기록 전시관 - LocalStorage 데이터 관리 모듈 (교사 권한 수정/삭제 포함)

const STORAGE_KEY = "WITHSPACE_CLASSROOM_SYSTEM_V3";

class DataStore {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                return JSON.parse(raw);
            } catch (e) {
                console.error("데이터 로드 실패", e);
            }
        }
        return this.createCleanStructure();
    }

    saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }

    createCleanStructure() {
        return {
            classrooms: [],
            activeClassId: null,
            viewsCount: 1420,
            likesCount: 388
        };
    }

    createClassroom(teacherName, teacherEmail, className, theme) {
        const classCode = generateClassCode();
        const newClass = {
            id: `class_${Date.now()}`,
            code: classCode,
            name: className || "우리반 디지털 미술 전시관",
            teacherName: teacherName || "선생님",
            teacherEmail: teacherEmail || "teacher@school.ed.kr",
            theme: theme || CONFIG.DEFAULT_THEME,
            createdAt: new Date().toISOString().split('T')[0],
            students: []
        };

        this.data.classrooms.unshift(newClass);
        this.data.activeClassId = newClass.id;
        this.saveData();
        return newClass;
    }

    getClassroomByCode(code) {
        if (!code) return null;
        const cleanCode = code.trim().toUpperCase();
        return this.data.classrooms.find(c => c.code.toUpperCase() === cleanCode);
    }

    getActiveClassroom() {
        if (!this.data.activeClassId && this.data.classrooms.length > 0) {
            this.data.activeClassId = this.data.classrooms[0].id;
        }
        return this.data.classrooms.find(c => c.id === this.data.activeClassId) || null;
    }

    setActiveClassroom(classId) {
        this.data.activeClassId = classId;
        this.saveData();
    }

    joinStudentWithCode(classCode, studentName, studentEmail, googleId = null) {
        const classroom = this.getClassroomByCode(classCode);
        if (!classroom) {
            return { success: false, message: "올바르지 않은 학급 코드입니다. 교사에게 전달받은 코드를 확인해주세요!" };
        }

        if (classroom.students.length >= CONFIG.MAX_STUDENTS) {
            return { success: false, message: "해당 학급의 정원(30명)이 가득 차 더 이상 가입할 수 없습니다." };
        }

        let existingStudent = classroom.students.find(s => s.googleEmail === studentEmail || s.name === studentName);
        if (existingStudent) {
            return { success: true, classroom, student: existingStudent, isNew: false };
        }

        const studentNumber = classroom.students.length + 1;
        const newStudent = {
            id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            number: studentNumber,
            name: `${studentNumber}번 ${studentName}`,
            googleEmail: studentEmail,
            googleId: googleId,
            exp: 0,
            categories: ["전체", "🎨 그림", "📝 글/시", "🔬 관찰자료", "🎬 영상"],
            posts: [],
            weeklyPickId: null,
            stickers: [],
            guestbook: []
        };

        classroom.students.push(newStudent);
        this.saveData();
        return { success: true, classroom, student: newStudent, isNew: true };
    }

    getStudentById(studentId) {
        const activeClass = this.getActiveClassroom();
        if (!activeClass) return null;
        return activeClass.students.find(s => s.id === studentId);
    }

    addPost(studentId, postData, expReward = CONFIG.EXP_TABLE.CREATE_POST) {
        const student = this.getStudentById(studentId);
        if (!student) return null;

        const newPost = {
            id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            title: postData.title,
            category: postData.category || "🎨 그림",
            type: postData.type || "image",
            content: postData.content,
            description: postData.description || "",
            date: new Date().toISOString().split('T')[0],
            likes: 0
        };

        student.posts.unshift(newPost);
        if (!student.weeklyPickId) {
            student.weeklyPickId = newPost.id;
        }

        const oldExp = student.exp;
        student.exp += expReward;

        this.saveData();
        return { post: newPost, oldExp, newExp: student.exp };
    }

    // 👩‍🏫 교사 권한: 작품 수정
    updatePost(studentId, postId, updatedData) {
        const student = this.getStudentById(studentId);
        if (!student) return false;

        const post = student.posts.find(p => p.id === postId);
        if (post) {
            post.title = updatedData.title || post.title;
            post.category = updatedData.category || post.category;
            post.description = updatedData.description !== undefined ? updatedData.description : post.description;
            this.saveData();
            return true;
        }
        return false;
    }

    // 👩‍🏫 교사 권한: 작품 삭제
    deletePost(studentId, postId) {
        const student = this.getStudentById(studentId);
        if (!student) return false;

        const idx = student.posts.findIndex(p => p.id === postId);
        if (idx !== -1) {
            student.posts.splice(idx, 1);
            if (student.weeklyPickId === postId) {
                student.weeklyPickId = student.posts.length > 0 ? student.posts[0].id : null;
            }
            this.saveData();
            return true;
        }
        return false;
    }

    // 👩‍🏫 교사 권한: 학생 계정 삭제
    deleteStudent(studentId) {
        const activeClass = this.getActiveClassroom();
        if (!activeClass) return false;

        const idx = activeClass.students.findIndex(s => s.id === studentId);
        if (idx !== -1) {
            activeClass.students.splice(idx, 1);
            this.saveData();
            return true;
        }
        return false;
    }

    addCategory(studentId, categoryName) {
        const student = this.getStudentById(studentId);
        if (student && !student.categories.includes(categoryName)) {
            student.categories.push(categoryName);
            student.exp += CONFIG.EXP_TABLE.CREATE_CATEGORY;
            this.saveData();
            return true;
        }
        return false;
    }

    setWeeklyPick(studentId, postId) {
        const student = this.getStudentById(studentId);
        if (student) {
            student.weeklyPickId = postId;
            this.saveData();
        }
    }

    addSticker(targetStudentId, stickerId, senderName) {
        const student = this.getStudentById(targetStudentId);
        if (student) {
            student.stickers.push({
                id: `sticker_${Date.now()}`,
                stickerId: stickerId,
                from: senderName,
                date: new Date().toISOString().split('T')[0]
            });
            this.saveData();
            return true;
        }
        return false;
    }

    addGuestbookEntry(targetStudentId, author, content, isParent = false) {
        const student = this.getStudentById(targetStudentId);
        if (student) {
            const entry = {
                id: `gb_${Date.now()}`,
                author: author,
                content: content,
                isParent: isParent,
                date: new Date().toISOString().split('T')[0]
            };
            student.guestbook.unshift(entry);
            this.saveData();
            return entry;
        }
        return null;
    }

    incrementLikes() {
        this.data.likesCount = (this.data.likesCount || 0) + 1;
        this.saveData();
        return this.data.likesCount;
    }
}

const store = new DataStore();
