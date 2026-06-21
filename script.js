// =========================================
// ELEMENTS
// =========================================

const nameInput = document.getElementById("nameInput");
const usernameInput = document.getElementById("usernameInput");
const postInput = document.getElementById("postInput");
const avatarInput = document.getElementById("avatarInput");
const downloadBtn = document.getElementById("downloadBtn");

const namePreview = document.getElementById("namePreview");
const usernamePreview = document.getElementById("usernamePreview");
const tweetText = document.getElementById("tweetText");
const avatarPreview = document.getElementById("avatarPreview");
const tweetCard = document.getElementById("tweetCard");

// =========================================
// LIVE PREVIEW
// =========================================

function updatePreview() {

    namePreview.textContent = nameInput.value;

    usernamePreview.textContent = usernameInput.value;

    tweetText.textContent = postInput.value;

    autoGrow();

}

nameInput.addEventListener("input", updatePreview);
usernameInput.addEventListener("input", updatePreview);
postInput.addEventListener("input", updatePreview);

// =========================================
// AVATAR
// =========================================

avatarInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        avatarPreview.src = e.target.result;

    };

    reader.readAsDataURL(file);

});

// =========================================
// AUTO HEIGHT
// =========================================

function autoGrow() {

    const lines = postInput.value.split("\n").length;

    if (lines < 8) {

        tweetText.style.fontSize = "54px";

    }

    else if (lines < 14) {

        tweetText.style.fontSize = "46px";

    }

    else {

        tweetText.style.fontSize = "40px";

    }

}

// =========================================
// DOWNLOAD
// =========================================

downloadBtn.addEventListener("click", async () => {

    downloadBtn.innerText = "Rendering...";

    const canvas = await html2canvas(tweetCard, {

        backgroundColor: null,

        scale: 4,

        useCORS: true

    });

    const link = document.createElement("a");

    const filename =
        nameInput.value
            .replace(/\s+/g, "-")
            .toLowerCase() +
        "-post.png";

    link.download = filename;

    link.href = canvas.toDataURL("image/png");

    link.click();

    downloadBtn.innerText = "Download PNG";

});

// =========================================
// INIT
// =========================================

updatePreview();
