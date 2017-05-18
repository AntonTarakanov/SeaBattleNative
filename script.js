"use strict";
var tbodyPeople = document.getElementById("fieldPeople");
var arrayFieldPeople = createMap();
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
            state[i].push({      //add end
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

function modifierCoord(direction){ // 0 = horizontally, 1 = vertically
    if (direction == 0) {
        return "horizontally";
    } else return "vertically";
};

function installShips() {
    for (let i=0; i<objectsShips.length; i++) {
        let offer = [randomNumber(0, 10), randomNumber(0, 10), modifierCoord(randomNumber(0, 1))];
        console.log(offer);
    };
};
installShips();

function inspectLocation(coordinate) {

    if (coordinate[2] === "horizontally") {
        /*if (x + size < 10) {
            for (i = 0; i < size; i++) {
                if (stateArray[y][x + i].value != 0) return false;
            }
            return true;
        } else {
            return false;
        }
        */
    };

    if (coordinate[2] === "vertically") {
      /*  if (y + size < 10) {
            for (var i = 0; i < size; i++) {
                if (stateArray[y + i][x].value != 0) return false;
            }
            return true;
        } else {
            return false;
        }*/
    };

};

//for testing____________

//function lineDataShow(x, y, id) {
//    var cell = document.getElementById(id + [x,y].join(':'));
//    console.log ("LineDataShow = " + cell.dataset.shipId);
//}; //lineDataShow(0, 0, 'cell-');

//objectsShips[i].coordinate = [randomNumber(0,10), randomNumber(0,10), randomNumber(1,2),];


//for testing___________


function paintField(){
    tbodyPeople.innerHTML = arrayFieldPeople.map( function (row, rowId){
        return '<tr>' + row.map( function (cell ,cellId){
                return '<td '+'id="cell-'+rowId+':'+cellId +'"'+' class="cell cellValue-'+cell.value+'"'+' data-ship-id="'+cellId+'"'+'>'+rowId+':'+cellId+'</td>'
            }).join('') + '</tr>';
    }).join('');
};



paintField();
