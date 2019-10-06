/* Классы для клетки раскиданные по константам */
const CLASS_BY_TYPE = {
    EMPTY: 'sb_playFiled__water',
    SHIP: 'sb_playFiled__ship',
    SHOT: 'sb_playFiled__shot',
    KILL_AREA: 'sb_playFiled__killArea',
    SHOT_SHIPS: 'sb_playFiled__shotShips',
    AREA: 'sb_playFiled__area',
    CELL: 'sb_playFiled__cell'
};

/**
 * Функция создаёт разметку (игровое поле) для переданного игрока по данным из "SeaBattleState".
 * @param {string} playerName - наименование игрока для которого рисуем игровое поле.
 */
function createExampleMap(playerName) {
    const mapElement = document.getElementById(SeaBattleState.getMapId(playerName));
    const tableElement = document.createElement('table');
    const mapElementChild = mapElement.getElementsByTagName('table');
    const defaultTableClass = [CLASS_BY_TYPE.CELL, CLASS_BY_TYPE.AREA].join(' ');

    for (let i = 0; i < MAP_SIZE.SIZE_Y; i++) {
        const rowElement = document.createElement('tr');
        for (let j = 0; j < MAP_SIZE.SIZE_X; j++) {
            const cellElement = document.createElement('td');
            const cellInfo = SeaBattleState.getCellByPosition({
                y: i,
                x: j,
            }, playerName);

            cellElement.className = SeaBattleState.isPCPlayer(playerName) ? defaultTableClass : getClassByType(cellInfo.type, playerName);
            setCellAttribute(cellElement, cellInfo);
            rowElement.appendChild(cellElement);
        }
        tableElement.appendChild(rowElement);
    }

    if (mapElementChild.length) {
        for (let i = 0; i < mapElementChild.length; i++) {
            mapElementChild[i].remove()
        }
    }
    mapElement.appendChild(tableElement);
    setTableHandlers(mapElement, SeaBattleState[playerName].handlers);
}

/**
 * Устанавливаем атрибуты для клетки.
 * @param {object} cellElement - DOM-елемент клетки.
 * @param {object} cellInfo - информация о клетке.
 */
function setCellAttribute(cellElement, cellInfo) {
    if (cellInfo.attribute) {
        for (let key in cellInfo.attribute) {
            if (cellInfo.attribute.hasOwnProperty(key)) {
                cellElement.setAttribute(['data', key].join(''), cellInfo.attribute[key]);
            }
        }
    }
}

/**
 * Устанавливаем для карты обработчики.
 * @param {object} mapTable
 * @param {object} handlers
 */
function setTableHandlers(mapTable, handlers) {
    for (let key in handlers) {
        if (handlers.hasOwnProperty(key)) {
            mapTable.addEventListener(key, handlers[key]);
        }
    }
}

/**
 * Возвращает класс для типа клетки.
 * @param {string} type
 */
function getClassByType(type) {
    let result = '';
    switch(type) {
        case CELL_TYPE.EMPTY: {
            result = CLASS_BY_TYPE.EMPTY;
            break;
        }
        case CELL_TYPE.SHIP: {
            result = CLASS_BY_TYPE.SHIP;
            break;
        }
        case CELL_TYPE.SHOT: {
            result = CLASS_BY_TYPE.SHOT;
            break;
        }
        case CELL_TYPE.KILL_AREA: {
            result = CLASS_BY_TYPE.KILL_AREA;
            break;
        }
        case CELL_TYPE.SHOT_SHIPS: {
            result = CLASS_BY_TYPE.SHOT_SHIPS;
            break;
        }
        default: {
            result = CLASS_BY_TYPE.AREA;
            break;
        }
    }
    return [CLASS_BY_TYPE.CELL, result].join(' ');
}

/**
 * Перерисовать клетку
 * @param {object} cellTD
 * @param {string} type
 */
function redrawCell(cellTD, type) {
    if (cellTD) {
        cellTD.className = getClassByType(type);
    }
}

/**
 * Перерисовать клетку по координатам.
 * @param {object} position - координаты клетки.
 * @param {object} cell - объект с информацией о клетке.
 */
function redrawCellByPosition(position, cell) {
    cell = cell ? cell : SeaBattleState.getCellByPosition(position);
    redrawCell(getCellTDByPosition(position), cell.type);
}

/**
 * Возвращает DOM-элемент по атрибуту position.
 * @param {object} position
 * @return
 */
function getCellTDByPosition(position) {
    const mapTable = document.getElementById(SeaBattleState.getMapId(position.playerName));
    const shipList = mapTable.getElementsByClassName(CLASS_BY_TYPE.CELL);
    let result = null;

    for (let i = 0; i < shipList.length; i++) {
        const arrayPosition = shipList[i].getAttribute('dataPosition').split('-');
        const matchResult = SeaBattle.matchCoordinate(position, SeaBattle.getPositionByAttribute(arrayPosition));
        if (matchResult) {
            result = shipList[i];
            break;
        }
    }

    return result;
}
