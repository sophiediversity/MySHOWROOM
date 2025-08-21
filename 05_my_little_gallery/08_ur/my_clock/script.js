document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("#canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = "clock.png"; // oder dein eigener Name wie z. B. "meine_uhr.png"

  const tickSound = new Audio("ticktock.mp3");
  tickSound.volume = 1.0;

  let lastSecond = -1;
  let soundEnabled = false; // Sound ist anfangs aus

  // Button reagiert auf Klicks
const soundButton = document.querySelector("#soundButton");
soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  if (!soundEnabled) {
    tickSound.pause();
    tickSound.currentTime = 0;
  }
});


  img.onload = () => {
    function clock() {
      const now = new Date();
      const sek = now.getSeconds();
      const min = now.getMinutes();
      const std = now.getHours() % 12;

      if (sek !== lastSecond) {
        lastSecond = sek;
        if (soundEnabled) {
          tickSound.currentTime = 0;
          tickSound.play().catch(() => {});
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 1.65);

      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Stundenzeiger
      ctx.save();
      ctx.rotate((std + min / 60) * Math.PI / 6);
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.lineTo(0, -70);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#aaa";
      ctx.stroke();
      ctx.restore();

      // Minutenzeiger
      ctx.save();
      ctx.rotate((min + sek / 60) * Math.PI / 30);
      ctx.beginPath();
      ctx.moveTo(0, 15);
      ctx.lineTo(0, -100);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#e00";
      ctx.stroke();
      ctx.restore();

      // Sekundenzeiger
      ctx.save();
      ctx.rotate(sek * Math.PI / 30);
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(0, -110);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0af";
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      requestAnimationFrame(clock);
    }

    requestAnimationFrame(clock);
  };
});
