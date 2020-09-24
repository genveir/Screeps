import { Role } from "./types";

export interface HarvesterMemory extends CreepMemory {
    role: string;
    targets : HarvesterMemoryTargets;
}

export interface HarvesterMemoryTargets {
    energySources : Source[];
    index: number;
    current: Id<Source>;
}

export class Harvester implements Role {
    memory : HarvesterMemory;

    constructor(private creep : Creep)
    {
        this.memory = <HarvesterMemory>creep.memory;
    }

    public run() {
        if (this.creep.store.getFreeCapacity() != 0) {
            var target = Game.getObjectById(this.memory.targets.current)

            if (this.creep.harvest(target) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
            }
        }
        else
        {
            var spawn = this.creep.room.find(FIND_MY_SPAWNS)[0];
            var transferResult = this.creep.transfer(spawn, RESOURCE_ENERGY);
            if (transferResult == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(spawn);
            }
            else if (transferResult == ERR_FULL) {
                (<HarvesterMemory>this.creep.memory).role = 'upgrader';
            }
            else
            {
                this.updateTarget();
            }
        }
    }

    private updateTarget()
    {
        var numTargets = this.memory.targets.energySources.length;

        var currentTarget = this.memory.targets.index;

        var newTarget = currentTarget + 1;
        if (newTarget >= numTargets) newTarget = 0;

        (<HarvesterMemory>this.creep.memory).targets.index = newTarget;
        (<HarvesterMemory>this.creep.memory).targets.current = this.memory.targets.energySources[newTarget].id;
    }

    public static initialMemory(energySources) : HarvesterMemory
    {
        var mem : HarvesterMemory;
        mem = {
            role: 'harvester',
            targets: {
                energySources: energySources,
                index: 0,
                current: energySources[0]
            }
        };

        return mem;
    }
}