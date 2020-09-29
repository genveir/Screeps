import { MovementUtil } from './../../util/movement';
import { Task } from '../task';
import { BaseTask } from '../baseTask';
import { PositionUtil } from '../../util/position';

export class Fill extends BaseTask implements Task {
    public static readonly type : string = "FILL";
    
    constructor(id: string, claimedBy : Id<Creep>[], numAllowed : number, public structure : Id<Structure>) {
        super(id, Fill.type, claimedBy, numAllowed);

        this._structure = null;
    }

    private _structure : StructureWithEnergyStore | null;
    private getStructureWithEnergyStore(structure : Id<Structure>) : StructureWithEnergyStore | null {
        if (this._structure === null)
        {
            var instance : any | null = Game.getObjectById(structure);
        
            if (!instance || !instance.store || instance.store.getCapacity(RESOURCE_ENERGY) === 0) this._structure = null;
            else this._structure = <StructureWithEnergyStore>instance;
        }
        return this._structure;
    }

    
    private getStructure() : StructureWithEnergyStore | null {
        var structure = this.getStructureWithEnergyStore(this.structure);
        if (!structure)
        {
            console.log("structure " + this.structure + " does not exist");
            this.unclaimAll();
            this.clearOnNextTick = true;
        }

        return structure;
    }

    protected _getPriority(creep : Creep) {
        var structure = this.getStructure();
        if (!structure) {
            return 0;
        }
        else
        {
            var prio = 100000;
            switch(structure.structureType)
            {
                case STRUCTURE_TOWER: prio = 500000; break;
                case STRUCTURE_EXTENSION: prio = 300000;  break;
                case STRUCTURE_SPAWN: prio = 300000;  break;
                case STRUCTURE_CONTAINER: {
                    var hasSomeEnergy = creep.store.energy > 0;
                    var isNotFull = creep.store.energy < creep.store.getCapacity(RESOURCE_ENERGY);

                    if (hasSomeEnergy && isNotFull) prio = 50000;
                    else prio = 0;

                    break;
                }
            }

            return prio - PositionUtil.getFlyDistance(structure.pos, creep.pos);
        }
    }

    protected _getSuitability(creep : Creep) {
        var structure = this.getStructure();

        if (structure && creep.store.energy > 0 && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            return 100000 - PositionUtil.getFlyDistance(structure.pos, creep.pos);
        }
        else {
            return 0;
        }
    }

    public execute(creep: Creep) {
        var structure = this.getStructure();
        if (!structure)
        {
            console.log("structure " + this.structure + " does not exist");
            this.unclaimAll();
        }
        else
        {
            var result = creep.transfer(structure, RESOURCE_ENERGY);
            if (result === ERR_NOT_IN_RANGE) {
                MovementUtil.moveTo(creep, structure.pos);
            }
        }

        if (this.getPriority(creep) <= 0 || this.getSuitability(creep) <= 0) this.unclaim(creep.id);
    }

    public serialize() {
        var copy : any = JSON.parse(JSON.stringify(this));
        copy._structure = null;
        return JSON.stringify(copy);
    }
}