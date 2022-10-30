class BoardState {
	constructor(piecesList) {
		this.piecesList = piecesList;
		let zeroArray = [0, 0, 0, 0, 0, 0, 0, 0];
		this.board = [];
		for (let i = 0; i < 8; i++) {
			this.board.push([zeroArray]);
		}
		for (let i = 0; i < piecesList.length; i++) {
			let location = [piecesList[i].location[0], piecesList[i].location[1]];
			this.board[location[0]][location[1]] = piecesList[i];
		}
	}

	Evaluate() {
		let evaluation = 0;

		//defines how important each square on the board is
		let squareValueArray = [];
		let centreArray = [0, 0.05, 0.1, 0.15, 0.15, 0.1, 0.05, 0];
		for (let i = 0; i < 8; i++) {
			let thisColumn = centreArray.map(function (num) {
				return Math.round((num + (-1 * ((1 / 75) * i ** 2) + (7 / 75) * i)) * 100) / 100;
			});
			squareValueArray.push(thisColumn);
		}

		for (let i = 0; i < this.piecesList.length; i++) {
			let piece = this.piecesList[i];
			evaluation += piece.value * 10;
			if (piece.name.includes("pawn")) {
				if (piece.colour == "red") {
					evaluation += piece.location[1] * 0.05;
					evaluation += Math.round((-1 * ((1 / 75) * piece.location[0] ** 2) + (7 / 75) * piece.location[0]) * 100) / 100;
				} else {
					evaluation -= (7 - piece.location[1]) * 0.05;
					evaluation -= Math.round((-1 * ((1 / 75) * piece.location[0] ** 2) + (7 / 75) * piece.location[0]) * 100) / 100;
				}
			} else {
				let controlledSquares = piece.LegalMoves(this.board);
				let magnitude = 0;
				for (let i = 0; i < controlledSquares.length; i++) {
					magnitude += squareValueArray[controlledSquares[i][0]][controlledSquares[i][1]];
				}
				magnitude *= 0.1;
				if (piece.colour == "red") {
					if (piece.name.includes("king") && this.piecesList.length > 8) {
						evaluation -= magnitude;
					} else {
						evaluation += magnitude;
					}
				} else {
					if (piece.name.includes("king") && this.piecesList.length > 8) {
						evaluation += magnitude;
					}
					else {
					evaluation -= magnitude;
					}
				}
			}
		}
		evaluation += (Math.random()-0.5)*0.1
		return evaluation;
	}

	ListToDraw() {
		let listToDraw = [];
		for (let i = 0; i < this.piecesList.length; i++) {
			let pieceDrawList = this.piecesList[i].ListToDraw();
			listToDraw.push(pieceDrawList);
		}
		return listToDraw;
	}
}

function IsZero(thing) {
	if (thing == null || thing == undefined || thing == 0) {
		return true;
	}
	return false;
}

class Piece {
	constructor(location, colour, name) {
		this.location = location;
		this.colour = colour;
		this.name = name;
	}

	DefineDrawOrigin() {
		return [this.location[0] * 10, -10 * (this.location[1] - 7)];
	}

	MoveTo(destination) {
		this.location = destination;
	}
}

class Pawn extends Piece {
	constructor(location, colour, name, moved) {
		super(location, colour, name);
		this.moved = moved;
		if (this.colour == "red") {
			this.value = 1;
		} else {
			this.value = -1;
		}
	}

	ListToDraw() {
		this.origin = this.DefineDrawOrigin();
		let listToDraw = [
			[2, 9],
			[2, 8],
			[3, 9],
			[3, 8],
			[3, 7],
			[3, 5],
			[3, 4],
			[4, 9],
			[4, 8],
			[4, 7],
			[4, 6],
			[4, 5],
			[4, 4],
			[4, 3],
		];
		let reflection = [];
		for (let i = 0; i < listToDraw.length; i++) {
			reflection.push([9 - listToDraw[i][0], listToDraw[i][1]]);
		}
		for (let i = 0; i < reflection.length; i++) {
			listToDraw.push(reflection[i]);
		}
		for (let i = 0; i < listToDraw.length; i++) {
			listToDraw[i][0] += this.origin[0];
			listToDraw[i][1] += this.origin[1];
		}
		return listToDraw;
	}

