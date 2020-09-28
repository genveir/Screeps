import { PositionUtil } from "../util/position";
import { Task } from "./task";

export abstract class BaseTask implements Task {
    public clearOnNextTick : boolean;

    constructor(public id: string, public type : string, public claimedBy : Id<Creep>[], public numAllowed : number) {
        this.clearOnNextTick = false;

        if (!claimedBy) this.claimedBy = [];
    }

    protected abstract _getPriority(creep : Creep) : number;

    private static priorities : {[id: string]: number } = {};
    public getPriority(creep : Creep) : number {
        var key = this.id + "" + creep.id;

        if (!BaseTask.priorities[key]) {
            BaseTask.priorities[key] = this._getPriority(creep);
        }
        return BaseTask.priorities[key];
    }
    
    protected abstract _getSuitability(creep : Creep) : number;
    
    private static suitabilities : {[id: string]: number } = {};
    public getSuitability(creep : Creep) : number {
        var key = this.id + "" + creep.id;

        if (!BaseTask.suitabilities[key]) {
            BaseTask.suitabilities[key] = this._getSuitability(creep);
        }
        return BaseTask.suitabilities[key];
    }

    public claim(creep : Creep) {
        if (Memory.debug || creep.memory.debug) {
            console.log("claimer: " + creep.name + " prio = " + this.getPriority(creep) + " suit = " + this.getSuitability(creep));
            console.log("others:")
            this.claimedBy.forEach(c => {
                var other = Game.getObjectById(c);
                if (!other) console.log("dead creep");
                else console.log(creep.name + " prio = " + this.getPriority(creep) + " suit = " + this.getSuitability(other));
            })
        }

        for (var indexToInsertAt = 0; indexToInsertAt <= this.claimedBy.length; indexToInsertAt++)
        {
            if (this.claimedBy.length > indexToInsertAt) {
                var otherCreep = Game.getObjectById(this.claimedBy[indexToInsertAt]);

                if (!otherCreep) this.claimedBy[indexToInsertAt] = creep.id;
                else {
                    if (this.getSuitability(otherCreep) < this.getSuitability(creep))
                    { 
                        this.claimedBy.splice(indexToInsertAt, 0, creep.id);
                        break;
                    }
                }
            }
            else 
            {
                this.claimedBy[indexToInsertAt] = creep.id;
                break;
            }
        }

        if (this.type !== "IDLE") creep.say(this.type);
        creep.memory.savedTask = { active: true, roomName: creep.room.name, taskId: this.id };
    }

    public unclaimAll() {
        for (var cid in this.claimedBy)
        {
            var creepId = this.claimedBy[cid];
            var creep = Game.getObjectById(creepId);

            if (creep) {
                if (!creep.memory.savedTask) creep.memory.savedTask = {active: false, roomName: "", taskId: ""};
                creep.memory.savedTask.active = false;
            }
        }

        this.claimedBy = [];
    }

    public unclaim(cid: Id<Creep>) {
        var index = this.claimedBy.indexOf(cid);
        
        if (index !== -1)
        {
            var creep = Game.getObjectById(cid);

            if (creep) {
                creep.memory.savedTask.active = false;
            } 
            this.claimedBy.splice(index, 1);
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