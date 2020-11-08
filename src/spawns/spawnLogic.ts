export class SpawnLogic
{
    constructor(private spawn : StructureSpawn) {

    }

    private workerParts = [WORK,CARRY,CARRY,MOVE,MOVE];

    public run() {
        var spawnRoom = this.spawn.room;

        var creepcount = spawnRoom.find(FIND_MY_CREEPS).length;
        
        if (!this.spawn.spawning) {
            if (creepcount < 14) {
                var spawnEnergy = this.spawn.store.getUsedCapacity(RESOURCE_ENERGY);
                var extensionEnergy = this.spawn.room.find(FIND_STRUCTURES)
                    .filter(s => s.structureType === STRUCTURE_EXTENSION)
                    .map(s => <StructureExtension>s)
                    .map(s => s.store.getUsedCapacity(RESOURCE_ENERGY))
                    .reduce((previous, current) => previous + current);

                var totalAvailableEnergy = spawnEnergy + extensionEnergy;

                if (totalAvailableEnergy >= 300) {
                    var availableEnergy = 900;
                    if (totalAvailableEnergy < 900) availableEnergy = 900;
                    var body = this.buildBody(availableEnergy, this.workerParts);

                    this.spawn.spawnCreep(body, 'Harvester' + Game.time, { memory: {role : "harvester", slot: null} });
                }
            }
        }
    }

    buildBody(maxEnergy : number, bodyParts: BodyPartConstant[]) : BodyPartConstant[] {
        var index = 0;
        var done = bodyParts.length === 0;
        
        var availableEnergy = maxEnergy;
        var body : BodyPartConstant[] = [];
        while (!done) {
            var nextPart = bodyParts[index];
            var cost = this.getPartCost(nextPart);

            if (cost < availableEnergy) 
            {
                body.push(nextPart);
                availableEnergy -= cost;
            }
            else done = true;

            index++;
            if (index == bodyParts.length) index = 0;
        }

        return body;
    }

    getPartCost(bpc : BodyPartConstant) : number {
        switch(bpc) {
            case MOVE: return 50;
            case WORK: return 100;
            case CARRY: return 50;
            case ATTACK: return 80;
            case RANGED_ATTACK: return 150;
            case HEAL: return 250;
            case CLAIM: return 600;
            case TOUGH: return 10;
        }
    }
}