	LegalMoves(board) {
		let xPosition = this.location[0];
		let yPosition = this.location[1];
		let listOfMoves = [];
		if (this.colour == "red") {
			//red forward 1
			if (yPosition < 7) {
				if (IsZero(board[xPosition][yPosition + 1])) {
					listOfMoves.push([xPosition, yPosition + 1]);
				}
				//red diagonal left
				if (xPosition != 0) {
					if (!IsZero(board[xPosition - 1][yPosition + 1])) {
						if (board[xPosition - 1][yPosition + 1].colour == "blue") {
							listOfMoves.push([xPosition - 1, yPosition + 1]);
						}
					}
				}
				//red diagonal right
				if (xPosition != 7) {
					if (!IsZero(board[xPosition + 1][yPosition + 1])) {
						if (board[xPosition + 1][yPosition + 1].colour == "blue") {
							listOfMoves.push([xPosition + 1, yPosition + 1]);
						}
					}
				}
				//red forward 2
				if (this.moved == false) {
					if (IsZero(board[xPosition][yPosition + 2]) && IsZero(board[xPosition][yPosition + 1])) {
						listOfMoves.push([xPosition, yPosition + 2]);
					}
				}
			}
		} else {
			if (yPosition > 0) {
				//blue forward 1
				if (IsZero(board[xPosition][yPosition - 1])) {
					listOfMoves.push([xPosition, yPosition - 1]);
				}
				//blue diagonal left
				if (xPosition != 0) {
					if (!IsZero(board[xPosition - 1][yPosition - 1])) {
						if (board[xPosition - 1][yPosition - 1].colour == "red") {
							listOfMoves.push([xPosition - 1, yPosition - 1]);
						}
					}
				}
				//blue diagonal right
				if (xPosition != 7) {
					if (!IsZero(board[xPosition + 1][yPosition - 1])) {
						if (board[xPosition + 1][yPosition - 1].colour == "red") {
							listOfMoves.push([xPosition + 1, yPosition - 1]);
						}
					}
				}
				//blue forward 2
				if (this.moved == false) {
					if (IsZero(board[xPosition][yPosition - 2]) && IsZero(board[xPosition][yPosition - 1])) {
						listOfMoves.push([xPosition, yPosition - 2]);
					}
				}
			}
		}
		return listOfMoves;
	}
}

class Bishop extends Piece {
	constructor(location, colour, name) {
		super(location, colour, name);
		if (this.colour == "red") {
			this.value = 3;
		} else {
			this.value = -3;
		}
	}

	ListToDraw() {
		this.origin = this.DefineDrawOrigin();
		let listToDraw = [
			[2, 9],
			[2, 8],
			[3, 9],
			[3, 8],
			[3, 7],
			[3, 5],
			[3, 4],
			[3, 3],
			[4, 9],
			[4, 8],
			[4, 7],
			[4, 6],
			[4, 5],
			[4, 4],
		];
		let reflection = [];
		for (let i = 0; i < listToDraw.length; i++) {
			reflection.push([9 - listToDraw[i][0], listToDraw[i][1]]);
		}
		for (let i = 0; i < reflection.length; i++) {
			listToDraw.push(reflection[i]);
		}
		listToDraw.push([4, 3]);
		listToDraw.push([4, 2]);
		listToDraw.push([4, 1]);
		listToDraw.push([3, 2]);
		for (let i = 0; i < listToDraw.length; i++) {
			listToDraw[i][0] += this.origin[0];
			listToDraw[i][1] += this.origin[1];
		}
		return listToDraw;
	}

	LegalMoves(board) {
		let xPosition = this.location[0];
		let yPosition = this.location[1];
		let listOfMoves = [];
		//up right
		for (let [x, y] = [xPosition + 1, yPosition + 1]; x < 8 && y < 8; [x++, y++]) {
			if (IsZero(board[x][y])) {
				listOfMoves.push([x, y]);
			} else if (board[x][y].colour != this.colour) {
				listOfMoves.push([x, y]);
				break;
			} else {
				break;
			}
		}
		//up left
		for (let [x, y] = [xPosition - 1, yPosition + 1]; x >= 0 && y < 8; [x--, y++]) {
			if (IsZero(board[x][y])) {
				listOfMoves.push([x, y]);
			} else if (board[x][y].colour != this.colour) {
				listOfMoves.push([x, y]);
				break;
			} else {
				break;
			}
		}
		//down right
		for (let [x, y] = [xPosition + 1, yPosition - 1]; x < 8 && y >= 0; [x++, y--]) {
			if (IsZero(board[x][y])) {
				listOfMoves.push([x, y]);
			} else if (board[x][y].colour != this.colour) {
				listOfMoves.push([x, y]);
				break;
			} else {
				break;
			}
		}
		//down left
		for (let [x, y] = [xPosition - 1, yPosition - 1]; x >= 0 && y >= 0; [x--, y--]) {
			if (IsZero(board[x][y])) {
				listOfMoves.push([x, y]);
			} else if (board[x][y].colour != this.colour) {
				listOfMoves.push([x, y]);
				break;
			} else {
				break;
			}
		}
		return listOfMoves;
	}
}

class Knight extends Piece {
	constructor(location, colour, name) {
		super(location, colour, name);
		if (this.colour == "red") {
			this.value = 3;
		} else {
			this.value = -3;
		}
	}

