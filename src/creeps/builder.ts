import { MovementUtil } from './../utils/movementUtil';
import { CreepLogic } from "./creepLogic";

export class Builder {
    constructor(private creep : Creep) { }

    public runBuilder() {
        if (this.creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            var nearestSite = this.creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

            if (nearestSite) {
                var result = this.creep.build(nearestSite);
                if (result == ERR_NOT_IN_RANGE) MovementUtil.moveTo(this.creep, nearestSite.pos);
            }
            else {
                new CreepLogic(this.creep).retask();
            }
        }
        else {
            new CreepLogic(this.creep).retask();
        }
    }
}