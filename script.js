// ======================================
// ELEMENTS
// ======================================

const nameInput = document.getElementById("nameInput");
const usernameInput = document.getElementById("usernameInput");
const postInput = document.getElementById("postInput");
const avatarInput = document.getElementById("avatarInput");

const displayName = document.getElementById("displayName");
const usernamePreview = document.getElementById("usernamePreview");
const tweetText = document.getElementById("tweetText");
const avatarPreview = document.getElementById("avatarPreview");

const downloadBtn = document.getElementById("downloadBtn");

const modeButtons =
document.querySelectorAll(".mode-btn");

// ======================================
// INIT
// ======================================

init();

function init(){

    updatePreview();

    setupInputs();

    setupAvatar();

    setupDownload();

    setupModeToggle();

}

// ======================================
// LIVE PREVIEW
// ======================================

function setupInputs(){

    nameInput.addEventListener(
        "input",
        updatePreview
    );

    usernameInput.addEventListener(
        "input",
        updatePreview
    );

    postInput.addEventListener(
        "input",
        updatePreview
    );

}

function updatePreview(){

    displayName.textContent =
        nameInput.value || "Ariana Hernandez";

    usernamePreview.textContent =
        usernameInput.value || "@ArianaHernandez";

    tweetText.textContent =
        postInput.value;

}

// ======================================
// AVATAR
// ======================================

function setupAvatar(){

    avatarInput.addEventListener(
        "change",
        handleAvatarUpload
    );

}

function handleAvatarUpload(event){

    const file =
        event.target.files[0];

    if(!file) return;

    const reader =
        new FileReader();

    reader.onload = function(e){

        avatarPreview.src =
            e.target.result;

    };

    reader.readAsDataURL(file);

}

// ======================================
// MODE TOGGLE
// ======================================

function setupModeToggle(){

    modeButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                modeButtons.forEach(btn =>
                    btn.classList.remove("active")
                );

                button.classList.add("active");

                const mode =
                    button.textContent
                    .trim()
                    .toLowerCase();

                console.log(
                    "Mode:",
                    mode
                );

            }
        );

    });

}

// ======================================
// DOWNLOAD PNG
// ======================================

function setupDownload(){

    downloadBtn.addEventListener(
        "click",
        exportPNG
    );

}

async function exportPNG(){

    const card =
        document.getElementById(
            "tweetCard"
        );

    const originalText =
        downloadBtn.textContent;

    downloadBtn.textContent =
        "Generating...";

    try{

        const canvas =
            await html2canvas(card, {

                scale:4,

                backgroundColor:null,

                useCORS:true

            });

        const link =
            document.createElement("a");

        const filename =
            "x-post-" +
            Date.now() +
            ".png";

        link.download =
            filename;

        link.href =
            canvas.toDataURL(
                "image/png"
            );

        link.click();

    }

    catch(error){

        console.error(error);

        alert(
            "Export failed."
        );

    }

    finally{

        downloadBtn.textContent =
            originalText;

    }

}
