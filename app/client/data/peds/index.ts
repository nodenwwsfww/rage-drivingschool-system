import { drivingSchoolPeds } from './drivingSchool';
// eslint-disable-next-line no-unused-vars
import { PedData } from './interfaces';
import { getPedDataByShape, getActivateKeyCodeByPedData } from './methods';

export const pedsData: PedData[] = [...drivingSchoolPeds];
try {
    const keyShapes: ColshapeMp[] = []; // Array of colshapes with bound keys

    pedsData.forEach((ped: PedData) => {
        mp.peds.new(
            mp.game.joaat(ped.model),
            new mp.Vector3(ped.position.x, ped.position.y, ped.position.z),
            ped.heading,
            ped.dimension,
        );

        if (ped.keySettings.status) {
            // Если есть возможность юзать клавиши для вызова диалога
            const newShape: ColshapeMp = mp.colshapes.newSphere(
                ped.position.x,
                ped.position.y,
                ped.position.z,
                ped.keySettings.range,
                ped.dimension,
            );
            ped.keySettings.shapeId = newShape.id;
            keyShapes.push(newShape);
        }

        mp.labels.new(
            ped.label,
            new mp.Vector3(ped.position.x, ped.position.y, ped.position.z + 1),
            {
                color: [255, 255, 0, 255],
                dimension: ped.dimension,
                drawDistance: ped.keySettings.range,
                font: 4,
            },
        );
    });

    const keyPressHandler: Function = () => {
        // @ts-ignore
        if (!player.currentPedId) return;

        const pedData: PedData = pedsData.find(
            (ped: PedData) =>
                // @ts-ignore
                ped.id === player.currentPedId,
        );
        if (pedData) {
            pedData.keySettings.action(pedData);
        }
    };

    mp.events.add('playerEnterColshape', (shape: ColshapeMp) => {
        if (keyShapes.includes(shape)) {
            const pedData: PedData = getPedDataByShape(shape);
            const keyCode: number | null = getActivateKeyCodeByPedData(pedData);
            if (!keyCode) return;

            // @ts-ignore
            player.currentPedId = pedData.id;
            mp.keys.bind(keyCode, true, keyPressHandler);
        }
    });

    mp.events.add('playerExitColshape', (shape: ColshapeMp) => {
        if (keyShapes.includes(shape)) {
            const pedData: PedData = getPedDataByShape(shape);
            const keyCode: number | null = getActivateKeyCodeByPedData(pedData);
            if (!keyCode) return;

            mp.keys.unbind(keyCode, true, keyPressHandler);

            // @ts-ignore
            player.currentPedId = null;

            mp.events.callRemote(
                '_updatePlayerData',
                JSON.stringify({
                    isInDialogWithPed: false,
                    dialogWithPedData: null,
                }),
            );
        }
    });
} catch (e) {
    mp.events.callRemote('handleClientError', JSON.stringify(e));
}
