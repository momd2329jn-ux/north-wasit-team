import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    doc,
    getDoc
} from "./firebase.js";

const memberLoading = document.getElementById("memberLoading");
const memberData = document.getElementById("memberData");
const logoutBtn = document.getElementById("logoutBtn");

function safeText(value) {
    return value !== undefined && value !== null && String(value).trim() !== ""
        ? String(value)
        : "—";
}

function getGenderText(gender) {
    if (gender === "male") return "ذكر";
    if (gender === "female") return "أنثى";
    return "—";
}

function getEducationText(education) {
    const map = {
        primary: "ابتدائية",
        middle: "متوسطة",
        secondary: "إعدادية",
        "high-school": "إعدادية",
        diploma: "دبلوم",
        bachelor: "بكالوريوس",
        master: "ماجستير",
        phd: "دكتوراه",
        other: "أخرى"
    };
    return map[education] || safeText(education);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = safeText(value);
}

function showMemberPage() {
    if (memberLoading) {
        memberLoading.classList.add("hidden");
        memberLoading.style.display = "none";
    }

    if (memberData) {
        memberData.classList.remove("hidden");
        memberData.style.display = "block";
    }
}

function showMemberError(message) {
    console.error(message);

    if (memberLoading) {
        memberLoading.classList.remove("hidden");
        memberLoading.style.display = "block";
        memberLoading.innerHTML = `
            <div style="text-align:center;padding:30px 15px;">
                <h2 style="color:#b42318;margin-bottom:10px;">تعذر تحميل بياناتك</h2>
                <p>${safeText(message)}</p>
                <button type="button" onclick="location.reload()" style="margin-top:15px;padding:10px 20px;border:0;border-radius:10px;cursor:pointer;">
                    إعادة المحاولة
                </button>
            </div>
        `;
    }
}

async function loadMemberData(user) {
    try {
        const memberRef = doc(db, "members", user.uid);
        const memberSnapshot = await getDoc(memberRef);

        if (!memberSnapshot.exists()) {
            showMemberError("لم يتم العثور على بيانات هذا الحساب في قاعدة البيانات.");
            return;
        }

        const data = memberSnapshot.data();
        const fullName = safeText(data.fullName || data.name || user.displayName || "عضو الفريق");

        setText("welcomeName", fullName);
        setText("memberFullName", fullName);
        setText("memberPhone", data.phone);
        setText("memberBirthDate", data.birthDate);
        setText("memberGender", getGenderText(data.gender));
        setText("memberEducation", getEducationText(data.education));
        setText("memberSpecialization", data.specialization);
        setText("memberJob", data.job);
        setText("memberEmail", data.email || user.email);

        const avatarLetter = document.getElementById("avatarLetter");
        if (avatarLetter) {
            avatarLetter.textContent = fullName.charAt(0) || "ع";
        }

        showMemberPage();
        console.log("تم تحميل بيانات العضو بنجاح ✅");

    } catch (error) {
        console.error("خطأ في تحميل بيانات العضو:", error);
        showMemberError(error.message || "حدث خطأ أثناء جلب بيانات العضو.");
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    await loadMemberData(user);
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "index.html";
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء تسجيل الخروج.");
        }
    });
}

const currentYear = document.getElementById("currentYear");
if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}