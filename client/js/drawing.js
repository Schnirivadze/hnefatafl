// size
var pixel_boardsize = window.innerWidth * 0.6;
var boardsize = 11;
let board_a = new Array(boardsize);// array of pieces`s types
for (let l = 0; l < board_a.length; l++) { board_a[l] = new Array(boardsize); }
for (let y = 0; y < board_a.length; y++) { for (let x = 0; x < boardsize; x++) { board_a[y][x] = "none"; } }
let board_id = new Array(boardsize);// map with ids of pieces
for (let l = 0; l < board_id.length; l++) { board_id[l] = new Array(boardsize); }
for (let y = 0; y < board_id.length; y++) { for (let x = 0; x < boardsize; x++) { board_id[y][x] = -1; } }
var tilewidth = pixel_boardsize / boardsize;
var tileheight = pixel_boardsize / boardsize;
var piecewidth = tilewidth * 0.75;
var pieceheight = piecewidth / 608 * 1080;
// selection
var side = "defender";// or "attacker"
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
// offset
var overall_x_offset = (window.innerWidth - boardsize * tilewidth) / 2;
var overall_y_offset = (window.innerHeight - boardsize * tileheight / 2) / 2 - 0;
var piece_x_offset = 12 + overall_x_offset;
var piece_y_offset = overall_y_offset - (pieceheight/3*2);
var board_x_offset = 0 + overall_x_offset;
var board_y_offset = 0 + overall_y_offset;
var selection_y_offset = 0;
// opacity
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
// other
var piece_movement_interval = 50;
// logic
var friendly_taken_pieces = 0;
var hostile_taken_pieces = 0;

