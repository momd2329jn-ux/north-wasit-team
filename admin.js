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
} from "./firebase.js";


/* =========================
   العناصر
========================= */

const logoutBtn =
    document.getElementById("logoutBtn");

const newsForm =
    document.getElementById("newsForm");

const activityForm =
    document.getElementById("activityForm");

const galleryForm =
    document.getElementById("galleryForm");

const membersList =
    document.getElementById("membersList");

const newsList =
    document.getElementById("newsList");

const activitiesList =
    document.getElementById("activitiesList");

const galleryList =
    document.getElementById("galleryList");

const membersCount =
    document.getElementById("membersCount");

const newsCount =
    document.getElementById("newsCount");

const activitiesCount =
    document.getElementById("activitiesCount");

const galleryCount =
    document.getElementById("galleryCount");

const adminToast =
    document.getElementById("adminToast");

const galleryImage =
    document.getElementById("galleryImage");

const imagePreview =
    document.getElementById("imagePreview");


/* =========================
   التنبيهات
========================= */

function showToast(message) {

    if (!adminToast) return;

    adminToast.textContent = message;

    adminToast.classList.add("show");

    setTimeout(() => {
        adminToast.classList.remove("show");
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
   ضغط الصور
========================= */

function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader =
            new FileReader();

        reader.onload = () => {

            const image =
                new Image();

            image.onload = () => {

                const maxWidth = 1000;
                const maxHeight = 750;

                let width = image.width;
                let height = image.height;


                if (width > maxWidth) {

                    height =
                        height *
                        maxWidth /
                        width;

                    width =
                        maxWidth;
                }


                if (height > maxHeight) {

                    width =
                        width *
                        maxHeight /
                        height;

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


                if (!context) {

                    reject(
                        new Error(
                            "تعذر تجهيز الصورة."
                        )
                    );

                    return;
                }


                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                const qualities = [
                    0.65,
                    0.55,
                    0.45,
                    0.35,
                    0.28
                ];


                let result = "";


                for (
                    const quality
                    of qualities
                ) {

                    result =
                        canvas.toDataURL(
                            "image/jpeg",
                            quality
                        );


                    if (
                        result.length <=
                        550000
                    ) {
                        break;
                    }
                }


                resolve(result);
            };


            image.onerror = () => {

                reject(
                    new Error(
                        "تعذر قراءة الصورة."
                    )
                );
            };


            image.src =
                reader.result;
        };


        reader.onerror = () => {

            reject(
                new Error(
                    "تعذر قراءة الملف."
                )
            );
        };


        reader.readAsDataURL(file);
    });
}


/* =========================
   التحقق من الأدمن
========================= */

async function checkAdmin(user) {

    try {

        const adminRef =
            doc(
                db,
                "admins",
                user.uid
            );


        const adminSnapshot =
            await getDoc(adminRef);


        return adminSnapshot.exists();

    } catch (error) {

        console.error(
            "خطأ في التحقق من الأدمن:",
            error
        );

        return false;
    }
}


/* =========================
   الأخبار
========================= */

async function loadNews() {

    if (!newsList) return;


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
                )
            );


        const snapshot =
            await getDocs(newsQuery);


        if (newsCount) {

            newsCount.textContent =
                snapshot.size;
        }


        if (snapshot.empty) {

            newsList.innerHTML = `
                <div class="empty-message">
                    لا توجد أخبار حاليًا.
                </div>
            `;

            return;
        }


        newsList.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();


            const item =
                document.createElement(
                    "div"
                );


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
                    type="button"
                    class="delete-btn"
                    data-id="${docSnap.id}"
                >
                    🗑️ حذف
                </button>
            `;


            const deleteButton =
                item.querySelector(
                    ".delete-btn"
                );


            deleteButton.addEventListener(
                "click",
                () => {
                    deleteNews(
                        docSnap.id
                    );
                }
            );


            newsList.appendChild(item);
        });


    } catch (error) {

        console.error(error);

        newsList.innerHTML = `
            <div class="empty-message">
                تعذر تحميل الأخبار.
            </div>
        `;
    }
}


/* إضافة خبر */

if (newsForm) {

    newsForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const title =
                document
                    .getElementById(
                        "newsTitle"
                    )
                    ?.value
                    .trim();


            const content =
                document
                    .getElementById(
                        "newsContent"
                    )
                    ?.value
                    .trim();


            if (!title || !content) {

                showToast(
                    "يرجى ملء جميع حقول الخبر."
                );

                return;
            }


            try {

                await addDoc(
                    collection(
                        db,
                        "news"
                    ),
                    {
                        title,
                        content,
                        createdAt:
                            serverTimestamp()
                    }
                );


                newsForm.reset();


                showToast(
                    "تم نشر الخبر بنجاح ✅"
                );


                await loadNews();


            } catch (error) {

                console.error(error);

                showToast(
                    "حدث خطأ أثناء نشر الخبر."
                );
            }
        }
    );
}


/* حذف خبر */

async function deleteNews(id) {

    if (
        !confirm(
            "هل أنت متأكد من حذف هذا الخبر؟"
        )
    ) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "news",
                id
            )
        );


        showToast(
            "تم حذف الخبر بنجاح 🗑️"
        );


        await loadNews();


    } catch (error) {

        console.error(error);

        showToast(
            "حدث خطأ أثناء حذف الخبر."
        );
    }
}


/* =========================
   الفعاليات
========================= */

async function loadActivities() {

    if (!activitiesList) return;


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
                )
            );


        const snapshot =
            await getDocs(
                activitiesQuery
            );


        if (activitiesCount) {

            activitiesCount.textContent =
                snapshot.size;
        }


        if (snapshot.empty) {

            activitiesList.innerHTML = `
                <div class="empty-message">
                    لا توجد فعاليات حاليًا.
                </div>
            `;

            return;
        }


        activitiesList.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();


            const item =
                document.createElement(
                    "div"
                );


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
                    type="button"
                    class="delete-btn"
                >
                    🗑️ حذف
                </button>
            `;


            item
                .querySelector(
                    ".delete-btn"
                )
                .addEventListener(
                    "click",
                    () => {
                        deleteActivity(
                            docSnap.id
                        );
                    }
                );


            activitiesList.appendChild(item);
        });


    } catch (error) {

        console.error(error);

        activitiesList.innerHTML = `
            <div class="empty-message">
                تعذر تحميل الفعاليات.
            </div>
        `;
    }
}


