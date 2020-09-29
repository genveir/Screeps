import { Idle } from "../tasks/implementations/idle";
import { TaskList } from "../tasks/tasklist";
import { Logging } from "../util/logging";

export class SpawnLogic
{
    constructor(private spawn : StructureSpawn) {

    }

    public run() {
        var spawnRoom = this.spawn.room;

        var creeps = spawnRoom.find(FIND_CREEPS);
        var creepcount = creeps.length;
        
        var taskList = TaskList.getInstance(spawnRoom);
        
        var idlingCreeps = creeps.map(c => c.memory.savedTask.taskId)
            .map(tid => taskList.getById(tid))
            .filter(t => t === null)
            .length;

        if (idlingCreeps === 0) this.spawn.memory.noIdlerTicks++;
        else this.spawn.memory.noIdlerTicks = 0;

        var energySlots = spawnRoom.memory.energySlots.length;

        var energyExtensions = spawnRoom.find(FIND_MY_STRUCTURES)
            .filter(s => s.structureType === STRUCTURE_EXTENSION)
            .map(s => <StructureExtension>s);

        var energyInExtensions = 0;
        if (energyExtensions.length > 0)
        {
            energyInExtensions = energyExtensions.map(s => s.store.energy)
                .reduce((a, b) => a + b);
        }

        var availableEnergy = this.spawn.store.energy + energyInExtensions;
        new RoomVisual(this.spawn.room.name).text(availableEnergy + "⚡ " + idlingCreeps + "/" + creeps.length + "(" + (24 - this.spawn.memory.noIdlerTicks) + ")😴", this.spawn.pos.x, this.spawn.pos.y + 1);

        var body = this.buildWorkerBody(availableEnergy, 300, 900);

        if (!this.spawn.spawning && body) {
            if (this.shouldBuildCreep(creepcount, energySlots, 20, 24)) {
                var result = this.spawn.spawnCreep(
                    body.body, 
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
                if (result === 0) Logging.logSpawn(this.spawn, body.cost);
            }    
        }
    }

    private shouldBuildCreep(creepcount : number, energySlots : number, creepceiling : number, idlerceiling : number) : boolean {
        if (creepcount < energySlots) return true;
        if (creepcount >= creepceiling) return false;
        if (this.spawn.memory.noIdlerTicks > idlerceiling) return true;

        return false;
    }

    workerBody : BodyPartConstant[] = [MOVE, WORK, CARRY, MOVE, CARRY]
    buildWorkerBody(availableEnergy : number, minimumToSpend : number, maximumToSpend : number) : {cost : number, body : BodyPartConstant[] } | null {
        var body : BodyPartConstant[] = [];
        var cost = 0;

        if (availableEnergy > maximumToSpend) availableEnergy = maximumToSpend;

        var workerIndex = 0;
        while(availableEnergy > 0)
        {
            var part = this.workerBody[workerIndex];
            var partCost = SpawnLogic.getPartCost(part);
            body.push(part);
            cost += partCost;
            availableEnergy -= partCost;

            workerIndex++;
            if (workerIndex == this.workerBody.length) workerIndex = 0;
        }

        if (availableEnergy < 0) {
            var lastPart = body.pop();
            if (lastPart) cost -= SpawnLogic.getPartCost(lastPart);
        }

        if (cost < minimumToSpend) return null;
        else return {cost: cost, body: body};
    }

    static getPartCost(part : BodyPartConstant) : number {
        switch(part)
        {
            case MOVE: return 50;
            case WORK: return 100;
            case CARRY: return 50;
            case ATTACK: return 80;
            case RANGED_ATTACK: return 150;
            case HEAL: return 250;
            case TOUGH: return 10;
            case CLAIM: return 600;
            default: return 1000000;
        }
    }
}