import { SpawnTask } from './spawnTask';
import { DecisionDials } from './decisionData';
import { SpawnDialer } from './spawnDialer';
import { TaskList } from "../tasks/tasklist";
import { Logging } from "../util/logging";

export class SpawnLogic
{
    constructor(private spawn : StructureSpawn) {
        
    }

    public runSpawnLogic() {
        this.manageWorkerTasks();

        if (!this.spawn.spawning) {
            var task = this.getTask();
            if (task) {
                var body = this.buildBody(task);
                
                if (body) {
                    if (Memory.debug || this.spawn.memory.debug) console.log("building creep " + JSON.stringify(body));
                    var result = this.spawn.spawnCreep(
                        body.body, 
                        'Creep' + Game.time, 
                        { 
                            memory: task.memory
                        }
                    );
                    if (result === 0) {
                        task.fulfill(this.spawn);
                        Logging.logSpawn(this.spawn, body.cost);
                    }
                }
            }
        }
    }

    private manageWorkerTasks() : void {
        var spawnRoom = this.spawn.room;
        var energySlots : number = 0;
        if (spawnRoom.memory.energySlots) energySlots = spawnRoom.memory.energySlots.length;

        var creeps = spawnRoom.find(FIND_MY_CREEPS);
        var workercount = creeps.length;

        var idlingWorkers = this.getIdlingCreeps(creeps);
        if (idlingWorkers === 0) this.spawn.memory.noIdlerTicks++;
        else this.spawn.memory.noIdlerTicks = 0;
        
        var availableEnergy = this.calculateAvailableEnergy();

        new RoomVisual(this.spawn.room.name).text(availableEnergy + "⚡ " + 
            idlingWorkers + "/" + workercount + ".." + this.spawn.memory.settings.creepCeiling +
            "(" + (this.spawn.memory.settings.maxIdleTicks - this.spawn.memory.noIdlerTicks) + ")😴", this.spawn.pos.x, this.spawn.pos.y + 1);

        
        if (this.shouldBuildWorker(spawnRoom, workercount, energySlots)) {
            spawnRoom.memory.spawnTasks.push(new SpawnTask(TaskList.getNewId(), 100, 0, this.getWorkerMemory()))
        }

        new SpawnDialer(this.spawn).runSpawnDialer(workercount, idlingWorkers);
    }

    private getWorkerMemory() : CreepMemory {
        return {
            savedTask: {taskId: "", active: false, roomName: this.spawn.room.name},
            lastPositions: [null, null]
         }
    }

    private getTask() : SpawnTask | null {
        var spawnRoom = this.spawn.room;

        if (spawnRoom.memory.spawnTasks.length === 0) return null;
        var task = spawnRoom.memory.spawnTasks[spawnRoom.memory.spawnTasks.length - 1];

        return new SpawnTask(task.id, task.priority, task.type, task.memory);
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

    private shouldBuildWorker(spawnRoom: Room, creepcount : number, energySlots : number) : boolean {
        if (spawnRoom.memory.spawnTasks.some(st => st.type === 0)) return false;
        
        if (creepcount < energySlots) return true;
        if (creepcount >= this.spawn.memory.settings.creepCeiling) return false;
        if (this.spawn.memory.noIdlerTicks > this.spawn.memory.settings.maxIdleTicks) return true;

        return false;
    }

    buildBody(task : SpawnTask) : {cost : number, body : BodyPartConstant[] } | null  {
        var availableEnergy = this.calculateAvailableEnergy();

        switch(task.type) {
            case 0: return this.buildWorkerBody(availableEnergy, 300, 900);
            case 1: return this.buildScoutBody(availableEnergy);
        }
    }

    buildWorkerBody(availableEnergy : number, minimumToSpend : number, maximumToSpend : number) : {cost : number, body : BodyPartConstant[] } | null {
        var workerBody : BodyPartConstant[] = [MOVE, WORK, CARRY, MOVE, CARRY]

        var body : BodyPartConstant[] = [];
        var cost = 0;

        if (availableEnergy > maximumToSpend) availableEnergy = maximumToSpend;

        var workerIndex = 0;
        while(availableEnergy > 0)
        {
            var part = workerBody[workerIndex];
            var partCost = SpawnLogic.getPartCost(part);
            body.push(part);
            cost += partCost;
            availableEnergy -= partCost;

            workerIndex++;
            if (workerIndex == workerBody.length) workerIndex = 0;
        }

        if (availableEnergy < 0) {
            var lastPart = body.pop();
            if (lastPart) cost -= SpawnLogic.getPartCost(lastPart);
        }

        if (cost < minimumToSpend) return null;
        else return {cost: cost, body: body};
    }

    buildScoutBody(availableEnergy : number) : {cost : number, body : BodyPartConstant[] } | null {
        if (availableEnergy < 50) return null;
        
        var body = [MOVE];

        return {cost: 50, body};
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
