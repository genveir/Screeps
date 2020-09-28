import { Task } from '../task';
import { BaseTask } from '../baseTask';
import { PositionUtil } from '../../util/position';

export class Grab extends BaseTask implements Task {
    public static readonly type : string = "GRAB";
    
    constructor(id: string, claimedBy : Id<Creep> | null, public item : Id<Structure> | Id<Tombstone> | Id<Ruin>) {
        super(id, Grab.type, claimedBy);

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
            this.unclaim();
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
            return 105000 - PositionUtil.getFlyDistance(item.pos, creep.pos);
        }
    }

    protected _getSuitability(creep : Creep) {
        var item = this.getItem();

        if (!item) return 0;
        else {
            if ((<any>item).structureType && (<any>item).structureType === STRUCTURE_CONTAINER) {
                if (creep.store.energy === 0 && item.store.energy >= creep.store.getCapacity()) return 100000;
                else return 0;
            }
            if (creep.store.energy === 0 && item.store.energy > 0) return 100000 - PositionUtil.getFlyDistance(item.pos, creep.pos);
            else return 0;
        }
    }

    public execute(creep: Creep) {
        var item = this.getItem();
        if (!item)
        {
            this.unclaim();
        }
        else
        {
            var result = creep.withdraw(item, RESOURCE_ENERGY);
            if (result === ERR_NOT_IN_RANGE) {
                creep.moveTo(item, {reusePath: 20});
            }
        }

        if (this.getSuitability(creep) <= 0) this.unclaim();
    }

    public serialize() {
        var copy : any = JSON.parse(JSON.stringify(this));
        copy._item = null;
        return JSON.stringify(copy);
    }
}