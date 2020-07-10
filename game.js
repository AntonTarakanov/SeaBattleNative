const SeaBattleState = new SeaBattle();
const cellHelpers = {};
let isVictory = false;

/**
 * Функция-заглушка для ввода наименования игрока.
 * @param {boolean} isPCPlayer
 * @return {string}
 */
function enterYourName(isPCPlayer = false) {
    return isPCPlayer ? DEFAULT_NIK_NAME.player1 : DEFAULT_NIK_NAME.player0;
}

/**
 * Запускаем создание массивов данных, отрисовку полей и выполняем первый ход.
 */
function startSeaBattle() {
    for (let i = 0; i < AMOUNT_PLAYERS; i++) {
        const playerKey = 'player' + i;

        // Рандомно устанавливаем корабли для всех игроков.
        for (key in SHIP_INFO) {
            if (SHIP_INFO.hasOwnProperty(key)) {
                for (let j = 0; j < SHIP_INFO[key].count; j++) {
                    setShipSomewhere(SHIP_INFO[key], playerKey, j);
                }
            }
        }
        createExampleMap(playerKey);
    }

    // только для компьютера;
    setRadioButtonHandler();
}

/**
 * Возвращает координаты для конкретного корабля, в конкретной карте. Перед этим получает массив возможных значений.
 * @param {object} shipInfo - общая информация о корабле.
 * @param {string} playerName - наименование игрока
 * @param {number} shipIndex - порядковй номер корабля. Необходимо для идентификации.
 */
function setShipSomewhere(shipInfo, playerName, shipIndex) {
    const freeCellList = getMapForCurrentShip(shipInfo, playerName, ACTION_INSTALL);

    if (freeCellList.length) {
        const initPosition = freeCellList[SeaBattle.getRandomNumber(freeCellList.length - 1)];
        const shipId = [shipInfo.name, shipIndex].join('-');

        Object.assign(initPosition, {
            direction: getRandomDirection(initPosition),
            size: shipInfo.size,
            shipName: shipInfo.name,
            playerName: playerName,
            attribute: {
                shipId: shipId
            }
        });

        setShip(initPosition );
        SeaBattleState.getCountShipList(playerName).push(PlayerState.getEmptyItemShipList(shipId, shipInfo.size, initPosition));
        result = initPosition;
    }
}

/**
 * Возвращает массив с возможными координатами для конкретного корабля, в конкретной карте c конкретным направлением.
 * [{x:1, y:2, direction: {} }]
 * Потом рандомно кликаем на элемент массива и ставим туда корабль.
 * @param {object} shipInfo - информация о корабле.
 * @param {string} playerKey - наименования игрока.
 * @param {string} action - наименование действия.
 * @return {Array}
 */
function getMapForCurrentShip(shipInfo, playerKey, action) {
    const resultArray = [];
    const checkCallback = action === ACTION_KILL
        ? type => cellHelpers.isUsedCell(type)
        : type => !cellHelpers.isEmptyCell(type);

    SeaBattleState.getMap(playerKey).forEach(item => {
        if (!checkCallback(item.type)) {

            /* TODO: возможно, есть смысл проверять клетки на этапе построения общего массива для встраивание корабля */
            const checkCell = checkCanActionShip(Object.assign({}, item, {
                size: shipInfo.size,
                playerKey: playerKey
            }), checkCallback);
            if (checkCell.isHor || checkCell.isVer) {
                resultArray.push(Object.assign(checkCell, item));
            }
        }
    });

    return resultArray;
}

/**
 * Проверить, что в данную клетку можно установить корабль.
 * @param {number} startCell - клетка и информация о ней (которую проверяем).
 * @param {function} checkCallback - необходимое условие.
 * @return {object} объект со свойствами "isHor" и "isVer".
 */
function checkCanActionShip(startCell, checkCallback) {

    function checkPosition(newPosition) {
        let result = true;
        if (SeaBattle.checkMapRange(newPosition)) {
            const currentCell = SeaBattleState.getCellByPosition(newPosition, startCell.playerKey);
            if (checkCallback(currentCell.type)) {
                result = false;
            }
        } else {
            result = false;
        }
        return result;
    }

    const resultObj = {
        isHor: true,
        isVer: true
    };

    /* "> 1" т.к. сейчас строится общий массив с проверкой на одну клетку. */
    if (startCell.size > 1) {
        for (let i = 0; i < startCell.size; i++) {
            if (resultObj.isHor) {
                resultObj.isHor = checkPosition({
                    x: startCell.x + i,
                    y: startCell.y
                });
            }
            if (resultObj.isVer) {
                resultObj.isVer = checkPosition({
                    x: startCell.x,
                    y: startCell.y + i
                });
            }
            if (!resultObj.isVer && !resultObj.isHor) break;
        }
    }

    return resultObj;
}

