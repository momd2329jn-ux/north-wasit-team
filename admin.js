import {
    auth, db, onAuthStateChanged, signOut,
    collection, addDoc, getDocs, query, orderBy, serverTimestamp,
    doc, getDoc, deleteDoc
} from "./firebase.js";

const adminMessage=document.getElementById("adminMessage");
const adminContent=document.getElementById("adminContent");
const adminLogoutBtn=document.getElementById("adminLogoutBtn");
const postForm=document.getElementById("postForm");
const adminPostsList=document.getElementById("adminPostsList");
const membersList=document.getElementById("membersList");
const membersCount=document.getElementById("membersCount");
const adminToast=document.getElementById("adminToast");

const categoryInfo={
    news:{label:"الأخبار",icon:"📰"},
    health:{label:"الصحة",icon:"♥"},
    environment:{label:"البيئة",icon:"♧"},
    articles:{label:"المقالات",icon:"✎"},
    activities:{label:"الفعاليات",icon:"◆"}
};

function showAdminToast(message){
    if(!adminToast)return;
    adminToast.textContent=message;
    adminToast.classList.add("show");
    setTimeout(()=>adminToast.classList.remove("show"),3500);
}
function escapeHTML(value){
    return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;")
        .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function formatDate(value){
    try{
        const d=value?.toDate?value.toDate():new Date(value);
        return Number.isNaN(d.getTime())?"":d.toLocaleDateString("ar-IQ",{year:"numeric",month:"short",day:"numeric"});
    }catch{return "";}
}

async function checkAdmin(user){
    try{
        const snap=await getDoc(doc(db,"admins",user.uid));
        if(!snap.exists()){
            adminMessage.textContent="ليس لديك صلاحية الدخول إلى لوحة الإدارة.";
            adminMessage.style.color="#b42318";
            return false;
        }
        adminMessage.textContent="تم التحقق من صلاحيات الإدارة بنجاح.";
        adminMessage.style.color="#15803d";
        adminContent?.classList.remove("hidden");
        return true;
    }catch(error){
        console.error(error);
        adminMessage.textContent="حدث خطأ أثناء التحقق من صلاحيات الإدارة.";
        adminMessage.style.color="#b42318";
        return false;
    }
}

async function loadPosts(){
    if(!adminPostsList)return;
    try{
        const snap=await getDocs(query(collection(db,"posts"),orderBy("createdAt","desc")));
        if(snap.empty){
            adminPostsList.innerHTML='<div class="members-loading">لا توجد منشورات جديدة حاليًا.</div>';
            return;
        }
        adminPostsList.innerHTML="";
        snap.forEach(docSnap=>{
            const data=docSnap.data();
            const info=categoryInfo[data.category]||categoryInfo.news;
            const row=document.createElement("div");
            row.className="admin-content-row";
            const image=data.image?`<img class="admin-content-image" src="${escapeHTML(data.image)}" alt="">`:"";
            row.innerHTML=`
                <div class="content-row-main">
                    ${image}
                    <div>
                        <div class="admin-content-meta">${escapeHTML(info.icon)} ${escapeHTML(info.label)}${formatDate(data.createdAt)?" • "+escapeHTML(formatDate(data.createdAt)):""}</div>
                        <h3>${escapeHTML(data.title||"منشور")}</h3>
                        <p>${escapeHTML(data.content||"")}</p>
                    </div>
                </div>
                <button class="delete-btn" type="button">🗑️ حذف</button>`;
            row.querySelector(".delete-btn").addEventListener("click",()=>deletePost(docSnap.id));
            adminPostsList.appendChild(row);
        });
    }catch(error){
        console.error(error);
        adminPostsList.innerHTML='<div class="members-loading">تعذر تحميل المنشورات الجديدة.</div>';
    }
}

async function deletePost(postId){
    if(!confirm("هل أنت متأكد من حذف هذا المنشور؟"))return;
    try{
        await deleteDoc(doc(db,"posts",postId));
        showAdminToast("تم حذف المنشور بنجاح 🗑️");
        await loadPosts();
    }catch(error){
        console.error(error);
        showAdminToast("حدث خطأ أثناء حذف المنشور.");
    }
}

if(postForm){
    postForm.addEventListener("submit",async event=>{
        event.preventDefault();
        const category=document.getElementById("postCategory").value;
        const title=document.getElementById("postTitle").value.trim();
        const content=document.getElementById("postContent").value.trim();
        const image=document.getElementById("postImage").value.trim();
        if(!category||!title||!content){
            showAdminToast("يرجى ملء القسم والعنوان والمحتوى.");
            return;
        }
        try{
            const user=auth.currentUser;
            await addDoc(collection(db,"posts"),{
                category,title,content,image:image||"",
                authorId:user?.uid||"",
                createdAt:serverTimestamp()
            });
            postForm.reset();
            showAdminToast("تم نشر المنشور بنجاح ✅");
            await loadPosts();
        }catch(error){
            console.error(error);
            showAdminToast("حدث خطأ أثناء نشر المنشور.");
        }
    });
}

async function loadMembers(){
    if(!membersList)return;
    try{
        const snap=await getDocs(query(collection(db,"members"),orderBy("createdAt","desc")));
        if(membersCount)membersCount.textContent=`${snap.size} عضو`;
        if(snap.empty){
            membersList.innerHTML='<div class="members-loading">لا يوجد أعضاء حاليًا.</div>';
            return;
        }
        membersList.innerHTML="";
        snap.forEach(docSnap=>{
            const data=docSnap.data();
            const name=data.fullName||"عضو بدون اسم";
            const email=data.email||"لا يوجد بريد";
            const phone=data.phone||"لا يوجد رقم";
            const row=document.createElement("div");
            row.className="member-row";
            row.innerHTML=`
                <div class="member-row-avatar">${escapeHTML(name.charAt(0)||"ع")}</div>
                <div class="member-row-info"><h3>${escapeHTML(name)}</h3><p>${escapeHTML(email)}</p></div>
                <div class="member-row-phone">${escapeHTML(phone)}</div>`;
            membersList.appendChild(row);
        });
    }catch(error){
        console.error(error);
        membersList.innerHTML='<div class="members-loading">تعذر تحميل قائمة الأعضاء.</div>';
    }
}

adminLogoutBtn?.addEventListener("click",async()=>{
    try{
        await signOut(auth);
        window.location.href="index.html";
    }catch(error){
        console.error(error);
        showAdminToast("حدث خطأ أثناء تسجيل الخروج.");
    }
});

onAuthStateChanged(auth,async user=>{
    if(!user){
        window.location.href="index.html";
        return;
    }
    const isAdmin=await checkAdmin(user);
    if(!isAdmin)return;
    await Promise.all([loadPosts(),loadMembers()]);
});

const year=document.getElementById("currentYear");
if(year)year.textContent=new Date().getFullYear();