function drawboard() {
    let container = document.getElementById("board");
    container.innerHTML = "";
    var tilewidth = 100;
    var tileheight = 100;
    var boardsize = 11;
    var x_offset = 0;
    var y_offset = 0;
    for (let y = 0; y < boardsize; y++) {
        for (let x = 0; x < boardsize; x++) {
            var real_x = (x - y - 1) * tilewidth * 0.5 + (tilewidth * boardsize * 0.5) + x_offset;
            var real_y = (x + y) * tileheight * 0.25 + y_offset;
            var tile_type = 0;
            if ((y == 5 && x <= 7 && x >= 3) || (x == 5 && y <= 7 && y >= 3) || (y >= 4 && x >= 4 && y <= 6 && x <= 6)) tile_type = 2;
            if ((y == x || x + y == boardsize - 1) && (y == boardsize - 1 || y == 0 || y == 5)) tile_type = 1;
            if (((x == 0 || x == 10) && (y >= 3 && y <= 7)) || ((y == 0 || y == 10) && (x >= 3 && x <= 7)) || ((x == 9 || x == 1) && y == 5) || ((y == 9 || y == 1) && x == 5)) tile_type = 3;
            container.innerHTML += `
            <img class="tiles" src="./tile${tile_type}.png" style="width: ${tilewidth}px;position: absolute;top: ${real_y}px;left: ${real_x}px;" alt="${x}|${y}">
            `
        }
    }
}
function drawpieces() {
    let container = document.getElementById("pieces");
    container.innerHTML = "";
    var tilewidth = 100;
    var tileheight = 100;
    var boardsize = 11;
    var x_offset = 12;
    var y_offset = -90;
    var piecenumber = 0;
    for (let y = 0; y < boardsize; y++) {
        for (let x = 0; x < boardsize; x++) {
            var real_x = (x - y - 1) * tilewidth * 0.5 + (tilewidth * boardsize * 0.5) + x_offset;
            var real_y = (x + y) * tileheight * 0.25 + y_offset;
            var tile_type = 0;
            if ((y == 5 && x <= 7 && x >= 3) || (x == 5 && y <= 7 && y >= 3) || (y >= 4 && x >= 4 && y <= 6 && x <= 6)) tile_type = 3;
            if (y == x && y == 5) tile_type = 1;
            if (((x == 0 || x == 10) && (y >= 3 && y <= 7)) || ((y == 0 || y == 10) && (x >= 3 && x <= 7)) || ((x == 9 || x == 1) && y == 5) || ((y == 9 || y == 1) && x == 5)) tile_type = 2;
            if (tile_type == 0) continue;
            container.innerHTML += `
            <img class="pieces" id="piece_${piecenumber}"  onmousedown ="selectpiece('piece_${piecenumber}',event)" src="./pawn (${tile_type}).png" style="user-drag: none;width: ${75}px;position: absolute;top: ${real_y}px;left: ${real_x}px;" alt="${x}|${y}">
            `
            piecenumber++;
        }
    }
}