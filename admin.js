import {
  auth, db, onAuthStateChanged, signOut, collection, addDoc, getDocs,
  query, orderBy, serverTimestamp, doc, getDoc, deleteDoc, updateDoc
} from "./firebase.js";

const adminMessage=document.getElementById("adminMessage");
const adminContent=document.getElementById("adminContent");
const adminLogoutBtn=document.getElementById("adminLogoutBtn");
const postForm=document.getElementById("postForm");
const postCategory=document.getElementById("postCategory");
const postImage=document.getElementById("postImage");
const postImagePreview=document.getElementById("postImagePreview");
const membersList=document.getElementById("membersList");
const membersCount=document.getElementById("membersCount");
const adminToast=document.getElementById("adminToast");

function showAdminToast(message){
  if(!adminToast)return;
  adminToast.textContent=message;
  adminToast.classList.add("show");
  setTimeout(()=>adminToast.classList.remove("show"),3500);
}
function escapeHTML(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
function formatDate(value){
  if(!value)return "";
  try{const d=value.toDate?value.toDate():new Date(value);return d.toLocaleString("ar-IQ");}catch{return "";}
}
function compressImage(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{
      const image=new Image();
      image.onload=()=>{
        const maxWidth=1100,maxHeight=800;
        let width=image.width,height=image.height;
        if(width>maxWidth){height*=maxWidth/width;width=maxWidth;}
        if(height>maxHeight){width*=maxHeight/height;height=maxHeight;}
        const canvas=document.createElement("canvas");
        canvas.width=Math.round(width);canvas.height=Math.round(height);
        canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",0.68));
      };
      image.onerror=reject;image.src=reader.result;
    };
    reader.onerror=reject;reader.readAsDataURL(file);
  });
}
function getCategoryLabel(category){return {news:"الأخبار",health:"الصحة",environment:"البيئة",articles:"المقالات",activities:"الفعاليات"}[category]||category;}

if(postImage){postImage.addEventListener("change",()=>{
  const file=postImage.files?.[0];
  if(!file){postImagePreview.classList.add("hidden");postImagePreview.innerHTML="";return;}
  if(!file.type.startsWith("image/")){showAdminToast("الملف المختار ليس صورة.");postImage.value="";return;}
  const url=URL.createObjectURL(file);
  postImagePreview.classList.remove("hidden");
  postImagePreview.innerHTML=`<img src="${url}" alt="معاينة الصورة"><span>تم اختيار الصورة من الجهاز ✅</span>`;
});}

async function checkAdmin(user){
  try{
    const snap=await getDoc(doc(db,"admins",user.uid));
    if(!snap.exists()){adminMessage.textContent="ليس لديك صلاحية الدخول إلى لوحة الإدارة.";adminMessage.style.color="#b91c1c";return false;}
    adminMessage.textContent="تم التحقق من صلاحيات الإدارة بنجاح.";adminMessage.style.color="#15803d";
    adminContent.classList.remove("hidden");return true;
  }catch(error){console.error(error);adminMessage.textContent="حدث خطأ أثناء التحقق من صلاحيات الإدارة.";adminMessage.style.color="#b91c1c";return false;}
}

if(postForm){postForm.addEventListener("submit",async(event)=>{
  event.preventDefault();
  const category=postCategory.value;
  const title=document.getElementById("postTitle").value.trim();
  const content=document.getElementById("postContent").value.trim();
  const file=postImage.files?.[0]||null;
  if(!category||!title||!content){showAdminToast("يرجى إكمال القسم والعنوان والمحتوى.");return;}
  try{
    showAdminToast("جاري تجهيز المنشور...");
    let image="";
    if(file){
      if(!file.type.startsWith("image/")){showAdminToast("الملف المختار ليس صورة.");return;}
      image=await compressImage(file);
      const size=Math.ceil((image.length*3)/4);
      if(size>550000){showAdminToast("الصورة كبيرة جدًا بعد الضغط. اختار صورة أصغر.");return;}
    }
    const data={title,content,image,category,createdAt:serverTimestamp()};
    const target=category==="news"?"news":category==="activities"?"activities":"posts";
    await addDoc(collection(db,target),data);
    postForm.reset();postImagePreview.classList.add("hidden");postImagePreview.innerHTML="";
    showAdminToast(`تم نشر ${getCategoryLabel(category)} بنجاح ✅`);
    await Promise.all([loadNews(),loadActivities(),loadPosts()]);
  }catch(error){console.error(error);showAdminToast("حدث خطأ أثناء نشر المحتوى. افتح Console إذا احتجنا تشخيصًا أدق.");}
});}

