import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  increment,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "mamaspace-bf004.firebaseapp.com",
  projectId: "mamaspace-bf004",
  storageBucket: "mamaspace-bf004.firebasestorage.app",
  messagingSenderId: "520083469560",
  appId: "1:520083469560:web:d83cec2ce32ba0fa1bf70d"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let currentUser = null;
let selectedFile = null;

/* =========================
   HOME PAGE ELEMENTS
========================= */

const postBtn = document.querySelector(".post-btn");
const textarea = document.querySelector(".compose-input");
const postsContainer = document.getElementById("postsContainer");
const imageIcon = document.getElementById("imageIcon");
const userInfo = document.getElementById("userInfo");

/* =========================
   PROFILE PAGE ELEMENTS
========================= */

const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const profileImage = document.getElementById("profileImage");
const profileEmoji = document.getElementById("profileEmoji");

/* =========================
   FILE INPUT
========================= */

const fileInput = document.createElement("input");

fileInput.type = "file";
fileInput.accept = "image/*";

if (imageIcon) {

  imageIcon.addEventListener("click", () => {
    fileInput.click();
  });

}

fileInput.addEventListener("change", (e) => {

  selectedFile = e.target.files[0];

  if (selectedFile) {
    alert(`Selected: ${selectedFile.name}`);
  }

});

/* =========================
   AUTH
========================= */

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    alert("Please login first");
    window.location.href = "login.html";
    return;

  }

  currentUser = user;

  const username = user.email.split("@")[0];

  /* HOME PAGE USER INFO */

  if (userInfo) {

    userInfo.innerHTML = `
      Welcome back, <b>@${username}</b>
    `;

  }

  /* PROFILE PAGE USER INFO */

  if (profileName) {

    profileName.textContent = username;

  }

  if (profileUsername) {

    profileUsername.textContent = "@" + username;

  }

  if (profileBio) {

    profileBio.textContent =
      "Welcome to Mamaspace 💕";

  }

  /* PROFILE PHOTO */

  if (profileImage) {

    if (user.photoURL) {

      profileImage.src = user.photoURL;

      profileImage.style.display = "block";

      if (profileEmoji) {
        profileEmoji.style.display = "none";
      }

    } else {

      profileImage.style.display = "none";

      if (profileEmoji) {
        profileEmoji.style.display = "block";
      }

    }

  }

});

/* =========================
   CREATE POST
========================= */

if (postBtn) {

  postBtn.addEventListener("click", async () => {

    if (!currentUser) return;

    const text = textarea.value.trim();

    if (!text && !selectedFile) {

      alert("Write something or add a photo 💕");
      return;

    }

    try {

      let imageUrl = "";

      if (selectedFile) {

        const storageRef = ref(
          storage,
          "posts/" +
          Date.now() +
          "_" +
          selectedFile.name
        );

        await uploadBytes(storageRef, selectedFile);

        imageUrl = await getDownloadURL(storageRef);

      }

      const username =
        currentUser.email.split("@")[0];

      await addDoc(collection(db, "posts"), {

        user: username,
        username: "@" + username,
        email: currentUser.email,

        avatar:
          currentUser.photoURL ||
          "👩‍🍼",

        content: text,

        imageUrl: imageUrl,

        likes: 0,

        comments: [],

        createdAt: Date.now()

      });

      textarea.value = "";

      selectedFile = null;

      alert("Posted successfully 💕");

    } catch (err) {

      console.error(err);

      alert("Failed to post");

    }

  });

}

/* =========================
   LOAD POSTS
========================= */

if (postsContainer) {

  const q = query(
    collection(db, "posts"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {

    postsContainer.innerHTML = "";

    snapshot.forEach((docSnap) => {

      const post = docSnap.data();

      const postId = docSnap.id;

      const avatarHTML =
        post.avatar &&
        post.avatar.startsWith("http")

          ? `<img src="${post.avatar}" class="avatar-img">`

          : `${post.avatar || "👩‍🍼"}`;

      const postHTML = `

        <div class="post">

          <div class="post-header">

            <div class="avatar">
              ${avatarHTML}
            </div>

            <div>

              <div class="post-user">
                ${post.user}
              </div>

              <div style="color:#888;font-size:14px;">
                ${post.username}
              </div>

            </div>

          </div>

          <div class="post-content">
            ${post.content || ""}
          </div>

          ${post.imageUrl ? `
            <img src="${post.imageUrl}" class="post-image">
          ` : ""}

          <div class="post-footer">

            <div class="action-btn like-btn" data-id="${postId}">
              ❤️ ${post.likes || 0}
            </div>

            <div class="action-btn comment-btn" data-id="${postId}">
              💬 ${(post.comments || []).length}
            </div>

          </div>

          <div class="comment-section" id="comments-${postId}">

            ${(post.comments || [])
              .map(c => `
                <div class="comment">${c}</div>
              `)
              .join("")}

            <div class="comment-input">

              <input
                type="text"
                placeholder="Write a comment..."
                class="comment-text"
              >

              <button
                class="send-comment"
                data-id="${postId}"
              >
                Send
              </button>

            </div>

          </div>

        </div>

      `;

      postsContainer.innerHTML += postHTML;

    });

    attachEvents();

  });

}

/* =========================
   EVENTS
========================= */

function attachEvents() {

  /* LIKE */

  document.querySelectorAll(".like-btn")
    .forEach(btn => {

      btn.addEventListener("click", async () => {

        const postRef = doc(
          db,
          "posts",
          btn.dataset.id
        );

        await updateDoc(postRef, {
          likes: increment(1)
        });

      });

    });

  /* TOGGLE COMMENTS */

  document.querySelectorAll(".comment-btn")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        const section =
          document.getElementById(
            `comments-${btn.dataset.id}`
          );

        section.style.display =
          section.style.display === "block"
            ? "none"
            : "block";

      });

    });

  /* SEND COMMENT */

  document.querySelectorAll(".send-comment")
    .forEach(btn => {

      btn.addEventListener("click", async () => {

        const input =
          btn.previousElementSibling;

        const text =
          input.value.trim();

        if (!text || !currentUser) return;

        const username =
          currentUser.email.split("@")[0];

        const postRef = doc(
          db,
          "posts",
          btn.dataset.id
        );

        await updateDoc(postRef, {

          comments: arrayUnion(
            `@${username}: ${text}`
          )

        });

        input.value = "";

      });

    });

}
