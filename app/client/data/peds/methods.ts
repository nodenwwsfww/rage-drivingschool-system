// eslint-disable-next-line no-unused-vars
import { PedData } from './interfaces';
import { pedsData } from './index';
// eslint-disable-next-line no-unused-vars

export const savePedData = (
    pedType: string,
    countOfPossibleAnswers: number,
    pedData: PedData,
) => {
    mp.events.callRemote(
        '_updatePlayerData',
        JSON.stringify({
            isInDialogWithPed: true,
        }),
    );

    const dialogWithPedData: any = {
        pedType,
        countOfPossibleAnswers,
        currentAnswer: null,
        currentPhraseNodeIdx: -1,
        currentPhraseIdx: -1,
        pedData,
    };

    mp.events.callRemote(
        '_updatePlayerData',
        JSON.stringify({
            dialogWithPedData,
        }),
    );
};

export const getPedDataByShape = (shape: ColshapeMp): PedData | undefined =>
    pedsData.find((ped: PedData) => ped.keySettings.shapeId === shape.id);

export const getActivateKeyCodeByPedData = (
    pedData: PedData,
): number | null => {
    if (!pedData) return null;
    return Number(pedData.keySettings.keyCode) || null;
};
