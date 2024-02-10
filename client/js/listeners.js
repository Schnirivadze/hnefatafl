// update mouse position of it is over board or pieces
document.getElementById("board").addEventListener('mousemove', updateMousePosition);
document.getElementById("pieces").addEventListener('mousemove', updateMousePosition);
window.addEventListener("resize", (event) => {
    console.log("resized");
    // reset variables
    pixel_boardsize = window.innerWidth * 0.6;
    tilewidth = pixel_boardsize / boardsize;
    tileheight = pixel_boardsize / boardsize;
    piecewidth = tilewidth * 0.75;
    pieceheight = piecewidth / 608 * 1080;
    overall_x_offset = (window.innerWidth - boardsize * tilewidth) / 2;
    overall_y_offset = (window.innerHeight - boardsize * tileheight / 2) / 2 - 0;
    piece_x_offset = 12 + overall_x_offset;
    piece_y_offset = overall_y_offset - (pieceheight / 3 * 2);
    board_x_offset = 0 + overall_x_offset;
    board_y_offset = 0 + overall_y_offset;

    // reset tiles sizes and positions
    for (let y = 0; y < boardsize; y++) {
        for (let x = 0; x < boardsize; x++) {
            var tile = document.getElementById(`tile_${x}_${y}`);// get tile
            var realPos = getrealposition(x, y, board_x_offset, board_y_offset);// get top and left of piece image tag
            // update style
            tile.style.width = `${tilewidth}px`;
            tile.style.top = `${realPos.y}px`;
            tile.style.left = `${realPos.x}px`;
        }
    }

    // reset pieces sizes and positions
    for (let y = 0; y < boardsize; y++) {
        for (let x = 0; x < boardsize; x++) {
            if (board_id[y][x] != -1) {
                var piece = document.getElementById(`piece_${board_id[y][x]}`);// get piece
                var realPos = getrealposition(x, y, piece_x_offset, piece_y_offset);// get top and left of piece image tag
                // update style
                piece.style.width = `${piecewidth}px`;
                piece.style.top = `${realPos.y}px`;
                piece.style.left = `${realPos.x}px`;
            }
        }
    }
});

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