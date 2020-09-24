import { Harvester } from './harvester';

export class SpawnLogic
{
    constructor(private spawn : StructureSpawn) {

    }

    public run() {
        var spawnRoom = this.spawn.room;

        var creepcount = spawnRoom.find(FIND_CREEPS).length;
        
        if (!this.spawn.spawning) {
            if (creepcount < 10) {
                var energySources = this.spawn.room.find(FIND_SOURCES).map(s => s.id);
                var initmemory = Harvester.initialMemory(energySources);
                this.spawn.spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], 'Harvester' + Game.time, { memory: initmemory });
            }
        }
    }
}