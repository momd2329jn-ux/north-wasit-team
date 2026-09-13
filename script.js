import {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    doc,
    setDoc,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp
} from "./firebase.js";


const loginModal = document.getElementById("loginModal");
const joinModal = document.getElementById("joinModal");
const mainNav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");


function toggleMenu() {
    if (mainNav) {
        mainNav.classList.toggle("active");
    }
}


function openLogin() {
    closeJoin();

    if (loginModal) {
        loginModal.classList.add("active");
    }

    document.body.style.overflow = "hidden";
}


function closeLogin() {
    if (loginModal) {
        loginModal.classList.remove("active");
    }

    document.body.style.overflow = "";
}


function openJoin() {
    closeLogin();

    if (joinModal) {
        joinModal.classList.add("active");
    }

    document.body.style.overflow = "hidden";
}


function closeJoin() {
    if (joinModal) {
        joinModal.classList.remove("active");
    }

    document.body.style.overflow = "";
}


function switchToJoin() {
    closeLogin();
    openJoin();
}


function switchToLogin() {
    closeJoin();
    openLogin();
}


function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}


window.toggleMenu = toggleMenu;
window.openLogin = openLogin;
window.closeLogin = closeLogin;
window.openJoin = openJoin;
window.closeJoin = closeJoin;
window.switchToJoin = switchToJoin;
window.switchToLogin = switchToLogin;
window.showToast = showToast;


const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


const joinForm = document.getElementById("joinForm");

if (joinForm) {

    joinForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const fullName =
            document.getElementById("fullName").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const birthDate =
            document.getElementById("birthDate").value;

        const gender =
            document.getElementById("gender").value;

        const education =
            document.getElementById("education").value;

        const specialization =
            document.getElementById("specialization").value.trim();

        const job =
            document.getElementById("job").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        if (
            !fullName ||
            !phone ||
            !birthDate ||
            !gender ||
            !education ||
            !email ||
            !password
        ) {
            showToast("يرجى ملء جميع الحقول المطلوبة.");
            return;
        }


        if (password !== confirmPassword) {
            showToast("كلمتا المرور غير متطابقتين.");
            return;
        }


        if (password.length < 6) {
            showToast("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
            return;
        }


        try {

            showToast("جاري إنشاء الحساب...");


            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user = userCredential.user;


            await updateProfile(user, {
                displayName: fullName
            });


            await setDoc(
                doc(db, "members", user.uid),
                {
                    uid: user.uid,
                    fullName: fullName,
                    phone: phone,
                    birthDate: birthDate,
                    gender: gender,
                    education: education,
                    specialization: specialization,
                    job: job,
                    email: email,
                    role: "member",
                    createdAt: serverTimestamp()
                }
            );


            showToast("تم إنشاء الحساب بنجاح 🎉");


            setTimeout(() => {
                window.location.href = "member.html";
            }, 1000);


        } catch (error) {

            console.error(error);


            if (error.code === "auth/email-already-in-use") {

                showToast(
                    "هذا البريد الإلكتروني مستخدم مسبقًا."
                );

            } else if (error.code === "auth/invalid-email") {

                showToast(
                    "البريد الإلكتروني غير صحيح."
                );

            } else if (error.code === "auth/weak-password") {

                showToast(
                    "كلمة المرور ضعيفة."
                );

            } else {

                showToast(
                    "حدث خطأ أثناء إنشاء الحساب."
                );
            }
        }
    });
}


const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        if (!email || !password) {

            showToast(
                "يرجى إدخال البريد الإلكتروني وكلمة المرور."
            );

            return;
        }


        try {

            showToast("جاري تسجيل الدخول...");


            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            showToast("تم تسجيل الدخول بنجاح ✅");


            setTimeout(() => {
                window.location.href = "member.html";
            }, 700);


        } catch (error) {

            console.error(error);


            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {

                showToast(
                    "البريد الإلكتروني أو كلمة المرور غير صحيحة."
                );

            } else if (error.code === "auth/invalid-email") {

                showToast(
                    "البريد الإلكتروني غير صحيح."
                );

            } else {

                showToast(
                    "حدث خطأ أثناء تسجيل الدخول."
                );
            }
        }
    });
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* تحميل الأخبار */