	ListToDraw() {
		this.origin = this.DefineDrawOrigin();
		let listToDraw = [
			[2, 9],
			[2, 8],
			[2, 3],
			[2, 4],
			[3, 9],
			[3, 8],
			[3, 7],
			[3, 6],
			[3, 4],
			[3, 3],
			[3, 2],
			[4, 9],
			[4, 8],
			[4, 7],
			[4, 6],
			[4, 5],
			[4, 3],
			[4, 2],
			[4, 1],
		];
		let reflection = [];
		for (let i = 0; i < listToDraw.length; i++) {
			reflection.push([9 - listToDraw[i][0], listToDraw[i][1]]);
		}
		for (let i = 0; i < reflection.length; i++) {
			listToDraw.push(reflection[i]);
		}
		listToDraw.push([5, 4]);
		listToDraw.push([6, 5]);
		listToDraw.push([6, 1]);
		listToDraw.push([7, 7]);
		listToDraw.push([7, 6]);
		listToDraw.push([7, 2]);
		for (let i = 0; i < listToDraw.length; i++) {
			listToDraw[i][0] += this.origin[0];
			listToDraw[i][1] += this.origin[1];
		}
		return listToDraw;
	}

	LegalMoves(board) {
		let xPosition = this.location[0];
		let yPosition = this.location[1];
		let listOfMoves = [];
		//up right
		if (xPosition <= 6 && yPosition <= 5) {
			if (IsZero(board[xPosition + 1][yPosition + 2])) {
				listOfMoves.push([xPosition + 1, yPosition + 2]);
			} else if (board[xPosition + 1][yPosition + 2].colour !== this.colour) {
				listOfMoves.push([xPosition + 1, yPosition + 2]);
			}
		}
		// right up
		if (xPosition <= 5 && yPosition <= 6) {
			if (IsZero(board[xPosition + 2][yPosition + 1])) {
				listOfMoves.push([xPosition + 2, yPosition + 1]);
			} else if (board[xPosition + 2][yPosition + 1].colour !== this.colour) {
				listOfMoves.push([xPosition + 2, yPosition + 1]);
			}
		}
		// right down
		if (xPosition <= 5 && yPosition >= 1) {
			if (IsZero(board[xPosition + 2][yPosition - 1])) {
				listOfMoves.push([xPosition + 2, yPosition - 1]);
			} else if (board[xPosition + 2][yPosition - 1].colour !== this.colour) {
				listOfMoves.push([xPosition + 2, yPosition - 1]);
			}
		}
		// down right
		if (xPosition <= 6 && yPosition >= 2) {
			if (IsZero(board[xPosition + 1][yPosition - 2])) {
				listOfMoves.push([xPosition + 1, yPosition - 2]);
			} else if (board[xPosition + 1][yPosition - 2].colour !== this.colour) {
				listOfMoves.push([xPosition + 1, yPosition - 2]);
			}
		}
		// down left
		if (xPosition >= 1 && yPosition >= 2) {
			if (IsZero(board[xPosition - 1][yPosition - 2])) {
				listOfMoves.push([xPosition - 1, yPosition - 2]);
			} else if (board[xPosition - 1][yPosition - 2].colour !== this.colour) {
				listOfMoves.push([xPosition - 1, yPosition - 2]);
			}
		}
		// left down
		if (xPosition >= 2 && yPosition >= 1) {
			if (IsZero(board[xPosition - 2][yPosition - 1])) {
				listOfMoves.push([xPosition - 2, yPosition - 1]);
			} else if (board[xPosition - 2][yPosition - 1].colour !== this.colour) {
				listOfMoves.push([xPosition - 2, yPosition - 1]);
			}
		}
		// left up
		if (xPosition >= 2 && yPosition <= 6) {
			if (IsZero(board[xPosition - 2][yPosition + 1])) {
				listOfMoves.push([xPosition - 2, yPosition + 1]);
			} else if (board[xPosition - 2][yPosition + 1].colour !== this.colour) {
				listOfMoves.push([xPosition - 2, yPosition + 1]);
			}
		}
		// up left
		if (xPosition >= 1 && yPosition <= 5) {
			if (IsZero(board[xPosition - 1][yPosition + 2])) {
				listOfMoves.push([xPosition - 1, yPosition + 2]);
			} else if (board[xPosition - 1][yPosition + 2].colour !== this.colour) {
				listOfMoves.push([xPosition - 1, yPosition + 2]);
			}
		}
		return listOfMoves;
	}
}

class Rook extends Piece {
	constructor(location, colour, name, moved) {
		super(location, colour, name);
		this.moved = moved;
		if (this.colour == "red") {
			this.value = 5;
		} else {
			this.value = -5;
		}
	}

	ListToDraw() {
		this.origin = this.DefineDrawOrigin();
		let listToDraw = [
			[2, 9],
			[2, 8],
			[2, 2],
			[3, 9],
			[3, 8],
			[3, 7],
			[3, 6],
			[3, 5],
			[3, 4],
			[3, 3],
			[4, 9],
			[4, 8],
			[4, 7],
			[4, 6],
			[4, 5],
			[4, 4],
			[4, 3],
			[4, 2],
		];
		let reflection = [];
		for (let i = 0; i < listToDraw.length; i++) {
			reflection.push([9 - listToDraw[i][0], listToDraw[i][1]]);
		}
		for (let i = 0; i < reflection.length; i++) {
			listToDraw.push(reflection[i]);
		}
		for (let i = 0; i < listToDraw.length; i++) {
			listToDraw[i][0] += this.origin[0];
			listToDraw[i][1] += this.origin[1];
		}
		return listToDraw;
	}

