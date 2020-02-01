const SeaBattleState = new SeaBattle();
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
 * @return {object}
 */
function setShipSomewhere(shipInfo, playerName, shipIndex) {
    let result = null;
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
    return result;
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
    let checkCallback;
    if (action === ACTION_KILL) {
        checkCallback = (type) => type === CELL_TYPE.KILL_AREA || type === CELL_TYPE.SHOT|| type === CELL_TYPE.SHOT_SHIPS;
    } else {
        checkCallback = (type) => type !== CELL_TYPE.EMPTY;
    }
    SeaBattleState.getMap(playerKey).forEach((item) => {
        if (!checkCallback(item.type)) {
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
 * @param {function} checkCallback - необходимо условие.
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
            if (!resultObj.isVer && !resultObj.isHor) {
                break;
            }
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
    getAroundCellList(initialPosition).forEach((item) => {
        const position = Object.assign(item, { playerName: initialPosition.playerName });

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
        // TODO: массив дублируется.
        [-1, 1].forEach(item => {
            aroundCellList.push({
                x: isHorDirection ? initialPosition.x + i : initialPosition.x + item,
                y: isHorDirection ? initialPosition.y - item : initialPosition.y + i
            });
        });
    }
    return aroundCellList;
}

/**
 * Получить рандомное иди доступное значения направления для переданное начальной точки.
 * @param {object} initialPosition - начальные координаты клетки.
 * @return {string} направление.
 */
function getRandomDirection(initialPosition) {
    let result;
    if (initialPosition.isVer && initialPosition.isHor) {
        result = SeaBattle.getRandomNumber(1) === 0 ? AVAILABLE_DIRECTION.HOR : AVAILABLE_DIRECTION.VER;
    } else {
        result = initialPosition.isVer ? AVAILABLE_DIRECTION.VER : AVAILABLE_DIRECTION.HOR;
    }
    return result;
}

/**
 * Обработчик клика по таблице.
 * @param {Event} event
 */
function onTableClick(event) {
    const strPosition = event.target.getAttribute('dataPosition');
    if (strPosition && !isVictory) {
        const arrayPosition = strPosition.split('-');
        const playerName = SeaBattleState.getPlayerKeyByMapId(event.currentTarget.getAttribute('id'));
        if (playerName) {
            const currentCell = SeaBattleState.getCellByPosition({
                x: Number(arrayPosition[0]),
                y: Number(arrayPosition[1])
            }, playerName);
            onCellClick(currentCell, event.target, playerName);
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
 * TODO: не рефакторил.
 * Возвращает DOM-элемент по атрибуту position.
 * @param {object} position
 * @return
 */
function getCellTDByPosition(position) {
    const mapTable = document.getElementById(SeaBattleState.getMapId(position.playerName));
    const shipList = mapTable.getElementsByClassName('sb_playFiled__cell');
    let result = null;

    for (let i = 0; i < shipList.length; i++) {
        const arrayPosition = shipList[i].getAttribute('dataPosition').split('-');
        if (Number(arrayPosition[0]) === position.x && Number(arrayPosition[1]) === position.y) {
            result = shipList[i];
            break;
        }
    }

    return result;
}

/**
 * TODO: некрасивые метод.
 * Точка входа для выполнения действия компьютером.
 * @param {string} activePlayer - наименование активного игрока.
 */
function PCTurn(activePlayer) {
    const enemyName = SeaBattleState.getEnemyList(activePlayer);
    const PCLevel = SeaBattleState.getPCPlayerLevel();

    if (typeof enemyName === 'string') {
        let shotList = [];

        if (PCLevel === RADIO_INPUT_VALUE.SMALL) {
            shotList = getShotList(enemyName);
        } else {
            if (SeaBattleState.getIsSuccessLastTurn(activePlayer)) {
                shotList = getFinishOffList(activePlayer, enemyName);
            } else {
                shotList = PCLevel === RADIO_INPUT_VALUE.LARGE
                    ? getShotListByShipsSize(enemyName)
                    : getShotList(enemyName);
            }
        }

        if (shotList.length) {
            const randomIndex = SeaBattle.getRandomNumber(shotList.length - 1);
            console.log(shotList[randomIndex]);
            doCellClick(Object.assign(shotList[randomIndex], { playerName: enemyName }));
        }
    }
}

/**
 * TODO: некрасивые метод.
 * Возвращает массив с координатами выстрелов в соответствии с размером кораблей.
 * Если корабль занимает 4 клетки, не нужно стрелять в область где доступно только 3 клетки.
 * @param {string} enemyName - наименование врага в которого нужно выстрелить.
 */
function getShotListByShipsSize(enemyName) {
    let result = [];
    let maxSize = 0;

    SeaBattleState.getEntireShipItem(enemyName).forEach((item) => {
        if (item.countUnbroken > maxSize) {
            maxSize = item.countUnbroken;
        }
    });
    if (maxSize > 0) {
        result = getMapForCurrentShip({ size: maxSize }, enemyName, ACTION_KILL);
    } else {
        result = getShotList(enemyName);
    }
    return result;
}

/**
 * TODO: очень страшный метод. Отрефакторить.
 * Возвращает массив с координатами чтобы добить корабль.
 * @param {string} activePlayer - наименование активного игрока.
 * @param {string} enemyName - враг.
 */
function getFinishOffList(activePlayer, enemyName) {
    const successTurn = SeaBattleState.getLastSuccessTurn(activePlayer);
    const potentialTargetList = [];
    const direction = findDirection(successTurn, enemyName);

    if (direction) {
        let canBack = true;
        let canFront = true;

        for (let i = 1; i < 4; i++) {
            if (canBack) {
                const currentPosition = direction === AVAILABLE_DIRECTION.HOR ? { x: successTurn.x - i, y: successTurn.y } : { x: successTurn.x, y: successTurn.y - i };
                const resultCheck = checkPCFinishOffShot(currentPosition, enemyName);
                canBack = resultCheck.can;

                if (resultCheck.cell) {
                    potentialTargetList.push(resultCheck.cell);
                }
            }
            if (canFront) {
                const currentPosition = direction === AVAILABLE_DIRECTION.HOR ? { x: successTurn.x + i, y: successTurn.y } : { x: successTurn.x, y: successTurn.y + i };
                const resultCheck = checkPCFinishOffShot(currentPosition, enemyName);
                canFront = resultCheck.can;

                if (resultCheck.cell) {
                    potentialTargetList.push(resultCheck.cell);
                }
            }
            if (!canFront && canBack) {
                break;
            }
        }
    } else {
        const enemyShotCell = getShotList(enemyName);
        getNeighbouringCell(successTurn).forEach((aroundItem) => {
            enemyShotCell.forEach((emptyItem) => {
                if (aroundItem.x === emptyItem.x && aroundItem.y === emptyItem.y) {
                    potentialTargetList.push(aroundItem);
                }
            });
        });
    }

    return potentialTargetList;
}

/**
 * TODO: не очень красивое использование метода. Вероятнее всего нужно переделать.
 * Проверяет можем ли стрелять по этой клетке и стоит ли продолжать дальше перебирать знаения.
 * @param {object} position - координаты.
 * @param {object} enemyName - враг.
 * @return {object}
 */
function checkPCFinishOffShot(position, enemyName) {
    const result = {
        can: !!SeaBattle.checkMapRange(position),
        cell: null
    };
    if (result.can) {
        /* TODO: кажется дублируется массив и условие. */
        const currentCell = SeaBattleState.getCellByPosition(position, enemyName);
        const conditionList = [CELL_TYPE.SHOT_SHIPS, CELL_TYPE.SHOT, CELL_TYPE.KILL_AREA];
        if (!conditionList.includes(currentCell.type)) {
            result.cell = currentCell;
        }
    }
    return result;
}

/**
 * Возвращает примыкающие клетки.
 * @param {object} position - координаты.
 */
function getNeighbouringCell(position) {
    const neighbouringList = [];
    // TODO: проверить что не дублируется и убрать.
    const oneList = [-1, 1];
    oneList.forEach(item => {
        neighbouringList.push( { x: position.x + item, y: position.y, direction: AVAILABLE_DIRECTION.HOR } );
        neighbouringList.push( { x: position.x, y: position.y + item, direction: AVAILABLE_DIRECTION.VER } );
    });
    return neighbouringList;
}

/**
 * Просмотривает примыкающие клетки и определяет направление.
 * @param {object} position - координаты.
 * @param {string} playerKey
 */
function findDirection(position, playerKey) {
    // TODO: проверить, что условие не дублируется и убрать проверку из отдельной функции.
    const checkCellIsShotChips = cell => cell && cell.type === CELL_TYPE.SHOT_SHIPS;
    const findResult = getNeighbouringCell(position).find(item => {
        let result = false;
        if (SeaBattle.checkMapRange(item)) {
            const cell = SeaBattleState.getCellByPosition(item, playerKey);
            if (checkCellIsShotChips(cell)) {
                result = true;
            }
        }
        return result;
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

startSeaBattle();
