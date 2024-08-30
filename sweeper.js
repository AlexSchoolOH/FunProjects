const style = document.createElement("style");
style.innerHTML = `
body {
    color:#0f0f0f;
    font-size:24px;
    text-wrap: nowrap;
    white-space: nowrap; 
    overflow: scroll;
}

p {
    font-size:32px;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
    width:32px;
    transform:scale(2,1);
    margin:0px;
    padding:0px;
    text-wrap: nowrap;
    white-space: nowrap; 
}

p:hover {
    color:#2f2f2f;
}
`;
document.body.appendChild(style);
document.oncontextmenu = (event) => {
    event.preventDefault();
}

const displays = {
    0:"░",
    1:"1",
    2:"2",
    3:"3",
    4:"4",
    5:"5",
    6:"6",
    7:"7",
    8:"8",
    9:"9",
    noMine:"█",
    mine:"▓",
    flag:"🏳",
}

const colors = {
    0:"#1f1f1f",
    1:"#0000FF",
    2:"#007B00",
    3:"#FF0000",
    4:"#00007B",
    5:"#7B0000",
    6:"#007B7B",
    7:"#000000",
    8:"#7B7B7B",
    flag:"#ff0000",
}

let board = {
    width:0,
    height:0,

    contents:[],
    boardDiv: document.createElement("div"),
    turn:0,

    isDead:false,

    isInBoard: (X,Y) => {
        if (X < 0 || Y < 0 || X >= board.width || Y >= board.height) {
            return false;
        }
        return true;
    },

    query: (X,Y) => {
        if (board.isInBoard(X,Y)) {
            return board.contents[Y][X];
        }
        return -1;
    },

    tile: (X,Y,sweeped,minesAround,IsMine,IsFlagged) => {
        const element = document.createElement("p");
        element.innerHTML = displays[minesAround];
        if (IsFlagged) {
            element.innerHTML = displays.flag;
            element.style.color = colors.flag;
            element.style.transform = "scale(1,0.9) translate(-40%,10%)";
            element.style.margin = "0px";
            element.style.background = "#0f0f0f";
        }
        else {
            if (!sweeped) {
                element.innerHTML = displays.noMine;
            }
            else {
                if (IsMine) {
                    element.innerHTML = displays.mine;
                }
                else {
                    element.style.color = colors[minesAround];
                }
            }
        }

        element.style.display = "inline-block";
        element.style.fontFamily = "monospace, monospace";

        if (!sweeped) {
            element.onmousedown = (event) => {
                event.preventDefault();
                //1 is mousewheel;
                //2 is right;
                if (event.button == 0) {
                    if (!board.isDead) {
                        if (IsMine) {
                            if (board.turn > 0) {
                                board.isDead = true;
                                board.reveal(true);
                            }
                            else {
                                board.set(X,Y,true,board.getMinesAround(X,Y),false);
                            }
                        }
                        board.poke(X,Y);
                        board.turn += 1;
                    }
                }
                else if (event.button == 2) {
                    if (!board.isDead) {
                        const tile = board.query(X,Y);
                        board.set(X,Y,tile.sweeped,0,tile.IsMine,!tile.IsFlagged);
                    }
                }
            }
        }

        return {
            sweeped:sweeped,
            minesAround:minesAround,
            IsMine:IsMine,
            IsFlagged:IsFlagged,

            element:element,

            replaceTile: (newTile) => {
                element.after(newTile.element);
                element.parentElement.removeChild(element);

                return newTile;
            }
        }
    },

    getMinesAround(X,Y) {
        let num = 0;
        if (board.query(X+1,Y+1).IsMine) num += 1;
        if (board.query(X+1,Y-1).IsMine) num += 1;
        if (board.query(X-1,Y+1).IsMine) num += 1;
        if (board.query(X-1,Y-1).IsMine) num += 1;
        if (board.query(X+1,Y).IsMine) num += 1;
        if (board.query(X-1,Y).IsMine) num += 1;
        if (board.query(X,Y+1).IsMine) num += 1;
        if (board.query(X,Y-1).IsMine) num += 1;
        return num
    },

    set: (X,Y,sweeped,minesAround,IsMine,IsFlagged) => {
        board.contents[Y][X] = board.contents[Y][X].replaceTile(board.tile(X,Y,sweeped,minesAround,IsMine,IsFlagged));
    },

    poke: (X,Y) => {
        if (board.isInBoard(X,Y)) {
            const tile = board.query(X,Y);

            if (tile.sweeped == true || board.getMinesAround(X,Y) > 0) {
                board.set(X,Y,true,board.getMinesAround(X,Y),tile.IsMine);
                return;
            }

            //Sweeping
            board.set(X,Y,true,tile.minesAround,tile.IsMine);
            board.poke(X + 1, Y + 1);
            board.poke(X + 1, Y - 1);
            board.poke(X - 1, Y + 1);
            board.poke(X - 1, Y - 1);
            board.poke(X + 1, Y);
            board.poke(X - 1, Y);
            board.poke(X, Y + 1);
            board.poke(X, Y - 1);
        }
    },

    generate: (Width,Height,MineCount) => {
        board.contents = [];
        board.width = Width;
        board.height = Height;
        board.isDead = false;
        board.turn = 0;
        for (let X = 0; X < Height; X++) {
            board.contents.push([]);
            for (let Y = 0; Y < Width; Y++) {
                const newTile = board.tile(Y,X,false,0,false);
                board.contents[board.contents.length - 1].push(newTile);
                board.boardDiv.appendChild(newTile.element);
            }
            board.boardDiv.appendChild(document.createElement("br"));
        }

        for (let index = 0; index < MineCount; index++) {
            let X = Math.max(0,Math.round(Math.random() * board.width - 1));            
            let Y = Math.max(0,Math.round(Math.random() * board.height - 1));
            
            while (board.query(X,Y).IsMine == true) {
                X = Math.max(0,Math.round(Math.random() * (board.width - 1)));            
                Y = Math.max(0,Math.round(Math.random() * (board.height - 1)));
            }

            board.set(X % Width,Y % Height,false,0,true);
        }
    },

    reveal: (killed) => {
        for (let X = 0; X < board.height; X++) {
            board.contents.push([]);
            for (let Y = 0; Y < board.width; Y++) {
                board.poke(Y,X);
            }
        }

        if (killed) {
            const diedText = document.createElement("p");
            diedText.innerText = "You Died!";
            diedText.style.transform = "scale(1,1)";
            board.boardDiv.appendChild(diedText);
        }
    }
};