	LegalMoves(board) {
		let xPosition = this.location[0];
		let yPosition = this.location[1];
		let listOfMoves = [];
		//right
		for (let x = xPosition + 1; x < 8; x++) {
			if (IsZero(board[x][yPosition])) {
				listOfMoves.push([x, yPosition]);
			} else if (board[x][yPosition].colour !== this.colour) {
				listOfMoves.push([x, yPosition]);
				break;
			} else {
				break;
			}
		}
		//left
		for (let x = xPosition - 1; x >= 0; x--) {
			if (IsZero(board[x][yPosition])) {
				listOfMoves.push([x, yPosition]);
			} else if (board[x][yPosition].colour !== this.colour) {
				listOfMoves.push([x, yPosition]);
				break;
			} else {
				break;
			}
		}
		//up
		for (let y = yPosition + 1; y < 8; y++) {
			if (IsZero(board[xPosition][y])) {
				listOfMoves.push([xPosition, y]);
			} else if (board[xPosition][y].colour !== this.colour) {
				listOfMoves.push([xPosition, y]);
				break;
			} else {
				break;
			}
		}
		//down
		for (let y = yPosition - 1; y >= 0; y--) {
			if (IsZero(board[xPosition][y])) {
				listOfMoves.push([xPosition, y]);
			} else if (board[xPosition][y].colour !== this.colour) {
				listOfMoves.push([xPosition, y]);
				break;
			} else {
				break;
			}
		}
		return listOfMoves;
	}
}

class Queen extends Piece {
	constructor(location, colour, name) {
		super(location, colour, name);
		if (this.colour == "red") {
			this.value = 9;
		} else {
			this.value = -9;
		}
	}

	ListToDraw() {
		this.origin = this.DefineDrawOrigin();
		let listToDraw = [
			[2, 9],
			[2, 8],
			[2, 1],
			[3, 9],
			[3, 8],
			[3, 7],
			[3, 5],
			[3, 2],
			[4, 9],
			[4, 8],
			[4, 7],
			[4, 6],
			[4, 5],
			[4, 4],
			[4, 3],
			[4, 2],
			[4, 1],
			[4, 0],
		];
		let reflection = [];
		for (let i = 0; i < listToDraw.length; i++) {
			reflection.push([9 - listToDraw[i][0], listToDraw[i][1]]);
		}
		for (let i = 0; i < reflection.length; i++) {
			listToDraw.push(reflection[i]);
		}
		for (let i = 0; i < listToDraw.length; i++) {
			listToDraw[i][0] += this.origin[0];
			listToDraw[i][1] += this.origin[1];
		}
		return listToDraw;
	}

	LegalMoves(board) {
		let xPosition = this.location[0];
		let yPosition = this.location[1];
		let listOfMoves = [];
		//up right
		for (let [x, y] = [xPosition + 1, yPosition + 1]; x < 8 && y < 8; [x++, y++]) {
			if (IsZero(board[x][y])) {
				listOfMoves.push([x, y]);
			} else if (board[x][y].colour != this.colour) {
				listOfMoves.push([x, y]);
				break;
			} else {
				break;
			}
		}
		//up left
		for (let [x, y] = [xPosition - 1, yPosition + 1]; x >= 0 && y < 8; [x--, y++]) {
			if (IsZero(board[x][y])) {
				listOfMoves.push([x, y]);
			} else if (board[x][y].colour != this.colour) {
				listOfMoves.push([x, y]);
				break;
			} else {
				break;
			}
		}
		//down right
		for (let [x, y] = [xPosition + 1, yPosition - 1]; x < 8 && y >= 0; [x++, y--]) {
			if (IsZero(board[x][y])) {
				listOfMoves.push([x, y]);
			} else if (board[x][y].colour != this.colour) {
				listOfMoves.push([x, y]);
				break;
			} else {
				break;
			}
		}
		//down left
		for (let [x, y] = [xPosition - 1, yPosition - 1]; x >= 0 && y >= 0; [x--, y--]) {
			if (IsZero(board[x][y])) {
				listOfMoves.push([x, y]);
			} else if (board[x][y].colour != this.colour) {
				listOfMoves.push([x, y]);
				break;
			} else {
				break;
			}
		}
		//right
		for (let x = xPosition + 1; x < 8; x++) {
			if (IsZero(board[x][yPosition])) {
				listOfMoves.push([x, yPosition]);
			} else if (board[x][yPosition].colour !== this.colour) {
				listOfMoves.push([x, yPosition]);
				break;
			} else {
				break;
			}
		}
		//left
		for (let x = xPosition - 1; x >= 0; x--) {
			if (IsZero(board[x][yPosition])) {
				listOfMoves.push([x, yPosition]);
			} else if (board[x][yPosition].colour !== this.colour) {
				listOfMoves.push([x, yPosition]);
				break;
			} else {
				break;
			}
		}
		//up
		for (let y = yPosition + 1; y < 8; y++) {
			if (IsZero(board[xPosition][y])) {
				listOfMoves.push([xPosition, y]);
			} else if (board[xPosition][y].colour !== this.colour) {
				listOfMoves.push([xPosition, y]);
				break;
			} else {
				break;
			}
		}
		//down
		for (let y = yPosition - 1; y >= 0; y--) {
			if (IsZero(board[xPosition][y])) {
				listOfMoves.push([xPosition, y]);
			} else if (board[xPosition][y].colour !== this.colour) {
				listOfMoves.push([xPosition, y]);
				break;
			} else {
				break;
			}
		}
		return listOfMoves;
	}
}

