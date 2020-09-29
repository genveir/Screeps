import { MovementUtil } from './../../util/movement';
import { PositionUtil } from '../../util/position';
import { Task } from '../task';
import { BaseTask } from '../baseTask';

export class Idle extends BaseTask implements Task {
    public static type : string = "IDLE";

    public constructor(id : string) {
        super(id, Idle.type, [], 0);

        this.clearOnNextTick = true;
    }

    protected _getPriority(creep : Creep) {
        return -1000000;
    }

    protected _getSuitability(creep : Creep) {
        return -1000000;
    }

    public execute(creep : Creep) {
        var nearestSource : Source | null = null;
        var nearestContainer : StructureContainer | null = null;

        nearestSource = creep.pos.findClosestByRange(FIND_SOURCES);
        var containers = creep.room.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_CONTAINER);
        if (containers) nearestContainer = <StructureContainer>creep.pos.findClosestByRange(containers);

        var distToSource : number = 1000;
        var distToContainer : number = 1000;
        if (nearestSource) distToSource = creep.pos.getRangeTo(nearestSource);
        if (nearestContainer) distToContainer = creep.pos.getRangeTo(nearestContainer);
        
        if (distToSource !== 1000 || distToContainer !== 1000)
        {
            if (distToSource <= distToContainer) {
                if (distToSource > 9) MovementUtil.moveTo(creep, nearestSource!);
                else this.stayOutOfTheWay(creep);
            }
            else {
                if (distToContainer > 9) MovementUtil.moveTo(creep, nearestContainer!);
                else this.stayOutOfTheWay(creep);
            }
        }
        else this.stayOutOfTheWay(creep);
        
        this.unclaimAll();
    }

    private stayOutOfTheWay(creep: Creep) {
        this.moveAwayFromSources(creep);
        this.moveAwayFromSpawns(creep);
        this.moveAwayFromRoads(creep);
    }

    public serialize() : string {
        return JSON.stringify(this);
    }

    private moveAwayFromRoads(creep : Creep)
    {
        var isOnARoad = creep.pos.lookFor(LOOK_STRUCTURES).filter(s => s.structureType === STRUCTURE_ROAD).length > 0;

        if (isOnARoad) this.randomMove(creep);
    }
}