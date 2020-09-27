import { PositionUtil } from './../util/position';
import { Task } from './task';
import { BaseTask } from './baseTask';

export class Idle extends BaseTask implements Task {
    public static type : string = "IDLE";

    public constructor(id : string, claimedBy : Id<Creep> | null) {
        super(id, Idle.type, claimedBy);

        this.clearOnNextTick = true;
    }

    public getPriority(creep : Creep) {
        return -1000000;
    }

    public canPerform(creep : Creep) {
        return true;
    }

    public execute(creep : Creep) {        
        this.moveAwayFromSources(creep);
        this.moveAwayFromSpawns(creep);
        this.moveAwayFromRoads(creep);

        this.unclaim();
    }

    public serialize() : string {
        return JSON.stringify(this);
    }

    private moveAwayFromRoads(creep : Creep)
    {
        var isOnARoad = creep.pos.lookFor(LOOK_STRUCTURES).filter(s => s.structureType === STRUCTURE_ROAD).length > 0;

        if (isOnARoad) this.randomMove(creep);
    }
}