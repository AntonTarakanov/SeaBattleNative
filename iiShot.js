/**
 * Created by Anniktar on 23.05.2017.
 */
//console.log("Hello iiShot");
class OptionII {
    constructor(iiBoolean) {
        this.iiBoolean = iiBoolean;
        this.xLastHit = undefined;
        this.yLastHit = undefined;
        this.direction = undefined;
        this.resultLast = undefined;
        this.logShot = [];
    };

    get boolean() { return [this.iiBoolean]; };
    set boolean(bool) { this.iiBoolean = bool; };

    addLog(dataShot){ this.logShot.push(dataShot); };
};
let cellValue = ["empty", "ship", "kill", "hit", "miss", "round"];
let optionII = new OptionII(false);

function opponentShot (){
    if (optionII.iiBoolean === false) {
        console.log("randomShot");
    };
    if (optionII.iiBoolean === true) {
        iiShot();
    };
};

function iiShot() {

};

iiShot();
console.log("log shot: "+optionII.logShot);

/*function exampleArray(offer,map){
 let array = [];
 for (let i=-1; i<offer[3].size+1; i++) {
 array.push({ x : offer[0]-1, y : offer[1]+i });
 console.log("exampleArray = " + array[i+1].x);
 };
 };*/