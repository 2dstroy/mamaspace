<!-- Firebase SDKs -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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

  // Update these IDs to match your login HTML form
  const form = document.getElementById("loginForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const btnIcon = document.getElementById("btnIcon");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Basic validation
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    btnText.textContent = "Signing in...";
    btnIcon.classList.remove("fa-heart");
    btnIcon.classList.add("fa-spinner", "fa-spin");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("User signed in:", user);

      alert(`Welcome back to Mamaspace! ❤️`);

      // Redirect to dashboard (change path if needed)
      window.location.href = "/dashboard.html";

    } catch (error) {
      console.error(error);
      let message = "Invalid email or password.";

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        message = "Incorrect email or password.";
      } else if (error.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please try again later.";
      }

      alert(message);
    } finally {
      // Reset button
      submitBtn.disabled = false;
      btnText.textContent = "Sign In";
      btnIcon.classList.add("fa-heart");
      btnIcon.classList.remove("fa-spinner", "fa-spin");
    }
  });
</script>
