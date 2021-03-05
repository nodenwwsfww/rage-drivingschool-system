import {
    examConfig,
    // eslint-disable-next-line no-unused-vars
    ExamConfig,
    // eslint-disable-next-line no-unused-vars
    VehicleData,
} from '../../../data/drivingSchool/examConfig';

/* В системе реализован Map список в котором ключ - id пользователя, значение - его VehicleMp
 * */

// dev tools, remove it pls.
import * as fs from 'fs';

function logData(message: string) {
    try {
        console.log(message);
        fs.appendFileSync('logger.txt', `${message}\n`);
    } catch (e) {
        console.log(e);
    }
}
//

interface ExamData {
    vehicle: VehicleMp;
    licenseId: number;
    wayData: {
        id: number;
    };
}
interface DrivingExamStaticFields {
    examVehiclesInUse: Map<string, ExamData>;
    examConfig: ExamConfig;
}

// @ts-ignore
mp.events.addCommand(
    'alpha',
    (player: PlayerMp, fullText: string, alpha: string) => {
        logData(alpha);
        if (player !== undefined && alpha !== undefined)
            player.call('setAlpha', [Number(alpha)]);
    },
);

mp.events.addCommand('tps', player => {
    if (player.vehicle) {
        player.vehicle.position =
            examConfig.route[examConfig.route.length - 1].position;
    }
});

class DrivingExam implements DrivingExamStaticFields {
    examVehiclesInUse: Map<string, ExamData> = new Map();

    examConfig: ExamConfig = examConfig;

    constructor() {
        this.initEvents();
    }

    selectCarForPlayer(player: PlayerMp, licenseId: number): VehicleData {
        return this.examConfig.vehiclesData[licenseId - 1];
    }

    createCarForPlayer(player: PlayerMp, vehicleData: VehicleData): VehicleMp {
        return mp.vehicles.new(
            mp.joaat(vehicleData.model),
            this.examConfig.startPoint.position,
            {
                heading: this.examConfig.startPoint.heading,
                numberPlate: 'studyVehicle',
                color: vehicleData.color,
                locked: true,
                dimension: player.id + 1,
            },
        );
    }

    setNextMarkForPlayer(player: PlayerMp, userId: string): void {
        const data: ExamData = { ...this.examVehiclesInUse.get(userId) };

        // Тут проверка на то не является ли это последним чекпоинтом в списке
        data.wayData.id += 1;

        if (data.wayData.id === this.examConfig.route.length - 1) {
            const vehicleData: VehicleData = this.examConfig.vehiclesData[
                data.licenseId - 1
            ];

            const alphaVehicleData = {
                model: mp.joaat(vehicleData.model),
                position: this.examConfig.route[data.wayData.id].position,
                options: {
                    heading: this.examConfig.route[data.wayData.id].heading,
                    numberPlate: 'studyVehicle',
                    color: vehicleData.color,
                    locked: true,
                    dimension: player.id + 1,
                    alpha: 102,
                },
            };

            player.call('drivingSchool_createClientAlphaVehicle', [
                JSON.stringify(alphaVehicleData),
            ]);

            player.call('drivingSchool_createClientParkColshape', [
                JSON.stringify({
                    position: this.examConfig.route[data.wayData.id].position,
                    range: vehicleData.parkColshapeRange,
                }),
            ]);
            player.call('drivingSchool_toggleCollisionForVehicle', [false]);
        } else {
            const checkPointData = {
                type: 1,
                position: this.examConfig.route[data.wayData.id].position,
                radius: 10,
                options: {
                    direction: this.examConfig.route[data.wayData.id + 1]
                        .position,
                    color: [255, 255, 255, 255],
                    visible: true,
                    dimension: player.dimension,
                },
            };

            const blipData = {
                sprite: 38,
                position: this.examConfig.route[data.wayData.id].position,
                options: {
                    color: 1,
                    shortRange: true,
                    dimension: player.dimension,
                },
            };

            player.call('drivingSchool_createClientCheckPoint', [
                JSON.stringify(checkPointData),
            ]);

            player.call('drivingSchool_createClientBlip', [
                JSON.stringify(blipData),
            ]);
        }

        this.examVehiclesInUse.set(userId, data);
    }

    destroyExamObjects(player: PlayerMp, userId: string): void {
        try {
            const examData: ExamData = {
                ...this.examVehiclesInUse.get(userId),
            };

            if (!examData) return;
            if (!examData.vehicle || !mp.vehicles.exists(examData.vehicle))
                return;

            player.removeFromVehicle();
            setTimeout(() => examData.vehicle.destroy(), 200);
            player.call('drivingSchool_destroyWorkObjects', []);
        } catch (e) {
            logData(e);
        }
    }

    getLicenseNameById(licenseId: number): string {
        return this.examConfig.licenses[licenseId - 1];
    }

    giveLicenseToPlayer(player: PlayerMp, licenseId: number): void {
        try {
            const licenseData = [...player.getVariable('licenses')];
            if (!licenseData || !licenseData.length) return;
            logData(`${licenseData}`);
            logData(`${this.getLicenseNameById(licenseId)}`);

            licenseData[licenseId - 1] = true;
            player.setVariable('licenses', licenseData); // Тут сделайте сохранение
            player.outputChatBox(
                `Теперь для вас доступен транспорт "${this.getLicenseNameById(
                    licenseId,
                )}" класса`,
            );
        } catch (e) {
            logData(e);
        }
    }

