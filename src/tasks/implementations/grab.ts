import { Task } from '../task';
import { BaseTask } from '../baseTask';
import { PositionUtil } from '../../util/position';
import { MovementUtil } from '../../util/movement';

export class Grab extends BaseTask implements Task {
    public static readonly type : string = "GRAB";
    
    constructor(id: string, claimedBy : Id<Creep>[], numAllowed : number, public item : Id<Structure> | Id<Tombstone> | Id<Ruin>) {
        super(id, Grab.type, claimedBy, numAllowed);

        this._item = null;
    }

    private _item : StructureWithEnergyStore | Tombstone | Ruin | null;
    private getItemWithEnergyStore() : StructureWithEnergyStore | Tombstone | Ruin | null {
        if (this._item === null)
        {
            var instance : any | null = Game.getObjectById(this.item);
        
            if (!instance || !instance.store || instance.store.getCapacity(RESOURCE_ENERGY) === 0) this._item = null;
            else this._item = <any>instance;
        }
        return this._item;
    }

    
    private getItem() : StructureWithEnergyStore | Tombstone | Ruin | null {
        var item = this.getItemWithEnergyStore();
        if (!item)
        {
            this.unclaimAll();
            this.clearOnNextTick = true;
        }
        return item;
    }

    protected _getPriority(creep : Creep) {
        var item = this.getItem();
        if (!item) {
            return 0;
        }
        else
        {
            var energyAvailable = item.store.energy;

            var prio = energyAvailable * 1500;
            return prio - PositionUtil.getFlyDistance(item.pos, creep.pos);
        }
    }

    protected _getSuitability(creep : Creep) {
        var item = this.getItem();

        if (item)
        {
            if ((<any>item).structureType && (<any>item).structureType === STRUCTURE_CONTAINER) {
                if (creep.store.energy === 0 && item.store.energy >= creep.store.getCapacity()) return 100000;
            }
            else {
                return creep.store.getFreeCapacity() * 1000 - PositionUtil.getFlyDistance(item.pos, creep.pos);
            }
        }

        return 0;
    }

    public execute(creep: Creep) {
        var item = this.getItem();
        if (!item)
        {
            this.unclaimAll();
        }
        else
        {
            var result = creep.withdraw(item, RESOURCE_ENERGY);
            if (result === ERR_NOT_IN_RANGE) {
                MovementUtil.moveTo(creep, item.pos);
            }
        }

        if (this.getPriority(creep) <= 0 || this.getSuitability(creep) <= 0) this.unclaim(creep.id);
    }

    public serialize() {
        var copy : any = JSON.parse(JSON.stringify(this));
        copy._item = null;
        return JSON.stringify(copy);
    }
}