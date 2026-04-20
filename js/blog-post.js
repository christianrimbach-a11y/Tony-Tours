// Blog-Post Hero: ein statisches Bild (keine Slideshow-Rotation).
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".post-hero-slideshow .slide").forEach((slide, i) => {
    slide.classList.toggle("active", i === 0);
  });
});
