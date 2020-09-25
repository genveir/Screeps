import { PositionUtil } from './../util/position';
import { Task } from './task';

export class Harvest implements Task {
    public static type : string = "HARVEST";

    public type : string; // to serialize
    private source : Id<Source>;
    private pos : SavedPosition;

    public claimedBy : Id<Creep> | null;

    constructor(source : Id<Source>, pos : RoomPosition, claimedBy: Id<Creep> | null) {
        this.type = Harvest.type;
        this.source = source;
        this.pos = pos;
        this.claimedBy = this.claimedBy;
    }

    public canPerform(creep : Creep) {
        return true;
    }

    public claim(creep : Creep) {
        this.claimedBy = creep.id;
    }

    public unclaim() {
        this.claimedBy = null;
    }

    public serialize() : string {
        return JSON.stringify(this);
    }

    public report() : string {
        return "I am a working Harvest object for source " + this.source + " and I was claimed by: " + this.claimedBy;
    }

    public static sortByPosition(tasks : Harvest[]) : void {
        tasks.sort((a, b) => {
            return PositionUtil.compare(a.pos, b.pos);
        });
    }
}