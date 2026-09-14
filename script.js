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


/* ==================================================
   ELEMENTS
================================================== */

const loginModal =
    document.getElementById("loginModal");

const joinModal =
    document.getElementById("joinModal");

const socialModal =
    document.getElementById("socialModal");

const mainNav =
    document.getElementById("mainNav");

const menuToggle =
    document.getElementById("menuToggle");

const socialPlatformsBtn =
    document.getElementById("socialPlatformsBtn");

const socialModalClose =
    document.getElementById("socialModalClose");

const socialModalOverlay =
    document.getElementById("socialModalOverlay");


/* ==================================================
   SOCIAL MEDIA MODAL
================================================== */

function openSocialModal() {

    if (!socialModal) return;

    socialModal.classList.add("active");

    socialModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";
}


function closeSocialModal() {

    if (!socialModal) return;

    socialModal.classList.remove("active");

    socialModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";
}


/* ==================================================
   MOBILE MENU
================================================== */

function toggleMenu() {

    if (mainNav) {

        mainNav.classList.toggle(
            "active"
        );
    }
}


/* ==================================================
   LOGIN MODAL
================================================== */

function openLogin() {

    closeJoin();
    closeSocialModal();

    if (loginModal) {

        loginModal.classList.add(
            "active"
        );

        loginModal.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    document.body.style.overflow =
        "hidden";
}


function closeLogin() {

    if (loginModal) {

        loginModal.classList.remove(
            "active"
        );

        loginModal.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    document.body.style.overflow =
        "";
}


/* ==================================================
   JOIN MODAL
================================================== */

function openJoin() {

    closeLogin();
    closeSocialModal();

    if (joinModal) {

        joinModal.classList.add(
            "active"
        );

        joinModal.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    document.body.style.overflow =
        "hidden";
}


function closeJoin() {

    if (joinModal) {

        joinModal.classList.remove(
            "active"
        );

        joinModal.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    document.body.style.overflow =
        "";
}


/* ==================================================
   SWITCH BETWEEN LOGIN / JOIN
================================================== */

function switchToJoin() {

    closeLogin();

    openJoin();
}


function switchToLogin() {

    closeJoin();

    openLogin();
}


/* ==================================================
   TOAST
================================================== */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) return;

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 3500);
}


/* ==================================================
   GLOBAL FUNCTIONS
================================================== */

window.toggleMenu =
    toggleMenu;

window.openLogin =
    openLogin;

window.closeLogin =
    closeLogin;

window.openJoin =
    openJoin;

window.closeJoin =
    closeJoin;

window.switchToJoin =
    switchToJoin;

window.switchToLogin =
    switchToLogin;

window.showToast =
    showToast;

window.openSocialModal =
    openSocialModal;

window.closeSocialModal =
    closeSocialModal;


/* ==================================================
   CURRENT YEAR
================================================== */

const currentYear =
    document.getElementById(
        "currentYear"
    );

if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();
}


/* ==================================================
   JOIN FORM
================================================== */

const joinForm =
    document.getElementById(
        "joinForm"
    );


