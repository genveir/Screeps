import { Task } from './task';
import { BaseTask } from './baseTask';

export class FillSpawn extends BaseTask implements Task {
    public static readonly type : string = "FILLSPAWN";
    
    constructor(id: string, claimedBy : Id<Creep> | null, private spawn : Id<StructureSpawn>) {
        super(id, FillSpawn.type, claimedBy);
    }

    private getSpawn() : StructureSpawn | null {
        var spawn = Game.getObjectById(this.spawn);
        if (!spawn)
        {
            console.log("spawn " + this.spawn + " does not exist");
            this.unclaim();
        }
        return spawn;
    }

    public getPriority(creep : Creep) {
        var spawn = this.getSpawn();
        if (!spawn) {
            return 0;
        }
        else
        {
            return 300000;
        }
    }

    public canPerform(creep: Creep) {
        var spawn = this.getSpawn();

        if (!spawn) { return false; }
        else {
        return creep.store.energy > 0 &&
            spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    }

    public execute(creep: Creep) {
        var spawn = Game.getObjectById(this.spawn);
        if (!spawn)
        {
            console.log("spawn " + this.spawn + " does not exist");
            this.unclaim();
        }
        else
        {
            var result = creep.transfer(spawn, RESOURCE_ENERGY);
            if (result === ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
        }

        if (!this.canPerform(creep)) this.unclaim();
    }

    public serialize() {
        return JSON.stringify(this);
    }
}