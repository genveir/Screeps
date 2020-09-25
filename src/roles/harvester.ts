import { Role } from "./roles";

export class Harvester implements Role {
    constructor(private creep : Creep)
    {

    }

    public run() {
        if (this.creep.store.getFreeCapacity() != 0) {
            var target = Game.getObjectById(this.creep.memory.targets.current)

            if (!target) console.log("creep " + this.creep.name + " tried to go to id " + this.creep.memory.targets.current + " which does not exist");
            else
            {
                if (this.creep.harvest(target) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(target);
                }
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
                this.creep.memory.role = 'upgrader';
            }
            else
            {
                this.updateTarget();
            }
        }
    }

    private updateTarget()
    {
        var numTargets = this.creep.memory.targets.energySources.length;

        var currentTarget = this.creep.memory.targets.index;

        var newTarget = currentTarget + 1;
        if (newTarget >= numTargets) newTarget = 0;

        this.creep.memory.targets.index = newTarget;
        this.creep.memory.targets.current = this.creep.memory.targets.energySources[newTarget];
    }

    public static initialMemory(energySources : Id<Source>[]) : CreepMemory
    {
        var mem : CreepMemory;
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