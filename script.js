window.onscroll = function() {
    let header = document.querySelector('header');
    if (window.scrollY > 40) { 
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
};

document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".toggle");
  const menu = document.querySelector(".menu");
  const header = document.querySelector("header");

  toggle.addEventListener("click", function () {
    menu.classList.toggle("active");
    toggle.classList.toggle("active");
    header.classList.toggle("menu-active"); 
  }); 
});