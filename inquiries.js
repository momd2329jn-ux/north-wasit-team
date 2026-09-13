import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp
} from "./firebase.js";


/* =========================
   العناصر
========================= */

const inquiryForm =
    document.getElementById("inquiryForm");

const inquiryType =
    document.getElementById("inquiryType");

const inquirySubject =
    document.getElementById("inquirySubject");

const inquiryMessage =
    document.getElementById("inquiryMessage");

const inquiriesList =
    document.getElementById("inquiriesList");

const inquiryToast =
    document.getElementById("inquiryToast");

const logoutBtn =
    document.getElementById("logoutBtn");


let currentUser = null;


/* =========================
   الإشعارات
========================= */

function showToast(message, type = "success") {

    if (!inquiryToast) return;

    inquiryToast.textContent = message;

    inquiryToast.className =
        `inquiry-toast ${type} show`;

    setTimeout(() => {

        inquiryToast.classList.remove("show");

    }, 3500);
}


/* =========================
   حماية النصوص
========================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   التاريخ
========================= */

function formatDate(timestamp) {

    if (!timestamp) {
        return "منذ قليل";
    }

    try {

        const date =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);

        return date.toLocaleDateString(
            "ar-IQ",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    } catch {

        return "منذ قليل";
    }
}


/* =========================
   حالة الاستفسار
========================= */

function getStatusInfo(status) {

    if (status === "answered") {

        return {
            text: "تم الرد",
            className: "answered"
        };
    }


    if (status === "closed") {

        return {
            text: "مغلق",
            className: "closed"
        };
    }


    return {
        text: "قيد المراجعة",
        className: "pending"
    };
}


/* =========================
   التحقق من الدخول
========================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        currentUser = user;


        await loadMyInquiries();
    }
);


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
                    "index.html";

            } catch (error) {

                console.error(
                    "خطأ أثناء تسجيل الخروج:",
                    error
                );

                showToast(
                    "حدث خطأ أثناء تسجيل الخروج.",
                    "error"
                );
            }
        }
    );
}


/* =========================
   إرسال الاستفسار
========================= */

if (inquiryForm) {

    inquiryForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /* -------------------------
               التأكد من تسجيل الدخول
            ------------------------- */

            if (!currentUser) {

                showToast(
                    "يجب تسجيل الدخول أولاً.",
                    "error"
                );

                return;
            }


            /* -------------------------
               قراءة البيانات
            ------------------------- */

            const type =
                inquiryType?.value.trim() || "";

            const subject =
                inquirySubject?.value.trim() || "";

            const message =
                inquiryMessage?.value.trim() || "";


            /* -------------------------
               التحقق
            ------------------------- */

            if (!type) {

                showToast(
                    "يرجى اختيار نوع الاستفسار.",
                    "error"
                );

                inquiryType?.focus();

                return;
            }


            if (!subject) {

                showToast(
                    "يرجى كتابة عنوان الاستفسار.",
                    "error"
                );

                inquirySubject?.focus();

                return;
            }


            if (!message) {

                showToast(
                    "يرجى كتابة تفاصيل الاستفسار.",
                    "error"
                );

                inquiryMessage?.focus();

                return;
            }


            /* -------------------------
               زر الإرسال
            ------------------------- */

            const submitButton =
                inquiryForm.querySelector(
                    'button[type="submit"]'
                );


            const originalText =
                submitButton
                    ? submitButton.textContent
                    : "إرسال الاستفسار";


            try {

                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.textContent =
                        "جاري الإرسال...";
                }


                /* -------------------------
                   بيانات الاستفسار
                ------------------------- */

                const inquiryData = {

                    userId:
                        currentUser.uid,

                    userName:
                        currentUser.displayName ||
                        "عضو الفريق",

                    userEmail:
                        currentUser.email || "",

                    type:
                        type,

                    subject:
                        subject,

                    message:
                        message,

                    status:
                        "pending",

                    reply:
                        "",

                    createdAt:
                        serverTimestamp(),

                    repliedAt:
                        null
                };


                /* -------------------------
                   الحفظ في Firebase
                ------------------------- */

                const inquiryRef =
                    await addDoc(
                        collection(
                            db,
                            "inquiries"
                        ),
                        inquiryData
                    );


                console.log(
                    "تم حفظ الاستفسار:",
                    inquiryRef.id
                );


                /* -------------------------
                   نجاح
                ------------------------- */

                inquiryForm.reset();


                showToast(
                    "تم إرسال استفسارك بنجاح 🌷",
                    "success"
                );


                await loadMyInquiries();


            } catch (error) {

                console.error(
                    "خطأ أثناء إرسال الاستفسار:",
                    error
                );


                if (
                    error?.code ===
                    "permission-denied"
                ) {

                    showToast(
                        "ليس لديك صلاحية إرسال الاستفسار.",
                        "error"
                    );

                } else {

                    showToast(
                        "تعذر إرسال الاستفسار، حاول مرة ثانية.",
                        "error"
                    );
                }


            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        originalText;
                }
            }
        }
    );
}


