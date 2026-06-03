document.addEventListener("DOMContentLoaded", () => {
  const followBtn = document.getElementById("followBtn");
  const followerStat = document.querySelectorAll(".stat-number")[1]; // Followers

  if (!followBtn || !followerStat) return;

  let isFollowing = false;

  // Load saved follow state
  const savedState = localStorage.getItem("isFollowing");
  if (savedState === "true") {
    isFollowing = true;
    followBtn.textContent = "Unfollow";
  } else {
    followBtn.textContent = "Follow";
  }

  followBtn.addEventListener("click", () => {
    isFollowing = !isFollowing;

    let currentFollowers = parseInt(followerStat.textContent) || 0;

    if (isFollowing) {
      followBtn.textContent = "Unfollow";
      followerStat.textContent = currentFollowers + 1;
    } else {
      followBtn.textContent = "Follow";
      followerStat.textContent = Math.max(0, currentFollowers - 1);
    }

    localStorage.setItem("isFollowing", isFollowing);
  });
});
