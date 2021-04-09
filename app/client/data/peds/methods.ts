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

export const getPedDataByShape = (shape: ColshapeMp): PedData => {
    const result = pedsData.find((ped: PedData) => ped.keySettings.shapeId === shape.id);
    if (!result) throw new Error('Could not find pedData in pedsData by shapeId');
    return result;
};

export const getActivateKeyCodeByPedData = (
    pedData: PedData,
): number => {
    const result = Number(pedData?.keySettings?.keyCode);
    if (!result) throw new Error('Could not get pedData keyCode or parse keyCode to Number');
    return result;
};
