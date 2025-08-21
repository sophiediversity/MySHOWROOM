//  für Element Service (Text-Rotator)
   document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".word-container");
  const words = container.querySelectorAll("span");

  words.forEach(word => {
    word.classList.add("word");
  });
});

const roles = [
      "Diplom Pädagogin",
      "E-Learning Designerin",
      "Illustratorin",
      "Webentwicklerin"
    ];

    const container = document.querySelector(".word-container");

    roles.forEach(role => {
      const span = document.createElement("span");
      span.textContent = role;
      span.classList.add("word");
      container.appendChild(span);
    });
  