class King extends Piece {
	constructor(location, colour, name, moved) {
		super(location, colour, name);
		this.moved = moved;
		if (this.colour == "red") {
			this.value = 999999;
		} else {
			this.value = -999999;
		}
	}

	ListToDraw() {
		this.origin = this.DefineDrawOrigin();
		let listToDraw = [
			[1, 9],
			[1, 8],
			[1, 5],
			[1, 4],
			[2, 9],
			[2, 8],
			[2, 3],
			[2, 4],
			[2, 5],
			[2, 6],
			[3, 9],
			[3, 8],
			[3, 7],
			[3, 6],
			[3, 5],
			[3, 4],
			[3, 3],
			[3, 1],
			[4, 9],
			[4, 8],
			[4, 7],
			[4, 6],
			[4, 5],
			[4, 4],
			[4, 3],
			[4, 2],
			[4, 1],
			[4, 0],
		];
		let reflection = [];
		for (let i = 0; i < listToDraw.length; i++) {
			reflection.push([9 - listToDraw[i][0], listToDraw[i][1]]);
		}
		for (let i = 0; i < reflection.length; i++) {
			listToDraw.push(reflection[i]);
		}
		for (let i = 0; i < listToDraw.length; i++) {
			listToDraw[i][0] += this.origin[0];
			listToDraw[i][1] += this.origin[1];
		}
		return listToDraw;
	}

	LegalMoves(board) {
		let xPosition = this.location[0];
		let yPosition = this.location[1];
		let listOfMoves = [];
		//top 3
		if (yPosition < 7) {
			for (let x = xPosition - 1; x <= xPosition + 1 && x >= 0 && x <= 7; x++) {
				if (IsZero(board[x][yPosition + 1])) {
					listOfMoves.push([x, yPosition + 1]);
				} else if (board[x][yPosition + 1].colour != this.colour) {
					listOfMoves.push([x, yPosition + 1]);
				}
			}
		}
		//bottom 3
		if (yPosition > 0) {
			for (let x = xPosition - 1; x <= xPosition + 1 && x >= 0 && x <= 7; x++) {
				if (IsZero(board[x][yPosition - 1])) {
					listOfMoves.push([x, yPosition - 1]);
				} else if (board[x][yPosition - 1].colour !== this.colour) {
					listOfMoves.push([x, yPosition - 1]);
				}
			}
		}
		//left
		if (xPosition > 0) {
			if (IsZero(board[xPosition - 1][yPosition])) {
				listOfMoves.push([xPosition - 1, yPosition]);
			} else if (board[xPosition - 1][yPosition].colour !== this.colour) {
				listOfMoves.push([xPosition - 1, yPosition]);
			}
		}
		//right
		if (xPosition < 7) {
			if (IsZero(board[xPosition + 1][yPosition])) {
				listOfMoves.push([xPosition + 1, yPosition]);
			} else if (board[xPosition + 1][yPosition].colour != this.colour) {
				listOfMoves.push([xPosition + 1, yPosition]);
			}
		}
		return listOfMoves;
	}
}

function KingCheck(position) {
	let kings = 0;
	let kingColour;
	for (let i = 0; i < position.piecesList.length; i++) {
		try {
			if (position.piecesList[i].name.includes("king")) {
				kings++;
				kingColour = position.piecesList[i].colour;
				if (kings == 2) {
					return true;
				}
			}
		} catch (error) {
			console.log(position.piecesList[i].location);
		}
	}
	return kingColour;
}

