"use strict";
let tbodyPeople = document.getElementById("fieldPeople");
let tbodyOpponent = document.getElementById("fieldOpponent");
let mapPeople = createMap();
let mapOpponent = createMap();
let shipsPlay = [];
let shipsOpponent = [];
let configBattle = { //count - size
    oneCell : [4, 1],
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
            state[i].push({
                value: 'empty',
                x: j,
                y: i,
                countObj: undefined
            })
        }
    };
    return state;
};

function createShip(array) {
    for (let key in configBattle) {
        for (let i=0; i<configBattle[key][0] ; i++) {
            let ship = new Ship (key, configBattle[key][1]); //count-size
            array.push(ship);
        };
    };
};

function randomNumber(min, max) { //including min-max
    return Math.floor (Math.random () * (max-min+1))+min;
};

function modifierCourse(course){
    if (course === 0) return "horizontally";
    return "vertically";
};

function isInsideBox(coordinate, size){
    let coord = coordinate+size;
    return (coord >= 0) && (coord < 10);
};

function addMap (x, y, type, count, map){
    map[x][y].value = type;
    map[x][y].countObj = count;
};

//-----------------------------installShips
function installShips(array, map) {
    for (let i=0; i<array.length; i++) {
        let put = false;
        do {
            let offer = [randomNumber(0, 9), randomNumber(0, 9), modifierCourse(randomNumber(0, 1)), array[i], i];
            if (inspectBorder(offer)) {
                if (inspectLocation(offer, map)) {
                    put = putShip(offer, map);
                };
            };
        } while (put === false);
    };
};

function putShip(offer, map) {
    offer[3].coordinate = [offer[0],offer[1],offer[2]];
    for (let i=0; i<offer[3].size; i++) {
        if (offer[2] === "horizontally") {
            addMap (offer[0], offer[1]+i, "ship", offer[4], map);
        };
        if (offer[2] === "vertically") {
            addMap (offer[0]+i, offer[1], "ship", offer[4], map);
        };
    };
    installRound(offer, map);
    exampleArray(offer, map);
    return true;
};

function inspectBorder(offer) {
    if (offer[2] === "horizontally") return isInsideBox(offer[1], offer[3].size);
    if (offer[2] === "vertically") return isInsideBox(offer[0], offer[3].size);
};

function inspectLocation(offer,map) {
    for (let i=0; i<offer[3].size; i++) {
        if (offer[2] === "horizontally") {
            if ( map[offer[0]] [offer[1]+i].value != "empty") return false;
        };
        if (offer[2] === "vertically") {
            if ( map[offer[0]+i] [offer[1]].value != "empty") return false;
        };
    };
    return true;
};
//-----------------------------installShips

//-------------------------------------------installRound

function installRound(offer, map) {
    if (offer[2] === "horizontally") installRoundHor(offer, map);
    if (offer[2] === "vertically") installRoundVer(offer, map);
};

function installRoundHor(offer, map){
    for (let i=-1; i<offer[3].size+1; i++){
        if ((isInsideBox(offer[0]-1,0))&&(isInsideBox(offer[1]+i,0))) addMap(offer[0]-1,offer[1]+i,"round",undefined, map);
        if ((isInsideBox(offer[0]+1,0))&&(isInsideBox(offer[1]+i,0))) addMap(offer[0]+1,offer[1]+i,"round",undefined, map);
    };
    if ((isInsideBox(offer[0],0))&&(isInsideBox(offer[1]-1,0))) addMap(offer[0],offer[1]-1,"round",undefined, map);
    if ((isInsideBox(offer[0],0))&&(isInsideBox(offer[1]+offer[3].size,0))) addMap(offer[0],offer[1]+offer[3].size,"round",undefined, map);
};

function installRoundVer(offer, map){
    for (let i=-1; i<offer[3].size+1; i++){
        if ( (isInsideBox(offer[0]+i,0))&&(isInsideBox(offer[1]-1,0))) addMap(offer[0]+i,offer[1]-1,"round",undefined, map);
        if ( (isInsideBox(offer[0]+i,0))&&(isInsideBox(offer[1]+1,0))) addMap(offer[0]+i,offer[1]+1,"round",undefined, map);
    };
    if ((isInsideBox(offer[0]-1,0))&&(isInsideBox(offer[1],0))) addMap(offer[0]-1,offer[1],"round",undefined, map);
    if ((isInsideBox(offer[0]+offer[3].size,0))&&(isInsideBox(offer[1],0))) addMap(offer[0]+offer[3].size,offer[1],"round",undefined, map);
};
//-------------------------------------------installRound

//-------------------------------------------click and dataset testing
function hit(x,y){
    updateCell(x,y,"hit","cell-");
    console.log("hit - "+x+":"+y);
};

function updateCell(x, y, value, id){
    var cell = document.getElementById(id + [x, y].join(':'));
    cell.className = 'cell cellValue-' + value;
    console.log("updateCell");
};
//-------------------------------------------click and dataset testing
//-------------------------------------------paintField
function paintField(array,field){
    field.innerHTML = array.map( function (row, rowId){
        return '<tr>' + row.map( function (cell ,cellId){
                return '<td '+'id="cell-'+rowId+':'+cellId +'"'+' onclick="hit('+rowId+','+cellId +')" class="cell cellValue-'+cell.value+'"'+' data-ship-id="'+cell.countObj+'"'+'>'+rowId+':'+cellId+'</td>'
            }).join('') + '</tr>';
    }).join('');
};
//-------------------------------------------paintFields

createShip(shipsPlay);
installShips(shipsPlay, mapPeople);
paintField(mapPeople, tbodyPeople);

createShip(shipsOpponent);
installShips(shipsOpponent, mapOpponent);
paintField(mapOpponent, tbodyOpponent);