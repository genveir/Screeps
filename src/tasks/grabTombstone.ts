import { BaseTask } from './baseTask';
import { Task } from './task';

export class GrabTombstone extends BaseTask implements Task {
    public static type : string = "GRABTOMBSTONE";

    constructor(id : string, claimedBy: Id<Creep> | null, public tombstone : Id<Tombstone>) {
        super(id, GrabTombstone.type, claimedBy);
    }

    public getPriority(creep : Creep) {
        return 105;
    }

    private getTombstone() : Tombstone | null {
        var tombstone = Game.getObjectById(this.tombstone);
        if (!tombstone) {
            this.clearOnNextTick = true;
            this.unclaim();
        }
        return tombstone;
    }

    public canPerform(creep : Creep) {
        var tombstone = this.getTombstone();

        if (!tombstone) return false;
        if (tombstone.store.energy === 0) return false;
        if (creep.store.getFreeCapacity() < tombstone.store.energy) return false;
        if (creep.getActiveBodyparts(MOVE) === 0) return false;
        if (creep.getActiveBodyparts(CARRY) === 0) return false;

        return true;
    }

    public execute(creep : Creep) {
        
        var tombstone = this.getTombstone();
        if (tombstone)
        {
            var result = creep.withdraw(tombstone, RESOURCE_ENERGY);

            if (result === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(tombstone);
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