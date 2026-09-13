import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "./firebase.js";


const memberName = document.getElementById("memberName");
const memberEmail = document.getElementById("memberEmail");
const memberPhone = document.getElementById("memberPhone");
const memberEducation = document.getElementById("memberEducation");
const memberSpecialization = document.getElementById("memberSpecialization");
const memberJob = document.getElementById("memberJob");
const memberGender = document.getElementById("memberGender");
const memberBirthDate = document.getElementById("memberBirthDate");

const logoutBtn = document.getElementById("logoutBtn");

const memberNews = document.getElementById("memberNews");
const memberActivities = document.getElementById("memberActivities");


function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function setText(element, value) {
    if (element) {
        element.textContent = value || "—";
    }
}


/* تسجيل الخروج */

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            window.location.href = "index.html";

        } catch (error) {

            console.error(
                "خطأ أثناء تسجيل الخروج:",
                error
            );
        }
    });
}


/* تحميل بيانات العضو */

async function loadMemberData(user) {

    try {

        const memberRef =
            doc(db, "members", user.uid);

        const memberSnapshot =
            await getDoc(memberRef);


        if (!memberSnapshot.exists()) {

            setText(
                memberName,
                user.displayName || "عضو الفريق"
            );

            setText(
                memberEmail,
                user.email
            );

            return;
        }


        const data =
            memberSnapshot.data();


        setText(
            memberName,
            data.fullName || user.displayName
        );

        setText(
            memberEmail,
            data.email || user.email
        );

        setText(
            memberPhone,
            data.phone
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
            memberGender,
            data.gender
        );

        setText(
            memberBirthDate,
            data.birthDate
        );


    } catch (error) {

        console.error(
            "خطأ في تحميل بيانات العضو:",
            error
        );
    }
}


/* تحميل أخبار العضو */

async function loadMemberNews() {

    if (!memberNews) return;


    try {

        const newsQuery = query(
            collection(db, "news"),
            orderBy("createdAt", "desc"),
            limit(5)
        );


        const snapshot =
            await getDocs(newsQuery);


        if (snapshot.empty) {

            memberNews.innerHTML = `
                <div class="empty-message">
                    لا توجد أخبار حاليًا.
                </div>
            `;

            return;
        }


        memberNews.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();


            const article =
                document.createElement("article");


            article.className =
                "member-news-card";


            article.innerHTML = `
                <h3>
                    ${escapeHTML(data.title)}
                </h3>

                <p>
                    ${escapeHTML(data.content)}
                </p>
            `;


            memberNews.appendChild(article);
        });


    } catch (error) {

        console.error(
            "خطأ في تحميل الأخبار:",
            error
        );


        memberNews.innerHTML = `
            <div class="empty-message">
                تعذر تحميل الأخبار.
            </div>
        `;
    }
}


/* تحميل فعاليات العضو */

async function loadMemberActivities() {

    if (!memberActivities) return;


    try {

        const activitiesQuery = query(
            collection(db, "activities"),
            orderBy("createdAt", "desc"),
            limit(5)
        );


        const snapshot =
            await getDocs(activitiesQuery);


        if (snapshot.empty) {

            memberActivities.innerHTML = `
                <div class="empty-message">
                    لا توجد فعاليات حاليًا.
                </div>
            `;

            return;
        }


        memberActivities.innerHTML = "";


        snapshot.forEach((docSnap) => {

            const data =
                docSnap.data();


            const article =
                document.createElement("article");


            article.className =
                "member-activity-card";


            article.innerHTML = `
                <h3>
                    ${escapeHTML(data.title)}
                </h3>

                <p>
                    ${escapeHTML(data.content)}
                </p>
            `;


            memberActivities.appendChild(article);
        });


    } catch (error) {

        console.error(
            "خطأ في تحميل الفعاليات:",
            error
        );


        memberActivities.innerHTML = `
            <div class="empty-message">
                تعذر تحميل الفعاليات.
            </div>
        `;
    }
}


/* التحقق من تسجيل الدخول */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "index.html";

        return;
    }


    await loadMemberData(user);

    await loadMemberNews();

    await loadMemberActivities();
});