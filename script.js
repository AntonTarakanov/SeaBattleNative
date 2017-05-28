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

let allCountShipPl = 20;
let allCountShipOpp = 20;
function allCountShipCalc(value){
    return value-=1;
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
    sizeReduce(){
        this.size -= 1;
    };
};

class Trial {
  constructor (idShip, objShip, map) {
      this.x = randomNumber(0,9);
      this.y = randomNumber(0,9);
      this.course = modifierCourse(randomNumber(0,1));
      this.idShip = idShip;
      this.objShip = objShip;
      this.map = map;
      this.arrayRound = undefined;
  };
};

function createMap(){
    let state = [];
    for (let i=0; i<10; i++) {
        state[i] = [];
        for (let j=0; j<10; j++) {
            state[i].push({
                x: j,
                y: i,
                value: 'empty',
                idShip: undefined
            })
        };
    };
    return state;
};

function randomNumber(min, max) { //including min-max
    return Math.floor (Math.random () * (max-min+1))+min;
};

function modifierCourse(course){
    if (course === 0) return "horizontally";
    return "vertically";
};

function getTrial (idShip, objShip, map){
    let trial = new  Trial(idShip, objShip, map);
    return trial;
};

function createShip(array) {
    for (let key in configBattle) {
        for (let i=0; i<configBattle[key][0] ; i++) {
            let ship = new Ship (key, configBattle[key][1]); //count-size
            array.push(ship);
        };
    };
};

function installShips(arrayShips, map) {
    for (let i=0; i<arrayShips.length; i++) {
        let put = false;
        do {
            let trial = getTrial(i, arrayShips[i], map);
            if (inspectBorder(trial)) {
                if (inspectLocation(trial)) {
                    put = putShip(trial);
                };
            };
        } while (put === false);
    };
};

function inspectBorder(trial) {
    if (trial.course === "horizontally") return isInsideBox(trial.y, trial.objShip.size);
    if (trial.course === "vertically") return isInsideBox(trial.x, trial.objShip.size);
};

function isInsideBox(coordinate, size){
    let coord = coordinate+size;
    return (coord >= 0) && (coord < 10);
};

function isInsideBoxTwo(x, y){
    return (x >= 0) && (x < 10) && (y >= 0) && (y < 10);
};

function inspectLocation(trial) {
    for (let i=0; i<trial.objShip.size; i++) {
        if (trial.course === "horizontally") {
            if ( trial.map[trial.x] [trial.y+i].value != "empty") return false;
        };
        if (trial.course === "vertically") {
            if ( trial.map[trial.x+i] [trial.y].value != "empty") return false;
        };
    };
    return true;
};

function putShip(trial) {
    trial.objShip.coordinate = [trial.x,trial.y,trial.course];
    for (let i=0; i<trial.objShip.size; i++) {
        if (trial.course === "horizontally") {
            addMap (trial, trial.x, trial.y+i, "ship");
        };
        if (trial.course === "vertically") {
            addMap (trial, trial.x+i, trial.y, "ship");
        };
    };
    startRound(trial);
    return true;
};

function addMap (trial, x, y, type){
    trial.map[x][y].value = type;
    trial.map[x][y].countObj = trial.idShip;
};

function startRound(trial) {
    let arrayRound=[];
    if (trial.course === "horizontally") {
        for (let i=-1; i<trial.objShip.size+1; i++) {
            arrayRound.push({x: trial.x + 1, y: trial.y + i}, {x: trial.x - 1, y: trial.y + i});
        };
        arrayRound.push( {x: trial.x, y: trial.y-1}, {x: trial.x, y: trial.y+trial.objShip.size});
    };
    if (trial.course === "vertically") {
        for (let i=-1; i<trial.objShip.size+1; i++) {
            arrayRound.push({x: trial.x + i, y: trial.y + 1},{x: trial.x + i, y: trial.y - 1});
        };
        arrayRound.push( {x: trial.x-1, y: trial.y},{x: trial.x+trial.objShip.size, y: trial.y} );
    };
    trial.objShip.arrayRound = arrayRound;
    installRound(arrayRound, trial.map, "round");
};

function installRound(array, map, value) {
    for (let key in array) {
        if (isInsideBoxTwo(array[key].x, array[key].y)) {
            map[array[key].x][array[key].y].value = value;
        };
    };
};

function paintField(array,field){
    field.innerHTML = array.map( function (row, rowId){
        return '<tr>' + row.map( function (cell ,cellId){
                return '<td '+'id="cellPl-'+rowId+':'+cellId +'"'+' class="cell cellValue-'+cell.value+'"'+' data-ship-id="'+cell.countObj+'"'+' data-cell-id="'+rowId+':'+cellId+'"'+'></td>'
            }).join('') + '</tr>';
    }).join('');
};