if (joinForm) {

    joinForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const fullName =
                document
                    .getElementById("fullName")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();


            const birthDate =
                document
                    .getElementById("birthDate")
                    .value;


            const gender =
                document
                    .getElementById("gender")
                    .value;


            const education =
                document
                    .getElementById("education")
                    .value;


            const specialization =
                document
                    .getElementById("specialization")
                    .value
                    .trim();


            const job =
                document
                    .getElementById("job")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            /* التحقق من الحقول */

            if (
                !fullName ||
                !phone ||
                !birthDate ||
                !gender ||
                !education ||
                !email ||
                !password
            ) {

                showToast(
                    "يرجى ملء جميع الحقول المطلوبة."
                );

                return;
            }


            /* التحقق من كلمة المرور */

            if (
                password !==
                confirmPassword
            ) {

                showToast(
                    "كلمتا المرور غير متطابقتين."
                );

                return;
            }


            if (
                password.length < 6
            ) {

                showToast(
                    "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
                );

                return;
            }


            try {

                showToast(
                    "جاري إنشاء الحساب..."
                );


                /* إنشاء الحساب */

                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                /* إضافة اسم المستخدم */

                await updateProfile(
                    user,
                    {
                        displayName:
                            fullName
                    }
                );


                /* حفظ بيانات العضو */

                await setDoc(
                    doc(
                        db,
                        "members",
                        user.uid
                    ),
                    {

                        uid:
                            user.uid,

                        fullName:
                            fullName,

                        phone:
                            phone,

                        birthDate:
                            birthDate,

                        gender:
                            gender,

                        education:
                            education,

                        specialization:
                            specialization,

                        job:
                            job,

                        email:
                            email,

                        role:
                            "member",

                        createdAt:
                            serverTimestamp()
                    }
                );


                showToast(
                    "تم إنشاء الحساب بنجاح 🎉"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "member.html";

                    },
                    1000
                );


            } catch (error) {

                console.error(
                    "خطأ في إنشاء الحساب:",
                    error
                );


                if (
                    error.code ===
                    "auth/email-already-in-use"
                ) {

                    showToast(
                        "هذا البريد الإلكتروني مستخدم مسبقًا."
                    );

                }

                else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    showToast(
                        "البريد الإلكتروني غير صحيح."
                    );

                }

                else if (
                    error.code ===
                    "auth/weak-password"
                ) {

                    showToast(
                        "كلمة المرور ضعيفة."
                    );

                }

                else {

                    showToast(
                        "حدث خطأ أثناء إنشاء الحساب."
                    );
                }
            }
        }
    );
}


/* ==================================================
   LOGIN FORM
================================================== */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            if (
                !email ||
                !password
            ) {

                showToast(
                    "يرجى إدخال البريد الإلكتروني وكلمة المرور."
                );

                return;
            }


            try {

                showToast(
                    "جاري تسجيل الدخول..."
                );


                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                showToast(
                    "تم تسجيل الدخول بنجاح ✅"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "member.html";

                    },
                    700
                );


            } catch (error) {

                console.error(
                    "خطأ في تسجيل الدخول:",
                    error
                );


                if (
                    error.code ===
                        "auth/invalid-credential" ||

                    error.code ===
                        "auth/wrong-password" ||

                    error.code ===
                        "auth/user-not-found"
                ) {

                    showToast(
                        "البريد الإلكتروني أو كلمة المرور غير صحيحة."
                    );

                }

                else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    showToast(
                        "البريد الإلكتروني غير صحيح."
                    );

                }

                else {

                    showToast(
                        "حدث خطأ أثناء تسجيل الدخول."
                    );
                }
            }
        }
    );
}


/* ==================================================
   SECURITY
   منع إدخال HTML من Firebase داخل الصفحة
================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


/* ==================================================
   LOAD NEWS
================================================== */

async function loadNews() {

    const container =
        document.getElementById(
            "newsContainer"
        );


    if (!container) return;


    try {

        const newsQuery =
            query(
                collection(
                    db,
                    "news"
                ),

                orderBy(
                    "createdAt",
                    "desc"
                ),

                limit(6)
            );


        const snapshot =
            await getDocs(
                newsQuery
            );


        /* لا توجد أخبار */

        if (
            snapshot.empty
        ) {

            container.innerHTML = `
                <div class="loading-card">
                    لا توجد أخبار حاليًا.
                </div>
            `;

            return;
        }


        container.innerHTML =
            "";


        /* عرض الأخبار */

        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "news-card";


                card.innerHTML = `

                    <div class="card-icon">
                        📰
                    </div>

                    <h3>
                        ${escapeHTML(
                            data.title
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            data.content
                        )}
                    </p>

                `;


                container.appendChild(
                    card
                );
            }
        );


    } catch (error) {

        console.error(
            "خطأ في تحميل الأخبار:",
            error
        );


        container.innerHTML = `
            <div class="loading-card">
                تعذر تحميل الأخبار حاليًا.
            </div>
        `;
    }
}


/* ==================================================
   LOAD ACTIVITIES
================================================== */

