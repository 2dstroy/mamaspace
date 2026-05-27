import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const userPosts = document.getElementById("user-posts");

onAuthStateChanged(auth, (user) => {

  console.log("PROFILE USER:", user);

  // ❌ DO NOT REDIRECT IMMEDIATELY
  if (!user) return;

  const username = user.email.split("@")[0];

  profileName.textContent = username;
  profileUsername.textContent = "@" + username;
  profileBio.textContent = "Welcome to Mamaspace 💕";

  loadPosts(user.email);

});

function loadPosts(email) {

  const q = query(
    collection(db, "posts"),
    where("email", "==", email),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {

    userPosts.innerHTML = "";

    if (snapshot.empty) {
      userPosts.innerHTML = `<div class="post">No posts yet 💕</div>`;
      return;
    }

    snapshot.forEach((doc) => {

      const post = doc.data();

      userPosts.innerHTML += `
        <div class="post">

          <div style="font-weight:700;color:#ff4d94;">
            ${post.user}
          </div>

          <div style="margin:10px 0;">
            ${post.content || ""}
          </div>

          ${post.imageUrl ? `
            <img src="${post.imageUrl}"
              style="width:100%;border-radius:15px;">
          ` : ""}

          <div style="margin-top:10px;color:#888;">
            ❤️ ${post.likes || 0} |
            💬 ${(post.comments || []).length}
          </div>

        </div>
      `;

    });

  });

}