function paintFieldOpponent(array,field){
    field.innerHTML = array.map( function (row, rowId){
        return '<tr>' + row.map( function (cell ,cellId){
                return '<td '+'id="cellOp-'+rowId+':'+cellId +'"'+' class="cell cellValue-'+cell.value+'"'+' data-ship-id="'+cell.countObj+'"'+' data-cell-id="'+rowId+':'+cellId+'"'+'></td>'
            }).join('') + '</tr>';
    }).join('');
};

createShip(shipsPlay);
installShips(shipsPlay, mapPeople);
paintField(mapPeople, tbodyPeople);

createShip(shipsOpponent);
installShips(shipsOpponent, mapOpponent);
paintFieldOpponent(mapOpponent, tbodyOpponent);
//-------------------------------------------------------------------------
opponent.addEventListener("click", shot);
//-------------------------------------------------------------------------
class OptionSS {
    constructor(status) {
        this.status = status;
        this.xLastHit = undefined;
        this.yLastHit = undefined;
        this.course = undefined;
        this.resultLast = undefined;
        this.logShot = [];
    };
    addLog(dataShot){ this.logShot.push(dataShot); };
};

let optionSS = new OptionSS(false);
let arrayState = ["kill","miss","hit",]; //ciuda nelsa ctrelat - no shot

class ComputerShotData {
    constructor() {
        this.x = randomNumber(0,9);
        this.y = randomNumber(0,9);
    };
};

function updateCell(x, y, value, idField){
    let cell = document.getElementById(idField + [x, y].join(':'));
    cell.className = 'cell cellValue-' + value;
};

function shot(event){
    let coordinate = event.target.dataset.cellId.split(":");
    coordinate.x = coordinate[0]; coordinate.y = coordinate[1]; coordinate.idShip = event.target.dataset.shipId;

    if (inspectShot(coordinate, mapOpponent)) {
        shotPeople(coordinate);
    } else {
        alert("Ne tupi potcan");
    };
};

function shotPeople(data){
    if (mapOpponent[data.x][data.y].value === "ship") {
        correctiveMap(data, mapOpponent, "hit");
        updateCell(data.x, data.y, "hit", "cellOp-");
        correctiveShip(data.idShip, shipsOpponent);
        allCountShipOpp = allCountShipCalc(allCountShipOpp);
        shipAnalysis(data, shipsOpponent, mapOpponent, "cellOp-");
    } else {
        correctiveMap(data, mapOpponent, "miss");
        updateCell(data.x, data.y, "miss", "cellOp-");
        shotOpponent();
    };
};

function correctiveMap (data, array, value){
    array[data.x][data.y].value = value;
};

function correctiveShip (idShip, array) {
    let obj = array[idShip];
    obj.sizeReduce();
    console.log("size ship = "+obj.size);
};

function randomFirstShot (){
    if (randomNumber(0,1)===1) {
        console.log("people shot");
    }
    else {
        shotOpponent()
    };
};

function shotOpponent(){
    if (optionSS.status === false) randomShot();
    if (optionSS.status === true) smartShot();
};

function getIdShip (x, y, idField){
    let cell = document.getElementById(idField + [x, y].join(':'));
    return cell.dataset.shipId;
};

function randomShot(){
    let indicator = false;
    do {
        let dataShot = new ComputerShotData();
            if (inspectShot(dataShot, mapPeople)) {
                dataShot.idShip = getIdShip(dataShot.x, dataShot.y, "cellPl-");
                doShot(dataShot);
                indicator = true;
            };
    } while (indicator === false);
};

function inspectShot (dataShot, array) {
    for (let key in arrayState){
        if (array[dataShot.x][dataShot.y].value === arrayState[key]) return false;
    };
    return true;
};

function doShot(dataShot) {
    if (mapPeople[dataShot.x][dataShot.y].value === "ship") {
        correctiveMap(dataShot, mapPeople, "hit");
        updateCell(dataShot.x, dataShot.y, "hit", "cellPl-");
        correctiveShip(dataShot.idShip, shipsPlay);
        allCountShipPl = allCountShipCalc(allCountShipPl);
        shipAnalysis(dataShot, shipsPlay, mapPeople, "cellPl-");
    } else {
        updateCell(dataShot.x, dataShot.y, "miss", "cellPl-");
        correctiveMap(dataShot, mapPeople, "miss");
    };
};

function smartShot(){
    console.log("smart shot");
};

function shipAnalysis(data, arrayShips, map, id){
    if ( (allCountShipPl === 0) || (allCountShipOpp === 0) ) {
        console.log("Game end. Begin in the snachala");
        location.reload();
    };
    if (arrayShips[data.idShip].size === 0) {
        console.log("ship is kill");
        console.log("arrayRound = "+arrayShips[data.idShip].arrayRound[1].x);
        installRound(arrayShips[data.idShip].arrayRound, map, "kill");
        let array = arrayShips[data.idShip].arrayRound;
        for (let key in array){
            if (isInsideBoxTwo(array[key].x, array[key].y)) {
                updateCell(array[key].x, array[key].y, "kill", id);
            };
        };
    };
};

function changeObjShip(){
    console.log("changeObjShip");
};

randomFirstShot();

