import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

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

// PROFILE ELEMENTS
const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");

const userPosts = document.getElementById("user-posts");

// AUTH
onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const username = user.email.split("@")[0];

  // PROFILE INFO
  profileName.innerHTML = username;

  profileUsername.innerHTML = "@" + username;

  profileBio.innerHTML = "Welcome to Mamaspace 💕";

  // LOAD USER POSTS
  loadPosts(user.email);

});

// LOAD POSTS
function loadPosts(email) {

  const q = query(
    collection(db, "posts"),
    where("email", "==", email),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {

    userPosts.innerHTML = "";

    if (snapshot.empty) {

      userPosts.innerHTML = `
        <div class="post">
          No posts yet 💕
        </div>
      `;

      return;
    }

    snapshot.forEach((doc) => {

      const post = doc.data();

      const postHTML = `
        <div class="post">

          <div style="font-weight:700;
                      margin-bottom:10px;
                      color:#ff4d94;">
            ${post.user}
          </div>

          <div style="margin-bottom:15px;">
            ${post.content || ""}
          </div>

          ${post.imageUrl ? `
            <img src="${post.imageUrl}"
                 style="
                   width:100%;
                   border-radius:18px;
                   margin-top:10px;
                 ">
          ` : ""}

          <div style="
            margin-top:15px;
            display:flex;
            gap:20px;
            color:#888;
            font-size:14px;
          ">
            <div>❤️ ${post.likes || 0}</div>
            <div>💬 ${(post.comments || []).length}</div>
          </div>

        </div>
      `;

      userPosts.innerHTML += postHTML;

    });

  });

}
