import './variables';
import './data';
import './events';

// Dev tools

mp.events.add('setAlpha', (alpha: number) => {
    mp.console.logInfo(`${alpha}`, true, true);
    player.vehicle.setAlpha(alpha);
});

mp.keys.bind(0x4e, true, () => {
    const currentStatus: boolean = player.getConfigFlag(32, true);
    player.setConfigFlag(32, !currentStatus);
    mp.gui.chat.push(`Seatbelt ${currentStatus ? 'on' : 'off'}`);
});
