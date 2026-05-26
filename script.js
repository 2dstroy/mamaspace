function goToHome() {
    if (localStorage.getItem("isLoggedIn") === "true") {
        window.location.href = "home.html";     // logged in user
    } else {
        window.location.href = "index.html";    // not logged in
    }
}