const difficulty = document.createElement("select");
difficulty.innerHTML = `
    <option value="Change Difficulty" style="display:none;">Change Difficulty</option>
    <option value="8|8|10">Easy</option>
    <option value="16|16|40">Medium</option>
    <option value="30|16|99">Hard</option>
    <option value="24|30|200">Harder</option>
    <option value="40|40|400">Insermountable</option>
    <option value="100|100|1000">XL Easy</option>
    <option value="100|100|2000">XL Medium</option>
    <option value="100|100|3000">XL Hard</option>
    <option value="100|100|4000">XL Harder</option>
    <option value="250|250|11000">Might Crash</option>
`;
difficulty.value = "Change Difficulty";

difficultySettings = [8,8,10];
difficulty.onchange = () => {
    if (difficulty.value == "Change Difficulty") return;

    board.boardDiv.innerHTML = "";

    const split = difficulty.value.split("|");
    difficultySettings = split;
    board.generate(split[0],split[1],split[2]);
    
    difficulty.value = "Change Difficulty";
}

const retry = document.createElement("button");
retry.innerText = "Restart";
retry.onclick = () => {
    board.boardDiv.innerHTML = "";
    board.generate(difficultySettings[0],difficultySettings[1],difficultySettings[2]);
}

document.body.appendChild(difficulty);
document.body.appendChild(retry);
document.body.appendChild(document.createElement("br"));
document.body.appendChild(board.boardDiv);

board.generate(difficultySettings[0],difficultySettings[1],difficultySettings[2]);