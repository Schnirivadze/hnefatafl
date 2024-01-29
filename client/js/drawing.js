//size
var boardsize = 11;
let board_a = new Array(boardsize);//array of pieces`s types
for (let l = 0; l < board_a.length; l++) { board_a[l] = new Array(boardsize); }
for (let y = 0; y < board_a.length; y++) { for (let x = 0; x < boardsize; x++) { board_a[y][x] = "none"; } }
let board_id = new Array(boardsize);//map with ids of pieces
for (let l = 0; l < board_id.length; l++) { board_id[l] = new Array(boardsize); }
for (let y = 0; y < board_id.length; y++) { for (let x = 0; x < boardsize; x++) { board_id[y][x] = -1; } }
var tilewidth = 100;
var tileheight = 100;
var piecewidth = 75;
var piecewidth = 75;
var pieceheight = piecewidth / 608 * 1080;
//selection
var side = "defender";//or "attacker"
var selection = {
    interval: null,
    piece: null,
    startPos: {
        x: 0, y: 0
    },
    endPos: {
        x: 0, y: 0
    }
};
var mouse = {
    pos: {
        x: 0, y: 0
    },
    boardPos: {
        x: 0, y: 0
    }
}
//offset
var overall_x_offset = (window.innerWidth - boardsize * tilewidth) / 2;
var overall_y_offset = (window.innerHeight - boardsize * tileheight / 2) / 2;
var piece_x_offset = 12 + overall_x_offset;
var piece_y_offset = -90 + overall_y_offset;
var board_x_offset = 0 + overall_x_offset;
var board_y_offset = 0 + overall_y_offset;
var selection_y_offset = 0;
//opacity
var default_tile_opacity = 1;
var unaccessible_tile_opacity = 0.25;
var accessible_tile_opacity = 1;
var default_piece_opacity = 1;
var irrelevant_piece_opacity = 0.1;
var relevant_piece_opacity = 0.8;
var selected_piece_opacity = 1;
var king_reveal_timeout = 0;
var defenders_reveal_timeout = 500;
var attackers_reveal_timeout = 1000;
//other
var piece_movement_interval = 50;


