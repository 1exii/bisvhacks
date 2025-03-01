document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio");
    const toggle = document.querySelector(".toggle-checkbox");
  
    toggle.addEventListener("change", () => {
      audio.currentTime = 0;
      audio.play();
    });
  });
  