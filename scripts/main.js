// We are linking the buttons to their respective sections
// We first have to allow the html to load before we can manipulate the DOM
document.addEventListener('DOMContentLoaded', () => {

  // We will add an event listenner to listen for burger click 
   const hamburgerBtn = document.getElementById('hamburger-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const body = document.body;

    // Here, when you click the hamburger, we toggle a class on the body.
    hamburgerBtn.addEventListener('click', () => {
        body.classList.toggle('sidebar-mobile-open');
    });

    // Here, if you click the dark overlay, it will close the menu.
    mobileOverlay.addEventListener('click', () => {
        body.classList.remove('sidebar-mobile-open');
    });

    // After safely loading the DOM, we can now select the buttons and sections
    // To make it easier, we can store all buttons attributes in a list , same for the content sections
    const navButtons = document.querySelectorAll('.nav-button');
    const contentSections = document.querySelectorAll('.content-section');

    // I will go through each navigation button and add a click listener
  navButtons.forEach(button => {
    button.addEventListener('click', () => {

      // This will close the sidebar when a link is clicked on mobile
      if (window.innerWidth <= 1080) {
          body.classList.remove('sidebar-mobile-open');
      }
    //   I identified the button that was clicked using 'this' keyword
      const targetId = button.dataset.section;

      navButtons.forEach(btn => {
        btn.classList.remove('active');
      });

      contentSections.forEach(section => {
        section.classList.remove('active');
      });

      button.classList.add('active');


      const targetSection = document.getElementById(targetId);
      

      if (targetSection) { // A small check to make sure the section exists
          targetSection.classList.add('active');
      }
    });
  });

});

