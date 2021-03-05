export interface PedData {
    id: number;
    name: string; // Имя персонажа
    label: string; // Label персонажа
    model: string; // Название одежды
    position: { x: number; y: number; z: number };
    heading: number;
    dimension: number;
    keySettings: {
        status: boolean; // Статус: работает ли активация клавиши у педа
        keyCode: string; // json не поддерживает 16-ычные коды, 0x45 и т.д
        range: number; // Диапазон расстояния для взаимодействия с педом (активация клавиши)
        action?: Function; // Срабатывает при нажатии клавиши
        shapeId?: number;
    };
    phrases: Phrase[][];
}
interface Phrase {
    type?: string;
    text: string;
    choiceTypes?: string[];
}
