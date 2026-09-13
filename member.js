import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    doc,
    getDoc
} from "./firebase.js";


// ===============================
// عناصر الصفحة
// ===============================

const memberLoading = document.getElementById("memberLoading");
const memberData = document.getElementById("memberData");

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
const currentYear = document.getElementById("currentYear");


// ===============================
// السنة الحالية
// ===============================

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


// ===============================
// تعبئة النصوص
// ===============================

function setText(element, value) {

    if (!element) return;

    if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    ) {
        element.textContent = value;
    } else {
        element.textContent = "—";
    }
}


// ===============================
// أول حرف من الاسم
// ===============================

function getFirstLetter(name) {

    if (!name || String(name).trim() === "") {
        return "ع";
    }

    return String(name).trim().charAt(0);
}


// ===============================
// تحميل بيانات العضو
// ===============================

async function loadMemberData(user) {

    try {

        console.log("بدأ تحميل بيانات العضو...");
        console.log("UID:", user.uid);

        const memberRef = doc(db, "members", user.uid);

        const memberSnap = await getDoc(memberRef);

        console.log("هل توجد بيانات العضو؟", memberSnap.exists());

        if (!memberSnap.exists()) {

            throw new Error(
                "لم يتم العثور على بيانات العضو في Firestore."
            );
        }

        const data = memberSnap.data();

        console.log("بيانات العضو:", data);


        // ===============================
        // الاسم
        // ===============================

        const fullName =
            data.fullName ||
            data.name ||
            user.displayName ||
            "عضو الفريق";


        // ===============================
        // تعبئة البيانات
        // ===============================

        setText(welcomeName, fullName);

        setText(
            avatarLetter,
            getFirstLetter(fullName)
        );

        setText(memberFullName, fullName);

        setText(
            memberPhone,
            data.phone
        );

        setText(
            memberBirthDate,
            data.birthDate
        );

        setText(
            memberGender,
            data.gender
        );

        setText(
            memberEducation,
            data.education
        );

        setText(
            memberSpecialization,
            data.specialization
        );

        setText(
            memberJob,
            data.job
        );

        setText(
            memberEmail,
            user.email
        );


        // ===============================
        // إظهار بيانات العضو
        // ===============================

        if (memberLoading) {
            memberLoading.style.display = "none";
        }

        if (memberData) {
            memberData.classList.remove("hidden");
        }

        console.log("تم تحميل بيانات العضو بنجاح ✅");

    } catch (error) {

        console.error(
            "خطأ في تحميل بيانات العضو:",
            error
        );


        // إخفاء التحميل

        if (memberLoading) {
            memberLoading.innerHTML = `
                <div style="
                    text-align:center;
                    padding:30px 15px;
                ">

                    <h2 style="
                        margin-bottom:10px;
                        color:#b42318;
                    ">
                        تعذر تحميل بياناتك
                    </h2>

                    <p style="
                        margin-bottom:15px;
                    ">
                        حدث خطأ أثناء جلب بيانات العضو.
                    </p>

                    <button
                        type="button"
                        onclick="location.reload()"
                        style="
                            border:0;
                            padding:10px 20px;
                            border-radius:10px;
                            cursor:pointer;
                        "
                    >
                        إعادة المحاولة
                    </button>

                </div>
            `;
        }

    }
}


// ===============================
// تسجيل الخروج
// ===============================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href = "index.html";

            } catch (error) {

                console.error(
                    "خطأ في تسجيل الخروج:",
                    error
                );

                alert(
                    "حدث خطأ أثناء تسجيل الخروج."
                );
            }
        }
    );
}


// ===============================
// مراقبة تسجيل الدخول
// ===============================

onAuthStateChanged(
    auth,
    async (user) => {

        console.log(
            "حالة تسجيل الدخول:",
            user
        );


        // إذا ماكو تسجيل دخول

        if (!user) {

            window.location.href = "index.html";

            return;
        }


        // تحميل بيانات العضو

        await loadMemberData(user);

    }
);