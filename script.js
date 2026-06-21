const nameInput = document.getElementById("nameInput");
const usernameInput = document.getElementById("usernameInput");
const postInput = document.getElementById("postInput");
const avatarInput = document.getElementById("avatarInput");

const namePreview = document.getElementById("namePreview");
const usernamePreview = document.getElementById("usernamePreview");
const postPreview = document.getElementById("postPreview");
const avatarPreview = document.getElementById("avatarPreview");

const tabs = document.querySelectorAll(".tab");

const singleMode = document.getElementById("singleMode");
const bulkMode = document.getElementById("bulkMode");

const downloadBtn = document.getElementById("downloadBtn");

/* LIVE UPDATE */
function update(){
namePreview.textContent = nameInput.value;
usernamePreview.textContent = usernameInput.value;
postPreview.textContent = postInput.value;
}

nameInput.oninput = update;
usernameInput.oninput = update;
postInput.oninput = update;

/* AVATAR */
avatarInput.onchange = (e)=>{
const file = e.target.files[0];
if(!file) return;
const reader = new FileReader();
reader.onload = (ev)=>{
avatarPreview.src = ev.target.result;
};
reader.readAsDataURL(file);
};

/* TOGGLE */
tabs.forEach(t=>{
t.onclick = ()=>{
tabs.forEach(x=>x.classList.remove("active"));
t.classList.add("active");

const mode = t.dataset.mode;

if(mode==="single"){
singleMode.classList.remove("hidden");
bulkMode.classList.add("hidden");
}

if(mode==="bulk"){
bulkMode.classList.remove("hidden");
singleMode.classList.add("hidden");
}

};
});

/* EXPORT */
downloadBtn.onclick = async ()=>{
const canvas = await html2canvas(document.getElementById("card"),{
scale:3,
backgroundColor:null
});

const link = document.createElement("a");
link.download = "post.png";
link.href = canvas.toDataURL();
link.click();
};
