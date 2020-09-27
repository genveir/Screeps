import { BaseTask } from './baseTask';
import { Task } from './task';

export class GrabRuin extends BaseTask implements Task {
    public static type : string = "GRABRUIN";

    constructor(id : string, claimedBy: Id<Creep> | null, public ruin : Id<Ruin>) {
        super(id, GrabRuin.type, claimedBy);
    }

    public getPriority(creep : Creep) {
        return 105000;
    }

    private getRuin() : Ruin | null {
        var ruin = Game.getObjectById(this.ruin);
        if (!ruin) {
            this.clearOnNextTick = true;
            this.unclaim();
        }
        return ruin;
    }

    public canPerform(creep : Creep) {
        var ruin = this.getRuin();

        if (!ruin) return false;
        if (ruin.store.energy === 0) return false;
        if (creep.store.getFreeCapacity() < ruin.store.energy) return false;
        if (creep.getActiveBodyparts(MOVE) === 0) return false;
        if (creep.getActiveBodyparts(CARRY) === 0) return false;

        return true;
    }

    public execute(creep : Creep) {
        
        var ruin = this.getRuin();
        if (ruin)
        {
            var result = creep.withdraw(ruin, RESOURCE_ENERGY);

            if (result === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(ruin);
            }
        }

        if (!this.canPerform(creep))
        {
            this.unclaim();
        } 
    }

    public serialize() : string {
        return JSON.stringify(this);
    }
}