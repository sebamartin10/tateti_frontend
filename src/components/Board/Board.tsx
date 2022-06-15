import { debug } from "console";
import { useState } from "react";
import './Board.css';
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import { clearInterval } from "timers";



type Square = {
    id: string,
    index: number
}

let turnLabel: string = "";
let currentCells: Array<string> = new Array(9).fill(null);
let isGameFinished : boolean = false;


let gameID: number;
let player1Symbol: string;
let player2Symbol: string;
let currentTurn: string;


const winingPositions = [
    [0, 1, 2],
    [0, 3, 6],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6]
]



export const Board = () => {

    const [turn, setTurn] = useState("X");
    const [cells, setCells] = useState(new Array(9).fill(null));
    const [result, setResult] = useState("");
    const [scoreX, setScoreX] = useState(0);
    const [scoreO, setScoreO] = useState(0);
    const [player1, setPlayer1] = useState("");
    const [player2, setPlayer2] = useState("");
    const [boardID, setBoardID] = useState();
    



    if (turn === "X") {
        turnLabel = "Player X turn...";
    } else {
        turnLabel = "Player O turn...";
    }


    function create_board() {

        axios.post("http://localhost:3000/board",
            { player1Symbol: "X", player2Symbol: "O", turnOf: "X", active: true })
            .then((response) => {
                console.log(response);
                console.log(response.data);
                setBoardID(response.data.board.id);
                setPlayer1(response.data.board.player1Symbol);
                setPlayer2(response.data.board.player2Symbol);
                setTurn(response.data.board.turnOf);
                gameID = response.data.board.id;

                console.log(gameID);

                for (let i = 0; i < 9; i++) {

                    create_squares(i, "", response.data.board.id);
                }
            });




    }
    function update_turn() {

        axios.put("http://localhost:3000/boards/" + gameID + "?", {
            turnOf: currentTurn
        })
            .then((response) => {
                console.log("Esperando por el player " + response.data.board.turnOf);
                setTurn(response.data.board.turnOf);
            });
    }
    function get_current_turn() {
        axios.get("http://localhost:3000/board/" + gameID + "?")
            .then((response) => {
                setTurn(response.data.board.turnOf);
                currentTurn = response.data.board.turnOf;
                setBoardID(response.data.board.id);
            })
    }
    function create_squares(_index: number, _symbol: string, board_id: number) {
        axios.post("http://localhost:3000/square", {
            index: _index,
            symbol: _symbol,
            board_id: gameID
        })
            .then((response) => {
                console.log(response.data.square);
            })
    }
    function get_squares(board_id: number) {
        axios.get("http://localhost:3000/boardSquares/" + gameID + "?")
            .then((response) => {

                let newCells = [...cells]

                for (let i = 0; i < 9; i++) {
                    newCells[i] = response.data.squares[i].symbol;
                    currentCells[i] = response.data.squares[i].symbol;
                }

                setCells(newCells);
                console.log("Actual cells " + currentCells);
                checkForWinner();


            })
    }
    function update_square(index: number) {

        axios.get("http://localhost:3000/boardSquares/" + gameID + "?")
            .then((response) => {


                for (let i = 0; i < response.data.squares.length; i++) {
                    if (response.data.squares[i].index === index) {
                        axios.put("http://localhost:3000/square/" + response.data.squares[i].id + "?", {

                            symbol: turn
                        })
                            .then((response) => {
                                console.log(response.data.square);
                            })
                    }
                }




            })


    }

    const handleClick = (index: number) => {
        
        console.log(isSquareEmpty(index));
        if(!isSquareEmpty(index))
            return;
        if (result !== "" || turn !== player1)
            return;


        update_square(index);

        if (turn === "X") {

            currentTurn = "O";

        } else {

            currentTurn = "X";
        }
        update_turn();






    }
    function isSquareEmpty(index : number){
        if(cells[index]==="")
            return true;
        return false;
            
        
    }

    const checkForWinner = () => {

        axios.get("http://localhost:3000/boardSquares/" + gameID + "?")
            .then((response) => {

                for (let i = 0; i < 9; i++) {

                    currentCells[i] = response.data.squares[i].symbol;
                }

                for (let i = 0; i < winingPositions.length; i++) {
                    const [a, b, c] = winingPositions[i];

                    if (currentCells[a] && currentCells[a] === currentCells[b] && currentCells[a] === currentCells[c]) {
                        if(currentCells[a]==="X"){
                            setResult("The winner is X");
                        
                            setScoreX(scoreX+1);
                        }else{
                            setResult("The winner is O");
                            
                            setScoreO(scoreO+1);
                        }
                        
                        isGameFinished=true;


                    }

                    /*if (!newCells.includes(null)) {
                        setTurn("");
                        setResult("Draw!")
                        console.log("Empate");
                    }*/
                }


            })





    }

    function start() {

        player1Symbol = "X";
        player2Symbol = "O";

        currentTurn = "X";

        let newCells = [...cells]
        newCells.fill("");
        setCells(newCells);
        setResult("");
        isGameFinished = false;

        create_board();


        setInterval(() => {
            if (!isGameFinished) {
                get_current_turn();
                get_squares(gameID);
            }


        }, 1000);
    }


    const playAgain = () => {
        setCells(new Array(9).fill(null));
        setTurn("X");
        setResult("");


    }
    const getInputEvent = (event: any) => {

        gameID = event.target.value;

    }


    const join = () => {
        get_current_turn();
        isGameFinished = false;
        player1Symbol = "O";
        player2Symbol = "X";
        setPlayer1(player1Symbol);
        setPlayer2(player2Symbol);
        setResult("");
        let newCells = [...cells]
        newCells.fill("");
        setCells(newCells);
        setInterval(() => {
            if (!isGameFinished) {
                get_current_turn();
                get_squares(gameID);
            }

        }, 1000);


    }


    return (
        <div>
            <div>
                <h1 className='game-title'>
                    Play Tic Tac Toe
                </h1>
                <button className='button-start' onClick={start}>Create</button>
                <input className='input-header' placeholder='Enter ID Game' onChange={getInputEvent} />
                <button className='button-start' onClick={join}>Join</button>
                

                
                <div className="game-info">
                    <h4>Game info</h4>
                    <p>ID Game: {boardID}</p>
                    <p>You: {player1}</p>
                    <p>Opponent: {player2}</p>
                </div>

                

                
                



            </div>
        
            <div className="board">

                

                <h4 className="turn-label">{turnLabel}</h4>

                <h1 className="winnerLabel">{result}</h1>

                <div className="row" >
                    <div className="cell" onClick={() => handleClick(0)}>
                        {cells[0]}
                    </div>
                    <div className="cell" onClick={() => handleClick(1)}>
                        {cells[1]}
                    </div>
                    <div className="cell" onClick={() => handleClick(2)}>
                        {cells[2]}
                    </div>

                </div>
                <div className="row">
                    <div className="cell" onClick={() => handleClick(3)}>
                        {cells[3]}
                    </div>
                    <div className="cell" onClick={() => handleClick(4)}>
                        {cells[4]}
                    </div>
                    <div className="cell" onClick={() => handleClick(5)}>
                        {cells[5]}
                    </div>
                </div>
                <div className="row">
                    <div className="cell" onClick={() => handleClick(6)}>
                        {cells[6]}
                    </div>
                    <div className="cell" onClick={() => handleClick(7)}>
                        {cells[7]}
                    </div>
                    <div className="cell" onClick={() => handleClick(8)}>
                        {cells[8]}
                    </div>
                </div>
                <div className="score-board">
                    <div>
                        <label>X :</label>
                        {scoreX}
                    </div>
                    <div>
                        <label>O :</label>
                        {scoreO}
                    </div>

                </div>
              

            </div>
        </div>


    );
}

export default Board;