function MovePiece(piece, destination, startPosition) {
	let nextPosition = new BoardState(startPosition.piecesList);
	if (!IsZero(startPosition.board[destination[0]][destination[1]])) {
		let pieceToRemoveName = startPosition.board[destination[0]][destination[1]].name;
		nextPosition.board[destination[0]][destination[1]] = 0;
		nextPosition.piecesList = startPosition.piecesList.filter((i) => i.name != pieceToRemoveName);
	}
	let movingPieceName = piece.name;
	if (piece.name.includes("pawn") || piece.name.includes("rook") || piece.name.includes("king")) {
		piece.moved = true;
	}
	nextPosition.board[piece.location[0]][piece.location[1]] = 0;
	//piece.MoveTo(destination);
	nextPosition.board[destination[0]][destination[1]] = piece;
	nextPosition.piecesList = startPosition.piecesList.filter((i) => i.name != movingPieceName);
	nextPosition.piecesList.push(piece);
	//console.log(nextPosition.board[1])
	for (let x = 0; x < 8; x++) {
		for (let y = 0; y < 8; y++) {
			if (!IsZero(nextPosition.board[x][y])) {
				if (IsZero(nextPosition.board[x][y].name)) {
					nextPosition.board[x][y] = 0;
				}
			}
		}
	}
	return [nextPosition, startPosition];
}

function FindNextMove(colourToMove, currentPosition, depthReached, finalDepth) {
	if (depthReached < finalDepth) {
		depthReached++;
		let bestMove;
		for (let i = 0; i < currentPosition.piecesList.length; i++) {
			if (currentPosition.piecesList[i].LegalMoves(currentPosition.board).length > 0 && currentPosition.piecesList[i].colour == colourToMove) {
				for (let j = 0; j < currentPosition.piecesList[i].LegalMoves(currentPosition.board).length; j++) {
					bestMove = [currentPosition.piecesList[i], currentPosition.piecesList[i].LegalMoves(currentPosition.board)[j]];
					break;
				}
			}
		}
		let newOldPositions = MovePiece(bestMove[0], bestMove[1], currentPosition);
		let bestMoveValue = newOldPositions[0].Evaluate();
		currentPosition = newOldPositions[1];
		for (let i = 0; i < currentPosition.piecesList.length; i++) {
			//console.log("reached 1");
			if (currentPosition.piecesList[i].LegalMoves(currentPosition.board).length > 0 && currentPosition.piecesList[i].colour == colourToMove) {
				for (let j = 0; j < currentPosition.piecesList[i].LegalMoves(currentPosition.board).length; j++) {
					//console.log("reached 2");
					if (!IsZero(currentPosition.piecesList[i].LegalMoves(currentPosition.board)[j][0])) {
						//console.log(currentPosition.piecesList[i].LegalMoves(currentPosition.board)[j]);
						let newOldPositions = MovePiece(currentPosition.piecesList[i], currentPosition.piecesList[i].LegalMoves(currentPosition.board)[j], currentPosition);
						let NextPosititon = newOldPositions[0];
						currentPosition = newOldPositions[1];
						if (colourToMove == "red") {
							//console.log("reached 3");
							let nextValue = FindNextMove("blue", NextPosititon, depthReached, finalDepth)[1]
							if (nextValue > bestMoveValue) {
								bestMove = [currentPosition.piecesList[i], currentPosition.piecesList[i].LegalMoves(currentPosition.board)[j]];
								newOldPositions = MovePiece(currentPosition.piecesList[i], currentPosition.piecesList[i].LegalMoves(currentPosition.board)[j], currentPosition);
								bestMoveValue = nextValue;
								currentPosition = newOldPositions[1];
								//console.log("reached 4.............");
							}
						} else {
							let nextValue = FindNextMove("red", NextPosititon, depthReached, finalDepth)[1]
							if (nextValue < bestMoveValue) {
								bestMove = [currentPosition.piecesList[i], currentPosition.piecesList[i].LegalMoves(currentPosition.board)[j]];
								newOldPositions = MovePiece(currentPosition.piecesList[i], currentPosition.piecesList[i].LegalMoves(currentPosition.board)[j], currentPosition);
								bestMoveValue = nextValue;
								currentPosition = newOldPositions[1];
								//console.log("reached 4.............");
							}
						}
						//console.log("Best so far is: " + bestMove[0].name + " at " + bestMove[0].location + " to " + bestMove[1] + ". With an eval of " + bestMoveValue)
					}
				}
			}
		}
		return [bestMove, bestMoveValue];
	} else {
		return [0, currentPosition.Evaluate()];

	}
}

function DoMove(count, currentPosition, depth) {
	if (count % 2 == 0) {
		let move = FindNextMove("red", currentPosition, 0, depth)[0];
		currentPosition = MovePiece(move[0], move[1], currentPosition)[0];
		currentPosition.piecesList = [];
		for (let x = 0; x < 8; x++) {
			for (let y = 0; y < 8; y++) {
				if (!IsZero(currentPosition.board[x][y])) {
					currentPosition.piecesList.push(currentPosition.board[x][y]);
				}
			}
		}
		console.log(move[0].name + " at " + move[0].location + " to " + move[1]);
	} else {
		let move = FindNextMove("blue", currentPosition, 0, depth)[0];
		currentPosition = MovePiece(move[0], move[1], currentPosition)[0];
		currentPosition.piecesList = [];
		for (let x = 0; x < 8; x++) {
			for (let y = 0; y < 8; y++) {
				if (!IsZero(currentPosition.board[x][y])) {
					currentPosition.piecesList.push(currentPosition.board[x][y]);
				}
			}
		}
		console.log(move[0].name + " at " + move[0].location + " to " + move[1]);
	}

	return currentPosition;
}

