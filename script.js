import {
    auth, db,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    doc, setDoc, collection, addDoc, getDocs,
    query, orderBy, limit, serverTimestamp
} from "./firebase.js";

const loginModal = document.getElementById("loginModal");
const joinModal = document.getElementById("joinModal");
const socialModal = document.getElementById("socialModal");
const mainNav = document.getElementById("mainNav");
const menuToggle = document.getElementById("menuToggle");

function setModal(modal, open) {
    if (!modal) return;
    modal.classList.toggle("active", open);
    modal.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("modal-open", open);
}
function toggleMenu(){ mainNav?.classList.toggle("active"); }
function openLogin(){ closeJoin(); closeSocial(); setModal(loginModal,true); }
function closeLogin(){ setModal(loginModal,false); }
function openJoin(){ closeLogin(); closeSocial(); setModal(joinModal,true); }
function closeJoin(){ setModal(joinModal,false); }
function openSocial(){ closeLogin(); closeJoin(); setModal(socialModal,true); }
function closeSocial(){ setModal(socialModal,false); }
function switchToJoin(){ closeLogin(); openJoin(); }
function switchToLogin(){ closeJoin(); openLogin(); }
function showToast(message){
    const toast=document.getElementById("toast");
    if(!toast)return;
    toast.textContent=message;
    toast.classList.add("show");
    setTimeout(()=>toast.classList.remove("show"),3500);
}
window.toggleMenu=toggleMenu;
window.openLogin=openLogin; window.closeLogin=closeLogin;
window.openJoin=openJoin; window.closeJoin=closeJoin;
window.openSocial=openSocial; window.closeSocial=closeSocial;
window.switchToJoin=switchToJoin; window.switchToLogin=switchToLogin;
window.showToast=showToast;

const year=document.getElementById("currentYear");
if(year) year.textContent=new Date().getFullYear();

function escapeHTML(value){
    return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;")
        .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function formatDate(value){
    if(!value) return "";
    try{
        const d=value.toDate ? value.toDate() : new Date(value);
        if(Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString("ar-IQ",{year:"numeric",month:"long",day:"numeric"});
    }catch{return "";}
}

const categoryInfo={
    news:{label:"الأخبار",icon:"📰",color:"news"},
    health:{label:"الصحة",icon:"♥",color:"health"},
    environment:{label:"البيئة",icon:"♧",color:"environment"},
    articles:{label:"المقالات",icon:"✎",color:"articles"},
    activities:{label:"الفعاليات",icon:"◆",color:"activities"}
};

function createPostCard(data, fallbackCategory="news"){
    const category=data.category || fallbackCategory;
    const info=categoryInfo[category] || categoryInfo.news;
    const card=document.createElement("article");
    card.className="post-card";
    if(data.image){
        const img=document.createElement("img");
        img.className="post-image";
        img.loading="lazy";
        img.src=data.image;
        img.alt=data.title || info.label;
        img.onerror=()=>img.remove();
        card.appendChild(img);
    }
    const body=document.createElement("div");
    body.className="post-body";
    body.innerHTML=`
        <div class="post-meta">${escapeHTML(info.icon)} ${escapeHTML(info.label)}${formatDate(data.createdAt) ? " • "+escapeHTML(formatDate(data.createdAt)) : ""}</div>
        <h3>${escapeHTML(data.title || "منشور من الفريق")}</h3>
        <p>${escapeHTML(data.content || "")}</p>`;
    card.appendChild(body);
    return card;
}

function renderPosts(container, posts, emptyText){
    if(!container)return;
    container.innerHTML="";
    if(!posts.length){
        container.innerHTML=`<div class="empty-card">${escapeHTML(emptyText)}</div>`;
        return;
    }
    posts.forEach(post=>container.appendChild(createPostCard(post)));
}

async function getCollectionDocs(name, max=30){
    try{
        const q=query(collection(db,name),orderBy("createdAt","desc"),limit(max));
        const snap=await getDocs(q);
        return snap.docs.map(d=>({id:d.id,...d.data()}));
    }catch(error){
        console.error(`خطأ في ${name}:`,error);
        return [];
    }
}

async function loadAllPosts(){
    const posts=await getCollectionDocs("posts",40);
    const legacyNews=await getCollectionDocs("news",12);
    const legacyActivities=await getCollectionDocs("activities",12);

    const normalized=[
        ...posts,
        ...legacyNews.map(x=>({...x,category:"news"})),
        ...legacyActivities.map(x=>({...x,category:"activities"}))
    ];
    normalized.sort((a,b)=>{
        const ta=a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt||0).getTime();
        const tb=b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt||0).getTime();
        return tb-ta;
    });

    const latest=document.getElementById("latestContainer");
    if(latest){
        latest.innerHTML="";
        const latestPosts=normalized.slice(0,6);
        if(!latestPosts.length) latest.innerHTML='<div class="empty-card">لا توجد مستجدات منشورة حاليًا.</div>';
        else latestPosts.forEach(p=>latest.appendChild(createPostCard(p)));
    }

    for(const category of Object.keys(categoryInfo)){
        const container=document.getElementById(category==="news"?"newsContainer":`${category}Container`);
        const items=normalized.filter(p=>(p.category||"news")===category).slice(0,9);
        renderPosts(container,items,`لا يوجد محتوى في قسم ${categoryInfo[category].label} حاليًا.`);
    }
}

