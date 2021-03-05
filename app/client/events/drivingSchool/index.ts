interface HandleData {
    licenseId: number;
    trafficViolations: {
        checkTimer?: NodeJS.Timeout;
        speedViolationsCount: number;
        safetyViolationsCount: number; // seatbelts or helmet
    };
}
interface WorkObjects {
    blip?: BlipMp | null;
    checkPoint?: CheckpointMp | null;
    alphaVehicle?: VehicleMp | null;
    parkColshape?: ColshapeMp | null;
}

class DrivingHandler {
    handleData: HandleData | null;

    workObjects: WorkObjects = {};

    constructor() {
        this.initEvents();
    }

    destroyWorkObjects() {
        if (this.workObjects.blip && mp.blips.exists(this.workObjects.blip))
            this.workObjects.blip.destroy();

        if (
            this.workObjects.checkPoint &&
            mp.checkpoints.exists(this.workObjects.checkPoint)
        )
            this.workObjects.checkPoint.destroy();

        if (
            this.workObjects.alphaVehicle &&
            mp.vehicles.exists(this.workObjects.alphaVehicle)
        )
            this.workObjects.alphaVehicle.destroy();

        if (
            this.workObjects.parkColshape &&
            mp.colshapes.exists(this.workObjects.parkColshape)
        )
            this.workObjects.parkColshape.destroy();
    }

    sendViolationWarning(message: string) {
        mp.gui.chat.push(`${message}`);
    }

    violationCheck = () => {
        if (!player.vehicle || !player.getVariable('drivingSchool_onExam')) {
            clearInterval(this.handleData.trafficViolations.checkTimer);
            return;
        }
        const speedInMetresPerSecond: number = player.vehicle.getSpeed();

        const vehicleSpeed: number = Math.round(speedInMetresPerSecond * 3.6); // in km/h
        let isViolation: boolean;

        if (vehicleSpeed > 50) {
            this.sendViolationWarning(
                `Вы превысили допустимую скорость (${vehicleSpeed} km/h)`,
            );

            this.handleData.trafficViolations.speedViolationsCount += 1;
            isViolation = true;
        }
        if (player.getConfigFlag(32, true)) {
            isViolation = true;
            this.handleData.trafficViolations.safetyViolationsCount += 1;
            this.sendViolationWarning(
                `У вас не пристегнуты ремни безопасности или шлем (клавиша N)`,
            );
        }
        if (isViolation) {
            clearInterval(this.handleData.trafficViolations.checkTimer);

            if (
                this.handleData.trafficViolations.safetyViolationsCount +
                    this.handleData.trafficViolations.speedViolationsCount >=
                5
            ) {
                mp.events.callRemote('drivingSchool_endExam', 'failed');
                this.handleData = null;
            } else
                setTimeout(() => {
                    this.handleData.trafficViolations.checkTimer = setInterval(
                        () => this.violationCheck(),
                        500,
                    );
                }, 6000 + 5000 * Math.random()); // some random time
        }
    };

    initEvents() {
        mp.events.add('drivingSchool_destroyWorkObjects', () =>
            this.destroyWorkObjects(),
        );
        mp.events.add('drivingSchool_createClientBlip', d => {
            const data = JSON.parse(d);
            if (this.workObjects.blip && mp.blips.exists(this.workObjects.blip))
                this.workObjects.blip.destroy();
            this.workObjects.blip = mp.blips.new(
                data.sprite,
                data.position,
                data.options,
            );
        });

        mp.events.add('drivingSchool_createClientCheckPoint', d => {
            const data = JSON.parse(d);
            if (
                this.workObjects.checkPoint &&
                mp.checkpoints.exists(this.workObjects.checkPoint)
            )
                this.workObjects.checkPoint.destroy();
            this.workObjects.checkPoint = mp.checkpoints.new(
                data.type,
                data.position,
                data.radius,
                data.options,
            );
        });

        mp.events.add('drivingSchool_startViolationChecker', d => {
            const { licenseId } = JSON.parse(d);

            this.handleData = {
                licenseId,
                trafficViolations: {
                    safetyViolationsCount: 0,
                    speedViolationsCount: 0,
                },
            };

            this.handleData.trafficViolations.checkTimer = setInterval(
                () => this.violationCheck(),
                500,
            );
        });

        mp.events.add('drivingSchool_createClientAlphaVehicle', d => {
            const { model, position, options } = JSON.parse(d);
            if (
                this.workObjects.alphaVehicle &&
                mp.vehicles.exists(this.workObjects.alphaVehicle)
            )
                this.workObjects.alphaVehicle.destroy();
            this.workObjects.alphaVehicle = mp.vehicles.new(
                model,
                position,
                options,
            );

            this.workObjects.alphaVehicle.setAlpha(options.alpha); // rage issue
        });
        mp.events.add('playerEnterCheckpoint', (checkPoint: CheckpointMp) => {
            if (
                checkPoint === this.workObjects.checkPoint &&
                player.getVariable('drivingSchool_onExam') &&
                player.vehicle
            ) {
                if (
                    this.workObjects.checkPoint &&
                    mp.checkpoints.exists(this.workObjects.checkPoint)
                )
                    this.workObjects.checkPoint.destroy();
                if (
                    this.workObjects.blip &&
                    mp.blips.exists(this.workObjects.blip)
                )
                    this.workObjects.blip.destroy();
                mp.events.callRemote('drivingSchool_setNextMarkForPlayer');
            }
        });

        mp.events.add('playerExitVehicle', () => {
            if (this.handleData && this.handleData.trafficViolations.checkTimer)
                clearInterval(this.handleData.trafficViolations.checkTimer);
        });

        mp.events.add(
            'drivingSchool_toggleCollisionForVehicle',
            (status: boolean) => {
                if (this.workObjects && this.workObjects.alphaVehicle)
                    this.workObjects.alphaVehicle.setNoCollision(
                        player.vehicle.handle,
                        status,
                    );
            },
        );

        mp.events.add('drivingSchool_createClientParkColshape', d => {
            const { position, range } = JSON.parse(d);
            if (
                this.workObjects.parkColshape &&
                mp.colshapes.exists(this.workObjects.parkColshape)
            )
                this.workObjects.parkColshape.destroy();
            this.workObjects.parkColshape = mp.colshapes.newSphere(
                position.x,
                position.y,
                position.z,
                range,
                player.dimension,
            );
            console.log('create park colshape on clientside');
        });
        mp.events.add('playerEnterColshape', (colshape: ColshapeMp) => {
            if (colshape !== this.workObjects.parkColshape) return;
            console.log('enter park colshape');
            if (!player.getVariable('drivingSchool_onExam')) return;
            if (!player.vehicle) return;
            mp.events.callRemote('drivingSchool_checkPlayerParking', []);
        });
    }
}
// eslint-disable-next-line no-unused-vars
const drivingHandler = new DrivingHandler();
