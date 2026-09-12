import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    doc,
    getDoc
} from "./FIREBASE_UPDATED.js";


/* =========================
   العناصر
========================= */

const memberLoading =
    document.getElementById("memberLoading");

const memberData =
    document.getElementById("memberData");

const logoutBtn =
    document.getElementById("logoutBtn");


/* =========================
   تحويل الجنس إلى عربي
========================= */

function getGenderText(gender) {

    if (gender === "male") {
        return "ذكر";
    }

    if (gender === "female") {
        return "أنثى";
    }

    return "—";
}


/* =========================
   تحويل التعليم إلى عربي
========================= */

function getEducationText(education) {

    const educationMap = {

        "high-school": "الثانوية",
        "diploma": "دبلوم",
        "bachelor": "بكالوريوس",
        "master": "ماجستير",
        "phd": "دكتوراه"

    };

    return educationMap[education] || education || "—";
}


/* =========================
   حماية النصوص
========================= */

function safeText(value) {

    return value || "—";
}


/* =========================
   عرض بيانات العضو
========================= */

async function loadMemberData(user) {

    try {

        const memberRef =
            doc(db, "members", user.uid);

        const memberSnapshot =
            await getDoc(memberRef);


        if (!memberSnapshot.exists()) {

            alert(
                "لم يتم العثور على بيانات العضو."
            );

            await signOut(auth);

            window.location.href =
                "INDEX_UPDATED.html";

            return;
        }


        const data =
            memberSnapshot.data();


        /* =========================
           تعبئة البيانات
        ========================== */

        const fullName =
            safeText(data.fullName);


        document.getElementById(
            "welcomeName"
        ).textContent = fullName;


        document.getElementById(
            "memberFullName"
        ).textContent = fullName;


        document.getElementById(
            "memberPhone"
        ).textContent =
            safeText(data.phone);


        document.getElementById(
            "memberBirthDate"
        ).textContent =
            safeText(data.birthDate);


        document.getElementById(
            "memberGender"
        ).textContent =
            getGenderText(data.gender);


        document.getElementById(
            "memberEducation"
        ).textContent =
            getEducationText(data.education);


        document.getElementById(
            "memberSpecialization"
        ).textContent =
            safeText(data.specialization);


        document.getElementById(
            "memberJob"
        ).textContent =
            safeText(data.job);


        document.getElementById(
            "memberEmail"
        ).textContent =
            safeText(data.email || user.email);


        /* =========================
           الحرف الأول للأفاتار
        ========================== */

        const avatarLetter =
            document.getElementById(
                "avatarLetter"
            );


        if (avatarLetter) {

            avatarLetter.textContent =
                fullName.charAt(0) || "ع";

        }


        /* =========================
           إظهار الصفحة
        ========================== */

        memberLoading.classList.add("hidden");

        memberData.classList.remove("hidden");


    } catch (error) {

        console.error(error);


        memberLoading.innerHTML = `
            <p>
                حدث خطأ أثناء تحميل بياناتك.
            </p>
        `;
    }
}


/* =========================
   مراقبة تسجيل الدخول
========================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href =
            "INDEX_UPDATED.html";

        return;
    }


    await loadMemberData(user);

});


/* =========================
   تسجيل الخروج
========================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "INDEX_UPDATED.html";

            } catch (error) {

                console.error(error);

                alert(
                    "حدث خطأ أثناء تسجيل الخروج."
                );

            }

        }
    );

}


/* =========================
   السنة الحالية
========================= */

const currentYear =
    document.getElementById("currentYear");

if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}