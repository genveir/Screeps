export class SpawnLogic
{
    constructor(private spawn : StructureSpawn) {

    }

    public run() {
        var spawnRoom = this.spawn.room;

        var creepcount = spawnRoom.find(FIND_CREEPS).length;
        
        var energySlots = spawnRoom.memory.energySlots.length;

        if (!this.spawn.spawning) {
            if (creepcount < energySlots * 2) {
                this.spawn.spawnCreep(
                    [WORK,CARRY,CARRY,MOVE,MOVE], 
                    'Creep' + Game.time, 
                    { 
                        memory: { 
                            savedTask: { 
                                active: false, 
                                roomName: this.spawn.room.name, 
                                taskId: ""
                            }
                        }
                    });
            }
        }
    }
}