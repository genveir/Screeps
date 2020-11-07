export class SpawnLogic
{
    constructor(private spawn : StructureSpawn) {

    }

    private bodyParts = [WORK,CARRY,CARRY,MOVE,MOVE];

    public run() {
        var spawnRoom = this.spawn.room;

        var creepcount = spawnRoom.find(FIND_MY_CREEPS).length;
        
        if (!this.spawn.spawning) {
            if (creepcount < 14) {
                this.spawn.spawnCreep(this.bodyParts, 'Harvester' + Game.time, { memory: {role : "harvester", slot: null} });
            }
        }
    }
}