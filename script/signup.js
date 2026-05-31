import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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

const form = document.getElementById("signupForm");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const btnIcon = document.getElementById("btnIcon");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const babyInfo = document.getElementById("babyInfo").value.trim();

  // Validation
  if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  btnText.textContent = "Creating account...";
  btnIcon.classList.remove("fa-heart");
  btnIcon.classList.add("fa-spinner", "fa-spin");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("User created:", user);

    // TODO: Save additional data (name, babyInfo) to Firestore here

    alert(`Welcome to Mamaspace, ${name}! ❤️\nYour account has been created successfully.`);
    
    // Redirect after success
    // window.location.href = "/dashboard.html";

  } catch (error) {
    console.error(error);
    let message = "Something went wrong. Please try again.";
    
    if (error.code === "auth/email-already-in-use") {
      message = "This email is already registered.";
    } else if (error.code === "auth/invalid-email") {
      message = "Please enter a valid email address.";
    } else if (error.code === "auth/weak-password") {
      message = "Password is too weak.";
    }
    
    alert(message);
  } finally {
    // Reset button
    submitBtn.disabled = false;
    btnText.textContent = "Join the Sisterhood";
    btnIcon.classList.add("fa-heart");
    btnIcon.classList.remove("fa-spinner", "fa-spin");
  }
});
