document.getElementById("board").addEventListener('mousemove', updateMousePosition);
document.getElementById("pieces").addEventListener('mousemove', updateMousePosition);
function updateMousePosition(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function removedefault() {
    var images = document.querySelectorAll("img");

    images.forEach(function (img) {
        img.addEventListener("dragstart", function (e) {
            e.preventDefault(); // Prevent the default drag-and-drop behavior
        });
    });
}