import { MemoryUtil } from './util/memory';
import { TaskList } from './tasks/tasklist';
import { GameLogic } from "./gameLogic";
import { SpawnLogic }  from "./spawnLogic/spawnLogic";
import { CreepLogic } from "./creepLogic";
import { Logging } from './util/logging';

if (Memory.debug) console.log("initiating memory");
MemoryUtil.migrate();
MemoryUtil.init();

var cpuLogEntry : CpuLogEntry = {tick: Game.time};
Memory.logging.cpuLogging.push(cpuLogEntry);

if (!Memory.me) Memory.me = "GBOY";

if (Memory.hm === true) {
    for (var r in Memory.rooms) {
        Memory.rooms[r].drawHeatMap = !Memory.rooms[r].drawHeatMap;
    }
    Memory.hm = false;
}

if (Memory.debug) console.log("cleaning up dead creep memories");
// clean up dead creep memory
for (var creepName in Memory.creeps) {
    if (!Game.creeps[creepName]) {
        delete Memory.creeps[creepName];
    }
}

cpuLogEntry.setupEnd = Game.cpu.getUsed();

if (Memory.debug) console.log("starting gamelogic");
// run logic that determines overall goals and strategies
new GameLogic().runGameLogic(cpuLogEntry);
cpuLogEntry.gameLogicEnd = Game.cpu.getUsed();

if (Memory.debug) console.log("starting spawnlogic");
cpuLogEntry.spawnLogicEnds = [];
// run logic per spawn
for (var spawnName in Game.spawns) {
    var spawn = Game.spawns[spawnName];
    
    var spawnLogic = new SpawnLogic(spawn);
    spawnLogic.runSpawnLogic();
    cpuLogEntry.spawnLogicEnds.push({spawnName: spawnName, cpu: Game.cpu.getUsed()});
}
cpuLogEntry.spawnLogicEnd = Game.cpu.getUsed();

if (Memory.debug) console.log("starting creeplogic");
cpuLogEntry.creepLogicEnds = [];
// run logic per creep
for (var creepName in Game.creeps) {
    var creep = Game.creeps[creepName];

    var creepLogic = new CreepLogic(creep);
    creepLogic.runCreepLogic();
    cpuLogEntry.creepLogicEnds.push({creepName: creepName, cpu: Game.cpu.getUsed()});
}
cpuLogEntry.creepLogicEnd = Game.cpu.getUsed();

Logging.update();

if (Memory.debug) console.log("saving task list");
TaskList.saveAll();