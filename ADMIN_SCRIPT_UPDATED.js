import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    doc,
    getDoc,
    deleteDoc
} from "./FIREBASE_UPDATED.js";


/* العناصر */

const adminMessage =
    document.getElementById("adminMessage");

const adminContent =
    document.getElementById("adminContent");

const adminLogoutBtn =
    document.getElementById("adminLogoutBtn");

const newsForm =
    document.getElementById("newsForm");

const activityForm =
    document.getElementById("activityForm");

const membersList =
    document.getElementById("membersList");

const membersCount =
    document.getElementById("membersCount");

const adminToast =
    document.getElementById("adminToast");


/* رسالة صغيرة */

function showAdminToast(message) {

    if (!adminToast) return;

    adminToast.textContent = message;

    adminToast.classList.add("show");

    setTimeout(() => {

        adminToast.classList.remove("show");

    }, 3500);
}


/* حماية النصوص */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* تحويل الصورة إلى حجم صغير */

function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader =
            new FileReader();

        reader.onload = function () {

            const image =
                new Image();

            image.onload = function () {

                const maxWidth = 1200;
                const maxHeight = 900;

                let width =
                    image.width;

                let height =
                    image.height;


                if (width > maxWidth) {

                    height =
                        height *
                        (maxWidth / width);

                    width =
                        maxWidth;
                }


                if (height > maxHeight) {

                    width =
                        width *
                        (maxHeight / height);

                    height =
                        maxHeight;
                }


                const canvas =
                    document.createElement(
                        "canvas"
                    );


                canvas.width =
                    Math.round(width);

                canvas.height =
                    Math.round(height);


                const context =
                    canvas.getContext("2d");


                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                const compressed =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.70
                    );


                resolve(compressed);
            };


            image.onerror = reject;

            image.src =
                reader.result;
        };


        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}


/* التحقق من صلاحية الأدمن */

async function checkAdmin(user) {

    try {

        const adminRef =
            doc(db, "admins", user.uid);

        const adminSnapshot =
            await getDoc(adminRef);


        if (!adminSnapshot.exists()) {

            if (adminMessage) {

                adminMessage.textContent =
                    "ليس لديك صلاحية الدخول إلى لوحة الإدارة.";

                adminMessage.style.color =
                    "#b91c1c";
            }

            return false;
        }


        if (adminMessage) {

            adminMessage.textContent =
                "تم التحقق من صلاحيات الإدارة بنجاح.";

            adminMessage.style.color =
                "#15803d";
        }


        if (adminContent) {

            adminContent.classList.remove("hidden");
        }


        return true;

    } catch (error) {

        console.error(
            "خطأ في التحقق من الأدمن:",
            error
        );


        if (adminMessage) {

            adminMessage.textContent =
                "حدث خطأ أثناء التحقق من صلاحيات الإدارة.";

            adminMessage.style.color =
                "#b91c1c";
        }


        return false;
    }
}


/* نشر خبر */

if (newsForm) {

    newsForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const title =
                document
                    .getElementById("newsTitle")
                    .value
                    .trim();


            const content =
                document
                    .getElementById("newsContent")
                    .value
                    .trim();


            if (!title || !content) {

                showAdminToast(
                    "يرجى ملء جميع حقول الخبر."
                );

                return;
            }


            try {

                await addDoc(
                    collection(db, "news"),
                    {
                        title: title,
                        content: content,
                        createdAt:
                            serverTimestamp()
                    }
                );


                newsForm.reset();


                showAdminToast(
                    "تم نشر الخبر بنجاح ✅"
                );


                await loadNews();

            } catch (error) {

                console.error(error);

                showAdminToast(
                    "حدث خطأ أثناء نشر الخبر."
                );
            }
        }
    );
}


/* نشر فعالية */

if (activityForm) {

    activityForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const title =
                document
                    .getElementById("activityTitle")
                    .value
                    .trim();


            const content =
                document
                    .getElementById("activityContent")
                    .value
                    .trim();


            if (!title || !content) {

                showAdminToast(
                    "يرجى ملء جميع حقول الفعالية."
                );

                return;
            }


            try {

                await addDoc(
                    collection(db, "activities"),
                    {
                        title: title,
                        content: content,
                        createdAt:
                            serverTimestamp()
                    }
                );


                activityForm.reset();


                showAdminToast(
                    "تم نشر الفعالية بنجاح ✅"
                );


                await loadActivities();

            } catch (error) {

                console.error(error);

                showAdminToast(
                    "حدث خطأ أثناء نشر الفعالية."
                );
            }
        }
    );
}


/* حذف خبر */