function drawboard() {
    let container = document.getElementById("board");// get container
    container.innerHTML = "";// clear it
    for (let y = 0; y < boardsize; y++) {
        for (let x = 0; x < boardsize; x++) {
            var realPos = getrealposition(x, y, board_x_offset, board_y_offset);// get top and left of piece image tag

            // get tile type 
            var tile_type = "default";
            if ((y == 5 && x <= 7 && x >= 3) || (x == 5 && y <= 7 && y >= 3) || (y >= 4 && x >= 4 && y <= 6 && x <= 6)) tile_type = "red";
            if ((y == x || x + y == boardsize - 1) && (y == boardsize - 1 || y == 0 || y == 5)) tile_type = "white";
            if (((x == 0 || x == 10) && (y >= 3 && y <= 7)) || ((y == 0 || y == 10) && (x >= 3 && x <= 7)) || ((x == 9 || x == 1) && y == 5) || ((y == 9 || y == 1) && x == 5)) tile_type = "blue";

            // add piece to container
            container.innerHTML += `<img id = "tile_${x}_${y}" class="tiles" src="./media/tile_${tile_type}.png" style="width: ${tilewidth}px;position: absolute;top: ${realPos.y}px;left: ${realPos.x}px;" alt="${x}|${y}">`;
        }
    }
}
function drawpieces() {
    let container = document.getElementById("pieces");// get container
    container.innerHTML = "";// clear it
    var piecenumber = 0;// set counter
    for (let y = 0; y < boardsize; y++) {
        for (let x = 0; x < boardsize; x++) {
            var realPos = getrealposition(x, y, piece_x_offset, piece_y_offset);// get top and left of piece image tag

            // get piece type 
            var piece_type = "none";
            if ((y == 5 && x <= 7 && x >= 3) || (x == 5 && y <= 7 && y >= 3) || (y >= 4 && x >= 4 && y <= 6 && x <= 6)) piece_type = "defender";
            if (y == x && y == 5) piece_type = "king";
            if (((x == 0 || x == 10) && (y >= 3 && y <= 7)) || ((y == 0 || y == 10) && (x >= 3 && x <= 7)) || ((x == 9 || x == 1) && y == 5) || ((y == 9 || y == 1) && x == 5)) piece_type = "attacker";

            // update maps
            board_a[y][x] = piece_type;
            if (piece_type == "none") { board_id[y][x] = -1; continue; } // if there shouldnt be any piece
            board_id[y][x] = piecenumber;

            // get if piece friendly (for hover class)
            var isfriendly = (side == piece_type) || (side == "defender" && piece_type == "king");

            // add piece to container
            container.innerHTML += `<img class="pieces ${(isfriendly) ? 'friendly_piece' : ''} ${piece_type}" id="piece_${piecenumber}" onmousedown ="selectpiece('piece_${piecenumber}',event)" src="./media/${piece_type}.png" style="opacity:0;z-index: ${x + y};width: ${piecewidth}px;position: absolute;top: ${realPos.y}px;left: ${realPos.x}px;" alt="${x}|${y}">`;
            piecenumber++;// increment the counter
        }
    }
}
function animatepieces() {
    // reveal king in king_reveal_timeout ms
    var king = document.getElementsByClassName("king")[0];
    setTimeout(function () {
        king.style.opacity = "1"
    }, king_reveal_timeout)

    // reveal all defenders in defenders_reveal_timeout ms
    var defenders = document.getElementsByClassName("defender");
    for (let d = 0; d < defenders.length; d++) {
        setTimeout(function () {
            defenders[d].style.opacity = "1";
        }, defenders_reveal_timeout)
    }
    if (side == "defender") {
        setTimeout(function () {
            document.getElementById("player_info").style.top = "calc(100vh - 20vw / 4)"
        }, defenders_reveal_timeout)
    } else {
        setTimeout(function () {
            document.getElementById("enemy_info").style.top = "0px"
        }, defenders_reveal_timeout)
    }


    // reveal all attackers in attackers_reveal_timeout ms
    var attackers = document.getElementsByClassName("attacker");
    for (let a = 0; a < attackers.length; a++) {
        setTimeout(function () {
            attackers[a].style.opacity = "1";
        }, attackers_reveal_timeout)
    }
    if (side == "attacker") {
        setTimeout(function () {
            document.getElementById("player_info").style.top = "calc(100vh - 20vw / 4)"
        }, attackers_reveal_timeout)
    } else {
        setTimeout(function () {
            document.getElementById("enemy_info").style.top = "0px"
        }, attackers_reveal_timeout)
    }
}
function selectpiece(id, event) {
    selection.piece = document.getElementById(id);// set selection
    updateMousePosition(event);// update mouse position
    selection_y_offset = pieceheight - (mouse.pos.y - (selection.piece.style.top.slice(0, selection.piece.style.top.length - 2) - 0)) - pieceheight / 8;
    updateMousePosition(event);// update mouse position
    var isattaker = board_a[mouse.boardPos.y][mouse.boardPos.x] == "attacker";
    if ((isattaker && side == "attacker") || (!isattaker && side == "defender")) {

        selection.piece.style.zIndex = "" + Number.MAX_SAFE_INTEGER;// set Zindex to max
        selection.startPos = mouse.boardPos;// lock start position
        var atiles = getaccessibletiles(selection.startPos.x, selection.startPos.y);// get list of accsesible tiles
        showacessibletiles(selection.startPos.x, selection.startPos.y);// visualise allowed moves

        // set position every piece_movement_interval ms
        selection.interval = setInterval(function () {
            // if move is allowed
            if (atiles.some(item => item[0] === mouse.boardPos.x && item[1] === mouse.boardPos.y)) {
                selection.endPos = mouse.boardPos;// update end position

                // set top and left of piece image tag
                var realPos = getrealposition(selection.endPos.x, selection.endPos.y, piece_x_offset, piece_y_offset);
                selection.piece.style.top = realPos.y + "px";
                selection.piece.style.left = realPos.x + "px";
            }
        }, piece_movement_interval);
    } else {
        selection.startPos = mouse.boardPos;// didnt move
        selection.endPos = mouse.boardPos;// didnt move
    }
}
function unselectpiece() {
    selection_y_offset = 0;// reset offset
    showacessibletiles(-1, -1);// reset opacity
    clearInterval(selection.interval);// stop moving selected piece
    selection.interval = null;// just to make sure
    if (selection.piece != null) {
        selection.piece.style.zIndex = "" + (selection.endPos.x + selection.endPos.y);// correct z-index
        selection.piece = null;// remove selection
    }
    // if moved
    if (!(selection.startPos.x == selection.endPos.x && selection.startPos.y == selection.endPos.y)) {
        // move the id and type
        board_id[selection.endPos.y][selection.endPos.x] = board_id[selection.startPos.y][selection.startPos.x];
        board_id[selection.startPos.y][selection.startPos.x] = -1;
        board_a[selection.endPos.y][selection.endPos.x] = board_a[selection.startPos.y][selection.startPos.x];
        board_a[selection.startPos.y][selection.startPos.x] = "none";
        // analyse movement
        // check if there enemys around and how much
        var enemys = [];
        for (let y = selection.endPos.y - 1; y <= selection.endPos.y + 1; y++) {
            if (y < 11 && y >= 0) {
                for (let x = selection.endPos.x - 1; x <= selection.endPos.x + 1; x++) {
                    if (isinbounds(x) && isinbounds(y) && ishostile(x, y)) {
                        enemys.push({ x: x, y: y });
                    }
                }
            }
        }
        //if there enemies near
        if (enemys.length > 0) {
            var you_should_be_dead = false;// HAHAHAHAHAHAHAHAHAHAHA DIE!!!
            // you were pressed to the wall on the left
            if (!isinbounds(selection.endPos.x - 1)) {// if left is out of bounds
                if (ishostile(selection.endPos.x + 1, selection.endPos.y)) {// if piece on the right is hostile
                    you_should_be_dead = true;
                }
            }
            // you were pressed to the wall on the right
            if (!isinbounds(selection.endPos.x + 1)) {// if right is out of bounds
                if (ishostile(selection.endPos.x - 1, selection.endPos.y)) {// if piece on the left is hostile
                    you_should_be_dead = true;
                }
            }
            // you were sandwiched on x-axis
            if (isinbounds(selection.endPos.x + 1) && isinbounds(selection.endPos.x - 1) && ishostile(selection.endPos.x - 1, selection.endPos.y) && ishostile(selection.endPos.x + 1, selection.endPos.y)) {
                you_should_be_dead = true;
            }
            // you were pressed to the wall on top
            if (!isinbounds(selection.endPos.y - 1)) {// if top is out of bounds
                if (ishostile(selection.endPos.x, selection.endPos.y + 1)) {// if piece on the bottom is hostile
                    you_should_be_dead = true;
                }
            }
            // you were pressed to the wall on top
            if (!isinbounds(selection.endPos.y + 1)) {// if bottom is out of bounds
                if (ishostile(selection.endPos.x, selection.endPos.y - 1)) {// if piece on the top is hostile
                    you_should_be_dead = true;
                }
            }
            // you were sandwiched on y-axis
            if (isinbounds(selection.endPos.y + 1) && isinbounds(selection.endPos.y - 1) && ishostile(selection.endPos.x, selection.endPos.y - 1) && ishostile(selection.endPos.x, selection.endPos.y + 1)) {
                you_should_be_dead = true;
            }
            if (you_should_be_dead) {
                removepiece(selection.endPos.x, selection.endPos.y);
            }
            else {
                // check if enemys are sandwitched
                enemys.forEach(enemy => {
                    if (Math.abs(selection.endPos.x - enemy.x) != Math.abs(selection.endPos.y - enemy.y)) {
                        var tocheck = {
                            x: selection.endPos.x + (enemy.x - selection.endPos.x) * 2,
                            y: selection.endPos.y + (enemy.y - selection.endPos.y) * 2
                        };
                        if (!isinbounds(tocheck.x) || !isinbounds(tocheck.y)) removepiece(enemy.x, enemy.y); // pressed to the wall
                        else if (isfriendly(tocheck.x, tocheck.y)) removepiece(enemy.x, enemy.y); // sandwiched
                    }
                });
            }

        }
    }
}
function showacessibletiles(x, y) {
    // get all pieces and tiles
    var tiles = document.getElementsByClassName("tiles");
    var pieces = document.getElementsByClassName("pieces");
    // if reset
    if (x == -1 || y == -1) {
        for (let t = 0; t < tiles.length; t++) { tiles[t].style.opacity = default_tile_opacity; }
        for (let p = 0; p < pieces.length; p++) { pieces[p].style.opacity = default_piece_opacity; }
    } else {
        // make everything transparent
        for (let t = 0; t < tiles.length; t++) { tiles[t].style.opacity = unaccessible_tile_opacity; }
        for (let p = 0; p < pieces.length; p++) { pieces[p].style.opacity = irrelevant_piece_opacity; }
        // get accsesible tiles and pieces in the way
        var actiles = getaccessibletiles(x, y);
        var piecesitw = getpiecesintheway(x, y);
        // set opacity
        document.getElementById(`piece_${board_id[y][x]}`).style.opacity = selected_piece_opacity;
        for (let t = 0; t < actiles.length; t++) { document.getElementById(`tile_${actiles[t][0]}_${actiles[t][1]}`).style.opacity = accessible_tile_opacity; }
        for (let p = 0; p < piecesitw.length; p++) { document.getElementById(`piece_${piecesitw[p]}`).style.opacity = relevant_piece_opacity; }
    }

}
function updatesides() {
    if (side == "defender") {
        var fr = document.getElementById("player_info");
        var childrenF = fr.children;
        for (let c = 0; c < childrenF.length; c++) {
            if (childrenF[c].tagName == "line" || childrenF[c].tagName == "path") childrenF[c].classList = "redoutline";
        }
        var en = document.getElementById("enemy_info");
        var childrenE = en.children;
        for (let c = 0; c < childrenE.length; c++) {
            if (childrenE[c].tagName == "line" || childrenE[c].tagName == "path") childrenE[c].classList = "blueoutline";
        }
    } else {
        var fr = document.getElementById("player_info");
        var childrenF = fr.children;
        for (let c = 0; c < childrenF.length; c++) {
            if (childrenF[c].tagName == "line" || childrenF[c].tagName == "path") childrenF[c].classList = "blueoutline";
        }
        var en = document.getElementById("enemy_info");
        var childrenE = en.children;
        for (let c = 0; c < childrenE.length; c++) {
            if (childrenE[c].tagName == "line" || childrenE[c].tagName == "path") childrenE[c].classList = "redoutline";
        }
    }
}
function updatetakenpieces() {
    var step = 0;
    if (side == "attacker") {
        var fr = document.getElementById("player_info_pieces_container");
        fr.innerHTML = "";
        if (friendly_taken_pieces > 12) friendly_taken_pieces = 12
        for (let i = 0; i < friendly_taken_pieces; i++) {
            fr.innerHTML += `<image href="./media/defender.png" width="35" height="35" x="${90 + 15 * i}" y ="15"></image>`
        }
        var en = document.getElementById("enemy_info_pieces_container");
        en.innerHTML = "";
        step = 15;
        if (hostile_taken_pieces > 13) step = 195 / hostile_taken_pieces
        for (let i = 0; i < hostile_taken_pieces; i++) {
            en.innerHTML += ` <image href="./media/attacker.png" width="35" height="35" x="${280 - step * i}" y ="50"></image>`
        }
    } else {
        var fr = document.getElementById("player_info_pieces_container");
        fr.innerHTML = "";
        step = 15;
        if (friendly_taken_pieces > 13) step = 195 / friendly_taken_pieces
        for (let i = 0; i < friendly_taken_pieces; i++) {
            fr.innerHTML += `<image href="./media/attacker.png" width="35" height="35" x="${90 + step * i}" y ="15"></image>`
        }
        var en = document.getElementById("enemy_info_pieces_container");
        en.innerHTML = "";
        if (hostile_taken_pieces > 12) hostile_taken_pieces = 12
        for (let i = 0; i < hostile_taken_pieces; i++) {
            en.innerHTML += ` <image href="./media/defender.png" width="35" height="35" x="${280 - 15 * i}" y ="50"></image>`
        }
    }
}