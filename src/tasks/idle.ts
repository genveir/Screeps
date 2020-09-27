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
        var sources = creep.room.find(FIND_SOURCES).map(s => s.pos);
        var spawns = creep.room.find(FIND_MY_STRUCTURES).filter(s => s.structureType === STRUCTURE_SPAWN).map(s => s.pos);
        var dontStayNextTo = sources.concat(spawns);

        var isAdjacent : boolean = false;
        dontStayNextTo.forEach(s => {
            if(PositionUtil.getManhattanDistance(creep.pos, s) <= 2) isAdjacent = true;
        });

        if (isAdjacent) { // don't stay next to an energy source so noone can harvest it
            var dir = <DirectionConstant>Math.floor(Math.random() * 8);
            creep.move(dir);
        }

        this.unclaim();
    }

    public serialize() : string {
        return JSON.stringify(this);
    }
}