async function deleteNews(newsId) {

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف هذا الخبر؟"
        );


    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(db, "news", newsId)
        );


        showAdminToast(
            "تم حذف الخبر بنجاح 🗑️"
        );


        await loadNews();

    } catch (error) {

        console.error(error);

        showAdminToast(
            "حدث خطأ أثناء حذف الخبر."
        );
    }
}


/* تحميل الأخبار */

async function loadNews() {

    const container =
        document.getElementById(
            "adminNewsList"
        );


    if (!container) return;


    try {

        const newsQuery =
            query(
                collection(db, "news"),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(newsQuery);


        if (snapshot.empty) {

            container.innerHTML = `
                <div class="members-loading">
                    لا توجد أخبار حاليًا.
                </div>
            `;

            return;
        }


        container.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();


            const item =
                document.createElement("div");


            item.className =
                "admin-content-row";


            item.innerHTML = `
                <div>
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
                </div>

                <button
                    class="delete-btn"
                    type="button"
                    onclick="deleteNews('${docSnap.id}')"
                >
                    🗑️ حذف
                </button>
            `;


            container.appendChild(item);
        });


    } catch (error) {

        console.error(error);


        container.innerHTML = `
            <div class="members-loading">
                تعذر تحميل الأخبار.
            </div>
        `;
    }
}


/* حذف فعالية */

async function deleteActivity(
    activityId
) {

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف هذه الفعالية؟"
        );


    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(
                db,
                "activities",
                activityId
            )
        );


        showAdminToast(
            "تم حذف الفعالية بنجاح 🗑️"
        );


        await loadActivities();

    } catch (error) {

        console.error(error);

        showAdminToast(
            "حدث خطأ أثناء حذف الفعالية."
        );
    }
}


/* تحميل الفعاليات */

async function loadActivities() {

    const container =
        document.getElementById(
            "adminActivitiesList"
        );


    if (!container) return;


    try {

        const activitiesQuery =
            query(
                collection(db, "activities"),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                activitiesQuery
            );


        if (snapshot.empty) {

            container.innerHTML = `
                <div class="members-loading">
                    لا توجد فعاليات حاليًا.
                </div>
            `;

            return;
        }


        container.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();


            const item =
                document.createElement("div");


            item.className =
                "admin-content-row";


            item.innerHTML = `
                <div>
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
                </div>

                <button
                    class="delete-btn"
                    type="button"
                    onclick="deleteActivity('${docSnap.id}')"
                >
                    🗑️ حذف
                </button>
            `;


            container.appendChild(item);
        });


    } catch (error) {

        console.error(error);


        container.innerHTML = `
            <div class="members-loading">
                تعذر تحميل الفعاليات.
            </div>
        `;
    }
}


/* ========================= */
/* معرض الصور */
/* ========================= */


/* إضافة صورة */

async function uploadGalleryImage() {

    const imageInput =
        document.getElementById(
            "galleryImage"
        );

    const titleInput =
        document.getElementById(
            "galleryTitle"
        );

    if (!imageInput) {

        showAdminToast(
            "لم يتم العثور على حقل اختيار الصورة."
        );

        return;
    }


    const file =
        imageInput.files[0];


    const title =
        titleInput
            ? titleInput.value.trim()
            : "";


    if (!file) {

        showAdminToast(
            "يرجى اختيار صورة أولًا."
        );

        return;
    }


    if (!file.type.startsWith("image/")) {

        showAdminToast(
            "الملف المختار ليس صورة."
        );

        return;
    }


    try {

        showAdminToast(
            "جاري تجهيز الصورة..."
        );


        const imageData =
            await compressImage(file);


        /*
         * نتأكد من حجم الصورة بعد الضغط.
         * Firestore لديه حد لحجم المستند،
         * لذلك نمنع الصور الكبيرة جدًا.
         */

        const approximateSize =
            Math.ceil(
                (imageData.length * 3) / 4
            );


        if (
            approximateSize >
            700000
        ) {

            showAdminToast(
                "الصورة ما زالت كبيرة جدًا، اختاري صورة أصغر."
            );

            return;
        }


        await addDoc(
            collection(
                db,
                "gallery"
            ),
            {
                title:
                    title || "فعالية فريق شمال واسط",

                image:
                    imageData,

                createdAt:
                    serverTimestamp()
            }
        );


        imageInput.value = "";


        if (titleInput) {
            titleInput.value = "";
        }


        showAdminToast(
            "تمت إضافة الصورة للمعرض بنجاح 📸"
        );


        await loadGallery();

    } catch (error) {

        console.error(
            "خطأ في رفع الصورة:",
            error
        );


        showAdminToast(
            "حدث خطأ أثناء إضافة الصورة."
        );
    }
}


