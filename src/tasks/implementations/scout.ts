import { MovementUtil } from './../../util/movement';
import { Task } from '../task';
import { BaseTask } from '../baseTask';

export class Scout extends BaseTask implements Task {
    public static type : string = "SCOUT";

    public constructor(id : string, public claimedBy: Id<Creep>[], public roomName: string) {
        super(id, Scout.type, claimedBy, 1);

    }

    private getRoute(creep : Creep) : {exit: ExitConstant, room : string}[] | ERR_NO_PATH | null {
        var scoutingTask = Memory.scoutingTargets.filter(st => st.roomName == this.roomName[0]);
        if (scoutingTask) {
            return Game.map.findRoute(creep.room.name, this.roomName);
        }
        else return null;
    }

    public claim(creep : Creep) {
        super.claim(creep);

        var scoutingTask = Memory.scoutingTargets.filter(st => st.roomName === this.roomName[0])[0];
        scoutingTask.claimedBy = creep.id;
    }

    public unclaim(cid : Id<Creep>) {
        super.unclaim(cid);

        var scoutingTask = Memory.scoutingTargets.filter(st => st.roomName === this.roomName[0])[0];
        scoutingTask.claimedBy = null;
    }

    public unclaimAll() {
        super.unclaimAll();

        var scoutingTask = Memory.scoutingTargets.filter(st => st.roomName === this.roomName[0])[0];
        scoutingTask.claimedBy = null;
    }

    protected _getPriority(creep : Creep) {
        return 1000000;
    }

    protected _getSuitability(creep: Creep) {
        for (var bp in creep.body)
        {
            var part = creep.body[bp];

            if (part.type !== MOVE) return 0;
        }
        var route = this.getRoute(creep);
        if (!route || route == ERR_NO_PATH) return 0;

        return 100000 - 1000 * route.length;
    }

    public execute(creep : Creep) {
        var route = this.getRoute(creep);

        if (route && route !== ERR_NO_PATH && route.length !== 0) 
        {
            var step = route[0];
            var pos = creep.pos.findClosestByPath(step.exit);
        
            if (pos) {
                MovementUtil.moveTo(creep, pos);
                return;
            }
        }

        this.unclaimAll();
        this.clearOnNextTick = true;
    }

    public serialize() : string {
        return JSON.stringify(this);
    }
}