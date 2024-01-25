document.getElementById("board").addEventListener('mousemove', updateMousePosition);
document.getElementById("pieces").addEventListener('mousemove', updateMousePosition);
function updateMousePosition(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
}
