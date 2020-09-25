import { Task } from './task';
import { BaseTask } from './baseTask';

export class Refuel extends BaseTask implements Task {
    public static readonly type : string = "REFUEL";
    
    constructor(id: string, claimedBy : Id<Creep> | null, public tower : Id<StructureTower>) {
        super(id, Refuel.type, claimedBy);
    }

    private getTower() : StructureTower | null {
        var tower = Game.getObjectById(this.tower);
        if (!tower)
        {
            console.log("tower " + this.tower + " does not exist");
            this.unclaim();
        }
        return tower;
    }

    public getPriority() {
        var tower = this.getTower();
        if (!tower) {
            return 0;
        }
        else
        {
            return Math.min(200, tower.store.getFreeCapacity(RESOURCE_ENERGY));
        }
    }

    public canPerform(creep: Creep) {
        var tower = this.getTower();

        if (!tower) { return false; }
        else {
        return creep.store.energy > 0 &&
            tower.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    }

    public execute(creep: Creep) {
        var tower = Game.getObjectById(this.tower);
        if (!tower)
        {
            console.log("tower " + this.tower + " does not exist");
            this.unclaim();
        }
        else
        {
            var result = creep.transfer(tower, RESOURCE_ENERGY);
            if (result === ERR_NOT_IN_RANGE) {
                creep.moveTo(tower);
            }
        }

        if (!this.canPerform(creep)) this.unclaim();
    }

    public serialize() {
        return JSON.stringify(this);
    }
}