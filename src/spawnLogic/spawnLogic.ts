import { SpawnDialer } from './spawnDialer';
import { TaskList } from "../tasks/tasklist";
import { Logging } from "../util/logging";

export class SpawnLogic
{
    constructor(private spawn : StructureSpawn) {
        if (!spawn.memory.decisionDials) spawn.memory.decisionDials = {maxIdleTicks: 10, creepCeiling: 30, data: {ticksWithHighIdlers: 0, ticksAtCeiliing: 0, lastFitness: 0}}
    }

    public runSpawnLogic() {
        var spawnRoom = this.spawn.room;
        var energySlots = spawnRoom.memory.energySlots.length;

        var creeps = spawnRoom.find(FIND_MY_CREEPS);
        var creepcount = creeps.length;

        var idlingCreeps = this.getIdlingCreeps(creeps);
        if (idlingCreeps === 0) this.spawn.memory.noIdlerTicks++;
        else this.spawn.memory.noIdlerTicks = 0;
        
        var availableEnergy = this.calculateAvailableEnergy();
        
        new RoomVisual(this.spawn.room.name).text(availableEnergy + "⚡ " + 
            idlingCreeps + "/" + creepcount + ".." + this.spawn.memory.decisionDials.creepCeiling +
            "(" + (this.spawn.memory.decisionDials.maxIdleTicks - this.spawn.memory.noIdlerTicks) + ")😴", this.spawn.pos.x, this.spawn.pos.y + 1);

        var body = this.buildWorkerBody(availableEnergy, 300, 900);

        if (!this.spawn.spawning && body) {
            if (this.shouldBuildCreep(creepcount, energySlots)) {
                if (Memory.debug || this.spawn.memory.debug) console.log("building creep " + JSON.stringify(body));
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

        new SpawnDialer(this.spawn).runSpawnDialer(creepcount, idlingCreeps);
    }

    private getIdlingCreeps(creeps : Creep[]) : number {
        var spawnRoom = this.spawn.room;

        var taskList = TaskList.getInstance(spawnRoom);
        
        var idlingCreeps = creeps.map(c => c.memory.savedTask.taskId)
            .map(tid => taskList.getById(tid))
            .filter(t => t === null)
            .length;

        return idlingCreeps;
    }

    private calculateAvailableEnergy() {
        var spawnRoom = this.spawn.room;

        var energyExtensions = spawnRoom.find(FIND_MY_STRUCTURES)
            .filter(s => s.structureType === STRUCTURE_EXTENSION)
            .map(s => <StructureExtension>s);

        var energyInExtensions = 0;
        if (energyExtensions.length > 0)
        {
            energyInExtensions = energyExtensions.map(s => s.store.energy)
                .reduce((a, b) => a + b);
        }

        return this.spawn.store.energy + energyInExtensions;
    }

    private shouldBuildCreep(creepcount : number, energySlots : number) : boolean {
        if (creepcount < energySlots) return true;
        if (creepcount >= this.spawn.memory.decisionDials.creepCeiling) return false;
        if (this.spawn.memory.noIdlerTicks > this.spawn.memory.decisionDials.maxIdleTicks) return true;

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