loadAllPosts();

if(menuToggle){
    menuToggle.addEventListener("click",toggleMenu);
}
document.querySelectorAll(".nav a").forEach(link=>{
    link.addEventListener("click",()=>mainNav?.classList.remove("active"));
});
window.addEventListener("keydown",event=>{
    if(event.key==="Escape"){
        closeLogin(); closeJoin(); closeSocial();
    }
});
window.addEventListener("click",event=>{
    if(event.target===loginModal) closeLogin();
    if(event.target===joinModal) closeJoin();
    if(event.target===socialModal) closeSocial();
});

const joinForm=document.getElementById("joinForm");
if(joinForm){
    joinForm.addEventListener("submit",async event=>{
        event.preventDefault();
        const fullName=document.getElementById("fullName").value.trim();
        const phone=document.getElementById("phone").value.trim();
        const birthDate=document.getElementById("birthDate").value;
        const gender=document.getElementById("gender").value;
        const education=document.getElementById("education").value;
        const specialization=document.getElementById("specialization").value.trim();
        const job=document.getElementById("job").value.trim();
        const email=document.getElementById("email").value.trim();
        const password=document.getElementById("password").value;
        const confirmPassword=document.getElementById("confirmPassword").value;

        if(!fullName||!phone||!birthDate||!gender||!education||!email||!password){
            showToast("يرجى ملء جميع الحقول المطلوبة."); return;
        }
        if(password!==confirmPassword){showToast("كلمتا المرور غير متطابقتين.");return;}
        if(password.length<6){showToast("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");return;}

        try{
            showToast("جاري إنشاء الحساب...");
            const userCredential=await createUserWithEmailAndPassword(auth,email,password);
            const user=userCredential.user;
            await updateProfile(user,{displayName:fullName});
            await setDoc(doc(db,"members",user.uid),{
                uid:user.uid,fullName,phone,birthDate,gender,education,
                specialization,job,email,role:"member",createdAt:serverTimestamp()
            });
            showToast("تم إنشاء الحساب بنجاح 🎉");
            setTimeout(()=>window.location.href="member.html",900);
        }catch(error){
            console.error(error);
            if(error.code==="auth/email-already-in-use") showToast("هذا البريد الإلكتروني مستخدم مسبقًا.");
            else if(error.code==="auth/invalid-email") showToast("البريد الإلكتروني غير صحيح.");
            else if(error.code==="auth/weak-password") showToast("كلمة المرور ضعيفة.");
            else showToast("حدث خطأ أثناء إنشاء الحساب.");
        }
    });
}

const loginForm=document.getElementById("loginForm");
if(loginForm){
    loginForm.addEventListener("submit",async event=>{
        event.preventDefault();
        const email=document.getElementById("loginEmail").value.trim();
        const password=document.getElementById("loginPassword").value;
        if(!email||!password){showToast("يرجى إدخال البريد الإلكتروني وكلمة المرور.");return;}
        try{
            showToast("جاري تسجيل الدخول...");
            await signInWithEmailAndPassword(auth,email,password);
            showToast("تم تسجيل الدخول بنجاح ✅");
            setTimeout(()=>window.location.href="member.html",700);
        }catch(error){
            console.error(error);
            if(["auth/invalid-credential","auth/wrong-password","auth/user-not-found"].includes(error.code))
                showToast("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
            else if(error.code==="auth/invalid-email") showToast("البريد الإلكتروني غير صحيح.");
            else showToast("حدث خطأ أثناء تسجيل الدخول.");
        }
    });
}