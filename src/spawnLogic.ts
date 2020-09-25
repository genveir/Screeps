export class SpawnLogic
{
    constructor(private spawn : StructureSpawn) {

    }

    public run() {
        var spawnRoom = this.spawn.room;

        var creepcount = spawnRoom.find(FIND_CREEPS).length;
        
        if (!this.spawn.spawning) {
            if (creepcount < 10) {
                this.spawn.spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], 'Creep' + Game.time);
            }
        }
    }
}