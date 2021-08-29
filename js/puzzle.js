"use strict";

(function() {

    const imgWidth = 600;
    const imgHeight = 400;
    const cellWidth = 50;
    const cellHeight = 50;
    const cellsCol = Math.round(imgWidth / cellWidth);
    const cellsRow = Math.round(imgHeight/ cellHeight);

    var canvas = document.getElementById("puzzle");
    var ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Cell {
        constructor(_x, _y, _width, _height, _value, _imgSrc) {
            this.x = _x;
            this.y = _y;
            this.width = _width;
            this.height = _height;
            this.value = _value;
            this.img = _imgSrc;
        }
    }


    class Puzzle {
        constructor(_x, _y, _imgSrc, _width, _height, _cellsRow, _cellsCol) {
            this.x = _x;
            this.y = _y;
            this.img = _imgSrc;
            this.cellsRow = _cellsRow;
            this.cellsCol = _cellsCol;
            this.width = _width;
            this.height = _height;
            this.field = [];
            this.maskField = [];
            this.puzzleCells = new Array();
            for (let i = 0, n = 0; i < this.cellsRow; i++) {
                this.field[i] = [0];
                this.maskField[i] = [false];
                this.puzzleCells[i] = new Array();
                for (let j = 0; j < this.cellsCol; j++) {
                    this.field[i][j] = n;
                    this.maskField[i][j] = false;
                    let width = this.width / this.cellsCol;
                    let height = this.height / this.cellsRow;
                    this.puzzleCells[i][j] = new Cell(
                        getRandom((window.innerWidth - this.width) / 2 - width),
                        getRandom(window.innerHeight - height),
                        width,
                        height,
                        n++,
                        _imgSrc
                    );
                }
            }
        }

        findPuzzle(x, y) {
            for (let i = this.cellsRow - 1; i >= 0; i--) {
                for (let j = this.cellsCol - 1; j >= 0; j--) {
                    if (x >= this.puzzleCells[i][j].x && 
                        x <= (this.puzzleCells[i][j].x + this.puzzleCells[i][j].width) &&
                        y >= this.puzzleCells[i][j].y &&
                        y <= (this.puzzleCells[i][j].y + this.puzzleCells[i][j].height)
                        ) {
                        return {
                            row: i, 
                            col: j
                        };
                    }
                }
            }
            return;
        }

    }


    function getRandom(n) {
        return Math.floor(Math.random() * n);
    }


    var img = new Image(imgWidth, imgHeight);
    img.src = "./img/dog.png";

    let imgPosX = (window.innerWidth - imgWidth) / 2;
    let imgPosY = 150;
        
    var puzzle = new Puzzle(
        imgPosX,
        imgPosY,
        img,
        imgWidth,
        imgHeight,
        cellsRow,
        cellsCol
    )

    img.onload = function() {
        draw();
    }


    document.querySelector(".btn-restart").onclick = event=> {
        puzzle = new Puzzle(
            imgPosX,
            imgPosY,
            img,
            imgWidth,
            imgHeight,
            cellsRow,
            cellsCol
        )
        document.querySelector(".results").classList.add("show");

        clear();
        draw();

        canvas.addEventListener('mousedown', grabCell);
    };

    window.onresize = event=>{
        clear();
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        imgPosX = (window.innerWidth - imgWidth) / 2;
        puzzle.x = imgPosX;
        puzzle.y = imgPosY;

        for (let i = 0; i < puzzle.cellsRow; i++) {
            for (let j = 0; j < puzzle.cellsCol; j++) {
                let cellX = imgPosX + j * cellWidth;
                let cellY = imgPosY + i * cellHeight;
                if (puzzle.maskField[i][j]) {
                    puzzle.puzzleCells[i][j].x = cellX;
                    puzzle.puzzleCells[i][j].y = cellY;
                }
            }
        }

        draw();
    };

    var cell = {};
    canvas.addEventListener('mousedown', grabCell);

    canvas.addEventListener('mouseup', event=> {
        canvas.style.cursor = "grab";
        canvas.removeEventListener('mousemove', move);
        if (cell && isSuitable(event.clientX, event.clientY)) {
            puzzle.maskField[cell.row][cell.col] = true;
            clear();
            draw();
            if (isGameOver()) {
                document.querySelector(".results").classList.remove("show");
                canvas.removeEventListener('mousedown', grabCell);
            }
        }
        cell = {};
    });

    function grabCell(event) {
        cell = puzzle.findPuzzle(event.clientX, event.clientY);

        if (cell) {
            canvas.style.cursor = "grabbing";
            canvas.addEventListener('mousemove', move);
        }
    }

    function move(event) {
        clear();
        puzzle.puzzleCells[cell.row][cell.col].x = event.clientX - cellWidth / 2;
        puzzle.puzzleCells[cell.row][cell.col].y = event.clientY - cellHeight / 2;

        drawImage();

        for (let i = 0; i < puzzle.cellsRow; i++) {
            for (let j = 0; j < puzzle.cellsCol; j++) {
                if (i == cell.row && j == cell.col) continue;
                drawCell(i, j);
            }
        }
        drawCell(cell.row, cell.col);
    }

    function clear() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }

    function draw() {
        drawImage();

        /*
            Отрисовываем пазл
        */
        for (let i = 0; i < puzzle.cellsRow; i++) {
            for (let j = 0; j < puzzle.cellsCol; j++) {
                drawCell(i, j);
            }
        }
        /*
            Отрисовываем пазл
        */
    }

    function drawImage() {
        /*
           Отображаем главную картинку
        */
        ctx.save();
        ctx.drawImage(puzzle.img, puzzle.x, puzzle.y, puzzle.width, puzzle.height);

        let imgData = ctx.getImageData(puzzle.x, puzzle.y, puzzle.width, puzzle.height);
        for (let i = 3; i < imgData.data.length; i += 4)
            imgData.data[i] = 30;
        ctx.putImageData(imgData, puzzle.x, puzzle.y);

        ctx.lineWidth = 1;
        ctx.strokeRect(puzzle.x, puzzle.y, puzzle.width, puzzle.height);
        ctx.restore();
        /*
            Отображаем главную картинку
        */
       drawGrid();
    }


    function drawGrid() {
        /*
            Чертим сетку
        */
        ctx.save();
        let cellWidth = Math.round(puzzle.width / puzzle.cellsCol);

        for (let i = 0; i < puzzle.cellsCol; i++) {
            ctx.beginPath();
            ctx.moveTo(puzzle.x + i * cellWidth, puzzle.y);
            ctx.lineTo(puzzle.x + i * cellWidth, puzzle.y + puzzle.height);
            ctx.lineWidth = 0.25;
            ctx.stroke();
        }

        let cellHeight = Math.round(puzzle.height / puzzle.cellsRow);
        for (let i = 0; i < puzzle.cellsRow; i++) {
            ctx.beginPath();
            ctx.moveTo(puzzle.x, puzzle.y + i * cellHeight);
            ctx.lineTo(puzzle.x + puzzle.width, puzzle.y + i * cellHeight);
            ctx.lineWidth = 0.25;
            ctx.stroke();
        }
        /*
            Чертим сетку
        */
    }

    function drawCell(row, col) {
        ctx.save();
        ctx.drawImage(
            puzzle.puzzleCells[row][col].img,
            col * puzzle.puzzleCells[row][col].width,
            row * puzzle.puzzleCells[row][col].height,
            puzzle.puzzleCells[row][col].width,
            puzzle.puzzleCells[row][col].height,
            puzzle.puzzleCells[row][col].x,
            puzzle.puzzleCells[row][col].y,
            puzzle.puzzleCells[row][col].width,
            puzzle.puzzleCells[row][col].height,
        );
        ctx.restore();
    }
   
    function isSuitable(x, y) {
        for (let i = 0; i < puzzle.cellsRow; i++)
            for (let j = 0; j < puzzle.cellsCol; j++) {
                let cellX = imgPosX + j * cellWidth;
                let cellY = imgPosY + i * cellHeight;
                if (
                    x >= cellX && x <= (cellX + cellWidth) &&
                    y >= cellY && y <= (cellY + cellHeight) &&
                    puzzle.puzzleCells[cell.row][cell.col].value == puzzle.field[i][j]
                ) {
                    puzzle.puzzleCells[cell.row][cell.col].x = cellX;
                    puzzle.puzzleCells[cell.row][cell.col].y = cellY;
                    return true;
                }
            }
        return false;
    }

    function isGameOver() {
        for (let i = 0; i < cellsRow; i++)
            for (let j = 0; j < cellsCol; j++)
                if (!puzzle.maskField[i][j]) return false;
        return true;
    }


})();