window.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("adVideo");
  const countdownElement = document.getElementById("countdownTimer");

  let isVideoReady = false;
  let videoEnded = false;
  let autoResumeTimeout = null;
  let countdownInterval = null;

  const allowedKeys = [
    "Enter",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
  ];

  function loadVideo(src) {
    video.innerHTML = ""; // Clear previous sources

    const source = document.createElement("source");
    source.src = src;
    source.type = "video/mp4";

    source.addEventListener("error", () => {
      console.warn("❌ Source failed:", src);
      if (!src.includes("video.mp4")) {
        const fallback = "video.mp4?v=" + Date.now();
        console.log("🔁 Falling back to:", fallback);
        loadVideo(fallback);
      }
    });

    video.appendChild(source);
    video.load();
    video.play().catch((err) => {
      console.error("🎬 Initial play error:", err);
    });
  }

  function startCountdown(seconds) {
    let remaining = seconds;
    countdownElement.textContent = `Video will resume in ${remaining}s`;
    countdownElement.style.display = "block";

    countdownInterval = setInterval(() => {
      remaining--;
      countdownElement.textContent = `Video will resume in ${remaining}s`;

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        countdownElement.style.display = "none";

        video
          .play()
          .then(() => {
            console.log("▶️ Auto-resumed video after countdown");
          })
          .catch((err) => {
            console.error("❌ Auto-resume failed:", err);
          });
      }
    }, 1000);
  }

  function stopCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    countdownElement.style.display = "none";
  }

  video.addEventListener("canplay", () => {
    video.play().then(() => {
      isVideoReady = true;
      video.style.visibility = "visible";
    });
  });

  video.addEventListener("play", () => {
    if (autoResumeTimeout) {
      clearTimeout(autoResumeTimeout);
      autoResumeTimeout = null;
    }
    stopCountdown();
  });

  video.addEventListener("ended", () => {
    videoEnded = true;
    stopCountdown();
  });

  document.addEventListener("keydown", (e) => {
    if (!isVideoReady || videoEnded) return;

    if (
      allowedKeys.includes(e.key) ||
      [13, 37, 38, 39, 40].includes(e.keyCode)
    ) {
      if (video.paused) {
        video.play().then(() => {
          console.log("▶️ Resumed by key");
          stopCountdown();
        });
      } else {
        video.pause();
        console.log("⏸️ Paused by key");

        if (!autoResumeTimeout) {
          startCountdown(15);
          autoResumeTimeout = setTimeout(() => {
            autoResumeTimeout = null;
            stopCountdown();
            if (!videoEnded && video.paused) {
              video
                .play()
                .then(() =>
                  console.log("⏯️ Auto-resumed video after 15 seconds")
                )
                .catch((err) => console.error("❌ Auto-resume failed:", err));
            }
          }, 15000);
        }
      }
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && !video.paused) {
      video.pause();
      console.log("👁️ Visibility change: paused video");
    }
  });

  loadVideo("video.mp4?v=" + Date.now());
});
