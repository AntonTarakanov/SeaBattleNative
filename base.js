/* ================================================================================================================= */
/**
 * Что нужно сделать:
 * 0. Убрать все тудушки.
 * 1. Переделать хранение данных на Map. Ключ - объект с координатами.
 * 2. Добавить новые уровени сложности (оптимальное расстояние выбирать).
 * 3. Есть ошибка с выстрелом компьютера.
 * 4. Переработать стили чтобы была возможность располагать доп. окна/настройки.
 * 5. isVictory - перенести в SeaBattleState.
 * 6. Может есть смысл сделать универсальный цикл for где обыгрываются только пару значений.
 * 7. Написать метод "Получить рандомны элемент из переданного массива"
 */
/**
 * Уровни сложности.
 * small - все выстрелы рандомны.
 * medium - добивает раненых.
 * large - стреляет только в клетки, где может расположиться самый большой корабль.
 * След. планируемое улучшение - стрелять оптимальным расстоянием друг от друга в соответствии с самым большим живым кораблём.
 */
/* ================================================================================================================= */

/**
 * Пути подгружаемых скриптов.
 */
const SCRIPT_PATH = {
    MAP_RENDER: './mapRender.js',
    GAME: './game.js',
    CONSTANTS: './constants.js',
    PLAYER_STATE: './PlayerState.js'
};

/**
 * Метод загружаем файл скрипта.
 * @param {string} path - путь загружаемого скрипта.
 * @return {Promise}
 */
function loadScript(path) {
    const loadScript = document.createElement('script');

    loadScript.src = path;
    document.body.appendChild(loadScript);

    return new Promise((resolve, reject) => {
        loadScript.onload = () => resolve();
        loadScript.onerror = () => reject();
    });
}

/**
 * @return {Promise}
 */
loadScript(SCRIPT_PATH.CONSTANTS).then(() => {
    return loadScript(SCRIPT_PATH.PLAYER_STATE);
}).then(() => {
    return loadScript(SCRIPT_PATH.MAP_RENDER);
}).then(() => {
    return loadScript(SCRIPT_PATH.GAME);
});
