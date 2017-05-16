var tbodyPeople = document.getElementById("fieldPeople");
var arrayFieldPeople = generateArray();
var optionBattle = {
    oneCell : [4, 1], //count - size
    twoCell : [3, 2],
    threeCell : [2, 3],
    fourCell : [1, 4]
};

"use strict";
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

let ship1 = new Ship ("cruiser", 4);
ship1.coordinate = [1,2,3];

function generateArray(){
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

function paintField(){ //replace in paintField arguments;
    tbodyPeople.innerHTML = arrayFieldPeople.map( function (row, rowId){
        return '<tr>' + row.map( function (cell ,cellId){
                return '<td '+'id="cell-'+rowId+':'+cellId +'"'+' class="cell cellValue-'+cell.value+'"'+' data-ship-id="'+cellId+'"'+'>'+rowId+':'+cellId+'</td>'
            }).join('') + '</tr>';
    }).join('');
};

function lineDataShow(x, y, id) {
    var cell = document.getElementById(id + [x,y].join(':'));
    console.log ("LineDataShow = " + cell.dataset.shipId);
};

//commit for gethub;

paintField();
lineDataShow(0, 0, 'cell-');