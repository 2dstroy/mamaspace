import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, 
  arrayUnion, increment, query, orderBy, serverTimestamp, getDoc, setDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { 
  getStorage, ref, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJgFsx0Aq63bbQ7mwfOI6_0pSWJkO8zp8",
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

// DOM Elements
const postBtn = document.querySelector(".post-btn");
const textarea = document.querySelector(".compose-input");
const postsContainer = document.getElementById("postsContainer");
const imageIcon = document.getElementById("imageIcon");
const userInfo = document.getElementById("userInfo");

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "image/*";

imageIcon.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  selectedFile = e.target.files[0];
  if (selectedFile) alert(`Selected: ${selectedFile.name}`);
});

// ====================== AUTH ======================
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    const username = user.email.split("@")[0];
    userInfo.innerHTML = `Welcome back, <b>@${username}</b>`;
  } else {
    alert("Please login first");
    window.location.href = "signin.html";
  }
});

// ====================== CREATE POST ======================
postBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  const text = textarea.value.trim();
  if (!text && !selectedFile) return alert("Write something or add a photo 💕");

  try {
    let imageUrl = "";
    if (selectedFile) {
      const storageRef = ref(storage, `posts/${Date.now()}_${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    const username = currentUser.email.split("@")[0];

    await addDoc(collection(db, "posts"), {
      user: username,
      username: `@${username}`,
      email: currentUser.email,
      avatar: "👩‍🍼",
      content: text,
      imageUrl: imageUrl,
      likes: 0,
      comments: [],
      createdAt: serverTimestamp()
    });

    textarea.value = "";
    selectedFile = null;
    fileInput.value = "";
    alert("Posted successfully 💕");
  } catch (err) {
    console.error(err);
    alert("Failed to post");
  }
});

// ====================== LOAD POSTS ======================
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  postsContainer.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const post = docSnap.data();
    const postId = docSnap.id;

    const postHTML = `
      <div class="post">
        <div class="post-header">
          <div class="avatar">${post.avatar || "👩‍🍼"}</div>
          <div>
            <div class="post-user">${post.user}</div>
            <div style="color:#888;font-size:14px;">${post.username}</div>
          </div>
        </div>
        <div class="post-content">${post.content || ""}</div>
        ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="post image">` : ""}
        
        <div class="post-footer">
          <div class="action-btn like-btn" data-id="${postId}">
            ❤️ <span class="like-count">${post.likes || 0}</span>
          </div>
          <div class="action-btn comment-btn" data-id="${postId}">
            💬 ${(post.comments || []).length}
          </div>
        </div>

        <div class="comment-section" id="comments-${postId}" style="display:none;">
          ${(post.comments || []).map(c => `<div class="comment">${c}</div>`).join("")}
          <div class="comment-input">
            <input type="text" placeholder="Write a comment..." class="comment-text">
            <button class="send-comment" data-id="${postId}">Send</button>
          </div>
        </div>
      </div>
    `;
    postsContainer.innerHTML += postHTML;
  });
});

// ====================== LIKE + COMMENT ======================
postsContainer.addEventListener("click", async (e) => {
  if (!currentUser) return alert("Please login first!");

  // LIKE / UNLIKE
  if (e.target.closest(".like-btn")) {
    const likeBtn = e.target.closest(".like-btn");
    const postId = likeBtn.dataset.id;
    const postRef = doc(db, "posts", postId);
    const likeRef = doc(db, "posts", postId, "likes", currentUser.uid);

    try {
      const likeSnap = await getDoc(likeRef);

      if (likeSnap.exists()) {
        // UNLIKE
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likes: increment(-1) });
        likeBtn.style.color = "";
      } else {
        // LIKE
        await setDoc(likeRef, { likedAt: Date.now() });
        await updateDoc(postRef, { likes: increment(1) });
        likeBtn.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      alert("Like failed. Check Firebase Rules.");
    }
  }

  // TOGGLE COMMENTS
  if (e.target.closest(".comment-btn")) {
    const btn = e.target.closest(".comment-btn");
    const section = document.getElementById(`comments-${btn.dataset.id}`);
    section.style.display = section.style.display === "block" ? "none" : "block";
  }

  // SEND COMMENT
  if (e.target.closest(".send-comment")) {
    const btn = e.target.closest(".send-comment");
    const input = btn.previousElementSibling;
    const text = input.value.trim();
    if (!text) return;

    const postId = btn.dataset.id;
    const username = currentUser.email.split("@")[0];
    const postRef = doc(db, "posts", postId);

    try {
      await updateDoc(postRef, {
        comments: arrayUnion(`@${username}: ${text}`)
      });
      input.value = "";
    } catch (err) {
      console.error(err);
      alert("Failed to send comment");
    }
  }
});
