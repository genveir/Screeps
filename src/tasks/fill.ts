import { Task } from './task';
import { BaseTask } from './baseTask';

export class Fill extends BaseTask implements Task {
    public static readonly type : string = "FILL";
    
    constructor(id: string, claimedBy : Id<Creep> | null, public structure : Id<Structure>) {
        super(id, Fill.type, claimedBy);

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
            this.unclaim();
            this.clearOnNextTick = true;
        }
        return structure;
    }

    public getPriority() {
        var structure = this.getStructure();
        if (!structure) {
            return 0;
        }
        else
        {
            switch(structure.structureType)
            {
                case STRUCTURE_TOWER: return 500;
                case STRUCTURE_EXTENSION: return 300;
                default: return 100;
            }
        }
    }

    public canPerform(creep: Creep) {
        var structure = this.getStructure();

        if (!structure) { return false; }
        else {
        return creep.store.energy > 0 &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    }

    public execute(creep: Creep) {
        var structure = this.getStructure();
        if (!structure)
        {
            console.log("structure " + this.structure + " does not exist");
            this.unclaim();
        }
        else
        {
            var result = creep.transfer(structure, RESOURCE_ENERGY);
            if (result === ERR_NOT_IN_RANGE) {
                creep.moveTo(structure);
            }
        }

        if (!this.canPerform(creep)) this.unclaim();
    }

    public serialize() {
        var copy : any = JSON.parse(JSON.stringify(this));
        copy._structure = null;
        return JSON.stringify(copy);
    }
}