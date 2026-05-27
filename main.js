// AUTH
onAuthStateChanged(auth, (user) => {

  if (user) {

    currentUser = user;

    const username = user.email.split("@")[0];

    // HOME PAGE USER INFO
    if(userInfo){
      userInfo.innerHTML =
        `Welcome back, <b>@${username}</b>`;
    }

    // PROFILE PAGE
    const profileName =
      document.getElementById("profileName");

    const profileUsername =
      document.getElementById("profileUsername");

    const profileImage =
      document.getElementById("profileImage");

    const profileEmoji =
      document.getElementById("profileEmoji");

    // SET NAME
    if(profileName){
      profileName.textContent =
        user.displayName || username;
    }

    // SET USERNAME
    if(profileUsername){
      profileUsername.textContent =
        "@" + username;
    }

    // SET PROFILE PHOTO
    if(profileImage && user.photoURL){

      profileImage.src = user.photoURL;

      profileImage.style.display = "block";

      if(profileEmoji){
        profileEmoji.style.display = "none";
      }

    }

  } else {

    alert("Please login first");

    window.location.href = "login.html";

  }

});
