import { PositionUtil } from "../util/position";
import { Task } from "./task";
import { TaskList } from "./tasklist";

export abstract class BaseTask implements Task {
    public clearOnNextTick : boolean;

    constructor(public id: string, public type : string, public claimedBy : Id<Creep> | null) {
        this.clearOnNextTick = false;
    }

    protected abstract _getPriority(creep : Creep) : number;
    public getPriority(creep : Creep) : number {
        return this._getPriority(creep);
    }
    
    protected abstract _getSuitability(creep : Creep) : number;
    public getSuitability(creep : Creep) : number {
        return this._getSuitability(creep);
    }


    public claim(creep : Creep) {
        this.claimedBy = creep.id;

        if (this.type !== "IDLE") creep.say(this.type);
        creep.memory.savedTask = { active: true, roomName: creep.room.name, taskId: this.id };
    }

    public unclaim() {     
        if (this.claimedBy)
        {
            var creep = Game.getObjectById(this.claimedBy);

            if (creep) {
                if (!creep.memory.savedTask) creep.memory.savedTask = {active: false, roomName: "", taskId: ""};
                creep.memory.savedTask.active = false;
            } 
            this.claimedBy = null;
        }
    }

    public abstract execute(creep: Creep) : void;

    public abstract serialize() : string;

    public isEqualTo(task : Task) : boolean {
        return this.serialize() === task.serialize();
    }

    protected moveAwayFromSources(creep : Creep) : boolean {
        var sources = creep.room.find(FIND_SOURCES).map(s => s.pos);

        var isAdjacent : boolean = false;
        sources.forEach(s => {
            if(PositionUtil.getFlyDistance(creep.pos, s) === 1) isAdjacent = true;
        });

        if (isAdjacent) this.randomMove(creep);
        return isAdjacent;
    }

    protected moveAwayFromSpawns(creep : Creep) : boolean {
        var spawns = creep.room.find(FIND_MY_STRUCTURES).filter(s => s.structureType === STRUCTURE_SPAWN).map(s => s.pos);

        var isAdjacent : boolean = false;
        spawns.forEach(s => {
            if(PositionUtil.getFlyDistance(creep.pos, s) === 1) isAdjacent = true;
        });

        if (isAdjacent) this.randomMove(creep);
        return isAdjacent;
    }

    protected randomMove(creep : Creep) {
        var dir = <DirectionConstant>Math.floor(Math.random() * 8);
        creep.move(dir);   
    }
}