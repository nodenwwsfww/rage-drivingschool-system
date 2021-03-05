// eslint-disable-next-line no-unused-vars
import { PedData } from '../interfaces';
import { drivingSchoolData } from './pedsConfig';
import { savePedData } from '../methods';

function sendPedMenu(pedData: PedData) {
    if (pedData.name === 'Виктория') {
        mp.gui.chat.push(`1. Расскажите, что это за место? (слева сверху)`);
        mp.gui.chat.push(
            `2. Информация о получении водительских прав (слева снизу)`,
        );
        mp.gui.chat.push(`3. До свидания (справа сверху)`);
    } else if (pedData.name === 'Михаил') {
        mp.gui.chat.push(`1. Расскажите, что это за место? (слева сверху)`);
        mp.gui.chat.push(`2. Получить водительские права`);
        mp.gui.chat.push(`3. До свидания`);
    }
}

function startDialogWithPlayer(pedData?: PedData) {
    if (!pedData) return;
    if (pedData?.name !== 'Виктория' && pedData?.name !== 'Михаил') return;

    mp.gui.chat.push(`- Приветствую, что тебя интересует?`);
    mp.gui.chat.push(`- Для ответа набери соответствующую цифру`);
    mp.gui.chat.push(`- `);
    mp.gui.chat.push(`- `);

    sendPedMenu(pedData);
    savePedData('drivingSchool', 3, pedData);
}

mp.events.add('drivingSchool_startDialogWithPlayer', startDialogWithPlayer);

export const drivingSchoolPeds: Array<PedData> = [...drivingSchoolData].map(
    (p: PedData) => {
        const ped: PedData = { ...p };
        ped.keySettings.action = startDialogWithPlayer;
        return ped;
    },
);
