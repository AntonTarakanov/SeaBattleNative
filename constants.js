/**
 * @param {object} Объект с описанием кораблей.
 */
const SHIP_INFO = {
    one: {
        size: 1,
        count: 4,
        name: 'Frigate'
    },
    two: {
        size: 2,
        count: 3,
        name: 'Destroyer'
    },
    three: {
        size: 3,
        count: 2,
        name: 'Cruiser'
    },
    four: {
        size: 4,
        count: 1,
        name: 'Battleship'
    }
};

/* @param {number} Кол-во игроков (полей). */
const AMOUNT_PLAYERS = 2;

/* @param {object} Размеры игрового поля (карты). */
const MAP_SIZE = {
    SIZE_X: 10,
    SIZE_Y: 10
};

/* @param {object} возможные значения поля "type" для клетки. */
const CELL_TYPE = {
    EMPTY: 'empty',
    SHIP: 'ship',
    AREA: 'area',
    KILL_AREA: 'killArea',
    SHOT: 'shot',
    SHOT_SHIPS: 'shotShips'
};

/* @param {object} Доступные направления расположения коробля. */
const AVAILABLE_DIRECTION = {
    HOR: 'horizontal',
    VER: 'vertical',
};

/* @param {object} Соответствие идентификатора на форме наименование свойства в state. */
const ID_BY_NAME = {
    player0: {
        map: 'playerMapId',
        title: 'titlePlayer0'
    },
    player1: {
        map: 'playerMapIdTwo',
        title: 'titlePlayer1'
    }
};

/* @param {object} значения наименований по умолчанию */
const DEFAULT_NIK_NAME = {
    player0: 'HumanPlayer',
    player1: 'PCPlayer'
};

/* @param {string} наименование <input type="radio> */
const RADIO_INPUT_NAME = 'level';

/* @param {object} соответствие значений <input type="radio> */
const RADIO_INPUT_VALUE = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large'
};

/* @param {string} какое действие следует выполнить*/
const ACTION_KILL = 'kill';
const ACTION_INSTALL = 'install';

const USED_CELL = [CELL_TYPE.KILL_AREA, CELL_TYPE.SHOT, CELL_TYPE.SHOT_SHIPS];

const ONES_LIST = [-1, 1];