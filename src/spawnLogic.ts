export class SpawnLogic
{
    constructor(private spawn : StructureSpawn) {

    }

    public run() {
        var spawnRoom = this.spawn.room;

        var creeps = spawnRoom.find(FIND_CREEPS);
        var creepcount = creeps.length;
        var idlingCreeps = creeps.filter(c => !c.memory.savedTask.active).length;

        var energySlots = spawnRoom.memory.energySlots.length;

        var energyInExtensions = spawnRoom.find(FIND_MY_STRUCTURES)
            .filter(s => s.structureType === STRUCTURE_EXTENSION)
            .map(s => <StructureExtension>s)
            .map(s => s.store.energy)
            .reduce((a, b) => a + b);

        var availableEnergy = this.spawn.store.energy + energyInExtensions;

        var body : BodyPartConstant[] = []
        this.pushBasicBody(body);

        var bodyDoubles = Math.floor((availableEnergy - 300) / 300);
        if (bodyDoubles > 2) bodyDoubles = 2;
        for (var i = 0; i < bodyDoubles; i++) {
            this.pushBasicBody(body);
        }

        if (!this.spawn.spawning) {
            if (creepcount < energySlots || idlingCreeps === 0) {
                this.spawn.spawnCreep(
                    body, 
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

    pushBasicBody(body : BodyPartConstant[]) {
        body.push(WORK);
        body.push(CARRY);
        body.push(CARRY);
        body.push(MOVE);
        body.push(MOVE);
    }
}
