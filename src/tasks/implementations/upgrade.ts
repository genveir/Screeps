import { MovementUtil } from './../../util/movement';
import { PositionUtil } from './../../util/position';
import { Task } from '../task';
import { BaseTask } from '../baseTask';

export class Upgrade extends BaseTask implements Task {
    public static readonly type : string = "UPGRADE";

    constructor(id : string, claimedBy : Id<Creep>[], numAllowed : number, private controller : Id<StructureController>) {
        super(id, Upgrade.type, claimedBy, numAllowed);
    }

    private getController() : StructureController | null {
        var controller = Game.getObjectById(this.controller);
        if (!controller) {
            console.log("somehow this creep is not in a room with a controller");
            this.unclaimAll();
        }

        return controller;
    }

    protected _getPriority(creep : Creep) {
        var controller = this.getController();
        if (!controller) return 0;
        
        if (controller.ticksToDowngrade < 1000) return 1000000; // don't let the controller downgrade.
        return 1; // otherwise minimal, this is the job to do if there's no other job.
    }

    protected _getSuitability(creep : Creep) {
        if (creep.store.energy > 0) return 100000;
        return 0;
    }

    public execute(creep : Creep) {
        var controller = this.getController();
        if (controller)
        {
            this.moveAwayFromWalls(creep);
            var result = creep.upgradeController(controller);
            
            if (result === ERR_NOT_IN_RANGE) {
                MovementUtil.moveTo(creep, controller.pos);
            }
            else {
                this.transferEnergyToYoungestNeighbour(creep);
                this.grabEnergyFromTombstones(creep);
            }
        }   
        if (this.getPriority(creep) <= 0 || this.getSuitability(creep) <= 0) this.unclaim(creep.id);
    }

    private transferEnergyToYoungestNeighbour(creep : Creep) {
        var neighbours = creep.pos.findInRange(FIND_MY_CREEPS, 1).filter(c => c.memory.savedTask.taskId === this.id);
        if (neighbours) 
        {
            var youngest : Creep | null = null;
            var bestAge = creep.ticksToLive!;
            for (var creepName in neighbours) {
                var neighbour = neighbours[creepName];
                if (neighbour.ticksToLive! > bestAge) {
                    youngest = neighbour;
                    bestAge = neighbour.ticksToLive!
                } 
            }
            if (youngest) creep.transfer(youngest, RESOURCE_ENERGY);
        }
    }

    public serialize() : string {
        return JSON.stringify(this);
    }

    private moveAwayFromWalls(creep: Creep) {
        var surroundings = PositionUtil.getSurroundings(creep.pos).map(p => p.lookFor(LOOK_TERRAIN)[0]);
        if (surroundings.some(s => s === "wall")) {
            var tryToMoveTowardController = MovementUtil.moveTo(creep, this.getController()!, 1);
            if (tryToMoveTowardController !== 0) this.randomMove(creep);
        }
    }
}