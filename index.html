import {
    auth,
    db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp,
    where
} from "./firebase.js";


// ================================
// ELEMENTS
// ================================

const socialModal = document.getElementById("socialModal");
const loginModal = document.getElementById("loginModal");
const joinModal = document.getElementById("joinModal");

const loginForm = document.getElementById("loginForm");
const joinForm = document.getElementById("joinForm");

const loginMessage = document.getElementById("loginMessage");
const joinMessage = document.getElementById("joinMessage");


// ================================
// GLOBAL MODAL FUNCTIONS
// ================================

window.openSocial = function () {
    if (socialModal) {
        socialModal.classList.add("show");
    }
};

window.closeSocial = function () {
    if (socialModal) {
        socialModal.classList.remove("show");
    }
};


window.openLogin = function () {
    closeJoin();

    if (loginModal) {
        loginModal.classList.add("show");
    }
};


window.closeLogin = function () {
    if (loginModal) {
        loginModal.classList.remove("show");
    }
};


window.openJoin = function () {
    closeLogin();

    if (joinModal) {
        joinModal.classList.add("show");
    }
};


window.closeJoin = function () {
    if (joinModal) {
        joinModal.classList.remove("show");
    }
};


window.switchToJoin = function () {
    closeLogin();
    openJoin();
};


window.switchToLogin = function () {
    closeJoin();
    openLogin();
};


// ================================
// CLOSE MODALS WHEN CLICK OUTSIDE
// ================================

[loginModal, joinModal, socialModal].forEach(modal => {

    if (!modal) return;

    modal.addEventListener("click", function (event) {

        if (event.target === modal) {
            modal.classList.remove("show");
        }

    });

});


// ================================
// ESC KEY
// ================================

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeLogin();
        closeJoin();
        closeSocial();
    }

});


// ================================
// TOAST
// ================================

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.className = "";

    toast.classList.add("show");

    if (type === "error") {
        toast.classList.add("error");
    }

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}


// ================================
// LOGIN
// ================================

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        if (loginMessage) {
            loginMessage.textContent = "جاري تسجيل الدخول...";
            loginMessage.style.color = "#155dcc";
        }

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            // Check whether user is admin
            const adminRef = doc(db, "admins", user.uid);
            const adminSnapshot = await getDoc(adminRef);

            closeLogin();

            if (adminSnapshot.exists()) {

                window.location.href = "admin.html";

            } else {

                window.location.href = "member.html";

            }

        } catch (error) {

            console.error(error);

            let message =
                "تعذر تسجيل الدخول. تأكد من البيانات.";

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {
                message =
                    "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
            }

            if (error.code === "auth/too-many-requests") {
                message =
                    "تمت محاولات كثيرة. حاول لاحقاً.";
            }

            if (loginMessage) {
                loginMessage.textContent = message;
                loginMessage.style.color = "#d92d20";
            }

        }

    });

}


// ================================
// JOIN / REGISTER
// ================================

if (joinForm) {

    joinForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const fullName =
            document.getElementById("joinFullName").value.trim();

        const phone =
            document.getElementById("joinPhone").value.trim();

        const birthDate =
            document.getElementById("joinBirthDate").value;

        const gender =
            document.getElementById("joinGender").value;

        const education =
            document.getElementById("joinEducation").value;

        const specialization =
            document.getElementById("joinSpecialization").value.trim();

        const job =
            document.getElementById("joinJob").value.trim();

        const email =
            document.getElementById("joinEmail").value.trim();

        const password =
            document.getElementById("joinPassword").value;


        if (joinMessage) {
            joinMessage.textContent =
                "جاري إنشاء الحساب...";
            joinMessage.style.color = "#155dcc";
        }


        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;


            // Update Firebase Auth display name
            await updateProfile(user, {
                displayName: fullName
            });


            // Save member information
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
                    createdAt: serverTimestamp()
                }
            );


            if (joinMessage) {
                joinMessage.textContent =
                    "تم إنشاء الحساب بنجاح.";
                joinMessage.style.color = "#039855";
            }


            showToast(
                "تم إنشاء حسابك بنجاح 🎉"
            );


            setTimeout(() => {

                closeJoin();

                window.location.href = "member.html";

            }, 900);


        } catch (error) {

            console.error(error);

            let message =
                "حدث خطأ أثناء إنشاء الحساب.";

            if (error.code === "auth/email-already-in-use") {
                message =
                    "هذا البريد الإلكتروني مستخدم مسبقاً.";
            }

            if (error.code === "auth/weak-password") {
                message =
                    "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
            }

            if (error.code === "auth/invalid-email") {
                message =
                    "البريد الإلكتروني غير صحيح.";
            }


            if (joinMessage) {
                joinMessage.textContent = message;
                joinMessage.style.color = "#d92d20";
            }

        }

    });

}


// ================================
// LOAD NEWS
// ================================

