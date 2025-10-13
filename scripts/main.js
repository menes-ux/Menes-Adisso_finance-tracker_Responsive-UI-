// We are linking the buttons to their respective sections
// We first have to allow the html to load before we can manipulate the DOM
document.addEventListener('DOMContentLoaded', () => {

    // After safely loading the DOM, we can now select the buttons and sections
    // To make it easier, we can store all buttons attributes in a list , same for the content sections
    const navButtons = document.querySelectorAll('.nav-button');
    const contentSections = document.querySelectorAll('.content-section');

    // I will go through each navigation button and add a click listener
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
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

