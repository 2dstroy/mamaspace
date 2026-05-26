auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        console.log("Logged in as:", user.email);
        
        // Optional: Show hidden content
        document.getElementById("protected-content").style.display = "block";
    }
});