/* حذف صورة */

async function deleteGalleryImage(
    imageId
) {

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف هذه الصورة؟"
        );


    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(
                db,
                "gallery",
                imageId
            )
        );


        showAdminToast(
            "تم حذف الصورة بنجاح 🗑️"
        );


        await loadGallery();

    } catch (error) {

        console.error(
            "خطأ في حذف الصورة:",
            error
        );


        showAdminToast(
            "حدث خطأ أثناء حذف الصورة."
        );
    }
}


/* تحميل صور المعرض */

async function loadGallery() {

    const container =
        document.getElementById(
            "adminGalleryList"
        );


    if (!container) return;


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
                )
            );


        const snapshot =
            await getDocs(
                galleryQuery
            );


        if (snapshot.empty) {

            container.innerHTML = `
                <div class="members-loading">
                    لا توجد صور في المعرض حاليًا.
                </div>
            `;

            return;
        }


        container.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();


            const item =
                document.createElement("div");


            item.className =
                "admin-content-row";


            item.innerHTML = `
                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:15px;
                        width:100%;
                    "
                >

                    <img
                        src="${data.image}"
                        alt="${escapeHTML(data.title)}"
                        style="
                            width:90px;
                            height:70px;
                            object-fit:cover;
                            border-radius:12px;
                            flex-shrink:0;
                        "
                    >

                    <div>

                        <h3>
                            ${escapeHTML(
                                data.title
                            )}
                        </h3>

                        <p>
                            صورة من معرض الفريق
                        </p>

                    </div>

                </div>

                <button
                    class="delete-btn"
                    type="button"
                    onclick="deleteGalleryImage('${docSnap.id}')"
                >
                    🗑️ حذف
                </button>
            `;


            container.appendChild(item);
        });


    } catch (error) {

        console.error(
            "خطأ في تحميل المعرض:",
            error
        );


        container.innerHTML = `
            <div class="members-loading">
                تعذر تحميل صور المعرض.
            </div>
        `;
    }
}


/* تحميل الأعضاء */

async function loadMembers() {

    if (!membersList) return;


    try {

        const membersQuery =
            query(
                collection(db, "members"),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                membersQuery
            );


        if (membersCount) {

            membersCount.textContent =
                `${snapshot.size} عضو`;
        }


        if (snapshot.empty) {

            membersList.innerHTML = `
                <div class="members-loading">
                    لا يوجد أعضاء حاليًا.
                </div>
            `;

            return;
        }


        membersList.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();


            const name =
                data.fullName ||
                "عضو بدون اسم";


            const email =
                data.email ||
                "لا يوجد بريد";


            const phone =
                data.phone ||
                "لا يوجد رقم";


            const firstLetter =
                name.charAt(0) ||
                "ع";


            const row =
                document.createElement("div");


            row.className =
                "member-row";


            row.innerHTML = `
                <div class="member-row-avatar">
                    ${escapeHTML(
                        firstLetter
                    )}
                </div>

                <div class="member-row-info">

                    <h3>
                        ${escapeHTML(
                            name
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            email
                        )}
                    </p>

                </div>

                <div class="member-row-phone">
                    ${escapeHTML(
                        phone
                    )}
                </div>
            `;


            membersList.appendChild(row);
        });


    } catch (error) {

        console.error(error);


        membersList.innerHTML = `
            <div class="members-loading">
                تعذر تحميل قائمة الأعضاء.
            </div>
        `;
    }
}
/* جعل دوال الحذف متاحة للأزرار */

window.deleteNews =
    deleteNews;

window.deleteActivity =
    deleteActivity;

window.deleteGalleryImage =
    deleteGalleryImage;


/* زر إضافة صورة */

const galleryForm =
    document.getElementById(
        "galleryForm"
    );


if (galleryForm) {

    galleryForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            await uploadGalleryImage();
        }
    );
}


/* تسجيل الخروج */

if (adminLogoutBtn) {

    adminLogoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                window.location.href =
                    "INDEX_UPDATED.html";

            } catch (error) {

                console.error(error);

                showAdminToast(
                    "حدث خطأ أثناء تسجيل الخروج."
                );
            }
        }
    );
}


/* التحقق من تسجيل الدخول */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "INDEX_UPDATED.html";

            return;
        }


        const isAdmin =
            await checkAdmin(user);


        if (!isAdmin) {
            return;
        }


        await loadMembers();

        await loadNews();

        await loadActivities();

        await loadGallery();
    }
);


/* السنة الحالية */

const currentYear =
    document.getElementById(
        "currentYear"
    );


if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();
}