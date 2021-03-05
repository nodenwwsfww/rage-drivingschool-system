// eslint-disable-next-line no-unused-vars
import { DialogData } from '../interfaces';

export interface Action {
    type: string;
    name: string;
    callback: (...args: any[]) => void;
}

export const actions: Action[] = [
    {
        type: 'drivingSchool',
        name: 'startGettingLicense',
        callback: (player: PlayerMp, dialogData: DialogData) => {
            const selectedLicenseId: number = Number(dialogData.currentAnswer);

            player.setVariable('dialogWithPedData', null);
            player.setVariable('isInDialogWithPed', false);

            // Используем выбранную лицензию, 1 - M, 2 - D, 3 - C
            // Снимаем деньги либо здесь либо при старте экзамена
            mp.events.call(
                'drivingSchool_startExam',
                player,
                selectedLicenseId,
            );
        },
    },
];
