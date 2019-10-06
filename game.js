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
    let checkCallback = action === ACTION_KILL ?
        (type => SeaBattle.getInvalidShotList().includes(type)) : (type => type !== CELL_TYPE.EMPTY);

    return SeaBattleState.getMap(playerKey).reduce((result, item) => {
        if (!checkCallback(item.type)) {
            const checkCell = checkCanActionShip(Object.assign({}, item, {
                size: shipInfo.size,
                playerKey: playerKey
            }), checkCallback);
            if (checkCell.isHor || checkCell.isVer) {
                result.push(Object.assign(checkCell, item));
            }
        }
        return result;
    }, []);
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
    [-1, initialPosition.size].forEach(item => {
        aroundCellList.push({
            x: isHorDirection ? initialPosition.x + item : initialPosition.x,
            y: isHorDirection ? initialPosition.y : initialPosition.y + item
        });
    });

    // Записываем боковины корабля.
    for (let i = -1; i < initialPosition.size + 1; i++) {
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
 * Получить рандомное или доступное значение направления для переданной начальной точки.
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
        const playerName = SeaBattleState.getPlayerKeyByMapId(event.currentTarget.getAttribute('id'));
        if (playerName) {
            const currentCell = SeaBattleState.getCellByPosition(SeaBattle.getPositionByAttribute(strPosition), playerName);
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
    const activePlayer = SeaBattleState.getEnemyList(playerName);
    const isPCPlayer = SeaBattleState.isPCPlayer(activePlayer);

    if (SeaBattle.checkTypeForShot(cell.type)) {
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
    const PCLevel = SeaBattleState.getPCPlayerLevel();

    if (typeof enemyName === 'string') {
        let shotList = [];

        if (PCLevel === RADIO_INPUT_VALUE.SMALL) {
            shotList = getShotList(enemyName);
        } else {
            if (SeaBattleState.getIsSuccessLastTurn(activePlayer)) {
                shotList = getFinishOffList(activePlayer, enemyName);
            } else {
                if (PCLevel === RADIO_INPUT_VALUE.LARGE) {
                    shotList = getShotListByShipsSize(enemyName);
                } else {
                    shotList = getShotList(enemyName);
                }
            }
        }

        if (shotList.length) {
            const randomIndex = SeaBattle.getRandomNumber(shotList.length - 1);
            doCellClick(Object.assign(shotList[randomIndex], { playerName: enemyName }));
        }
    }
}

/**
 * Возвращает массив с координатами выстрелов в соответствии с размером корабля.
 * Пояснение: если корабль занимает 4 клетки, не нужно стрелять в область, где доступно только 3 клетки.
 * @param {string} enemyName - наименование врага в которого нужно выстрелить.
 */
function getShotListByShipsSize(enemyName) {
    const maxSize = SeaBattleState.getEntireShipItem(enemyName).reduce((maxSize, item) => {
        return item.countUnbroken > maxSize ? item.countUnbroken : maxSize;
    }, 0);
    return maxSize > 0 ? getMapForCurrentShip({ size: maxSize }, enemyName, ACTION_KILL) : getShotList(enemyName);
}

/**
 * Возвращает массив с координатами чтобы добить корабль.
 * @param {string} activePlayer - наименование активного игрока.
 * @param {string} enemyName - враг.
 */
function getFinishOffList(activePlayer, enemyName) {

    /**
     * Получить потенциальные координаты для выстрела при возможности определить направление.
     * @param {number} value - коэффициент для поиска нужной координаты.
     * @param {array} potentialTargetList - аккумулируем значения в этот массив.
     */
    function getPotentialTargetByDirection(value, potentialTargetList) {
        const currentPosition = direction === AVAILABLE_DIRECTION.HOR ?
            {x: successTurn.x + value, y: successTurn.y} : {x: successTurn.x, y: successTurn.y + value};
        const resultCheck = checkPCFinishOffShot(currentPosition, enemyName);

        if (resultCheck.cell) potentialTargetList.push(resultCheck.cell);
        return resultCheck.can;
    }

    const successTurn = SeaBattleState.getLastSuccessTurn(activePlayer);
    const direction = findDirection(successTurn, enemyName);
    let potentialTargetList = [];

    if (direction) {
        /* TODO: думаю, можно переписать на рекурсию */
        let canBack = true;
        let canFront = true;
        for (let i = 1; i < 4; i++) {
            if (canBack) canBack = getPotentialTargetByDirection(-i, potentialTargetList);
            if (canFront) canFront = getPotentialTargetByDirection(i, potentialTargetList);
            if (!canFront && !canBack) break;
        }
    } else {
        getNeighbouringCell(successTurn).forEach((aroundItem) => {
            potentialTargetList = getShotList(enemyName).filter(emptyItem => {
                return SeaBattle.matchCoordinate(aroundItem, emptyItem);
            });
        });
    }

    return potentialTargetList;
}

/**
 * Проверяет можем ли стрелять по этой клетке и стоит ли продолжать дальше перебирать значения.
 * @param {object} position - координаты.
 * @param {object} enemyName - враг.
 * @return {object}
 */
function checkPCFinishOffShot(position, enemyName) {
    const result = {
        can: true,
        cell: null
    };

    if (SeaBattle.checkMapRange(position)) {
        const currentCell = SeaBattleState.getCellByPosition(position, enemyName);
        if (currentCell.type === CELL_TYPE.SHOT_SHIPS) {
            result.can = true;
        } else {
            if (currentCell.type !== CELL_TYPE.SHOT && currentCell.type !== CELL_TYPE.KILL_AREA) {
                result.cell = currentCell;
            }
        }
    } else {
        result.can = false;
    }

    return result;
}

/**
 * Возвращает примыкающие клетки.
 * @param {object} position - координаты.
 */
function getNeighbouringCell(position) {
    const neighbouringList = [];
    [-1, 1].forEach(item => {
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
    return getNeighbouringCell(position).find(item => {
        let findResult = false;
        if (SeaBattle.checkMapRange(item)) {
            const cell = SeaBattleState.getCellByPosition(item, playerKey);
            if (cell && cell.type === CELL_TYPE.SHOT_SHIPS) {
                result = true;
            }
        }
        return findResult;
    }).direction;
}

/**
 * Точка входа для выполнения действия компьютером. Вероятно, нужно будет переписать.
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
    return SeaBattleState.getMap(enemyPlayer).filter(item => SeaBattle.checkTypeForShot(item.type));
}

/**
 * Проверяем остались ли ещё непотопленные корабли.
 * @param {string} enemyPlayer
 * @return {boolean}
 */
function checkVictory(enemyPlayer) {
    return !SeaBattleState[enemyPlayer].countShipList.some(item => item.countUnbroken !== 0);
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
