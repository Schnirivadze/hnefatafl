//update mouse position of it is over board or pieces
document.getElementById("board").addEventListener('mousemove', updateMousePosition);
document.getElementById("pieces").addEventListener('mousemove', updateMousePosition);
function updateMousePosition(event) {
    //real position
    mouse.pos.x = event.clientX;
    mouse.pos.y = event.clientY;

    //boardposition
    mouse.boardPos = getboardposition(event.clientY + selection_y_offset, event.clientX)

    //if out of bounds
    if (mouse.boardPos.x > 10) mouse.boardPos.x = 10;
    else if (mouse.boardPos.x < 0) mouse.boardPos.x = 0;
    if (mouse.boardPos.y > 10) mouse.boardPos.y = 10;
    else if (mouse.boardPos.y < 0) mouse.boardPos.y = 0;
}
function getboardposition(top, left) {
    return {
        x: Math.round((2 * (top - board_y_offset) * tilewidth + (left - board_x_offset) * tileheight) / (tilewidth * tileheight)) - 6,
        y: Math.round((2 * (top - board_y_offset) * tilewidth - (left - board_x_offset) * tileheight) / (tilewidth * tileheight)) + 5
    }
}
function getrealposition(rx, ry, x_offset, y_offset) {
    return {
        x: (rx - ry - 1) * tilewidth * 0.5 + (tilewidth * boardsize * 0.5) + x_offset,
        y: (rx + ry) * tileheight * 0.25 + y_offset
    }
}
function removedefault() {
    var images = document.querySelectorAll("img");
    images.forEach(function (img) {
        img.addEventListener("dragstart", function (e) {
            e.preventDefault(); // Prevent the default drag-and-drop behavior
        });
    });
}