```javascript id="z8wwxg"
import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc
}
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";



// FIREBASE CONFIG
const firebaseConfig = {

  apiKey: "AIzaSyBJgFsx0Aq63bbQ7mwfOI6_0pSWJkO8zp8",

  authDomain: "mamaspace-bf004.firebaseapp.com",

  projectId: "mamaspace-bf004",

  storageBucket: "mamaspace-bf004.firebasestorage.app",

  messagingSenderId: "520083469560",

  appId: "1:520083469560:web:d83cec2ce32ba0fa1bf70d",

  measurementId: "G-HFLW3BTN9E"

};



// INIT FIREBASE
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);



// GET URL PARAM
const params =
  new URLSearchParams(window.location.search);

const postId = params.get("id");



// LOAD ARTICLE
async function loadArticle() {

  if (!postId) {

    document.body.innerHTML =
      "<h1>Post not found</h1>";

    return;

  }

  try {

    const postRef =
      doc(db, "posts", postId);

    const snap =
      await getDoc(postRef);



    if (!snap.exists()) {

      document.body.innerHTML =
        "<h1>Article not found</h1>";

      return;

    }



    const post = snap.data();



    // TITLE
    document.getElementById("title")
      .innerText =
      post.title || "Untitled";



    // AUTHOR
    document.getElementById("author")
      .innerHTML =
      `By ${post.username || "@user"}`;



    // DATE
    document.getElementById("date")
      .innerText =
      post.createdAt
      ? new Date(
          post.createdAt.seconds * 1000
        ).toLocaleDateString()
      : "";



    // IMAGE
    if(post.imageUrl){

      document.getElementById("image")
        .src = post.imageUrl;

    } else {

      document.getElementById("image")
        .style.display = "none";

    }



    // CONTENT
    document.getElementById("content")
      .innerHTML =
      `
        <div style="
          margin-top:20px;
          line-height:1.8;
          font-size:18px;
          color:#444;
        ">
          ${post.content || ""}
        </div>
      `;

  } catch(err) {

    console.error(err);

    document.body.innerHTML =
      "<h1>Failed to load article</h1>";

  }

}

loadArticle();
```
