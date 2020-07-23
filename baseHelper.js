
const isEqualCoordinate = (first, second) => first.x === second.x && first.y === second.y;

const cellHelpers = {
    isEmpty: type => type === CELL_TYPE.EMPTY,
    isShip: type => type === CELL_TYPE.SHIP,
    isUsed: type => USED_CELL.includes(type)
};