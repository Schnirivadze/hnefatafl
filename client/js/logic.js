
function removepiece(x, y) {
    document.getElementById(`piece_${board_id[y][x]}`).remove();// remove from existence
    board_id[y][x] = -1;//remove id
    //update score
    if (ishostile(x, y)) friendly_taken_pieces++;
    else hostile_taken_pieces++;

    board_a[y][x] = "none";//remove class
    updatetakenpieces();
}
function isfriendly(x, y) {
    if (side == "defender") return board_a[y][x] == "defender" || board_a[y][x] == "king";
    else return board_a[y][x] == "attacker";
}
function ishostile(x, y) {
    if (side == "defender") return board_a[y][x] == "attacker";
    else return board_a[y][x] == "attacker" || board_a[y][x] == "king";
}
function isinbounds(p) {
    return p < boardsize && p >= 0;
}

function getaccessibletiles(x, y) {
    var atiles = new Array();
    atiles.push([x, y]);// push position of a piece
    // check left until found the edge of the map
    for (let left = 1; left < boardsize; left++) {
        if (x - left < 0) break; // if out of bounds
        else if (board_a[y][x - left] == "none") { atiles.push([x - left, y]); }  // if tile is accsesible
        else break; // if found edge
    }
    // check right until found the edge of the map
    for (let right = 1; right < boardsize; right++) {
        if (x + right >= boardsize) break; // if out of bounds
        else if (board_a[y][x + right] == "none") { atiles.push([x + right, y]); } // if tile is accsesible
        else break; // if found edge
    }
    // check up until found the edge of the map
    for (let up = 1; up < boardsize; up++) {
        if (y - up < 0) break; // if out of bounds
        else if (board_a[y - up][x] == "none") { atiles.push([x, y - up]); } // if tile is accsesible
        else break; // if found edge
    }
    // check down until found the edge of the map
    for (let down = 1; down < boardsize; down++) {
        if (y + down >= boardsize) break; // if out of bounds
        else if (board_a[y + down][x] == "none") { atiles.push([x, y + down]); } // if tile is accsesible
        else break; // if found edge
    }
    return atiles;
}
function getpiecesintheway(x, y) {
    var piecesitw = new Array();
    // check left until found piece in the way or end of the map
    for (let left = 1; left < boardsize; left++) {
        if (x - left < 0) break; // if out of bounds
        else if (board_a[y][x - left] == "none") continue; // if empty tile
        else { piecesitw.push(board_id[y][x - left]); break; }; // if found piece
    }
    // check right until found piece in the way or end of the map
    for (let right = 1; right < boardsize; right++) {
        if (x + right >= boardsize) break; // if out of bounds
        else if (board_a[y][x + right] == "none") continue; // if empty tile
        else { piecesitw.push(board_id[y][x + right]); break; }; // if found piece
    }
    // check up until found piece in the way or end of the map
    for (let up = 1; up < boardsize; up++) {
        if (y - up < 0) break; // if out of bounds
        else if (board_a[y - up][x] == "none") continue; // if empty tile
        else { piecesitw.push(board_id[y - up][x]); break; }; // if found piece
    }
    // check down until found piece in the way or end of the map
    for (let down = 1; down < boardsize; down++) {
        if (y + down >= boardsize) break; // if out of bounds
        else if (board_a[y + down][x] == "none") continue; // if empty tile
        else { piecesitw.push(board_id[y + down][x]); break; }; // if found piece
    }
    return piecesitw;
}