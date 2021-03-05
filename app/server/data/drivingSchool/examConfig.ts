export { examConfig } from './config';

interface Point {
    position: Vector3Mp;
    heading: number;
}
export interface VehicleData {
    category: string;
    model: string;
    color?: [Array2d, Array2d] | [RGB, RGB];
    parkColshapeRange: number;
}

interface ReturnData {
    position: Vector3Mp;
    heading: number;
    dimension: number;
}

export interface ExamConfig {
    route: Point[];
    vehiclesData: VehicleData[];
    startPoint: {
        position: Vector3Mp;
        heading: number;
    };
    returnPlayerBackData: ReturnData;
    licenses: string[];
}
