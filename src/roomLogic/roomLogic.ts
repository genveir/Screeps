import { TaskLogic } from './taskLogic';
import { BuildLogic } from './buildLogic';
import { PositionUtil } from '../util/position';

export class RoomLogic {
    buildLogic : BuildLogic;
    taskLogic : TaskLogic;

    constructor(private room: Room) {
        if (!this.room.memory.taskList) this.room.memory.taskList = [];
        if (!this.room.memory.energySlots) this.initializeEnergySlots();
        if (!this.room.memory.energyPerformance) this.room.memory.energyPerformance = [];
        if (!this.room.memory.energySums) this.room.memory.energySums = [];

        this.buildLogic = new BuildLogic(this.room);
        this.taskLogic = new TaskLogic(this.room);
    }

    run() {
        if (Memory.debug) console.log("firing towers in " + this.room.name);
        this.fireTowers();

        if (Memory.debug) console.log("running build logic for " + this.room.name);
        this.buildLogic.run();

        if (Memory.debug) console.log("running task logic for " + this.room.name);
        this.taskLogic.run();

        this.monitorEnergyPerformance()
    }

    private monitorEnergyPerformance() {
        if (this.room.controller) this.room.memory.energyPerformance.push(this.room.controller.progress);
        if (this.room.memory.energyPerformance.length === 300) 
        {
            this.room.memory.energySums.push({finalTick: Game.time, totalProgress: this.room.memory.energyPerformance[299] - this.room.memory.energyPerformance[0]});
            this.room.memory.energyPerformance = [];
        }

        if (this.room.memory.energySums.length > 0 && this.room.controller)
        {
            var lastSum = this.room.memory.energySums[this.room.memory.energySums.length - 1];
            new RoomVisual(this.room.name).text(lastSum.totalProgress + "⚡ (" + (300 - this.room.memory.energyPerformance.length) + "...)", this.room.controller.pos.x, this.room.controller.pos.y + 1, {font: 0.5});
        }
    }

    private fireTowers() {
        var towers = this.room.find(FIND_MY_STRUCTURES).filter(s => s.structureType === STRUCTURE_TOWER).map(s => <StructureTower>s);
        if (towers.length === 0) return;

        var enemies = this.room.find(FIND_HOSTILE_CREEPS);
        if (enemies.length === 0) return;

        towers.forEach(t => {
            var closest : number = 1000;
            var target : Creep;
            enemies.forEach(e => {
                var distance = PositionUtil.getFlyDistance(t.pos, e.pos);
                if (distance < closest)  {
                    closest = distance;
                    target = e;
                };
            })

            t.attack(target!);
        });
    }

    private initializeEnergySlots() : void {
        console.log("initializing energy slots for room " + this.room.name);

        var energySources = this.room.find(FIND_SOURCES);

        var energySlots : SavedHarvestPosition[] = [];
        energySources.forEach(es => {
            var id = es.id;
            var pos = es.pos;

            var emptySurrounding = PositionUtil.getEmptySurrounding(pos);
            emptySurrounding.forEach(es => 
            {
                energySlots.push({ id: id, pos: es })
            });
        });

        this.room.memory.energySlots = energySlots;
    }
}