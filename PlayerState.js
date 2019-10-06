class SeaBattle {
    constructor() {
        for (let i = 0; i < AMOUNT_PLAYERS; i++) {
            const playerKey = 'player' + i;
            this[playerKey] = new PlayerState(enterYourName(i), Boolean(i), ID_BY_NAME[playerKey].map);
        }
    }

    getCountShipList(playerKey) {
        return this[playerKey].countShipList;
    }

    getCountShipItem(playerKey, shipId) {
        return this[playerKey].getCountShipItem(shipId);
    }

    getEntireShipItem(playerKey) {
        const entireList = [];
        this.getCountShipList(playerKey).forEach((item) => {
            if (item.countUnbroken !== 0) {
                entireList.push(item);
            }
        });
        return entireList;
    }

    getMap(playerKey) {
        return this[playerKey].map;
    }

    getIsSuccessLastTurn(playerKey) {
        return this[playerKey].lastTurnInfo.isSuccess;
    }

    getMapId(playerKey) {
        return this[playerKey].documentMapId;
    }

    getPlayerKeyByMapId(mapId) {
        let result;
        for (let key in this) {
            if (this.hasOwnProperty(key) && this[key].documentMapId === mapId) {
                result = key;
            }
        }
        return result;
    }

    isPCPlayer(playerKey) {
        return this[playerKey].isPCPlayer;
    }

    setPCPlayerLevel(level) {
        for (let key in this) {
            if (this.hasOwnProperty(key) && this.isPCPlayer(key)) {
                this[key].PCLevel = level;
            }
        }
    }

    getPCPlayerLevel() {
        let result;
        for (let key in this) {
            if (this.hasOwnProperty(key) && this.isPCPlayer(key)) {
                result = this[key].PCLevel;
            }
        }
        return result;
    }

    setLastTurnInfo(playerKey, isSuccess, position) {
        this[playerKey].setLastTurnInfo(isSuccess, position);
    }

    getLastSuccessTurn(playerKey) {
        return this[playerKey].lastTurnInfo.getLastSuccessTurn();
    }

    getCellByPosition(position, playerKey) {
        playerKey = playerKey ? playerKey : position.playerName;
        return this[playerKey].getCellByPosition(position);
    }

    /**
     * Возвращает список врагов.
     * @param {string} activePlayer - наименование активного игрока.
     * @return {Array|string}
     */
    getEnemyList(activePlayer) {
        const resultList = [];
        for (let key in this) {
            if (this.hasOwnProperty(key) && key !== activePlayer) {
                resultList.push(key);
            }
        }
        return resultList.length === 1 ? resultList[0] : resultList;
    }

    /**
     * Возвращает рандомное число по переданным параметрам.
     * @param {number} max.
     * @param {number} min.
     * @return {number}
     */
    static getRandomNumber(max = 10, min = 0) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Проверить соответствие возможному диапазону.
     * @param {object} position - объект со свойствами x и y.
     */
    static checkMapRange(position) {
        return position.x >= 0 && position.y >= 0 && position.x <= 9 && position.y <= 9
    }

    /**
     * Проверить соответствие координат X и Y.
     * @param {object} firstPosition - объект со свойствами x и y.
     * @param {object} secondPosition - объект со свойствами x и y.
     */
    static matchCoordinate(firstPosition, secondPosition) {
        return firstPosition.x === secondPosition.x && firstPosition.y === secondPosition.y
    }

    /**
     * Проверяет можно ли выполнять выстрел в данный тип клетки.
     * @param {string} cellType - тип клетки.
     * @return {boolean}
     */
    static checkTypeForShot(cellType) {
        return !SeaBattle.getInvalidShotList().includes(cellType);
    }

    /**
     * Возвращает массив значений клетки по которым нельзя производить выстрел.
     * @return {array}
     */
    static getInvalidShotList() {
        return [CELL_TYPE.KILL_AREA, CELL_TYPE.SHOT_SHIPS, CELL_TYPE.SHOT];
    }

    /**
     * Возвращает объект с координатами по переданным атрибутам.
     * @param {string} dataPosition
     * @return {object}
     */
    static getPositionByAttribute(dataPosition) {
        const arrayPosition = dataPosition.split('-');
        return {
            x: Number(arrayPosition[0]),
            y: Number(arrayPosition[1])
        };
    }
}

class PlayerState {
    constructor(nikName, isPCPlayer, documentMapId) {
        this.nikName = nikName;
        this.isPCPlayer = isPCPlayer;
        this.documentMapId = documentMapId;
        this.map = PlayerState.createEmptyMap();
        this.handlers = { click: onTableClick };
        this.countShipList = [];
        this.lastTurnInfo = new LastTurnInfo();

        if (isPCPlayer) {
            this.PCLevel = RADIO_INPUT_VALUE.LARGE;
        }
    }

    /**
     * Возвращает объект из массива-карты по переданным координатам.
     * @param {object} position - координаты клетки.
     * @return {undefined|object}
     */
    getCellByPosition(position) {
        return this.map.find(item => SeaBattle.matchCoordinate(item, position));
    }

    getCountShipItem(shipId) {
        return this.countShipList.find(item => item.name === shipId);
    }

    setLastTurnInfo(isSuccess, position) {
        this.lastTurnInfo.setLastTurnInfo(isSuccess, position);
    }

    /**
     * Метод возвращает массив, по которому в дальнейшем будем строить и изменять таблицу-карту.
     * @return {Array}
     */
    static createEmptyMap() {
        const result = [];
        for (let i = 0; i < MAP_SIZE.SIZE_X; i++) {
            for (let j = 0; j < MAP_SIZE.SIZE_Y; j++) {
                result.push(Object.assign(PlayerState.getEmptyCell(), {
                    x: i,
                    y: j,
                    attribute: {
                        position: [i, j].join('-')
                    }
                }));
            }
        }
        return result;
    }

    /**
     * Метод возвращает пустую клетку.
     * @param {number} x
     * @param {number} y
     * @return {object}
     */
    static getEmptyCell(x = null, y = null) {
        return {
            x: x,
            y: y,
            type: CELL_TYPE.EMPTY,
            attribute: {},
        };
    }

    /**
     * Метод возвращает пустой элемент для массива "ShipList".
     * @param {string} name - наименование (идентификатор) корабля.
     * @param {number} countUnbroken - кол-во неповреждённых клеток.
     * @param {object} startPosition - стартовые координаты корабля.
     * @return {object}
     */
    static getEmptyItemShipList(name = '', countUnbroken = null, startPosition = {}) {
        return {
            name: name,
            countUnbroken: countUnbroken,
            startPosition: startPosition
        };
    }
}

class LastTurnInfo {
    constructor() {
        this.isSuccess = false;
        this.lastSuccessTurn = {
            x: null,
            y: null
        };
    }

    getLastSuccessTurn() {
        return this.lastSuccessTurn;
    }

    /**
     * Установить значение в lastTurnInfo.
     * @param {boolean} isSuccess - удачное ли попадание.
     * @param {object} position - координаты выстрела.
     */
    setLastTurnInfo(isSuccess, position) {
        this.isSuccess = isSuccess;
        if (isSuccess) {
            Object.assign(this.lastSuccessTurn, position);
        } else {
            this.lastSuccessTurn = {};
        }
    }
}

