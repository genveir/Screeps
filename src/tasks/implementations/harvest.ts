import { PositionUtil } from '../../util/position';
import { BaseTask } from '../baseTask';
import { Task } from '../task';

export class Harvest extends BaseTask implements Task {
    public static type : string = "HARVEST";

    constructor(id : string, claimedBy: Id<Creep> | null, private source : Id<Source>, public pos : RoomPosition) {
        super(id, Harvest.type, claimedBy);
    }

    private getSource() : Source | null {
        var source = Game.getObjectById(this.source);
        if (!source) {
            this.unclaim();
        }
        return source;
    }

    protected _getPriority(creep : Creep) {
        return 100000;
    }

    protected _getSuitability(creep : Creep) {
        var source = this.getSource();

        if (!source) return 0;
        if (source.energy === 0) return 0;
        if (creep.store.getFreeCapacity() === 0) return 0;
        if (creep.getActiveBodyparts(WORK) === 0) return 0;
        if (creep.getActiveBodyparts(CARRY) === 0) return 0;
        if (creep.getActiveBodyparts(MOVE) === 0) return 0;

        return 100000 - PositionUtil.getFlyDistance(this.pos, creep.pos);
    }

    public execute(creep : Creep) {
        if (creep.pos.isEqualTo(this.pos.x, this.pos.y)) {
            var source = this.getSource();
            if (source)
            {
                creep.harvest(source);
            }
        }
        else {
            creep.moveTo(this.pos.x, this.pos.y, {reusePath: 20});
        }

        if (creep.memory.debug) console.log(" creep has suitability " + this.getSuitability(creep));
        if (this.getSuitability(creep) <= 0) this.unclaim();
    }

    public serialize() : string {
        return JSON.stringify(
            {id: this.id, type: this.type, source: this.source, pos: {x: this.pos.x, y: this.pos.y, roomName: this.pos.roomName}, claimedBy: this.claimedBy }
            );
    }
}