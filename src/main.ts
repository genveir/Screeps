import { MemoryUtil } from './util/memory';
import { TaskList } from './tasks/tasklist';
import { GameLogic } from "./gameLogic";
import { SpawnLogic }  from "./spawnLogic/spawnLogic";
import { CreepLogic } from "./creepLogic";
import { Logging } from './util/logging';

MemoryUtil.init();
MemoryUtil.migrate();

if (!Memory.me) Memory.me = "GBOY";

if (Memory.hm === true) {
    for (var r in Memory.rooms) {
        Memory.rooms[r].drawHeatMap = !Memory.rooms[r].drawHeatMap;
    }
    Memory.hm = false;
}

// clean up dead creep memory
for (var creepName in Memory.creeps) {
    if (!Game.creeps[creepName]) {
        delete Memory.creeps[creepName];
    }
}

if (Memory.debug) console.log("starting gamelogic");
// run logic that determines overall goals and strategies
new GameLogic().runGameLogic();

if (Memory.debug) console.log("starting spawnlogic");
// run logic per spawn
for (var spawnName in Game.spawns) {
    var spawn = Game.spawns[spawnName];
    
    var spawnLogic = new SpawnLogic(spawn);
    spawnLogic.runSpawnLogic();
}

if (Memory.debug) console.log("starting creeplogic");
// run logic per creep
for (var creepName in Game.creeps) {
    var creep = Game.creeps[creepName];

    var creepLogic = new CreepLogic(creep);
    creepLogic.run();
}

Logging.update();

if (Memory.debug) console.log("saving task list");
TaskList.saveAll();