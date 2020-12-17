const { Chess } = require('./node_modules/chess.js');

// Position bonus for pieces
// Relative to white side. For black side ,  do 7 - index for each index
let PBonus = [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 25, 25, 10,  5,  5],
    [ 0,  0,  0, 20, 20,  0,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-20,-20, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0,  0,  0]
];

let NBonus = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

let BBonus = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];

let RBonus = [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0]
];

let QBonus = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
];

let KBonus = [

    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
];




function getPositionValue(piece, i, j, player)
{
    let Bonuses = {p: PBonus, n:NBonus, r:RBonus, b:BBonus, q:QBonus, k:KBonus};
    if (piece === null) {
        return 0;
    }
    if(player === "b")
    {
        i = 7-i;
        j = 7-j;
    }
    let value = 0;
    let pieceLowerCase = piece.type.toLowerCase();
    if (pieceLowerCase in Bonuses)
    {
        value = Bonuses[pieceLowerCase][i][j];
    }
    return value;
}

// Todo : Endgame evaluation value 


function getPieceVal(piece)
{
    // Value assignment
    // Value source: https://www.chessprogramming.org/Simplified_Evaluation_Function
    if (piece === null) {
        return 0;
    }
    var pieceValues = {p:100, n:320, r:500, b:330, q:900, k:20000};
    var value = 0;
    var pieceLowerCase = piece.type.toLowerCase();
    if (pieceLowerCase in pieceValues)
    {
        value = pieceValues[pieceLowerCase];
    }
    return value;
}

// Evaluate board value for the current player
// player = "b" or "w"
function evaluateBoard(game, player)
{
    let board = game.board()
    if(game.in_checkmate())
    {
        if (game.turn() === player)
        {
            return -1000000;
        }
        else
        {
            return 1000000;
        }
    }
    let totalScore = 0;
    // Evaluate 8*8 position on board:
    for(var i = 0; i < 8; i++)
    {
        for(var j = 0; j <8; j ++)
        {
            piece = board[i][j];
            if (piece !== null)
            {
                pieceValue = getPieceVal(piece);
                if(piece.color === player)
                {
                    totalScore = totalScore + pieceValue;
                    totalScore = totalScore + getPositionValue(piece,i,j, player);
                }
                else{
                    totalScore = totalScore - pieceValue;
                    totalScore = totalScore - getPositionValue(piece,i,j, player);
                }
            }
        }
    }
    return totalScore;
}

// Game is chessjs.game object
// Turn is 0 or 1, 0 being the same as the player we are maximizing and 1 being the opponent
// Max depth can be set depending on how far we can go before timeout
// cur_depth is current traversal depth
function MinMaxSearch(game, player, turn, max_depth, cur_depth, alpha, beta)
{
    // Max search depth, return board evaluation value
    if(cur_depth == max_depth)
    {
        return evaluateBoard(game, player);
    }
    let moves = game.moves();
    // Maximize
    if(turn == 0)
    {
        let bestValue = -1000000;
        for(let i = 0; i < moves.length; i++)
        {
            game.move(moves[i]);
            let curValue = MinMaxSearch(game, player, 1 - turn, max_depth, cur_depth + 1);
            game.undo();
            bestValue = Math.max(bestValue, curValue);
            alpha = Math.max(alpha, bestValue);
            if (alpha >= beta)
            {
                break;
            }
            
        }
        return bestValue;
    }
    // Minimize
    else
    {
        let bestValue = 1000000;
        for(let i = 0; i < moves.length; i++)
        {
            game.move(moves[i]);
            let curValue = MinMaxSearch(game, player, 1 - turn, max_depth, cur_depth + 1);
            game.undo();
            bestValue = Math.min(curValue, bestValue);
            beta = Math.min(beta, bestValue);
            if (beta <= alpha)
            {
                break;
            }            
        }
        return bestValue;
    }
}

function getBestMove(game_input, player)
{
    let game = Object.create(game_input);
    let moves = game.moves();
    let bestValue = -1000000;
    let bestIndex = 0;
    let alpha = -Infinity
    let beta = Infinity
    for(let i = 0; i < moves.length; i++)
    {
        game.move(moves[i]);
        let curValue = MinMaxSearch(game, player, 1, 2, 0, alpha, beta)
        game.undo()
        if(curValue > bestValue)
        {
            bestValue = curValue;
            bestIndex = i;
        }
        alpha = Math.max(alpha, bestValue);
        if (alpha >= beta)
        {
            break;
        }
    }
    return moves[bestIndex];
}


const chess = new Chess();


while (!chess.game_over()) {
    let bestMove = getBestMove(chess, chess.turn());
    chess.move(bestMove)
    console.log(chess.ascii())
};

/*
chess.move('a3')
console.log(chess.ascii())
chess.move('Nc6')
console.log(chess.ascii())*/

