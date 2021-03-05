// eslint-disable-next-line no-unused-vars
import { PedData } from '../interfaces';

export const drivingSchoolData: PedData[] = [
    {
        id: 0,
        name: 'Виктория',
        label: 'Консультат автошколы',
        model: 'ig_molly',
        position: {
            x: 442.6281433105469,
            y: -643.7672729492188,
            z: 28.584985733032227,
        },
        heading: 172.8732452392578,
        dimension: 0,
        keySettings: {
            status: true,
            keyCode: '0x45',
            range: 2.5,
        },
        phrases: [
            [
                {
                    text: 'Это место для получения прав',
                },
            ],
            [
                {
                    text: 'Ну типо информация, держи, напиши понял если понял',
                },
            ],
            [
                {
                    text: 'До свидания!',
                },
            ],
        ],
    },
    {
        id: 1,
        name: 'Михаил',
        label: 'Инструктор автошколы',
        model: 'cs_bankman',
        position: {
            x: 440.0052185058594,
            y: -641.6051025390625,
            z: 28.58513641357422,
        },
        heading: -4.084766864776611,
        dimension: 0,
        keySettings: {
            status: true,
            keyCode: '0x45',
            range: 2.5,
        },
        phrases: [
            [
                {
                    type: 'confirm',
                    text: 'Это место для получения прав',
                },
            ],
            [
                {
                    type: 'select',
                    text:
                        'Окей. Теперь тебе предстоит выбрать права.\n1. Категория M (цена 100$)\n2. Категория D (цена 100$)\n3. Категория C (цена 100$)\n4. Пожалуй, откажусь',
                    choiceTypes: ['await', 'await', 'await', 'goodBye'],
                },
                {
                    type: 'await',
                    text:
                        'Так и знал, всё, сейчас ты окажешься на площадке для сдачи экзаменов',
                },
            ],
            [
                {
                    type: 'goodBye',
                    text: 'До свидания!',
                },
            ],
        ],
    },
];