function drawboard() {
    let container = document.getElementById("board");//get container
    container.innerHTML = "";//clear it
    for (let y = 0; y < boardsize; y++) {
        for (let x = 0; x < boardsize; x++) {
            var realPos = getrealposition(x, y, board_x_offset, board_y_offset);//get top and left of piece image tag

            //get tile type 
            var tile_type = "default";
            if ((y == 5 && x <= 7 && x >= 3) || (x == 5 && y <= 7 && y >= 3) || (y >= 4 && x >= 4 && y <= 6 && x <= 6)) tile_type = "red";
            if ((y == x || x + y == boardsize - 1) && (y == boardsize - 1 || y == 0 || y == 5)) tile_type = "white";
            if (((x == 0 || x == 10) && (y >= 3 && y <= 7)) || ((y == 0 || y == 10) && (x >= 3 && x <= 7)) || ((x == 9 || x == 1) && y == 5) || ((y == 9 || y == 1) && x == 5)) tile_type = "blue";

            //add piece to container
            container.innerHTML += `<img id = "tile_${x}_${y}" class="tiles" src="./media/tile_${tile_type}.png" style="width: ${tilewidth}px;position: absolute;top: ${realPos.y}px;left: ${realPos.x}px;" alt="${x}|${y}">`;
        }
    }
}
function drawpieces() {
    let container = document.getElementById("pieces");//get container
    container.innerHTML = "";//clear it
    var piecenumber = 0;//set counter
    for (let y = 0; y < boardsize; y++) {
        for (let x = 0; x < boardsize; x++) {
            var realPos = getrealposition(x, y, piece_x_offset, piece_y_offset);//get top and left of piece image tag

            //get piece type 
            var piece_type = "none";
            if ((y == 5 && x <= 7 && x >= 3) || (x == 5 && y <= 7 && y >= 3) || (y >= 4 && x >= 4 && y <= 6 && x <= 6)) piece_type = "defender";
            if (y == x && y == 5) piece_type = "king";
            if (((x == 0 || x == 10) && (y >= 3 && y <= 7)) || ((y == 0 || y == 10) && (x >= 3 && x <= 7)) || ((x == 9 || x == 1) && y == 5) || ((y == 9 || y == 1) && x == 5)) piece_type = "attacker";

            //update maps
            board_a[y][x] = piece_type;
            if (piece_type == "none") { board_id[y][x] = -1; continue; } // if there shouldnt be any piece
            board_id[y][x] = piecenumber;

            //get if piece friendly (for hover class)
            var isfriendly = (side == piece_type) || (side == "defender" && piece_type == "king");

            //add piece to container
            container.innerHTML += `<img class="pieces ${(isfriendly) ? 'friendly_piece' : ''} ${piece_type}" id="piece_${piecenumber}" onmousedown ="selectpiece('piece_${piecenumber}',event)" src="./media/${piece_type}.png" style="opacity:0;z-index: ${x + y};width: ${piecewidth}px;position: absolute;top: ${realPos.y}px;left: ${realPos.x}px;" alt="${x}|${y}">`;
            piecenumber++;// increment the counter
        }
    }
}
function animatepieces() {
    //reveal king in king_reveal_timeout ms
    var king = document.getElementsByClassName("king")[0];
    setTimeout(function () {
        king.style.opacity = "1"
    }, king_reveal_timeout)

    //reveal all defenders in defenders_reveal_timeout ms
    var defenders = document.getElementsByClassName("defender");
    for (let d = 0; d < defenders.length; d++) {
        setTimeout(function () {
            defenders[d].style.opacity = "1";
        }, defenders_reveal_timeout)
    }

    //reveal all attackers in attackers_reveal_timeout ms
    var attackers = document.getElementsByClassName("attacker");
    for (let a = 0; a < attackers.length; a++) {
        setTimeout(function () {
            attackers[a].style.opacity = "1";
        }, attackers_reveal_timeout)
    }

}
function selectpiece(id, event) {
    selection.piece = document.getElementById(id);//set selection
    updateMousePosition(event);// update mouse position
    selection_y_offset = pieceheight - (mouse.pos.y - (selection.piece.style.top.slice(0, selection.piece.style.top.length - 2) - 0)) - pieceheight / 8;
    updateMousePosition(event);// update mouse position
    var isattaker = board_a[mouse.boardPos.y][mouse.boardPos.x] == "attacker";
    if ((isattaker && side == "attacker") || (!isattaker && side == "defender")) {

        selection.piece.style.zIndex = "" + Number.MAX_SAFE_INTEGER;//set Zindex to max
        selection.startPos = mouse.boardPos;//lock start position
        var atiles = getaccessibletiles(selection.startPos.x, selection.startPos.y);//get list of accsesible tiles
        showacessibletiles(selection.startPos.x, selection.startPos.y);//visualise allowed moves

        //set position every piece_movement_interval ms
        selection.interval = setInterval(function () {
            //if move is allowed
            if (atiles.some(item => item[0] === mouse.boardPos.x && item[1] === mouse.boardPos.y)) {
                selection.endPos = mouse.boardPos;//update end position

                //set top and left of piece image tag
                var realPos = getrealposition(selection.endPos.x, selection.endPos.y, piece_x_offset, piece_y_offset);
                selection.piece.style.top = realPos.y + "px";
                selection.piece.style.left = realPos.x + "px";
            }
        }, piece_movement_interval);
    } else {
        selection.startPos = mouse.boardPos;//didnt move
        selection.endPos = mouse.boardPos;//didnt move
    }
}
function unselectpiece() {
    selection_y_offset = 0;//reset offset
    showacessibletiles(-1, -1);//reset opacity
    clearInterval(selection.interval);//stop moving selected piece
    selection.interval = null;//just to make sure
    if (selection.piece != null) {
        selection.piece.style.zIndex = "" + (selection.endPos.x + selection.endPos.y);//correct z-index
        selection.piece = null;//remove selection
    }
    //if moved
    if (!(selection.startPos.x == selection.endPos.x && selection.startPos.y == selection.endPos.y)) {
        //move the id and type
        board_id[selection.endPos.y][selection.endPos.x] = board_id[selection.startPos.y][selection.startPos.x];
        board_id[selection.startPos.y][selection.startPos.x] = -1;
        board_a[selection.endPos.y][selection.endPos.x] = board_a[selection.startPos.y][selection.startPos.x];
        board_a[selection.startPos.y][selection.startPos.x] = "none";
    }
}
function showacessibletiles(x, y) {
    //get all pieces and tiles
    var tiles = document.getElementsByClassName("tiles");
    var pieces = document.getElementsByClassName("pieces");
    //if reset
    if (x == -1 || y == -1) {
        for (let t = 0; t < tiles.length; t++) { tiles[t].style.opacity = default_tile_opacity; }
        for (let p = 0; p < pieces.length; p++) { pieces[p].style.opacity = default_piece_opacity; }
    } else {
        //make everything transparent
        for (let t = 0; t < tiles.length; t++) { tiles[t].style.opacity = unaccessible_tile_opacity; }
        for (let p = 0; p < pieces.length; p++) { pieces[p].style.opacity = irrelevant_piece_opacity; }
        //get accsesible tiles and pieces in the way
        var actiles = getaccessibletiles(x, y);
        var piecesitw = getpiecesintheway(x, y);
        //set opacity
        document.getElementById(`piece_${board_id[y][x]}`).style.opacity = selected_piece_opacity;
        for (let t = 0; t < actiles.length; t++) { document.getElementById(`tile_${actiles[t][0]}_${actiles[t][1]}`).style.opacity = accessible_tile_opacity; }
        for (let p = 0; p < piecesitw.length; p++) { document.getElementById(`piece_${piecesitw[p]}`).style.opacity = relevant_piece_opacity; }
    }

}
function getaccessibletiles(x, y) {
    var atiles = new Array();
    atiles.push([x, y]);//push position of a piece
    //check left until found the edge of the map
    for (let left = 1; left < boardsize; left++) {
        if (x - left < 0) break; // if out of bounds
        else if (board_a[y][x - left] == "none") { atiles.push([x - left, y]); }  // if tile is accsesible
        else break; // if found edge
    }
    //check right until found the edge of the map
    for (let right = 1; right < boardsize; right++) {
        if (x + right >= boardsize) break; // if out of bounds
        else if (board_a[y][x + right] == "none") { atiles.push([x + right, y]); } // if tile is accsesible
        else break; // if found edge
    }
    //check up until found the edge of the map
    for (let up = 1; up < boardsize; up++) {
        if (y - up < 0) break; // if out of bounds
        else if (board_a[y - up][x] == "none") { atiles.push([x, y - up]); } // if tile is accsesible
        else break; // if found edge
    }
    //check down until found the edge of the map
    for (let down = 1; down < boardsize; down++) {
        if (y + down >= boardsize) break; // if out of bounds
        else if (board_a[y + down][x] == "none") { atiles.push([x, y + down]); } // if tile is accsesible
        else break; // if found edge
    }
    return atiles;
}
function getpiecesintheway(x, y) {
    var piecesitw = new Array();
    //check left until found piece in the way or end of the map
    for (let left = 1; left < boardsize; left++) {
        if (x - left < 0) break; // if out of bounds
        else if (board_a[y][x - left] == "none") continue; // if empty tile
        else { piecesitw.push(board_id[y][x - left]); break; }; // if found piece
    }
    //check right until found piece in the way or end of the map
    for (let right = 1; right < boardsize; right++) {
        if (x + right >= boardsize) break; // if out of bounds
        else if (board_a[y][x + right] == "none") continue; // if empty tile
        else { piecesitw.push(board_id[y][x + right]); break; }; // if found piece
    }
    //check up until found piece in the way or end of the map
    for (let up = 1; up < boardsize; up++) {
        if (y - up < 0) break; // if out of bounds
        else if (board_a[y - up][x] == "none") continue; // if empty tile
        else { piecesitw.push(board_id[y - up][x]); break; }; // if found piece
    }
    //check down until found piece in the way or end of the map
    for (let down = 1; down < boardsize; down++) {
        if (y + down >= boardsize) break; // if out of bounds
        else if (board_a[y + down][x] == "none") continue; // if empty tile
        else { piecesitw.push(board_id[y + down][x]); break; }; // if found piece
    }
    return piecesitw;
}