
//The current board state
var board = [["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""]];

var totalmoves = 0;

var won = false;
var displayed = false;
//Prints the board to console.
function printboard(board) {
	var height = board.length;
	var width = board[0].length;
	for(var i = 0; i < height; i++) {
		var line = "";
		for(var j = 0; j < width; j++) {
			line += board[i][j];
		}
		console.log(line);
	}
}

function is_any_line_at(x, y) {
	return (isLineAt(x, y, 1, 0) ||
            isLineAt(x, y, 0, 1) ||
           	isLineAt(x, y, 1, 1) ||
            isLineAt(x, y, 1, -1));
}


function detectWin() {
	//Check horizontal
	if(totalmoves >= 34) {
		return true;
	}
	for(var i = 0; i < board.length; i++) {
		for(var j = 0; j < board[0].length; j++) {
			if(is_any_line_at(i, j)) {
				won = true;
				return true;
			}
		}
	}
	printboard(board);
	return false;
}

function isLineAt(x, y, dx, dy) {
	 if ((x + 3 * dx >= 6) ||
            (y + 3 * dy < 0) || (y + 3 * dy >= 7)) {
            return false;
    }
    var t = board[x][y];
    if(t === "") {
    	return false;
    }
	for(var i = 0; i < 4; i++) {
		var totdx = i * dx;
		var totdy = i * dy;
		if(board[x + totdx][y + totdy] !== t) {
			return false;
		}
	}
	return true;
}

	//Adds a piece to the board representing the player's move.
function play(column, player) {
	if(!won) {
		totalmoves += 1;
		console.log("Count: " + totalmoves);
		if(column > board[0].length) {
			console.log("Illegal move!");
			return false;
		}

		for(var i = board.length - 1; i >= 0; i--) {
			if(board[i][column] === "") {
				board[i][column] = player;
				var cell = document.getElementById("" + i + column);
				if(cell !== null) {
					if(player === 1) {
						cell.className = "player";
					}
					else {
						cell.className = "cpu";
					}
				}
				return true;
			}
		}
		console.log("Illegal move!");
		return false;
	}
}

//Returns an array of valid playable columns.
function valid() {
	var cols = [];
	for(var i = 0; i < board[0].length; i++) {
		for(var j = board.length - 1; j >= 0; j--) {
			if(board[j][i] === "") {
				cols.push(i);
				//If there is at least 1 free space, column is valid and we can go to next. 
				break;
			}
		}
	}
	return cols;
}

function displayWin() {
	if(!displayed) {
		displayed = true;
		alert("winner!!");
	}
}

//Resets game
function reset() {
	totalmoves = 0;
	won = false;
	displayed = false;
	board = [["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""]];
	for(var i = 0; i < board.length; i++) {
		for(var j = 0; j < board[0].length; j++) {
			var cell = document.getElementById("" + i + j);
			cell.className = "";
		}
	}
	var btn = document.getElementById("reset");
	btn.remove();
}

function initialize() {
	var tdiv = document.createElement('div');
	tdiv.align = "center";
	var table = document.createElement('table');
	table.align = "center";
	for(var j = 0; j < 6; j++) {
		var row = table.insertRow(-1);
		row.id = j;
		for(var i = 0; i < 7; i++) {
			var cell = row.insertCell();
			cell.id = "" + j + i;
			cell.innerHTML = board[j][i];
		}	
	}
	var buttonrow = table.insertRow(-1);
	for(var i = 0; i < 7; i++) {
		var cell = buttonrow.insertCell();
		var btn = document.createElement('input');
		const j = i;
		btn.type = "button";
		btn.className = "btn";
		btn.value = "-x-";
		btn.addEventListener("click", function() {
			play(j, 1);
			play(Math.floor(Math.random() * 7), 2);
			if(detectWin()) {
				displayWin();
				var resetbtn = document.getElementById("reset");
				if(!resetbtn) {
					btn = document.createElement('input');
					const j = i;
					btn.type = "button";
					btn.id = "reset";
					btn.value = "RESET";
					btn.align = "center";
					tdiv.appendChild(btn);
					btn.addEventListener("click", function() {
						reset();
					});
				}
			}

		});
		cell.appendChild(btn);
	}
	tdiv.appendChild(table);
	document.body.appendChild(tdiv);
}

initialize();