async function loadActivities() {

    const container =
        document.getElementById(
            "activitiesContainer"
        );


    if (!container) return;


    try {

        const activitiesQuery =
            query(
                collection(
                    db,
                    "activities"
                ),

                orderBy(
                    "createdAt",
                    "desc"
                ),

                limit(6)
            );


        const snapshot =
            await getDocs(
                activitiesQuery
            );


        /* لا توجد فعاليات */

        if (
            snapshot.empty
        ) {

            container.innerHTML = `
                <div class="loading-card">
                    لا توجد فعاليات حاليًا.
                </div>
            `;

            return;
        }


        container.innerHTML =
            "";


        /* عرض الفعاليات */

        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "activity-card";


                card.innerHTML = `

                    <div class="card-icon">
                        🎯
                    </div>

                    <h3>
                        ${escapeHTML(
                            data.title
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            data.content
                        )}
                    </p>

                `;


                container.appendChild(
                    card
                );
            }
        );


    } catch (error) {

        console.error(
            "خطأ في تحميل الفعاليات:",
            error
        );


        container.innerHTML = `
            <div class="loading-card">
                تعذر تحميل الفعاليات حاليًا.
            </div>
        `;
    }
}


/* ==================================================
   LOAD GALLERY
================================================== */

async function loadGallery() {

    const galleryGrid =
        document.getElementById(
            "galleryGrid"
        );


    if (!galleryGrid) return;


    try {

        const galleryQuery =
            query(

                collection(
                    db,
                    "gallery"
                ),

                orderBy(
                    "createdAt",
                    "desc"
                ),

                limit(12)

            );


        const snapshot =
            await getDocs(
                galleryQuery
            );


        /* لا توجد صور */

        if (
            snapshot.empty
        ) {

            galleryGrid.innerHTML = `
                <div class="gallery-loading">
                    لا توجد صور في المعرض حاليًا.
                </div>
            `;

            return;
        }


        galleryGrid.innerHTML =
            "";


        /* عرض الصور */

        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "gallery-item";


                const imageUrl =
                    typeof data.image ===
                    "string"
                        ? data.image
                        : "";


                const title =
                    data.title ||
                    "فعالية فريق شمال واسط";


                if (!imageUrl) {

                    return;
                }


                item.innerHTML = `

                    <img
                        src="${escapeHTML(
                            imageUrl
                        )}"
                        alt="${escapeHTML(
                            title
                            )}"
                        loading="lazy"
                    >

                    <span>
                        ${escapeHTML(
                            title
                        )}
                    </span>

                `;


                galleryGrid.appendChild(
                    item
                );
            }
        );


        /* إذا كانت البيانات موجودة لكن بدون صور صالحة */

        if (
            galleryGrid.children.length === 0
        ) {

            galleryGrid.innerHTML = `
                <div class="gallery-loading">
                    لا توجد صور في المعرض حاليًا.
                </div>
            `;
        }


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


/* ==================================================
   SOCIAL MODAL EVENTS
================================================== */

if (
    socialPlatformsBtn
) {

    socialPlatformsBtn.addEventListener(
        "click",
        openSocialModal
    );
}


if (
    socialModalClose
) {

    socialModalClose.addEventListener(
        "click",
        closeSocialModal
    );
}


if (
    socialModalOverlay
) {

    socialModalOverlay.addEventListener(
        "click",
        closeSocialModal
    );
}


/* ==================================================
   LOAD PAGE CONTENT
================================================== */

loadNews();

loadActivities();

loadGallery();


/* ==================================================
   MOBILE MENU BUTTON
================================================== */

if (menuToggle) {

    menuToggle.addEventListener(
        "click",
        toggleMenu
    );
}


/* ==================================================
   CLOSE MOBILE MENU AFTER CLICK
================================================== */

document
    .querySelectorAll(
        ".nav a"
    )
    .forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    if (mainNav) {

                        mainNav.classList.remove(
                            "active"
                        );
                    }
                }
            );
        }
    );


/* ==================================================
   CLOSE MODALS BY CLICKING OUTSIDE
================================================== */

window.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            loginModal
        ) {

            closeLogin();
        }


        if (
            event.target ===
            joinModal
        ) {

            closeJoin();
        }


        if (
            event.target ===
            socialModal
        ) {

            closeSocialModal();
        }
    }
);


/* ==================================================
   ESCAPE KEY
================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !==
            "Escape"
        ) {

            return;
        }


        closeLogin();

        closeJoin();

        closeSocialModal();
    }
);