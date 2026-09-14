import {
    db,
    collection,
    setDoc,
    getDoc,
    doc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "./firebase.js";


// ===============================
// عناصر الصفحة
// ===============================

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


// ===============================
// مفتاح المتابعة
// ===============================

const STORAGE_KEY =
    "northWasitInquiryIds";


// ===============================
// الإشعارات
// ===============================

function showToast(
    message,
    type = "success"
) {

    if (!inquiryToast) return;

    inquiryToast.textContent =
        message;

    inquiryToast.className =
        `inquiry-toast ${type} show`;

    setTimeout(() => {

        inquiryToast.classList.remove(
            "show"
        );

    }, 3500);
}


// ===============================
// حماية النصوص
// ===============================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ===============================
// التاريخ
// ===============================

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


// ===============================
// حالة الاستفسار
// ===============================

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


// ===============================
// إنشاء رقم متابعة عشوائي
// ===============================

function createInquiryId() {

    const array =
        new Uint8Array(24);

    crypto.getRandomValues(array);

    return Array.from(array)
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");
}


// ===============================
// جلب أرقام الاستفسارات المحفوظة
// ===============================

function getSavedInquiryIds() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {
            return [];
        }

        const ids =
            JSON.parse(saved);

        return Array.isArray(ids)
            ? ids
            : [];

    } catch {

        return [];
    }
}


// ===============================
// حفظ رقم الاستفسار
// ===============================

function saveInquiryId(id) {

    const ids =
        getSavedInquiryIds();

    if (!ids.includes(id)) {

        ids.push(id);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(ids)
        );
    }
}


// ===============================
// إرسال الاستفسار
// ===============================

if (inquiryForm) {

    inquiryForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const type =
                inquiryType?.value.trim() || "";


            const subject =
                inquirySubject?.value.trim() || "";


            const message =
                inquiryMessage?.value.trim() || "";


            // التحقق

            if (!type) {

                showToast(
                    "يرجى اختيار نوع الاستفسار.",
                    "error"
                );

                return;
            }


            if (!subject) {

                showToast(
                    "يرجى كتابة عنوان الاستفسار.",
                    "error"
                );

                return;
            }


            if (!message) {

                showToast(
                    "يرجى كتابة تفاصيل الاستفسار.",
                    "error"
                );

                return;
            }


            const submitButton =
                document.getElementById(
                    "sendInquiryBtn"
                );


            const originalText =
                submitButton
                    ? submitButton.textContent
                    : "إرسال الاستفسار";


            try {

                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "جاري الإرسال...";
                }


                // إنشاء رقم سري للاستفسار

                const inquiryId =
                    createInquiryId();


                // البيانات

                const inquiryData = {

                    userId: null,

                    userName:
                        "مواطن",

                    userEmail:
                        "",

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


                // الحفظ بنفس رقم المتابعة

                await setDoc(
                    doc(
                        db,
                        "inquiries",
                        inquiryId
                    ),
                    inquiryData
                );


                // حفظ الرقم بالجهاز

                saveInquiryId(
                    inquiryId
                );


                // تنظيف النموذج

                inquiryForm.reset();


                showToast(
                    "تم إرسال استفسارك بنجاح 🌷",
                    "success"
                );


                // تحميل الاستفسارات

                await loadMyInquiries();


            } catch (error) {

                console.error(
                    "خطأ أثناء إرسال الاستفسار:",
                    error
                );


                showToast(
                    "تعذر إرسال الاستفسار، حاول مرة ثانية.",
                    "error"
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalText;
                }
            }
        }
    );
}


// ===============================
// تحميل استفسارات هذا الجهاز
// ===============================

async function loadMyInquiries() {

    if (!inquiriesList) return;


    const ids =
        getSavedInquiryIds();


    if (ids.length === 0) {

        inquiriesList.innerHTML = `

            <div class="empty-inquiries">

                <div class="empty-icon">
                    💬
                </div>

                <h3>
                    ما عندك استفسارات سابقة
                </h3>

                <p>
                    أرسل استفسارك من النموذج أعلاه
                    وسيظهر هنا.
                </p>

            </div>

        `;

        return;
    }


    try {

        inquiriesList.innerHTML = `

            <div class="loading-message">
                جاري تحميل استفساراتك...
            </div>

        `;


        const inquiries = [];


        // جلب كل استفسار بواسطة رقم المتابعة

        for (const id of ids) {

            try {

                const inquiryRef =
                    doc(
                        db,
                        "inquiries",
                        id
                    );


                const snapshot =
                    await getDoc(
                        inquiryRef
                    );


                if (
                    snapshot.exists()
                ) {

                    inquiries.push({

                        id:
                            snapshot.id,

                        ...snapshot.data()

                    });
                }

            } catch (error) {

                console.error(
                    "تعذر تحميل الاستفسار:",
                    id,
                    error
                );
            }
        }


        // الأحدث أولًا

        inquiries.sort(
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


        if (inquiries.length === 0) {

            inquiriesList.innerHTML = `

                <div class="empty-inquiries">

                    <div class="empty-icon">
                        💬
                    </div>

                    <h3>
                        ما عندك استفسارات سابقة
                    </h3>

                    <p>
                        أرسل استفسارك من النموذج أعلاه.
                    </p>

                </div>

            `;

            return;
        }


        renderInquiries(
            inquiries
        );


    } catch (error) {

        console.error(
            "خطأ في تحميل الاستفسارات:",
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


// ===============================
// عرض الاستفسارات
// ===============================

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


// ===============================
// تشغيل الصفحة
// ===============================

loadMyInquiries();