/* إضافة فعالية */

if (activityForm) {

    activityForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const title =
                document
                    .getElementById(
                        "activityTitle"
                    )
                    ?.value
                    .trim();


            const content =
                document
                    .getElementById(
                        "activityContent"
                    )
                    ?.value
                    .trim();


            if (!title || !content) {

                showToast(
                    "يرجى ملء جميع حقول الفعالية."
                );

                return;
            }


            try {

                await addDoc(
                    collection(
                        db,
                        "activities"
                    ),
                    {
                        title,
                        content,
                        createdAt:
                            serverTimestamp()
                    }
                );


                activityForm.reset();


                showToast(
                    "تم نشر الفعالية بنجاح ✅"
                );


                await loadActivities();


            } catch (error) {

                console.error(error);

                showToast(
                    "حدث خطأ أثناء نشر الفعالية."
                );
            }
        }
    );
}


/* حذف فعالية */

async function deleteActivity(id) {

    if (
        !confirm(
            "هل أنت متأكد من حذف هذه الفعالية؟"
        )
    ) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "activities",
                id
            )
        );


        showToast(
            "تم حذف الفعالية بنجاح 🗑️"
        );


        await loadActivities();


    } catch (error) {

        console.error(error);

        showToast(
            "حدث خطأ أثناء حذف الفعالية."
        );
    }
}


/* =========================
   معرض الصور
========================= */


/* معاينة الصورة */

if (galleryImage) {

    galleryImage.addEventListener(
        "change",
        () => {

            const file =
                galleryImage.files[0];


            if (!file) {

                if (imagePreview) {
                    imagePreview.innerHTML =
                        "";
                }

                return;
            }


            const url =
                URL.createObjectURL(file);


            if (imagePreview) {

                imagePreview.innerHTML = `
                    <img
                        src="${url}"
                        alt="معاينة الصورة"
                    >
                `;
            }
        }
    );
}


