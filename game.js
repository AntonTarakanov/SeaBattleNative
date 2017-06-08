opponent.addEventListener("click", shot);
let banShot = ["kill","miss","hit"];
class DataShot {
    constructor (idShip, map, idFiled) {
        this.coord = {};
        this.idShip = idShip;
        this.map = map;
        this.idField = idFiled;
    };
    get Coord () {
        return this.coord;
    };
    set Coord (infoShot) {
        this.coord.x = infoShot[0];
        this.coord.y = infoShot[1];
    };
    get mapValue () {
        return this.map[this.coord.x][this.coord.y].value;
    }
}

class SmartOptions {
    constructor (id) {
        this.coord = {};
        this.idShip = id;
        this.course = undefined;
        this.status = false;
    };
}
let smartOptions = new SmartOptions();

function chooseFirst (){
    if (randomNumber(0,1) === 1) {
        shotOpponent();
    }
}

function shot(event){
    let dataShot = new DataShot(event.target.dataset.shipId, mapOpponent, "cellOp-");
    dataShot.Coord = event.target.dataset.cellId.split(":");
    if (inspectShot(dataShot)) {
        doShot(dataShot);
    } else {
        alert("Do not be stupid boy!");
    }
}

function inspectShot (dataShot) {
    if (isInsideBoxTwo(dataShot.coord.x, dataShot.coord.y)) {
        for (let key in banShot){
            if (dataShot.mapValue === banShot[key]) {
                return false;
            }
        }
    } else return false;
    return true;
}

function ifOpponent (idField){
    if (idField === "cellPl-") { return true; }
    return false;
}

function doShot(dataShot) {
    if (ifOpponent(dataShot.idField)) {console.log("Coordinate shot = "+dataShot.coord.x+":"+dataShot.coord.y+" - "+dataShot.idField); }
    if (dataShot.mapValue === "ship") {
        updateCell(dataShot.coord.x, dataShot.coord.y, "hit", dataShot.idField);
        correctiveMap(dataShot, "hit");
        correctiveShip(dataShot);
        changeSmartOptions(dataShot, true);
        allCountShipCalc(dataShot);
        inspectEnd();
        shipAnalysis(dataShot);
        repeatePlay(dataShot);
    } else {
        updateCell(dataShot.coord.x, dataShot.coord.y, "miss", dataShot.idField);
        correctiveMap(dataShot, "miss");
        otherPlay(dataShot);
    }
}

function inspectEnd (){
    if (allCountShipPl === 0) {
        alert("Game end. Begin in the snachala. Opponent win!");
        location.reload();
    }
    if (allCountShipOpp === 0) {
        alert("Game end. Begin in the snachala. Play win!");
        location.reload();
    }
}

function identifyArrayShips(data){
    if (data.idField === "cellOp-") return shipsOpponent;
    if (data.idField === "cellPl-") return shipsPlay;
}

function shipAnalysis(data){
    let arrayShips = identifyArrayShips(data);
    if (arrayShips[data.idShip].size === 0) {
        alert("ship is kill");
        changeSmartOptions(data, false);
        installRound(arrayShips[data.idShip].arrayRound, data.map, "kill");
        let arrayRound = arrayShips[data.idShip].arrayRound;
        for (let key in arrayRound){
            if (isInsideBoxTwo(arrayRound[key].x, arrayRound[key].y)) {
                updateCell(arrayRound[key].x, arrayRound[key].y, "kill", data.idField);
            }
        }
    }
}

function changeSmartOptions (dataShot, logic){
    if (dataShot.idField === "cellPl-") {
        if ( (logic === true)&&(smartOptions.status===false) ) {
            smartOptions.status = true;
            smartOptions.coord = dataShot.coord;
            smartOptions.idShip = dataShot.idShip;
        }
        if (logic === false) {
            console.log("clean true");
            smartOptions.status = false;
            smartOptions.coord = {};
            smartOptions.idShip = undefined;
        }
    }
}

function updateCell(x, y, value, idField){
    let cell = document.getElementById(idField + [x, y].join(':'));
    cell.className = 'cell cellValue-' + value;
}

function shotOpponent (){
    if (smartOptions.status === true) {
        smartShot();
    } else {
        randomShot();
    }
}

function createData(x, y){
    let array = [x, y];
    let id = getIdShip(array[0],array[1], "cellPl-");
    let dataShot = new DataShot(id ,mapPeople, "cellPl-");
    dataShot.Coord = array;
    return dataShot;
}