/**
 * Установить корабль по переданным начальным координатам.
 * @param {object} initPosition - начальные координаты клетки.
 */
function setShip(initPosition) {
    const isHorDirection = initPosition.direction === AVAILABLE_DIRECTION.HOR;

    // Устанавливаем сам корабль
    for (let i = 0; i < initPosition.size; i++) {
        const currentPosition = {
            x: isHorDirection ? initPosition.x + i : initPosition.x,
            y: isHorDirection ? initPosition.y : initPosition.y + i,
        };

        if (currentPosition && SeaBattle.checkMapRange(currentPosition)) {
            const currentCell = SeaBattleState.getCellByPosition(currentPosition, initPosition.playerName);
            Object.assign(currentCell, {
                type: CELL_TYPE.SHIP,
                name: initPosition.shipName
            });
            Object.assign(currentCell.attribute, initPosition.attribute);
        }
    }

    // Устанавливаем область вокруг корабля.
    setAreaAroundShip(initPosition, CELL_TYPE.AREA);
}

/**
 * Установить область вокруг корабля.
 * @param {object} initialPosition - начальные координаты корабля.
 * @param {string} cellType - в какой тип перекрашивать клетки.
 * @param {boolean} isRedraw - перерисовывать ли клетку.
 */
function setAreaAroundShip(initialPosition, cellType, isRedraw = false) {
    getAroundCellList(initialPosition).forEach(item => {
        const position = {...item, playerName: initialPosition.playerName};

        if (position && SeaBattle.checkMapRange(position)) {
            const currentCell = SeaBattleState.getCellByPosition(position, position.name);
            currentCell.type = cellType;
            if (isRedraw) {
                redrawCellByPosition(position, currentCell);
            }
        }
    });
}

/**
 * Получить список клеток окружности корабля.
 * @param {object} initialPosition - начальные координаты корабля.
 * @return {Array}
 */
function getAroundCellList(initialPosition) {
    const isHorDirection = initialPosition.direction === AVAILABLE_DIRECTION.HOR;
    const aroundCellList = [];

    // Записываем нос и зад корабля.
    [initialPosition.size, -1].forEach(item => {
        aroundCellList.push({
            x: isHorDirection ? initialPosition.x + item : initialPosition.x,
            y: isHorDirection ? initialPosition.y : initialPosition.y + item
        });
    });

    // Записываем боковины корабля.
    for (let i = -1; i < initialPosition.size + 1; i++) {
        ONES_LIST.forEach(item => {
            aroundCellList.push({
                x: isHorDirection ? initialPosition.x + i : initialPosition.x + item,
                y: isHorDirection ? initialPosition.y - item : initialPosition.y + i
            });
        });
    }
    return aroundCellList;
}

/**
 * Получить рандомное иди доступное значения направления для переданной начальной точки.
 * @param {object} initialPosition - начальные координаты клетки.
 * @return {string} направление.
 */
function getRandomDirection(initialPosition) {
    return initialPosition.isVer && initialPosition.isHor
        ? SeaBattle.getRandomNumber(1) === 0 ? AVAILABLE_DIRECTION.HOR : AVAILABLE_DIRECTION.VER
        : initialPosition.isVer ? AVAILABLE_DIRECTION.VER : AVAILABLE_DIRECTION.HOR;
}

/**
 * Обработчик клика по таблице.
 * @param {Event} event
 */
function onTableClick(event) {
    if (!isVictory) {
        const elemLocation = getLocationByDOMElem(event.target);
        const playerName = SeaBattleState.getPlayerKeyByMapId(event.currentTarget.getAttribute(ATTRIBUTE_NAME.ID));

        if (elemLocation && playerName) {
            onCellClick(SeaBattleState.getCellByPosition(elemLocation, playerName), event.target, playerName);
        }
    }
}

/**
 * TODO: Переписать полностью. Много костылей чтобы быстро отлаживать ход PC.
 * Метод обрабатывает клик по конкретной клетке. Не по событию.
 * @param {object} cell - объект с информацией о клетке.
 * @param {object} cellTD - DOM-клетка.
 * @param {string} playerName - наименование игрока, в которого стрельнули.
 */
