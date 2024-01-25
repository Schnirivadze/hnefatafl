var boardsize = 11;
let board_a = new Array(boardsize);
for (let l = 0; l < board_a.length; l++) { board_a[l] = new Array(boardsize); }
for (let y = 0; y < board_a.length; y++) { for (let x = 0; x < boardsize; x++) { board_a[y][x] = 0; } }

var tilewidth = 100;
var tileheight = 100;
var selection = null;

var overall_x_offset = (window.innerWidth-boardsize*tilewidth)/2;
var overall_y_offset = (window.innerHeight-boardsize*tileheight/2)/2;
var piece_x_offset = 12+overall_x_offset;
var piece_y_offset = -90+overall_y_offset;
var board_x_offset = 0+overall_x_offset;
var board_y_offset = 0+overall_y_offset;



function drawboard() {
    let container = document.getElementById("board");
    container.innerHTML = "";
    for (let y = 0; y < boardsize; y++) {
        for (let x = 0; x < boardsize; x++) {
            var real_x = (x - y - 1) * tilewidth * 0.5 + (tilewidth * boardsize * 0.5) + board_x_offset;
            var real_y = (x + y) * tileheight * 0.25 + board_y_offset;
            var tile_type = 0;
            if ((y == 5 && x <= 7 && x >= 3) || (x == 5 && y <= 7 && y >= 3) || (y >= 4 && x >= 4 && y <= 6 && x <= 6)) tile_type = 2;
            if ((y == x || x + y == boardsize - 1) && (y == boardsize - 1 || y == 0 || y == 5)) tile_type = 1;
            if (((x == 0 || x == 10) && (y >= 3 && y <= 7)) || ((y == 0 || y == 10) && (x >= 3 && x <= 7)) || ((x == 9 || x == 1) && y == 5) || ((y == 9 || y == 1) && x == 5)) tile_type = 3;
            container.innerHTML += `
            <img id = "tile_${x}_${y}" class="tiles" src="./media/tile${tile_type}.png" style="width: ${tilewidth}px;position: absolute;top: ${real_y}px;left: ${real_x}px;" alt="${x}|${y}">
            `
        }
    }
}
function drawpieces() {
    let container = document.getElementById("pieces");
    container.innerHTML = "";
    var piecenumber = 0;
    for (let y = 0; y < boardsize; y++) {
        for (let x = 0; x < boardsize; x++) {
            var real_x = (x - y - 1) * tilewidth * 0.5 + (tilewidth * boardsize * 0.5) + piece_x_offset;
            var real_y = (x + y) * tileheight * 0.25 + piece_y_offset;
            var tile_type = 0;
            if ((y == 5 && x <= 7 && x >= 3) || (x == 5 && y <= 7 && y >= 3) || (y >= 4 && x >= 4 && y <= 6 && x <= 6)) tile_type = 3;
            if (y == x && y == 5) tile_type = 1;
            if (((x == 0 || x == 10) && (y >= 3 && y <= 7)) || ((y == 0 || y == 10) && (x >= 3 && x <= 7)) || ((x == 9 || x == 1) && y == 5) || ((y == 9 || y == 1) && x == 5)) tile_type = 2;
            board_a[y][x]=tile_type;
            if (tile_type == 0) continue;
            container.innerHTML += `
            <img class="pieces" id="piece_${piecenumber}"  onmousedown ="selectpiece('piece_${piecenumber}',event)" src="./media/pawn (${tile_type}).png" style="user-drag: none;width: ${75}px;position: absolute;top: ${real_y}px;left: ${real_x}px;" alt="${x}|${y}">
            `
            piecenumber++;
        }
    }
}
function selectpiece(id, event) {
    updateMousePosition(event);
    var piece = document.getElementById(id);
    piece.style.zIndex = Number.MAX_VALUE;
    //var (mouseX-board_x_offset)_offset = (mouseX-board_x_offset) - piece.style.left.slice(0, piece.style.left.length - 2)
    //var (mouseY-board_y_offset)_offset = (mouseY-board_y_offset) - piece.style.top.slice(0, piece.style.top.length - 2)
    var firstboardX=Math.round((2 * (mouseY-board_y_offset) * tilewidth - (mouseX-board_x_offset) * tileheight) / (tilewidth * tileheight)) + 5;
    var firstboardY=Math.round((2 * (mouseY-board_y_offset) * tilewidth + (mouseX-board_x_offset) * tileheight) / (tilewidth * tileheight)) - 6;;
    var lastboardX, lastboardY;
    showacessibletiles(firstboardX, firstboardY);
    selection = setInterval(function () {
        
        var boardX = Math.round((2 * (mouseY-board_y_offset) * tilewidth - (mouseX-board_x_offset) * tileheight) / (tilewidth * tileheight)) + 5;
        var boardY = Math.round((2 * (mouseY-board_y_offset) * tilewidth + (mouseX-board_x_offset) * tileheight) / (tilewidth * tileheight)) - 6;
        if (boardX > 10) boardX = 10;
        else if (boardX < 0) boardX = 0;
        if (boardY > 10) boardY = 10;
        else if (boardY < 0) boardY = 0;

        if (boardX != lastboardX && boardY != lastboardY) {
            var real_x = (boardY - boardX - 1) * tilewidth * 0.5 + (tilewidth * boardsize * 0.5) + piece_x_offset;
            var real_y = (boardY + boardX) * tileheight * 0.25 + piece_y_offset;
            //document.title = `${boardX};${boardY}`;
            piece.style.top = real_y + "px";
            piece.style.left = real_x + "px";
        }
    }, 50);
}
function unselectpiece() {
    showacessibletiles(-1, -1)
    clearInterval(selection);
}
function showacessibletiles(x, y) {
    var tiles = document.getElementsByClassName("tiles");
    var pieces = document.getElementsByClassName("pieces");
    if (x == -1 || y == -1) {
        for (let t = 0; t < tiles.length; t++) { tiles[t].style.opacity = 1; }
    } else {
        for (let t = 0; t < tiles.length; t++) { tiles[t].style.opacity = 0.25;  }
        var actiles= getacessibletiles(x,y);
        for (let t = 0; t < actiles.length; t++) {  document.getElementById(`tile_${actiles[t][1]}_${actiles[t][0]}`).style.opacity = 1; }
    }

}
function getacessibletiles(x,y) {
    var atiles=new Array();
    var ispawn=board_a[y][x]!=1;
    atiles.push([x,y]);
    if(ispawn){
    for (let left = 1; left < boardsize; left++) {
        if(x-left<0) break;
        if(board_a[y][x-left]==0){ atiles.push([x-left,y]);}
        else break;
    }
    for (let right = 1; right < boardsize; right++) {
        if(x+right>=boardsize) break;
        if(board_a[y][x+right]==0){ atiles.push([x+right,y]);}
        else break;
    }
    for (let up = 1; up < boardsize; up++) {
        if(y-up<0) break;
        if(board_a[y-up][x]==0){ atiles.push([x,y-up]);}
        else break;
    }
    for (let down = 1; down < boardsize; down++) {
        if(y+down>=boardsize) break;
        if(board_a[y+down][x]==0){ atiles.push([x,y+down]);}
        else break;
    }
}
    return atiles;
}