function randomShot(){
    let indicator = false;
    do {
        let dataShot = createData(randomNumber(0,9), randomNumber(0,9));
        if (inspectShot(dataShot)) {
            doShot(dataShot);
            indicator = true;
        }
    } while (indicator === false);
}

function getIdShip (x, y, idField){
    let cell = document.getElementById(idField + [x, y].join(':'));
    return cell.dataset.shipId;
}

function correctiveShip (dataShot) {
    let array = [];
    if (dataShot.idField === "cellPl-") {
        array = shipsPlay;
    } else array = shipsOpponent;
    let obj = array[dataShot.idShip];
    obj.sizeReduce();
}

function correctiveMap (data, newValue){
    data.map[data.coord.x][data.coord.y].value = newValue;
}

function smartShot(){
    console.log("smart shot is true");
    smartOptions.course = identifyCourse();
    let dataShot = targetCourse();
    doShot(dataShot);
}

function identifyCourse() {
    let arrayCell = aboutCell();
    for (let key in arrayCell){
        if (isInsideBoxTwo(arrayCell[key].x, arrayCell[key].y)) {
            if (mapPeople[arrayCell[key].x][arrayCell[key].y].value === "hit" ) {
                return arrayCell[key].course;
            }
        }
    }
    return undefined;
}

function aboutCell (){
    let array = [];
    array.push({ x: smartOptions.coord.x, y: smartOptions.coord.y-1, course: "horizontally" });
    array.push({ x: smartOptions.coord.x, y: smartOptions.coord.y+1, course: "horizontally" });
    array.push({ x: smartOptions.coord.x-1, y: smartOptions.coord.y, course: "vertically" });
    array.push({ x: smartOptions.coord.x+1, y: smartOptions.coord.y, course: "vertically" });
    return array;
};

function targetCourse () {
    console.log("target course = "+smartOptions.course);
    if (smartOptions.course === undefined) {
        return getTarget();
    }
    if (smartOptions.course === "horizontally") {
        return horizontallyTarget();
    }
    if (smartOptions.course === "vertically") {
        return verticallyTarget();
    }
}

    function getTarget (){
    let array = aboutCell();
    for (let key in array) {
        console.log("get target = "+array[key].x + ":"+array[key].y);
        if (isInsideBoxTwo(array[key].x,array[key].y)) {
            let dataShot = createData(array[key].x, array[key].y);
            if (inspectShot(dataShot)) {
                return dataShot;
            }
        }
    }
}

function horizontallyTarget () {
    for (let i=1; i<4; i++) {
        if (isInsideBoxTwo(smartOptions.coord.x, smartOptions.coord.y+i)) {
            let dataShot = createData(smartOptions.coord.x, smartOptions.coord.y + i);
            if (inspectShot(dataShot)) {
                console.log("horizontally target = " + smartOptions.coord.x + ":" + smartOptions.coord.y + i);
                return dataShot;
            }
        }
        if (isInsideBoxTwo(smartOptions.coord.x, smartOptions.coord.y-i)) {
            let dataShot = createData(smartOptions.coord.x, smartOptions.coord.y - i);
            if (inspectShot(dataShot)) {
                console.log("horizontally target = " + smartOptions.coord.x + ":" + smartOptions.coord.y - i);
                return dataShot;
            }
        }
    }
}

function verticallyTarget () {
    for (let i = 1; i < 4; i++) {
        if (isInsideBoxTwo(smartOptions.coord.x + i, smartOptions.coord.y)) {
            let dataShot = createData(smartOptions.coord.x + i, smartOptions.coord.y);
            if (inspectShot(dataShot)) {
                console.log("vertically target = " + smartOptions.coord.x + i + ":" + smartOptions.coord.y);
                return dataShot;
            }
        }
        if (isInsideBoxTwo(smartOptions.coord.x - i, smartOptions.coord.y)) {
            let dataShot = createData(smartOptions.coord.x - i, smartOptions.coord.y);
            if (inspectShot(dataShot)) {
                console.log("vertically target = " + smartOptions.coord.x - i + ":" + smartOptions.coord.y);
                return dataShot;
            }
        }
    }
}

function otherPlay (dataShot){
 if (dataShot.idField === "cellOp-") {
 shotOpponent();
 }
 }

function repeatePlay (dataShot){
    if (dataShot.idField === "cellPl-") {
        shotOpponent();
    }
}

chooseFirst();