async function loadNews() {

    const container =
        document.getElementById("newsContainer");


    if (!container) return;


    try {

        const newsQuery = query(
            collection(db, "news"),
            orderBy("createdAt", "desc"),
            limit(6)
        );


        const snapshot =
            await getDocs(newsQuery);


        if (snapshot.empty) {

            container.innerHTML = `
                <div class="loading-card">
                    لا توجد أخبار حاليًا.
                </div>
            `;

            return;
        }


        container.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data = docSnap.data();


            const card =
                document.createElement("article");


            card.className = "news-card";


            card.innerHTML = `
                <div class="card-icon">📰</div>

                <h3>
                    ${escapeHTML(data.title)}
                </h3>

                <p>
                    ${escapeHTML(data.content)}
                </p>
            `;


            container.appendChild(card);
        });


    } catch (error) {

        console.error(error);


        container.innerHTML = `
            <div class="loading-card">
                تعذر تحميل الأخبار حاليًا.
            </div>
        `;
    }
}


/* تحميل الفعاليات */

async function loadActivities() {

    const container =
        document.getElementById("activitiesContainer");


    if (!container) return;


    try {

        const activitiesQuery = query(
            collection(db, "activities"),
            orderBy("createdAt", "desc"),
            limit(6)
        );


        const snapshot =
            await getDocs(activitiesQuery);


        if (snapshot.empty) {

            container.innerHTML = `
                <div class="loading-card">
                    لا توجد فعاليات حاليًا.
                </div>
            `;

            return;
        }


        container.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data = docSnap.data();


            const card =
                document.createElement("article");


            card.className = "activity-card";


            card.innerHTML = `
                <div class="card-icon">🎯</div>

                <h3>
                    ${escapeHTML(data.title)}
                </h3>

                <p>
                    ${escapeHTML(data.content)}
                </p>
            `;


            container.appendChild(card);
        });


    } catch (error) {

        console.error(error);


        container.innerHTML = `
            <div class="loading-card">
                تعذر تحميل الفعاليات حاليًا.
            </div>
        `;
    }
}


/* تحميل صور المعرض */

async function loadGallery() {

    const galleryGrid =
        document.getElementById("galleryGrid");


    if (!galleryGrid) return;


    try {

        const galleryQuery =
            query(
                collection(db, "gallery"),
                orderBy("createdAt", "desc"),
                limit(12)
            );


        const snapshot =
            await getDocs(galleryQuery);


        if (snapshot.empty) {

            galleryGrid.innerHTML = `
                <div class="gallery-loading">
                    لا توجد صور في المعرض حاليًا.
                </div>
            `;

            return;
        }


        galleryGrid.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();


            const item =
                document.createElement("div");


            item.className =
                "gallery-item";


            item.innerHTML = `
                <img
                    src="${data.image}"
                    alt="${escapeHTML(
                        data.title ||
                        "صورة من فريق شمال واسط"
                    )}"
                    loading="lazy"
                >

                <span>
                    ${escapeHTML(
                        data.title ||
                        "فعالية فريق شمال واسط"
                    )}
                </span>
            `;


            galleryGrid.appendChild(item);
        });


    } catch (error) {

        console.error(
            "خطأ في تحميل صور المعرض:",
            error
        );


        galleryGrid.innerHTML = `
            <div class="gallery-loading">
                تعذر تحميل صور المعرض حاليًا.
            </div>
        `;
    }
}


/* تحميل محتوى الصفحة */

loadNews();
loadActivities();
loadGallery();


/* القائمة */

if (menuToggle) {

    menuToggle.addEventListener(
        "click",
        toggleMenu
    );
}


document
    .querySelectorAll(".nav a")
    .forEach((link) => {

        link.addEventListener("click", () => {

            if (mainNav) {
                mainNav.classList.remove("active");
            }
        });
    });


/* إغلاق النوافذ */

window.addEventListener("click", (event) => {

    if (event.target === loginModal) {
        closeLogin();
    }


    if (event.target === joinModal) {
        closeJoin();
    }
});