/* =========================
   تحميل استفسارات العضو
========================= */

async function loadMyInquiries() {

    if (
        !inquiriesList ||
        !currentUser
    ) {
        return;
    }


    try {

        inquiriesList.innerHTML = `
            <div class="loading-message">
                جاري تحميل استفساراتك...
            </div>
        `;


        /* -------------------------
           جلب استفسارات هذا العضو فقط
        ------------------------- */

        const inquiriesQuery =
            query(
                collection(
                    db,
                    "inquiries"
                ),

                where(
                    "userId",
                    "==",
                    currentUser.uid
                )
            );


        const snapshot =
            await getDocs(
                inquiriesQuery
            );


        const myInquiries = [];


        snapshot.forEach(
            (docSnap) => {

                const data =
                    docSnap.data();


                myInquiries.push({
                    id: docSnap.id,
                    ...data
                });
            }
        );


        /* -------------------------
           ترتيب الأحدث أولًا
        ------------------------- */

        myInquiries.sort(
            (a, b) => {

                const dateA =
                    a.createdAt?.toMillis
                        ? a.createdAt.toMillis()
                        : 0;

                const dateB =
                    b.createdAt?.toMillis
                        ? b.createdAt.toMillis()
                        : 0;

                return dateB - dateA;
            }
        );


        /* -------------------------
           لا توجد استفسارات
        ------------------------- */

        if (
            myInquiries.length === 0
        ) {

            inquiriesList.innerHTML = `
                <div class="empty-inquiries">

                    <div class="empty-icon">
                        💬
                    </div>

                    <h3>
                        ما عندك استفسارات حالياً
                    </h3>

                    <p>
                        أرسل استفسارك من النموذج أعلاه
                        وسيظهر هنا بعد إرساله.
                    </p>

                </div>
            `;

            return;
        }


        /* -------------------------
           عرض الاستفسارات
        ------------------------- */

        renderInquiries(
            myInquiries
        );


    } catch (error) {

        console.error(
            "خطأ أثناء تحميل استفسارات العضو:",
            error
        );


        inquiriesList.innerHTML = `
            <div class="empty-inquiries error-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    تعذر تحميل الاستفسارات
                </h3>

                <p>
                    حاول تحديث الصفحة مرة ثانية.
                </p>

            </div>
        `;
    }
}


/* =========================
   عرض الاستفسارات
========================= */

function renderInquiries(
    inquiries
) {

    if (!inquiriesList) return;


    inquiriesList.innerHTML = "";


    inquiries.forEach(
        (inquiry) => {

            const statusInfo =
                getStatusInfo(
                    inquiry.status
                );


            /* -------------------------
               الرد
            ------------------------- */

            let replyHTML = "";


            if (
                inquiry.reply &&
                inquiry.reply.trim() !== ""
            ) {

                replyHTML = `
                    <div class="inquiry-reply">

                        <div class="reply-header">

                            <span class="reply-icon">
                                ↩
                            </span>

                            <strong>
                                رد الإدارة
                            </strong>

                        </div>

                        <p>
                            ${escapeHTML(
                                inquiry.reply
                            )}
                        </p>

                        ${
                            inquiry.repliedAt
                                ? `
                                    <small>
                                        تم الرد بتاريخ
                                        ${formatDate(
                                            inquiry.repliedAt
                                        )}
                                    </small>
                                `
                                : ""
                        }

                    </div>
                `;

            } else {

                replyHTML = `
                    <div class="waiting-reply">

                        <span>
                            ⏳
                        </span>

                        بانتظار رد الإدارة

                    </div>
                `;
            }


            /* -------------------------
               البطاقة
            ------------------------- */

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "inquiry-history-card";


            card.innerHTML = `

                <div class="inquiry-card-top">

                    <div class="inquiry-card-title">

                        <span class="inquiry-type">
                            ${escapeHTML(
                                inquiry.type
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                inquiry.subject
                            )}
                        </h3>

                    </div>


                    <span class="
                        inquiry-status
                        ${statusInfo.className}
                    ">
                        ${statusInfo.text}
                    </span>

                </div>


                <p class="inquiry-message">
                    ${escapeHTML(
                        inquiry.message
                    )}
                </p>


                <div class="inquiry-card-date">

                    <span>
                        📅
                    </span>

                    ${formatDate(
                        inquiry.createdAt
                    )}

                </div>


                ${replyHTML}

            `;


            inquiriesList.appendChild(
                card
            );
        }
    );
}