async function loadNews() {

    const latestContainer =
        document.getElementById("latestContainer");

    if (!latestContainer) return;


    try {

        const newsQuery = query(
            collection(db, "news"),
            orderBy("createdAt", "desc"),
            limit(6)
        );

        const snapshot =
            await getDocs(newsQuery);


        if (snapshot.empty) {

            latestContainer.innerHTML = `
                <div class="empty-message">
                    لا توجد أخبار منشورة حالياً.
                </div>
            `;

            return;
        }


        latestContainer.innerHTML = "";


        snapshot.forEach(docSnapshot => {

            const data = docSnapshot.data();

            latestContainer.appendChild(
                createPostCard(data, "news")
            );

        });


    } catch (error) {

        console.error("Error loading news:", error);

        latestContainer.innerHTML = `
            <div class="empty-message">
                تعذر تحميل الأخبار حالياً.
            </div>
        `;

    }

}


// ================================
// LOAD CATEGORY POSTS
// ================================

async function loadCategoryPosts(
    category,
    elementId
) {

    const container =
        document.querySelector(
            `#${elementId} .category-posts`
        );

    if (!container) return;


    try {

        const postsQuery = query(
            collection(db, "posts"),
            where("category", "==", category),
            orderBy("createdAt", "desc"),
            limit(3)
        );

        const snapshot =
            await getDocs(postsQuery);


        if (snapshot.empty) {

            container.innerHTML = `
                <p class="empty-category">
                    لا توجد منشورات حالياً.
                </p>
            `;

            return;
        }


        container.innerHTML = "";


        snapshot.forEach(docSnapshot => {

            const data = docSnapshot.data();

            container.appendChild(
                createPostCard(data, "post")
            );

        });


    } catch (error) {

        console.error(
            `Error loading ${category}:`,
            error
        );

        container.innerHTML = `
            <p class="empty-category">
                تعذر تحميل المحتوى.
            </p>
        `;

    }

}


// ================================
// LOAD ACTIVITIES
// ================================

async function loadActivities() {

    const container =
        document.querySelector(
            "#activities .category-posts"
        );

    if (!container) return;


    try {

        const activitiesQuery = query(
            collection(db, "activities"),
            orderBy("createdAt", "desc"),
            limit(3)
        );

        const snapshot =
            await getDocs(activitiesQuery);


        if (snapshot.empty) {

            container.innerHTML = `
                <p class="empty-category">
                    لا توجد فعاليات حالياً.
                </p>
            `;

            return;
        }


        container.innerHTML = "";


        snapshot.forEach(docSnapshot => {

            const data = docSnapshot.data();

            container.appendChild(
                createPostCard(data, "activity")
            );

        });


    } catch (error) {

        console.error(
            "Error loading activities:",
            error
        );

        container.innerHTML = `
            <p class="empty-category">
                تعذر تحميل الفعاليات.
            </p>
        `;

    }

}


// ================================
// CREATE CARD
// ================================

function createPostCard(data, type) {

    const card =
        document.createElement("article");

    card.className = "post-card";


    let imageHTML = "";

    if (data.image) {

        imageHTML = `
            <div class="post-image">
                <img
                    src="${data.image}"
                    alt="${escapeHTML(data.title || "منشور")}"
                    loading="lazy"
                >
            </div>
        `;

    }


    let dateText = "";

    if (data.createdAt?.toDate) {

        dateText =
            data.createdAt
                .toDate()
                .toLocaleDateString("ar-IQ");

    }


    card.innerHTML = `

        ${imageHTML}

        <div class="post-card-content">

            ${
                dateText
                    ? `<span class="post-date">${dateText}</span>`
                    : ""
            }

            <h3>
                ${escapeHTML(data.title || "بدون عنوان")}
            </h3>

            <p>
                ${escapeHTML(
                    data.content ||
                    data.description ||
                    "لا يوجد وصف."
                )}
            </p>

        </div>

    `;


    return card;

}


// ================================
// ESCAPE HTML
// ================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ================================
// AUTH STATE
// ================================

onAuthStateChanged(auth, async user => {

    const loginButton =
        document.querySelector(".login-btn");

    if (!loginButton) return;


    if (user) {

        loginButton.textContent =
            "حسابي";

        loginButton.onclick = function () {

            window.location.href =
                "member.html";

        };

    } else {

        loginButton.textContent =
            "تسجيل الدخول";

        loginButton.onclick =
            window.openLogin;

    }

});


// ================================
// CURRENT YEAR
// ================================

const currentYear =
    document.getElementById("currentYear");

if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}


// ================================
// LOAD EVERYTHING
// ================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await loadNews();

        await loadCategoryPosts(
            "health",
            "health"
        );

        await loadCategoryPosts(
            "environment",
            "environment"
        );

        await loadCategoryPosts(
            "articles",
            "articles"
        );

        await loadActivities();

    }
);