async function loadNews(){
  const container=document.getElementById("adminNewsList");if(!container)return;
  try{const snap=await getDocs(query(collection(db,"news"),orderBy("createdAt","desc")));
    if(snap.empty){container.innerHTML='<div class="members-loading">لا توجد أخبار حاليًا.</div>';return;}
    container.innerHTML="";
    snap.forEach(s=>{const d=s.data();container.insertAdjacentHTML("beforeend",`<div class="admin-content-row"><div class="admin-row-main">${d.image?`<img class="admin-post-thumb" src="${d.image}" alt="">`:""}<div><h3>${escapeHTML(d.title)}</h3><p>${escapeHTML(d.content)}</p><small>${formatDate(d.createdAt)}</small></div></div><button class="delete-btn" type="button" onclick="deleteContent('news','${s.id}')">🗑️ حذف</button></div>`);});
  }catch(error){console.error(error);container.innerHTML='<div class="members-loading">تعذر تحميل الأخبار.</div>';}
}
async function loadActivities(){
  const container=document.getElementById("adminActivitiesList");if(!container)return;
  try{const snap=await getDocs(query(collection(db,"activities"),orderBy("createdAt","desc")));
    if(snap.empty){container.innerHTML='<div class="members-loading">لا توجد فعاليات حاليًا.</div>';return;}
    container.innerHTML="";
    snap.forEach(s=>{const d=s.data();container.insertAdjacentHTML("beforeend",`<div class="admin-content-row"><div class="admin-row-main">${d.image?`<img class="admin-post-thumb" src="${d.image}" alt="">`:""}<div><h3>${escapeHTML(d.title)}</h3><p>${escapeHTML(d.content)}</p><small>${formatDate(d.createdAt)}</small></div></div><button class="delete-btn" type="button" onclick="deleteContent('activities','${s.id}')">🗑️ حذف</button></div>`);});
  }catch(error){console.error(error);container.innerHTML='<div class="members-loading">تعذر تحميل الفعاليات.</div>';}
}
async function loadPosts(){
  const container=document.getElementById("adminPostsList");if(!container)return;
  try{const snap=await getDocs(query(collection(db,"posts"),orderBy("createdAt","desc")));
    if(snap.empty){container.innerHTML='<div class="members-loading">لا توجد منشورات في الصحة والبيئة والمقالات حاليًا.</div>';return;}
    container.innerHTML="";
    snap.forEach(s=>{const d=s.data();container.insertAdjacentHTML("beforeend",`<div class="admin-content-row"><div class="admin-row-main">${d.image?`<img class="admin-post-thumb" src="${d.image}" alt="">`:""}<div><span class="admin-badge">${getCategoryLabel(d.category)}</span><h3>${escapeHTML(d.title)}</h3><p>${escapeHTML(d.content)}</p><small>${formatDate(d.createdAt)}</small></div></div><button class="delete-btn" type="button" onclick="deleteContent('posts','${s.id}')">🗑️ حذف</button></div>`);});
  }catch(error){console.error(error);container.innerHTML='<div class="members-loading">تعذر تحميل المحتوى.</div>';}
}
async function deleteContent(collectionName,id){if(!confirm("هل أنت متأكد من الحذف؟"))return;try{await deleteDoc(doc(db,collectionName,id));showAdminToast("تم الحذف بنجاح 🗑️");await Promise.all([loadNews(),loadActivities(),loadPosts()]);}catch(error){console.error(error);showAdminToast("حدث خطأ أثناء الحذف.");}}
window.deleteContent=deleteContent;

