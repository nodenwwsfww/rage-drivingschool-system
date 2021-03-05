// eslint-disable-next-line no-unused-vars
import { Action, actions } from './drivingSchool';
// eslint-disable-next-line no-unused-vars
import { DialogData } from './interfaces';

const isANumber = (x: any): boolean => !isNaN(Number(x));
try {
    class DialogWithPedHandler {
        isASafeAnswer(answer: string, dialogData: DialogData): boolean {
            if (!isANumber(answer) && answer !== 'понял') return false;
            return !(
                isANumber(answer) &&
                (Number(answer) > dialogData.countOfPossibleAnswers ||
                    Number(answer) < 0 ||
                    !Number.isSafeInteger(Number(answer)))
            );
        }

        updateDialogData = (player: PlayerMp, dialogData: DialogData) =>
            player.setVariable('dialogWithPedData', dialogData);

        doNextAction(player: PlayerMp, dialogData: DialogData) {
            const { pedType } = dialogData;

            let actionName: string;

            if (
                pedType === 'drivingSchool' &&
                dialogData.currentPhraseIdx + 1 === 1 &&
                dialogData.currentPhraseNodeIdx === 1
            ) {
                actionName = 'startGettingLicense';
            }

            if (!actionName) return;

            const [actionData] = actions.filter(
                (action: Action) =>
                    action.type === pedType && action.name === actionName,
            );

            if (actionData) {
                const action: Function = actionData?.callback;
                if (action) action(player, dialogData);
            }
        }

        sendNextPhrase(player: PlayerMp, dialogData: DialogData): boolean {
            // Определяем следующую фразу, изменяем данные под следующий ответ, отправляем фразу

            const { currentPhraseNodeIdx } = dialogData;
            let { currentPhraseIdx } = dialogData;

            if (
                // last phrase
                dialogData.currentPhraseIdx >=
                dialogData.pedData.phrases[currentPhraseNodeIdx].length - 1
            ) {
                return false;
            }

            currentPhraseIdx += 1;
            dialogData.currentPhraseIdx += 1;
            if (
                dialogData.pedData.phrases[currentPhraseNodeIdx][
                    currentPhraseIdx
                ]?.choiceTypes
            )
                dialogData.countOfPossibleAnswers =
                    dialogData.pedData.phrases[currentPhraseNodeIdx][
                        currentPhraseIdx
                    ].choiceTypes.length - 1;
            else dialogData.countOfPossibleAnswers = 1;

            const { text } = dialogData.pedData.phrases[currentPhraseNodeIdx][
                currentPhraseIdx
            ];

            player.outputChatBox(`${text}`);

            return true;
        }

        returnPlayerIntoMenu = (player: PlayerMp, dialogData: DialogData) =>
            player.call('drivingSchool_startDialogWithPlayer', [
                dialogData.pedData,
            ]);

        handleUserAnswer(
            player: PlayerMp,
            answer: string,
            dialogData: DialogData,
        ): boolean {
            if (!answer) return false;

            if (isANumber(answer)) {
                // is a number
                const numberedAnswer = Number(answer);

                if (dialogData.currentPhraseNodeIdx === -1) {
                    // Если человек только начал говорить с npc
                    dialogData.currentPhraseNodeIdx = numberedAnswer - 1; // array index, so starts from zero
                    dialogData.currentPhraseIdx = -1; // При отправки некст фразы будет ++;
                } else {
                    const currentNodeIdx: number =
                        dialogData.currentPhraseNodeIdx;
                    const phraseData =
                        dialogData.pedData.phrases[currentNodeIdx][
                            dialogData.currentPhraseIdx
                        ];

                    // if это последняя фраза и дальше прощание (тк игрок выбрал прощание) // просто последняя фраза
                    if (
                        phraseData &&
                        phraseData?.choiceTypes?.length >= numberedAnswer &&
                        phraseData.choiceTypes[numberedAnswer - 1] === 'goodBye'
                    ) {
                        this.returnPlayerIntoMenu(player, dialogData);
                        return false;
                    }
                }

                dialogData.currentAnswer = answer;
                return true;
            }
            // string = 'Понял'{
            // Если это последний вопрос от npc из данной ноды (например FAQ), и был ответ "понял", то просто возвращаем в меню
            this.returnPlayerIntoMenu(player, dialogData);

            return false;
        }

        clearDialogData(player: PlayerMp) {
            player.setVariable('isInDialogWithPed', false);
            player.setVariable('dialogWithPedData', null);
        }

        checkChatMessage(player: PlayerMp, message: string) {
            if (player.getVariable('isInDialogWithPed')) {
                const dialogData: DialogData = {
                    ...player.getVariable('dialogWithPedData'),
                };

                const answer: string = message.trim().toLowerCase();

                if (!this.isASafeAnswer(answer, dialogData)) return;

                if (this.handleUserAnswer(player, answer, dialogData)) {
                    // Если ответ обработался и требует продолжения диалога с педом
                    this.doNextAction(player, dialogData);
                    if (this.sendNextPhrase(player, dialogData))
                        // if okay - continue
                        this.updateDialogData(player, dialogData);
                    else this.clearDialogData(player);
                }
            }
        }

        initEvents() {
            mp.events.add('playerChat', (player: PlayerMp, message: string) =>
                this.checkChatMessage(player, message),
            );
        }
    }

    const dialogHandler = new DialogWithPedHandler();
    dialogHandler.initEvents();
} catch (e) {
    console.error(e);
}