    endExam(player: PlayerMp, reason: string): void {
        try {
            const userId: string = player.getVariable('userId').toString();
            this.destroyExamObjects(player, userId);

            player.outputChatBox('Экзамен завершен');
            if (reason === 'passed') {
                player.outputChatBox('Поздравляем! Вы успешно сдали экзамен!');

                this.giveLicenseToPlayer(
                    player,
                    this.examVehiclesInUse.get(userId).licenseId,
                );
            } else if (reason === 'failed') {
                player.outputChatBox(`Вы провалили экзамен`);
            }

            this.examVehiclesInUse.delete(userId);
            player.setVariable('drivingSchool_onExam', false);

            player.position = this.examConfig.returnPlayerBackData.position;
            player.heading = this.examConfig.returnPlayerBackData.heading;
            player.dimension = this.examConfig.returnPlayerBackData.dimension;
        } catch (e) {
            logData(e);
        }
    }

    sendSafetyAlert(player: PlayerMp, licenseId: number): void {
        let message: string;

        switch (licenseId) {
            case 1:
            case 2: {
                message = 'Используйте ремни безопасности, клавиша N';
                break;
                // seat belts
            }

            case 3: {
                // helmet
                message = 'Используйте защитный шлем, клавиша N';
                break;
            }

            default: {
                break;
                // some error
            }
        }

        player.outputChatBox(`${message}`);
        player.outputChatBox(`Не превышайте допустимую скорость (50 km/h)`);
    }

    startViolationChecker(player: PlayerMp, licenseId: number) {
        setTimeout(() => {
            const violationCheckerData = {
                licenseId,
            };
            player.call('drivingSchool_startViolationChecker', [
                JSON.stringify(violationCheckerData),
            ]);
        }, 2000);
    }

    // Здесь будет UI
    startExam(player: PlayerMp, licenseId: number): void {
        const data = this.selectCarForPlayer(player, licenseId);
        if (!data) return;

        const userId: string = player.getVariable('userId').toString(); // edit type on userId type

        if (this.examVehiclesInUse.has(userId)) {
            // Удаляем старые данные если уж получилось что данные каким то образом сохранились
            this.destroyExamObjects(player, userId);
            this.examVehiclesInUse.delete(userId);
        }

        player.position = this.examConfig.startPoint.position;
        player.position.x -= 8.0;
        player.heading = this.examConfig.startPoint.heading;
        player.dimension = player.id + 1;
        const vehicle: VehicleMp = this.createCarForPlayer(player, data);

        setTimeout(() => {
            player.putIntoVehicle(vehicle, 0);
            setTimeout(() => {
                const examData: ExamData = {
                    vehicle,
                    licenseId,
                    wayData: {
                        id: -1,
                    },
                };

                this.examVehiclesInUse.set(userId, examData);
                player.setVariable('drivingSchool_onExam', true);
                this.setNextMarkForPlayer(player, userId);

                // UI подсказка (используйте ремни безопасности or шлем)
                this.sendSafetyAlert(player, licenseId);

                this.startViolationChecker(player, licenseId);
            }, 200);
        }, 200);
    }

    initEvents() {
        mp.events.add(
            'drivingSchool_startExam',
            (player: PlayerMp, licenseId: number): void =>
                this.startExam(player, licenseId),
        );

        mp.events.add('playerExitVehicle', (player: PlayerMp) => {
            if (player.getVariable('drivingSchool_onExam')) {
                logData('exitStudyVehicle endExam');
                this.endExam(player, 'exitStudyVehicle');
            }
        });

        mp.events.add(
            'drivingSchool_setNextMarkForPlayer',
            (player: PlayerMp) =>
                this.setNextMarkForPlayer(
                    player,
                    player.getVariable('userId').toString(),
                ),
        );

        mp.events.add(
            'drivingSchool_endExam',
            (player: PlayerMp, reason: string) => this.endExam(player, reason),
        );

        mp.events.add(
            'drivingSchool_checkPlayerParking',
            (player: PlayerMp) => {
                try {
                    console.log('event check parking');
                    if (!player.getVariable('drivingSchool_onExam')) return;
                    const examData: ExamData = this.examVehiclesInUse.get(
                        player.getVariable('userId').toString(),
                    );

                    if (!examData) return;
                    if (player.vehicle !== examData.vehicle) return;
                    /*
                        Проверяет в момент когда игрок находится в colshape парковки,
                        какой у игрока хэдинг машины, соответственно чтобы убедиться что он сдает задом,
                        поэтому берем heading у alphaCar, и проверяем находится ли heading игрока в этом диапазоне
                        (+- допустимо смещение на 45.0)
                    */
                    const playerHeading: number = player.vehicle.heading;
                    const normalHeading: number =
                        Number(
                            this.examConfig.route[
                                this.examConfig.route.length - 1
                            ].heading,
                        ) || 0;

                    console.log(playerHeading, normalHeading);
                    if (Math.abs(normalHeading - playerHeading) > 45.0) {
                        player.outputChatBox(
                            'Вы должны припарковаться также как и машина',
                        );
                    } else {
                        // good, прошел последний этап экзамена, завершаем
                        this.endExam(player, 'passed');
                    }
                } catch (e) {
                    logData(e);
                }
            },
        );
    }
}

// eslint-disable-next-line no-new
new DrivingExam();
