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
    }

    /**
     * Возвращает объект из массива-карты по переданным координатам.
     * @param {object} position - координаты клетки.
     * @return {null|number}
     */
    getCellByPosition(position) {
        let itemResult = null;
        this.map.every((item) => {
            let everyResult = true;
            if (item.x === position.x && item.y === position.y) {
                itemResult = item;
                everyResult = false;
            }
            return everyResult;
        });
        return itemResult;
    }

    getCountShipItem(shipId) {
        let returnResult = null;
        this.countShipList.every((item) => {
            let result = true;
            if (item.name === shipId) {
                returnResult = item;
                result = false;
            }
            return result;
        });
        return returnResult;
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
     * GAME_METHOD. Метод возвращает пустой элемент для массива "ShipList".
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