function onCellClick(cell, cellTD, playerName) {
    /* TODO: часть возможно дублируется. Проверить на дублирование. */
    const isCanHandler = (type) => type !== CELL_TYPE.SHOT && type !== CELL_TYPE.KILL_AREA && type !== CELL_TYPE.SHOT_SHIPS;
    const activePlayer = SeaBattleState.getEnemyList(playerName);
    const isPCPlayer = SeaBattleState.isPCPlayer(activePlayer);

    if (isCanHandler(cell.type)) {
        if (cell.type === CELL_TYPE.SHIP) {
            const countShipItem = SeaBattleState.getCountShipItem(playerName, cell.attribute.shipId);
            countShipItem.countUnbroken = countShipItem.countUnbroken - 1;
            const shipFinishOff = countShipItem.countUnbroken === 0;

            if (shipFinishOff) {
                setAreaAroundShip(countShipItem.startPosition, CELL_TYPE.KILL_AREA, true);
            }

            if (isPCPlayer) {
                if (shipFinishOff) {
                    SeaBattleState.setLastTurnInfo(activePlayer, false);
                } else {
                    SeaBattleState.setLastTurnInfo(activePlayer, true, cell);
                }
            }

            cell.type = CELL_TYPE.SHOT_SHIPS;
            redrawCell(cellTD, cell.type);

            if (checkVictory(playerName)) {
                alert('VICTORY');
                isVictory = true;
            } else {
                if (isPCPlayer) {
                    PCTurn(activePlayer);
                }
            }
        } else {
            cell.type = CELL_TYPE.SHOT;
            redrawCell(cellTD, cell.type);

            if (!isPCPlayer) {
                PCTurn(playerName);
            }
        }
    }
}

/**
 * Точка входа для выполнения действия компьютером.
 * @param {string} activePlayer - наименование активного игрока.
 */
function PCTurn(activePlayer) {
    const enemyName = SeaBattleState.getEnemyList(activePlayer);

    if (typeof enemyName === 'string') {
        let shotList = getShotListByBCLevel(activePlayer);
        if (shotList.length) {
            const randomIndex = SeaBattle.getRandomNumber(shotList.length - 1);
            doCellClick({...shotList[randomIndex], playerName: enemyName });
        }
    }
}

/**
 * Возвращает список координат для выстрела в соответствии с уровнем PC.
 * @param {string} activePlayer
 * @return {array}
 */
function getShotListByBCLevel(activePlayer) {
    const enemyName = SeaBattleState.getEnemyList(activePlayer);
    const level = SeaBattleState.getPCPlayerLevel();
    let result;

    if (level === RADIO_INPUT_VALUE.SMALL) {
        result = getShotList(enemyName);
    } else {
        result = SeaBattleState.getIsSuccessLastTurn(activePlayer)
            ? getFinishOffList(activePlayer, enemyName)
            : level === RADIO_INPUT_VALUE.LARGE ? getShotListByShipsSize(enemyName) : getShotList(enemyName);
    }
    return result;
}

/**
 * Возвращает массив с координатами выстрелов в соответствии с размером кораблей.
 * Если корабль занимает 4 клетки, не нужно стрелять в область где доступно только 3 клетки.
 * @param {string} enemyName - наименование врага в которого нужно выстрелить.
 */
function getShotListByShipsSize(enemyName) {
    let size = 0;
    SeaBattleState.getEntireShipItem(enemyName).forEach((item) => {
        if (item.countUnbroken > size) {
            size = item.countUnbroken;
        }
    });
    return size > 0 ? getMapForCurrentShip({size}, enemyName, ACTION_KILL) : getShotList(enemyName);
}

/**
 * Возвращает массив с координатами чтобы добить корабль.
 * @param {string} activePlayer - наименование активного игрока.
 * @param {string} enemyName - враг.
 */
function getFinishOffList(activePlayer, enemyName) {
    const successTurn = SeaBattleState.getLastSuccessTurn(activePlayer);
    const direction = findDirection(successTurn, enemyName);
    return direction
        ? getListForShotByDirection(successTurn, direction, enemyName)
        : getTouchingCellForShot(successTurn, enemyName);
}

/**
 * Возвращает массив клеток по которым можно произвести выстрел в соответствии с направлением.
 * @param {object} successTurn - информации по последнему успешному выстрелу.
 * @param {string} direction
 * @param {string} enemyName
 * @return {array}
 */
function getListForShotByDirection(successTurn, direction, enemyName) {
    const getCurrentCell = (i, successTurn, direction, enemyName) => {
        const position = direction === AVAILABLE_DIRECTION.HOR
            ? {x: successTurn.x + i, y: successTurn.y}
            : {x: successTurn.x, y: successTurn.y + i};
        return SeaBattle.checkMapRange(position) ? SeaBattleState.getCellByPosition(position, enemyName) : null;
    };
    const result = [];
    let canUseFront = true;
    let canUseBack = true;

    for (let i = 1; i < 4; i++) {
        canUseBack = canUseBack ? checkCellForShot(getCurrentCell(-i, successTurn, direction, enemyName), result) : canUseBack;
        canUseFront = canUseFront ? checkCellForShot(getCurrentCell(i, successTurn, direction, enemyName), result) : canUseFront;
        if (!canUseBack && !canUseFront) break;
    }
    return result;
}

