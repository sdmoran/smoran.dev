
//The current board state
var board = [["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""],
			 ["", "", "", "", "", "", ""]];


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


function detectWin() {
	//Check horizontal

	for(var i = 0; i < board.length; i++) {
		count = 0;
		symbol = '';
		for(var j = 0; j < board[0].length; j++) {
			var cell = document.getElementById("" + i + j);
			//console.log(cell);
			//console.log("CLASSNAME" + cell.className);
			if(cell.className !== '') {
				console.log(cell.className);
				if(cell.className === symbol) {
					count += 1;
					console.log(count);
					if(count == 4) {
						console.log("4 in a row!!!!!");
						return true;
					}
				}
				else {
					count = 1;
					symbol = cell.className;
				}
			}
		}
	}
	return false;
}

//Adds a piece to the board representing the player's move.
function play(column, player) {
	console.log(column);
	if(column > board[0].length) {
		console.log("Illegal move!");
		return false;
	}

	for(var i = board.length - 1; i >= 0; i--) {
		if(board[i][column] === "") {
			board[i][column] = player;
			console.log("Made move!");
			var cell = document.getElementById("" + i + column);
			if(cell !== null) {
				if(player === 1) {
					cell.className = "player";
					console.log(valid());
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
	alert("winner!!");
}

//Resets game
function reset() {
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
	var table = document.getElementById("tab");
	for(var j = 0; j < 6; j++) {
		var row = table.insertRow(-1);
		row.id = j;
		for(var i = 0; i < 7; i++) {
			var cell = row.insertCell();
			cell.id = "" + j + i;
			cell.innerHTML = board[j][i];
		}	
	}

	var t = document.getElementById("bt");
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
				console.log("win!!");
				displayWin();
				// buttonrow.remove();
				// buttonrow = table.insertRow(-1);
				btn = document.createElement('input');
				const j = i;
				btn.type = "button";
				btn.id = "reset";
				btn.value = "RESET";
				var div = document.getElementById("table");
				div.appendChild(btn);
				btn.addEventListener("click", function() {
					reset();
				});
			}

		});
		cell.appendChild(btn);
	}
}

initialize();