/* تحميل المعرض */

async function loadGallery() {

    if (!galleryList) return;


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


        if (galleryCount) {

            galleryCount.textContent =
                snapshot.size;
        }


        if (snapshot.empty) {

            galleryList.innerHTML = `
                <div class="empty-message">
                    لا توجد صور في المعرض حاليًا.
                </div>
            `;

            return;
        }


        galleryList.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-content-row";


            item.innerHTML = `
                <div class="gallery-admin-item">

                    <img
                        src="${data.image}"
                        alt="${escapeHTML(
                            data.title
                        )}"
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
                    type="button"
                    class="delete-btn"
                >
                    🗑️ حذف
                </button>
            `;


            item
                .querySelector(
                    ".delete-btn"
                )
                .addEventListener(
                    "click",
                    () => {
                        deleteGalleryImage(
                            docSnap.id
                        );
                    }
                );


            galleryList.appendChild(item);
        });


    } catch (error) {

        console.error(error);

        galleryList.innerHTML = `
            <div class="empty-message">
                تعذر تحميل صور المعرض.
            </div>
        `;
    }
}


/* رفع صورة */

if (galleryForm) {

    galleryForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const title =
                document
                    .getElementById(
                        "galleryTitle"
                    )
                    ?.value
                    .trim();


            const file =
                galleryImage
                    ?.files[0];


            if (!file) {

                showToast(
                    "يرجى اختيار صورة أولًا."
                );

                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showToast(
                    "الملف المختار ليس صورة."
                );

                return;
            }


            try {

                showToast(
                    "جاري تجهيز الصورة..."
                );


                const imageData =
                    await compressImage(
                        file
                    );


                if (
                    imageData.length >
                    550000
                ) {

                    showToast(
                        "الصورة كبيرة جدًا، اختاري صورة أصغر."
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
                            title ||
                            "فعالية فريق شمال واسط",

                        image:
                            imageData,

                        createdAt:
                            serverTimestamp()
                    }
                );


                galleryForm.reset();


                if (imagePreview) {
                    imagePreview.innerHTML =
                        "";
                }


                showToast(
                    "تمت إضافة الصورة بنجاح 📸"
                );


                await loadGallery();


            } catch (error) {

                console.error(
                    "خطأ في رفع الصورة:",
                    error
                );


                if (
                    error?.code 
                    ===
                    "permission-denied"
                ) {

                    showToast(
                        "ما عندچ صلاحية إضافة الصور."
                    );

                } else {

                    showToast(
                        "تعذر إضافة الصورة."
                    );
                }
            }
        }
    );
}


/* حذف صورة */

async function deleteGalleryImage(id) {

    if (
        !confirm(
            "هل أنت متأكد من حذف هذه الصورة؟"
        )
    ) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "gallery",
                id
            )
        );


        showToast(
            "تم حذف الصورة بنجاح 🗑️"
        );


        await loadGallery();


    } catch (error) {

        console.error(error);

        showToast(
            "حدث خطأ أثناء حذف الصورة."
        );
    }
}


/* =========================
   الأعضاء
========================= */

async function loadMembers() {

    if (!membersList) return;


    try {

        const membersQuery =
            query(
                collection(
                    db,
                    "members"
                ),
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
                snapshot.size;
        }


        if (snapshot.empty) {

            membersList.innerHTML = `
                <div class="empty-message">
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


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "member-row";


            row.innerHTML = `
                <div class="member-row-avatar">
                    ${escapeHTML(
                        name.charAt(0)
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
            <div class="empty-message">
                تعذر تحميل قائمة الأعضاء.
            </div>
        `;
    }
}


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

                console.error(error);

                showToast(
                    "حدث خطأ أثناء تسجيل الخروج."
                );
            }
        }
    );
}


/* =========================
   حماية لوحة الإدارة
========================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        const isAdmin =
            await checkAdmin(user);


        if (!isAdmin) {

            showToast(
                "ليس لديك صلاحية الدخول إلى لوحة الإدارة."
            );


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1500);


            return;
        }


        await loadMembers();

        await loadNews();

        await loadActivities();

        await loadGallery();
    }
);