/**
 * Проверка клетки на возможность произвести по ней выстрел.
 * @param {object} cell
 * @param {array} potentialTargetList
 * @return {boolean} стоит ли продолжать перебирать клетки по этому направлению.
 */
function checkCellForShot(cell, potentialTargetList) {
    let result = false;
    if (cell && !USED_CELL.includes(cell.type)) {
        potentialTargetList.push(cell);
    } else {
        result = cell ? CELL_TYPE.SHOT_SHIPS === cell.type : false;
    }
    return result;
}

/**
 * TODO: остановился тут.
 * TODO: перенести в базовые методы
 * Проверяет соответствие координат.
 * @param {object} first
 * @param {object} second
 * @return {boolean}
 */
function isEqualCoordinate(first, second) {
    return first.x === second.x && first.y === second.y;
}

/**
 * Возвращает примыкающие клетки по которым можно выстрелить.
 * @param {object} position - координаты.
 * @param {string} enemyName
 * @return {array}
 */
function getTouchingCellForShot(position, enemyName) {
    const cellList = getTouchingCell(position).map(item => SeaBattleState.getCellByPosition(item, enemyName));
    return cellList.filter(item => !USED_CELL.includes(item.type));
}

/**
 * Возвращает примыкающие клетки.
 * @param {object} position - координаты.
 */
function getTouchingCell(position) {
    const neighbouringList = [];
    ONES_LIST.forEach(item => {
        neighbouringList.push( { x: position.x + item, y: position.y, direction: AVAILABLE_DIRECTION.HOR } );
        neighbouringList.push( { x: position.x, y: position.y + item, direction: AVAILABLE_DIRECTION.VER } );
    });
    return neighbouringList.filter(item => SeaBattle.checkMapRange(item));
}

/**
 * Просмотривает примыкающие клетки и определяет направление.
 * @param {object} position - координаты.
 * @param {string} playerKey
 */
function findDirection(position, playerKey) {
    const findResult = getTouchingCell(position).find(item => {
        const cell = SeaBattleState.getCellByPosition(item, playerKey);
        return cell && cell.type === CELL_TYPE.SHOT_SHIPS
    });
    return findResult ? findResult.direction : null
}

/**
 * Точка входа для выполнения действия компьютером.
 * @param {object} position - координаты выстрела.
 */
function doCellClick(position) {
    getCellTDByPosition(position).click();
}

/**
 * Возвращает координаты клеток в которые можно произвести выстрел.
 * @param {string} enemyPlayer - наименование врага.
 * @return {Array} массив объектов содержаших в себе координаты необстреленных клеток.
 */
function getShotList(enemyPlayer) {
    const shotList = [];
    SeaBattleState.getMap(enemyPlayer).forEach((item) => {
        // TODO: чуть позже посмотреть не дублируется ли данное условие.
        const notEmptyCellList = [CELL_TYPE.KILL_AREA, CELL_TYPE.SHOT_SHIPS, CELL_TYPE.SHOT];
        // const condition = item.type !== CELL_TYPE.KILL_AREA && item.type !== CELL_TYPE.SHOT_SHIPS && item.type !== CELL_TYPE.SHOT;
        if (!notEmptyCellList.includes(item.type)) {
            shotList.push(item);
        }
    });
    return shotList;
}

/**
 * TODO: опитимизация - вызывать только при убийстве корабля.
 * Проверяем остались ли ещё непотопленные корабли.
 * @param {string} enemyPlayer
 * @return {boolean}
 */
function checkVictory(enemyPlayer) {
    return !notEmptyCountShipList(enemyPlayer);
}

/**
 * Метод проверяет убиты ли все корабли.
 * @param {string} enemyPlayer
 * @return {boolean}
 */
function notEmptyCountShipList(enemyPlayer) {
    return SeaBattleState[enemyPlayer].countShipList.find(item => {
        let result = false;
        if (item.countUnbroken !== 0) {
            result = true;
        }
        return result;
    });
}

/**
 * Обработчик смены уровня сложности.
 * @param {Event} event
 */
function onChangePCLevel(event) {
    SeaBattleState.setPCPlayerLevel(event.target.value);
}

/**
 * Ставим обработчики для <input type="radio>.
 */
function setRadioButtonHandler() {
    let defaultLevel;
    const radioList = document.getElementsByName(RADIO_INPUT_NAME);
    radioList.forEach((item) => {
        item.addEventListener('click', onChangePCLevel);
        if (item.checked) {
            defaultLevel = item.value;
        }
    });

    if (defaultLevel) {
        SeaBattleState.setPCPlayerLevel(defaultLevel);
    }
}

cellHelpers.isEmptyCell = type => type === CELL_TYPE.EMPTY;
cellHelpers.isUsedCell = type => USED_CELL.includes(type);

startSeaBattle();
