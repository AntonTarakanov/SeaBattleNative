"use strict";
var tbodyPeople = document.getElementById("fieldPeople");
var mapPeople = createMap();
var configBattle = {
    oneCell : [4, 1], //count - size
    twoCell : [3, 2],
    threeCell : [2, 3],
    fourCell : [1, 4]
};

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
    countCell(){
        this.size -= 1;
    };
};

function createMap(){
    let state = [];
    for (let i=0; i<10; i++) {
        state[i] = [];
        for (let j=0; j<10; j++) {
            state[i].push({      //add to the end
                value: 'empty',
                x: j,
                y: i
            })
        }
    };
    return state;
};

var objectsShips = [];
function createShip() {
    for (let key in configBattle) {
        for (let i=0; i<configBattle[key][0] ; i++) {
            let ship = new Ship (key, configBattle[key][1]); //count-size
            objectsShips.push(ship)
        };
    };
};
createShip();

function randomNumber(min, max) { //including min-max
    return Math.floor (Math.random () * (max-min+1))+min;
};

function modifierCourse(course){ // 0 = horizontally, 1 = vertically
    if (course === 0) {
        return "horizontally";
    } else return "vertically";
};

function installShips() {
    for (let i=0; i<objectsShips.length; i++) {
        let put = false;
        do {
            let offer = [randomNumber(0, 10), randomNumber(0, 10), modifierCourse(randomNumber(0, 1)), objectsShips[i]];
            if ((borderCheck(offer[0],offer[3].size)=== false) || (borderCheck(offer[1],offer[3].size)===false)) {continue;};
            if (inspectLocation(offer) === false) {continue;};
            console.log("installShips: "+offer);
            put = true;
            putShip(offer);
        } while (put === false);
    };
};
installShips();

function borderCheck (coord, size) {
    if (coord+size < 10) return true;
    return false;
};

function inspectLocation(offer) {
    if (offer[2] === "horizontally") {
        for (let i = 0; i < offer[3].size; i++) {
            if (mapPeople[offer[0]][offer[1]+i].value === "ship") return false;
        }
        return true;
    };
    if (offer[2] === "vertically") {
        for (let i = 0; i < offer[3].size; i++) {
            if (mapPeople[offer[0]+i][offer[1]].value === "ship") return false;
        }
        return true;
    };
};

function putShip(offer) {
    offer[3].coordinate = [offer[0],offer[1],offer[2]];
    for (let i=0; i<offer[3].size; i++) {
        if (offer[2] === "horizontally") {
            mapPeople[offer[0]][offer[1]+i].value = "ship";
        };
        if (offer[2] === "vertically") {
            mapPeople[offer[0]+i][offer[1]].value = "ship";
        };
    }
};

//for testing_____________________________________________________

//function lineDataShow(x, y, id) {
//    var cell = document.getElementById(id + [x,y].join(':'));
//    console.log ("LineDataShow = " + cell.dataset.shipId);
//}; //lineDataShow(0, 0, 'cell-');

//for testing_____________________________________________________


function paintField(){
    tbodyPeople.innerHTML = mapPeople.map( function (row, rowId){
        return '<tr>' + row.map( function (cell ,cellId){
                return '<td '+'id="cell-'+rowId+':'+cellId +'"'+' class="cell cellValue-'+cell.value+'"'+' data-ship-id="'+cellId+'"'+'>'+rowId+':'+cellId+'</td>'
            }).join('') + '</tr>';
    }).join('');
};



paintField();
