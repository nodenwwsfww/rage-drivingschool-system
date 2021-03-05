import './colshape';
import './chat';

// temp code for tests

mp.events.add('playerJoin', (player: PlayerMp) => {
    player.setVariable('userId', 1);
    player.setVariable('licenses', [false, false, false]);
    setTimeout(() => {
        player.position = new mp.Vector3(
            440.0052185058594,
            -641.6051025390625,
            28.58513641357422,
        );
        player.heading = -4.084766864776611 + 180.0;
        player.dimension = 0;
    }, 6000);
});

mp.events.add('_updatePlayerData', (player: PlayerMp, dataInJSON) => {
    const data = JSON.parse(dataInJSON);
    for (const key of Object.keys(data)) {
        player.setVariable(key, data[key]);
    }
});
