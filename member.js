import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "./firebase.js";

const loadingState = document.getElementById("loadingState");
const memberPage = document.getElementById("memberPage");

const welcomeName = document.getElementById("welcomeName");
const avatarLetter = document.getElementById("avatarLetter");

const memberFullName = document.getElementById("memberFullName");
const memberPhone = document.getElementById("memberPhone");
const memberBirthDate = document.getElementById("memberBirthDate");
const memberGender = document.getElementById("memberGender");
const memberEducation = document.getElementById("memberEducation");
const memberSpecialization = document.getElementById("memberSpecialization");
const memberJob = document.getElementById("memberJob");
const memberEmail = document.getElementById("memberEmail");

const logoutBtn = document.getElementById("logoutBtn");


// ===============================
// أدوات مساعدة
// ===============================

function setText(element, value, fallback = "غير مذكور") {
    if (!element) return;

    const text =
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
            ? String(value)
            : fallback;

    element.textContent = text;
}


function getFirstLetter(name) {
    if (!name) return "ع";

    return String(name).trim().charAt(0) || "ع";
}


// ===============================
// تحميل بيانات العضو
// ===============================

async function loadMemberData(user) {

    try {

        const memberRef = doc(db, "members", user.uid);
        const memberSnap = await getDoc(memberRef);

        if (!memberSnap.exists()) {
            throw new Error("لم يتم العثور على بيانات العضو.");
        }

        const data = memberSnap.data();

        const fullName =
            data.fullName ||
            data.name ||
            user.displayName ||
            "عضو الفريق";

        // الاسم في الترحيب
        setText(welcomeName, fullName, "عضو الفريق");

        // الحرف داخل الصورة الشخصية
        setText(avatarLetter, getFirstLetter(fullName), "ع");

        // البيانات الشخصية
        setText(memberFullName, fullName);
        setText(memberPhone, data.phone);
        setText(memberBirthDate, data.birthDate);
        setText(memberGender, data.gender);
        setText(memberEducation, data.education);
        setText(memberSpecialization, data.specialization);
        setText(memberJob, data.job);

        // الإيميل نأخذه من Firebase Authentication
        setText(memberEmail, user.email);

        // إظهار الصفحة
        if (loadingState) {
            loadingState.style.display = "none";
        }

        if (memberPage) {
            memberPage.style.display = "block";
        }

    } catch (error) {

        console.error("خطأ في تحميل بيانات العضو:", error);

        if (loadingState) {
            loadingState.innerHTML = `
                <div style="
                    text-align:center;
                    padding:40px 20px;
                    color:#b42318;
                ">
                    <h2>تعذر تحميل البيانات</h2>
                    <p>
                        حدث خطأ أثناء تحميل بيانات العضو.
                    </p>
                    <button
                        onclick="location.reload()"
                        style="
                            margin-top:15px;
                            padding:10px 20px;
                            border:0;
                            border-radius:10px;
                            cursor:pointer;
                        "
                    >
                        إعادة المحاولة
                    </button>
                </div>
            `;
        }

        if (memberPage) {
            memberPage.style.display = "none";
        }
    }
}


// ===============================
// تسجيل الخروج
// ===============================

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href = "index.html";

        } catch (error) {

            console.error("خطأ في تسجيل الخروج:", error);

            alert("حدث خطأ أثناء تسجيل الخروج.");
        }
    });
}


// ===============================
// آخر الأخبار
// ===============================

async function loadMemberNews() {

    const newsContainer = document.getElementById("memberNews");

    if (!newsContainer) return;

    try {

        const newsQuery = query(
            collection(db, "news"),
            orderBy("createdAt", "desc"),
            limit(5)
        );

        const snapshot = await getDocs(newsQuery);

        if (snapshot.empty) {
            newsContainer.innerHTML = `
                <p class="empty-message">
                    لا توجد أخبار حالياً.
                </p>
            `;
            return;
        }

        newsContainer.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const news = docSnap.data();

            const item = document.createElement("div");

            item.className = "member-news-item";

            item.innerHTML = `
                <h3>${escapeHtml(news.title || "خبر جديد")}</h3>
                <p>${escapeHtml(news.description || news.content || "")}</p>
            `;

            newsContainer.appendChild(item);
        });

    } catch (error) {

        console.error("خطأ في تحميل الأخبار:", error);

        newsContainer.innerHTML = `
            <p class="empty-message">
                تعذر تحميل الأخبار.
            </p>
        `;
    }
}


// ===============================
// آخر النشاطات
// ===============================

async function loadMemberActivities() {

    const activitiesContainer =
        document.getElementById("memberActivities");

    if (!activitiesContainer) return;

    try {

        const activitiesQuery = query(
            collection(db, "activities"),
            orderBy("createdAt", "desc"),
            limit(5)
        );

        const snapshot = await getDocs(activitiesQuery);

        if (snapshot.empty) {

            activitiesContainer.innerHTML = `
                <p class="empty-message">
                    لا توجد نشاطات حالياً.
                </p>
            `;

            return;
        }

        activitiesContainer.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const activity = docSnap.data();

            const item = document.createElement("div");

            item.className = "member-activity-item";

            item.innerHTML = `
                <h3>
                    ${escapeHtml(activity.title || "نشاط جديد")}
                </h3>

                <p>
                    ${escapeHtml(
                        activity.description ||
                        activity.content ||
                        ""
                    )}
                </p>
            `;

            activitiesContainer.appendChild(item);
        });

    } catch (error) {

        console.error("خطأ في تحميل النشاطات:", error);

        activitiesContainer.innerHTML = `
            <p class="empty-message">
                تعذر تحميل النشاطات.
            </p>
        `;
    }
}


// ===============================
// حماية النصوص من HTML
// ===============================

function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}


// ===============================
// مراقبة تسجيل الدخول
// ===============================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "index.html";

        return;
    }

    // تحميل بيانات العضو
    await loadMemberData(user);

    // تحميل الأخبار إذا كانت موجودة بالصفحة
    await loadMemberNews();

    // تحميل النشاطات إذا كانت موجودة بالصفحة
    await loadMemberActivities();
});