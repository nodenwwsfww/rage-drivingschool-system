mp.events.add('playerEnterColshape', (player: PlayerMp, shape: ColshapeMp) => {
    player.setVariable('colshapeData', shape);
});

mp.events.add('playerExitColshape', (player: PlayerMp) => {
    player.setVariable('colshapeData', null);
});
