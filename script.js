var tbodyPeople = document.getElementById("fieldPeople");
var arrayFieldPeople = generateArray();
var optionBattle = { };

"use strict";
function generateArray(){
    let state = [];
    for (let i=0; i<10; i++) {
        state[i] = [];
        for (let j=0; j<10; j++) {
            state[i].push({      //add end
                value: 'ship',
                x: j,
                y: i
            })
        }
    };
    return state;
};

function Ship (nameShip, size){
    var allCount = 20;
    this.nameShip = nameShip;
    this.size = size;
    this.nowSize = size;
    this.calcSize = function () {
        this.nowSize -= 1;
        return this.nowSize;
    };
};

//Ship.countAll = function (){
//   this.allCount -= 1;
//  return this.allCount;
//};

var shipOne = new Ship('OnePaluba', 4);

shipOne.calcSize();
console.log(Ship.allCount);
console.log(shipOne.allCount + ' : ' + shipOne.nowSize);
shipOne.calcSize();
console.log(shipOne.allCount + ' : ' + shipOne.nowSize);

//-----------------------------------------
function createObj () {

};

function createShip (){

};



function paintField(){ //replace in paintField arguments;

    tbodyPeople.innerHTML = arrayFieldPeople.map( function (row, rowId){
            return '<tr>' + row.map( function (cell ,cellId){
                return '<td '+'id="cell-'+rowId+':'+cellId +'"'+' class="cell cellValue-'+cell.value+'"' +'>'+rowId+':'+cellId+'</td>'
            }).join('') + '</tr>';
        }).join('');

};

paintField();

