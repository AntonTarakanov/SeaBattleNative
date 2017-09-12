"use strict";
let configBattle = { //count - size
    oneCell: [4, 1],
    twoCell: [3, 2],
    threeCell: [2, 3],
    fourCell: [1, 4]
};

let allCountShipPl = 20,
    allCountShipOpp = 20;
function allCountShipCalc(dataShot) {
    if (dataShot.idField === "cellOp-") {
        allCountShipOpp--;
    } else allCountShipPl--;
}

let tbodyPeople = document.getElementById("fieldPeople"),
    tbodyOpponent = document.getElementById("fieldOpponent"),
    mapPeople = createMap(),
    mapOpponent = createMap(),
    shipsPlay = [],
    shipsOpponent = [];

class Ship {
    constructor(nameShip, size, x, y, direction) {
        this.nameShip = nameShip;
        this.size = size;
        this.x = x;
        this.y = y;
        this.direction = direction;
    };
    get coordinate() {
        return [this.x, this.y, this.direction];
    };
    set coordinate(newCoord) {
        [this.x, this.y, this.direction] = newCoord;
    };
    sizeReduce() {
        this.size -= 1;
    };
}

class Trial {
    constructor(idShip, objShip, map) {
        this.x = randomNumber(0, 9);
        this.y = randomNumber(0, 9);
        this.course = modifierCourse(randomNumber(0, 1));
        this.idShip = idShip;
        this.objShip = objShip;
        this.map = map;
        this.arrayRound = undefined;
    };
}

function createMap() {
    let state = [];
    for (let i = 0; i < 10; i++) {
        state[i] = [];
        for (let j = 0; j < 10; j++) {
            state[i].push({
                x: j,
                y: i,
                value: 'empty',
                idShip: undefined
            })
        }
    }
    return state;
}

function randomNumber(min, max) { //including min-max
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function modifierCourse(course) {
    if (course === 0) return "horizontally";
    return "vertically";
}

function getTrial(idShip, objShip, map) {
    let trial = new Trial(idShip, objShip, map);
    return trial;
}

function createShip(array) {
    for (let key in configBattle) {
        for (let i = 0; i < configBattle[key][0]; i++) {
            let ship = new Ship(key, configBattle[key][1]); //count-size
            array.push(ship);
        }
    }
}

function installShips(arrayShips, map) {
    for (let i = 0; i < arrayShips.length; i++) {
        let put = false;
        do {
            let trial = getTrial(i, arrayShips[i], map);
            if (inspectBorder(trial)) {
                if (inspectLocation(trial)) {
                    put = putShip(trial);
                    startRound(trial);
                }
            }
        } while (put === false);
    }
}

function inspectBorder(trial) {
    if (trial.course === "horizontally") return isInsideBox(trial.y, trial.objShip.size);
    if (trial.course === "vertically") return isInsideBox(trial.x, trial.objShip.size);
}

function isInsideBox(coordinate, size) {
    let coord = coordinate + size;
    return (coord >= 0) && (coord < 10);
}

function isInsideBoxTwo(x, y) {
    return (x >= 0) && (x < 10) && (y >= 0) && (y < 10);
}

function inspectLocation(trial) {
    for (let i = 0; i < trial.objShip.size; i++) {
        if (trial.course === "horizontally") {
            if (trial.map[trial.x] [trial.y + i].value !== "empty") return false;
        }
        if (trial.course === "vertically") {
            if (trial.map[trial.x + i] [trial.y].value !== "empty") return false;
        }
    }
    return true;
}

function putShip(trial) {
    trial.objShip.coordinate = [trial.x, trial.y, trial.course];
    for (let i = 0; i < trial.objShip.size; i++) {
        if (trial.course === "horizontally") {
            addMap(trial, trial.x, trial.y + i, "ship");
        }
        ;
        if (trial.course === "vertically") {
            addMap(trial, trial.x + i, trial.y, "ship");
        }
    }
    return true;
}

function addMap(trial, x, y, type) {
    trial.map[x][y].value = type;
    trial.map[x][y].countObj = trial.idShip;
}

function startRound(trial) {
    let arrayRound = [];
    if (trial.course === "horizontally") {
        for (let i = -1; i < trial.objShip.size + 1; i++) {
            arrayRound.push({x: trial.x + 1, y: trial.y + i}, {x: trial.x - 1, y: trial.y + i});
        }
        arrayRound.push({x: trial.x, y: trial.y - 1}, {x: trial.x, y: trial.y + trial.objShip.size});
    }
    if (trial.course === "vertically") {
        for (let i = -1; i < trial.objShip.size + 1; i++) {
            arrayRound.push({x: trial.x + i, y: trial.y + 1}, {x: trial.x + i, y: trial.y - 1});
        }
        arrayRound.push({x: trial.x - 1, y: trial.y}, {x: trial.x + trial.objShip.size, y: trial.y});
    }
    trial.objShip.arrayRound = arrayRound;
    installRound(arrayRound, trial.map, "round");
}

function installRound(array, map, value) {
    for (let key in array) {
        if (isInsideBoxTwo(array[key].x, array[key].y)) {
            map[array[key].x][array[key].y].value = value;
        }
    }
}

function paintField(array, field, value) {
    field.innerHTML = array.map(function (row, rowId) {
        return '<tr>' + row.map(function (cell, cellId) {
            let hide = getHide(value, cell.value);
                return '<td '+
                    'id="'+value+rowId+':'+cellId+
                    '" class="cell cellValue-'+hide+
                    '" data-ship-id="'+cell.countObj+'"'+
                    ' data-cell-id="'+rowId+':'+cellId+'"'+
                    '></td>'
            }).join('')+'</tr>';
    }).join('');
}

function getHide (value, cell){
    let hide;
    hide = value !== 'cellPl-' ? "empty" : cell;
    return hide;
}

createShip(shipsPlay);
installShips(shipsPlay, mapPeople);
paintField(mapPeople, tbodyPeople, 'cellPl-');

createShip(shipsOpponent);
installShips(shipsOpponent, mapOpponent);
paintField(mapOpponent, tbodyOpponent, 'cellOp-');