async function loadInquiries(){
  const container=document.getElementById("adminInquiriesList");const count=document.getElementById("inquiriesCount");if(!container)return;
  try{
    const snap=await getDocs(query(collection(db,"inquiries"),orderBy("createdAt","desc")));
    if(count)count.textContent=`${snap.size} استفسار`;
    if(snap.empty){container.innerHTML='<div class="members-loading">لا توجد استفسارات حاليًا.</div>';return;}
    container.innerHTML="";
    snap.forEach(s=>{
      const d=s.data();const status=d.status||"pending";const replied=status==="answered"||!!d.reply;
      const safeId=s.id;
      container.insertAdjacentHTML("beforeend",`<article class="inquiry-admin-card ${replied?"answered":"pending"}">
        <div class="inquiry-admin-head"><div><span class="admin-badge">${escapeHTML(d.type||"استفسار")}</span><h3>${escapeHTML(d.subject||"بدون عنوان")}</h3></div><strong>${replied?"تم الرد ✅":"بانتظار الرد ⏳"}</strong></div>
        <p class="inquiry-message">${escapeHTML(d.message||"")}</p>
        <div class="inquiry-meta">${d.name?`<span>👤 ${escapeHTML(d.name)}</span>`:""}${d.email?`<span>✉ ${escapeHTML(d.email)}</span>`:""}${d.phone?`<span>📱 ${escapeHTML(d.phone)}</span>`:""}<span>🕒 ${formatDate(d.createdAt)}</span></div>
        ${d.reply?`<div class="existing-reply"><b>الرد الحالي:</b><p>${escapeHTML(d.reply)}</p></div>`:""}
        <textarea class="inquiry-reply-input" id="reply-${safeId}" placeholder="اكتب ردك على الاستفسار هنا..."></textarea>
        <div class="inquiry-actions"><button class="btn btn-primary" type="button" onclick="replyToInquiry('${safeId}')">${replied?"تحديث الرد":"إرسال الرد"}</button><button class="delete-btn" type="button" onclick="deleteInquiry('${safeId}')">🗑️ حذف</button></div>
      </article>`);
    });
  }catch(error){console.error(error);container.innerHTML='<div class="members-loading">تعذر تحميل الاستفسارات. تأكد من قواعد Firestore.</div>';}
}
async function replyToInquiry(id){
  const input=document.getElementById(`reply-${id}`);const reply=input?.value.trim();
  if(!reply){showAdminToast("اكتب الرد أولًا.");return;}
  try{await updateDoc(doc(db,"inquiries",id),{reply,status:"answered",repliedAt:serverTimestamp()});showAdminToast("تم إرسال الرد بنجاح ✅");await loadInquiries();}catch(error){console.error(error);showAdminToast("تعذر إرسال الرد.");}
}
async function deleteInquiry(id){if(!confirm("هل تريد حذف هذا الاستفسار؟"))return;try{await deleteDoc(doc(db,"inquiries",id));showAdminToast("تم حذف الاستفسار 🗑️");await loadInquiries();}catch(error){console.error(error);showAdminToast("تعذر حذف الاستفسار.");}}
window.replyToInquiry=replyToInquiry;window.deleteInquiry=deleteInquiry;

async function loadMembers(){
  if(!membersList)return;
  try{const snap=await getDocs(query(collection(db,"members"),orderBy("createdAt","desc")));if(membersCount)membersCount.textContent=`${snap.size} عضو`;
    if(snap.empty){membersList.innerHTML='<div class="members-loading">لا يوجد أعضاء حاليًا.</div>';return;}
    membersList.innerHTML="";
    snap.forEach(s=>{const d=s.data();const name=d.fullName||"عضو بدون اسم";membersList.insertAdjacentHTML("beforeend",`<div class="member-row"><div class="member-row-avatar">${escapeHTML(name.charAt(0)||"ع")}</div><div class="member-row-info"><h3>${escapeHTML(name)}</h3><p>${escapeHTML(d.email||"لا يوجد بريد")}</p></div><div class="member-row-phone">${escapeHTML(d.phone||"لا يوجد رقم")}</div></div>`);});
  }catch(error){console.error(error);membersList.innerHTML='<div class="members-loading">تعذر تحميل قائمة الأعضاء.</div>';}
}

if(adminLogoutBtn){adminLogoutBtn.addEventListener("click",async()=>{try{await signOut(auth);window.location.href="index.html";}catch(error){console.error(error);showAdminToast("حدث خطأ أثناء تسجيل الخروج.");}});}

onAuthStateChanged(auth,async(user)=>{
  if(!user){window.location.href="index.html";return;}
  if(!await checkAdmin(user))return;
  await Promise.all([loadMembers(),loadNews(),loadActivities(),loadPosts(),loadInquiries()]);
});

const currentYear=document.getElementById("currentYear");if(currentYear)currentYear.textContent=new Date().getFullYear();