import { SpawnLogic }  from "./spawns/spawnLogic";
import { CreepLogic } from "./creeps/creepLogic";
import { RoomLogic } from "./rooms/roomLogic";

for (var roomName in Game.rooms) {
    var room = Game.rooms[roomName];

    var roomLogic = new RoomLogic(room);
    roomLogic.run();
}

for (var spawnName in Game.spawns) {
    var spawn = Game.spawns[spawnName];
    
    var spawnLogic = new SpawnLogic(spawn);
    spawnLogic.run();
}

for (var creepName in Game.creeps) {
    var creep = Game.creeps[creepName];
    
    var creepLogic = new CreepLogic(creep);
    creepLogic.run();
}

for (var creepName in Memory.creeps) {
    if (!Game.creeps[creepName]) {
        delete Memory.creeps[creepName];
    }
}