return class MyEffect {
  constructor(display) {
    this.display = display;
    this.#clear();
    this.count = 0;
    
    this.rpawn1 = new Pawn([0, 1], "red", "rpawn1", false);
    this.rpawn2 = new Pawn([1, 1], "red", "rpawn2", false);
    this.rpawn3 = new Pawn([2, 1], "red", "rpawn3", false);
    this.rpawn4 = new Pawn([3, 1], "red", "rpawn4", false);
    this.rpawn5 = new Pawn([4, 1], "red", "rpawn5", false);
    this.rpawn6 = new Pawn([5, 1], "red", "rpawn6", false);
    this.rpawn7 = new Pawn([6, 1], "red", "rpawn7", false);
    this.rpawn8 = new Pawn([7, 1], "red", "rpawn8", false);
    this.rbishop1 = new Bishop([2, 0], "red", "rbishop1");
    this.rbishop2 = new Bishop([5, 0], "red", "rbishop2");
    this.rknight1 = new Knight([1, 0], "red", "rknight1");
    this.rknight2 = new Knight([6, 0], "red", "rknight2");
    this.rrook1 = new Rook([0, 0], "red", "rrook1", false);
    this.rrook2 = new Rook([7, 0], "red", "rrook2", false);
    this.rqueen = new Queen([4, 0], "red", "rqueen");
    this.rking = new King([3, 0], "red", "rking", false);
    
    this.bpawn1 = new Pawn([0, 6], "blue", "bpawn1", false);
    this.bpawn2 = new Pawn([1, 6], "blue", "bpawn2", false);
    this.bpawn3 = new Pawn([2, 6], "blue", "bpawn3", false);
    this.bpawn4 = new Pawn([3, 6], "blue", "bpawn4", false);
    this.bpawn5 = new Pawn([4, 6], "blue", "bpawn5", false);
    this.bpawn6 = new Pawn([5, 6], "blue", "bpawn6", false);
    this.bpawn7 = new Pawn([6, 6], "blue", "bpawn7", false);
    this.bpawn8 = new Pawn([7, 6], "blue", "bpawn8", false);
    this.bbishop1 = new Bishop([2, 7], "blue", "bbishop1");
    this.bbishop2 = new Bishop([5, 7], "blue", "bbishop2");
    this.bknight1 = new Knight([1, 7], "blue", "bknight1");
    this.bknight2 = new Knight([6, 7], "blue", "bknight2");
    this.brook1 = new Rook([0, 7], "blue", "brook1", false);
    this.brook2 = new Rook([7, 7], "blue", "brook2", false);
    this.bqueen = new Queen([4, 7], "blue", "bqueen");
    this.bking = new King([3, 7], "blue", "bking", false);
    
    
    this.startPiecesList = [this.rqueen, this.rking, this.bking, this.bqueen, this.brook1, this.brook2, this.rrook1, this.rrook2, this.rknight1, this.rknight2, this.bknight1, this.bknight2, this.rbishop1, this.rbishop2, this.bbishop1, this.bbishop2, this.rpawn1, this.rpawn2, this.rpawn3, this.rpawn4, this.rpawn5, this.rpawn6, this.rpawn7, this.rpawn8, this.bpawn1, this.bpawn2, this.bpawn3, this.bpawn4, this.bpawn5, this.bpawn6, this.bpawn7, this.bpawn8];
    this.currentPosition = new BoardState(this.startPiecesList);
  }

  #clear() {
    for (let x = 0; x < this.display.width; x++) {
      for (let y = 0; y < this.display.height; y++) {
        this.display.setPixel(x, y, [0, 0, 0]);
      }
    }
    
    //creating empty board
    let boardLength = (this.display.height) - (this.display.height % 8);
    let squareLength = boardLength / 8;
    let squares = 0;
    for (let y = 0; y < boardLength; y+=squareLength) {
      if ((y/squareLength) % 2 == 1) {
          squares++;
      }
      else {
        squares--;
      }
      for (let x = 0; x < boardLength; x+=squareLength) {
        squares++;
        for (let i = 0; i < squareLength; i++) {
          for (let j = 0; j < squareLength; j++) {
            if (squares % 2 === 0) {
              this.display.setPixel(x+i, y+j, [255, 255, 255]);
            }
            else {
              this.display.setPixel(x+i, y+j, [0, 0, 0]);
            }
          }
        }
      }
    }
    this.display.flush();
  }

  update() {
    this.#clear();
    if (this.count < 0) {
      this.rpawn1 = new Pawn([0, 1], "red", "rpawn1", false);
    this.rpawn2 = new Pawn([1, 1], "red", "rpawn2", false);
    this.rpawn3 = new Pawn([2, 1], "red", "rpawn3", false);
    this.rpawn4 = new Pawn([3, 1], "red", "rpawn4", false);
    this.rpawn5 = new Pawn([4, 1], "red", "rpawn5", false);
    this.rpawn6 = new Pawn([5, 1], "red", "rpawn6", false);
    this.rpawn7 = new Pawn([6, 1], "red", "rpawn7", false);
    this.rpawn8 = new Pawn([7, 1], "red", "rpawn8", false);
    this.rbishop1 = new Bishop([2, 0], "red", "rbishop1");
    this.rbishop2 = new Bishop([5, 0], "red", "rbishop2");
    this.rknight1 = new Knight([1, 0], "red", "rknight1");
    this.rknight2 = new Knight([6, 0], "red", "rknight2");
    this.rrook1 = new Rook([0, 0], "red", "rrook1", false);
    this.rrook2 = new Rook([7, 0], "red", "rrook2", false);
    this.rqueen = new Queen([4, 0], "red", "rqueen");
    this.rking = new King([3, 0], "red", "rking", false);
    
    this.bpawn1 = new Pawn([0, 6], "blue", "bpawn1", false);
    this.bpawn2 = new Pawn([1, 6], "blue", "bpawn2", false);
    this.bpawn3 = new Pawn([2, 6], "blue", "bpawn3", false);
    this.bpawn4 = new Pawn([3, 6], "blue", "bpawn4", false);
    this.bpawn5 = new Pawn([4, 6], "blue", "bpawn5", false);
    this.bpawn6 = new Pawn([5, 6], "blue", "bpawn6", false);
    this.bpawn7 = new Pawn([6, 6], "blue", "bpawn7", false);
    this.bpawn8 = new Pawn([7, 6], "blue", "bpawn8", false);
    this.bbishop1 = new Bishop([2, 7], "blue", "bbishop1");
    this.bbishop2 = new Bishop([5, 7], "blue", "bbishop2");
    this.bknight1 = new Knight([1, 7], "blue", "bknight1");
    this.bknight2 = new Knight([6, 7], "blue", "bknight2");
    this.brook1 = new Rook([0, 7], "blue", "brook1", false);
    this.brook2 = new Rook([7, 7], "blue", "brook2", false);
    this.bqueen = new Queen([4, 7], "blue", "bqueen");
    this.bking = new King([3, 7], "blue", "bking", false);
    
    
    this.startPiecesList = [this.rqueen, this.rking, this.bking, this.bqueen, this.brook1, this.brook2, this.rrook1, this.rrook2, this.rknight1, this.rknight2, this.bknight1, this.bknight2, this.rbishop1, this.rbishop2, this.bbishop1, this.bbishop2, this.rpawn1, this.rpawn2, this.rpawn3, this.rpawn4, this.rpawn5, this.rpawn6, this.rpawn7, this.rpawn8, this.bpawn1, this.bpawn2, this.bpawn3, this.bpawn4, this.bpawn5, this.bpawn6, this.bpawn7, this.bpawn8];
    this.currentPosition = new BoardState(this.startPiecesList);
    }
    if (KingCheck(this.currentPosition) === true && this.count >= 0) {
      this.currentPosition = DoMove(this.count, this.currentPosition, 3);
      for (let x = 0; x < 8; x++) {
		for (let y = 0; y < 8; y++) {
		  if (!IsZero(this.currentPosition.board[x][y])) {
				if (IsZero(this.currentPosition.board[x][y].name)) {
					this.currentPosition.board[x][y] = 0;
				}
				this.currentPosition.board[x][y].location = [x, y];
			}
		}
	}

    
    this.display.setPixel(10, 10, [255, 255, 255]);
    let listToDraw = this.currentPosition.ListToDraw()
    for (let i = 0; i < listToDraw.length; i++) {
      let pieceToDraw = listToDraw[i]
      if (this.currentPosition.piecesList[i].colour == "red") {
        var colour = [255,0,0];
      }
      else {
        colour = [0,0,255];
      }
      for (let j = 0; j < pieceToDraw.length; j++) {
        this.display.setPixel(pieceToDraw[j][0], pieceToDraw[j][1], colour);
      }
    }}
    else if (KingCheck(this.currentPosition) == "red" && this.count > 0) {
      for (let x = 0; x < this.display.width; x++) {
        for (let y = 0; y < this.display.height; y++) {
          this.display.setPixel(x, y, [255,0,0])
          this.count = -100
        }
      }
    }
    else if (this.count > 0){
      for (let x = 0; x < this.display.width; x++) {
        for (let y = 0; y < this.display.height; y++) {
          this.display.setPixel(x, y, [0,0,255])
          this.count = -100
        }
      }
    }
    this.count++
    this.display.flush();
  }
}
