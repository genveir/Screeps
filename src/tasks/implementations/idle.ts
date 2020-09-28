import { PositionUtil } from '../../util/position';
import { Task } from '../task';
import { BaseTask } from '../baseTask';

export class Idle extends BaseTask implements Task {
    public static type : string = "IDLE";

    public constructor(id : string) {
        super(id, Idle.type, [], 0);

        this.clearOnNextTick = true;
    }

    protected _getPriority(creep : Creep) {
        return -1000000;
    }

    protected _getSuitability(creep : Creep) {
        return -1000000;
    }

    public execute(creep : Creep) {        
        this.moveAwayFromSources(creep);
        this.moveAwayFromSpawns(creep);
        this.moveAwayFromRoads(creep);

        this.unclaimAll();
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