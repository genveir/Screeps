import { PositionUtil } from '../util/position';
import { BaseTask } from './baseTask';
import { Task } from './task';

export class Harvest extends BaseTask implements Task {
    public static type : string = "HARVEST";

    constructor(id : string, claimedBy: Id<Creep> | null, private source : Id<Source>, private pos : RoomPosition) {
        super(id, Harvest.type, claimedBy);
    }

    public getPriority(creep : Creep) {
        return 100000 - PositionUtil.getFlyDistance(this.pos, creep.pos);;
    }

    private getSource() : Source | null {
        var source = Game.getObjectById(this.source);
        if (!source) {
            this.unclaim();
        }
        return source;
    }

    public canPerform(creep : Creep) {
        var source = this.getSource();

        if (!source) return false;
        if (source.energy === 0) return false;
        if (creep.store.getFreeCapacity() === 0) return false;
        if (creep.getActiveBodyparts(WORK) === 0) return false;
        if (creep.getActiveBodyparts(MOVE) === 0) return false;
        if (creep.getActiveBodyparts(CARRY) === 0) return false;

        return true;
    }

    public execute(creep : Creep) {
        if (creep.pos.isEqualTo(this.pos.x, this.pos.y)) {
            var source = this.getSource();
            if (source)
            {
                creep.harvest(source);
            
                if (!this.canPerform(creep))
                {
                    this.unclaim();
                } 
            }
        }
        else {
            creep.moveTo(this.pos.x, this.pos.y);
        }
    }

    public serialize() : string {
        return JSON.stringify(
            {id: this.id, type: this.type, source: this.source, pos: {x: this.pos.x, y: this.pos.y, roomName: this.pos.roomName}, claimedBy: this.claimedBy }
            );
    }

    public report() : string {
        return "I am a working Harvest object for source " + this.source + " and I was claimed by: " + this.claimedBy;
    }
}