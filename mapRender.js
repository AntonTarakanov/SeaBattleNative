/* TODO: файл можно переименовать, т.к. по смыслу тут методы для работы с DOM. */

/**
 * Функция создаёт разметку (игровое поле) для переданного игрока по данным из "SeaBattleState".
 * @param {string} playerName - наименование игрока для которого рисуем игровое поле.
 */
function createExampleMap(playerName) {
    const mapElement = document.getElementById(SeaBattleState.getMapId(playerName));
    const tableElement = document.createElement('table');
    const mapElementChild = mapElement.getElementsByTagName('table');

    for (let i = 0; i < MAP_SIZE.SIZE_Y; i++) {
        const rowElement = document.createElement('tr');
        for (let j = 0; j < MAP_SIZE.SIZE_X; j++) {
            const cellElement = document.createElement('td');
            const cellInfo = SeaBattleState.getCellByPosition({
                y: i,
                x: j,
            }, playerName);

            cellElement.className = SeaBattleState.isPCPlayer(playerName) ? 'sb_playFiled__cell sb_playFiled__area' : getClassByType(cellInfo.type, playerName);
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
 * @param {object} cellElement - DOM-елемент клетки таблицы.
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
            result = 'sb_playFiled__water';
            break;
        }
        case CELL_TYPE.SHIP: {
            result = 'sb_playFiled__ship';
            break;
        }
        case CELL_TYPE.SHOT: {
            result = 'sb_playFiled__shot';
            break;
        }
        case CELL_TYPE.KILL_AREA: {
            result = 'sb_playFiled__killArea';
            break;
        }
        case CELL_TYPE.SHOT_SHIPS: {
            result = 'sb_playFiled__shotShips';
            break;
        }
        default: {
            result = 'sb_playFiled__area';
            break;
        }
    }
    return ['sb_playFiled__cell', result].join(' ');
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
 * TODO: можно добавить метод для сравнения координат.
 * TODO: можно добавить констунту для содержания классов.
 * Возвращает DOM-элемент по атрибуту position.
 * @param {object} position
 * @return
 */
function getCellTDByPosition(position) {
    const mapTable = document.getElementById(SeaBattleState.getMapId(position.playerName));
    const shipList = mapTable.getElementsByClassName('sb_playFiled__cell');
    let result = null;

    for (let i = 0; i < shipList.length; i++) {
        const elemLocation = getLocationByDOMElem(shipList[i]);
        if (isEqualCoordinate(elemLocation, position)) {
            result = shipList[i];
            break;
        }
    }

    return result;
}

/**
 * Получить координаты у переданного DOM-элемента.
 * @param {object} elem
 * @return {object}
 */
function getLocationByDOMElem(elem) {
    const strPosition = elem.getAttribute(ATTRIBUTE_NAME.POSITION);
    let result = null;

    if (strPosition) {
        const arrayPosition = strPosition.split('-');
        result = { x: Number(arrayPosition[0]), y: Number(arrayPosition[1]) };
    } else {
        console.log('Не удалось получить координаты DOM-элемента');
    }
    return result;
}