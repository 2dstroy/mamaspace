import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJgFsx0Aq63bbQ7mwfOI6_0pSWJkO8zp8",
  authDomain: "mamaspace-bf004.firebaseapp.com",
  projectId: "mamaspace-bf004",
  storageBucket: "mamaspace-bf004.firebasestorage.app",
  messagingSenderId: "520083469560",
  appId: "1:520083469560:web:d83cec2ce32ba0fa1bf70d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const form = document.getElementById("signinForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const btnIcon = document.getElementById("btnIcon");
const togglePasswordBtn = document.getElementById("togglePassword");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const messageBox = document.getElementById("messageBox");

// Show Message Function
function showMessage(text, type = "error") {
  messageBox.textContent = text;
  messageBox.classList.remove("hidden");
  messageBox.style.backgroundColor = type === "success" ? "#ecfdf5" : "#fee2e2";
  messageBox.style.color = type === "success" ? "#10b981" : "#ef4444";
  
  setTimeout(() => {
    messageBox.classList.add("hidden");
  }, 5000);
}

// Toggle Password Visibility
togglePasswordBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  
  togglePasswordBtn.innerHTML = isPassword 
    ? `<i class="fa-solid fa-eye-slash"></i>` 
    : `<i class="fa-solid fa-eye"></i>`;
});

// Login Form Submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Please enter email and password");
    return;
  }

  // Loading State
  submitBtn.disabled = true;
  btnText.textContent = "Signing in...";
  btnIcon.classList.add("fa-spinner", "fa-spin");
  btnIcon.classList.remove("fa-right-to-bracket");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
    
    showMessage("Welcome back Mama! ❤️", "success");
    
    // Redirect after short delay
    setTimeout(() => {
      window.location.href = "index.html";   // Change if your feed page has different name
    }, 1500);

  } catch (error) {
    console.error(error);
    let message = "Invalid email or password";

    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      message = "Incorrect email or password";
    } else if (error.code === "auth/invalid-email") {
      message = "Please enter a valid email address";
    } else if (error.code === "auth/too-many-requests") {
      message = "Too many failed attempts. Try again later";
    }

    showMessage(message);
  } finally {
    // Reset button
    submitBtn.disabled = false;
    btnText.textContent = "Sign In";
    btnIcon.classList.remove("fa-spinner", "fa-spin");
    btnIcon.classList.add("fa-right-to-bracket");
  }
});

// Forgot Password
forgotPasswordBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!email) {
    showMessage("Please enter your email address first");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showMessage("Password reset link sent to your email!", "success");
  } catch (error) {
    console.error(error);
    if (error.code === "auth/invalid-email") {
      showMessage("Please enter a valid email");
    } else if (error.code === "auth/user-not-found") {
      showMessage("No account found with this email");
    } else {
      showMessage("Failed to send reset email");
    }
  }
});

// Optional: Redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "index.html"; // Change to your main feed page
  }
});
