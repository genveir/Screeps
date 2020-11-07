import { GameLogic } from './gameLogic';
import { MemoryUtil } from './utils/memoryUtil';

MemoryUtil.init();

new GameLogic().runGameLogic();

for (var creepName in Memory.creeps) {
    if (!Game.creeps[creepName]) {
        delete Memory.creeps[creepName];
    }
}