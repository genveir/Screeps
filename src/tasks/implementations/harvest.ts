import { PositionUtil } from './../../util/position';
import { MovementUtil } from '../../util/movement';
import { BaseTask } from '../baseTask';
import { Task } from '../task';

export class Harvest extends BaseTask implements Task {
    public static type : string = "HARVEST";

    constructor(id : string, claimedBy: Id<Creep>[], numAllowed : number, private source : Id<Source>, public pos : RoomPosition) {
        super(id, Harvest.type, claimedBy, numAllowed);
    }

    private getSource() : Source | null {
        var source = Game.getObjectById(this.source);
        if (!source) {
            this.unclaimAll();
        }
        return source;
    }

    protected _getPriority(creep : Creep) {
        var prio = 100000;

        var source = this.getSource();
        if (source) {
            if (source.energy === 0) 
            {
                var distanceFromSource = PositionUtil.getFlyDistance(this.pos, creep.pos);
                var expectedTravelDifficultyModifier = distanceFromSource > 10 ? 1.2 : 0.1;
                var ticksToGetToSource = distanceFromSource * expectedTravelDifficultyModifier;
                
                var ticksToRegen = source.ticksToRegeneration;
                var safetyMargin = 5;
                var ticksForSourceToBeHarvested = ticksToRegen - safetyMargin;

                if (ticksToGetToSource < ticksForSourceToBeHarvested) return 0;
            }

            var energyExpected = source.ticksToRegeneration * 10;
            if (source.energy > energyExpected) prio += 100;
            if (source.energy === 3000) prio += 100;
        }

        return prio - PositionUtil.getFlyDistance(this.pos, creep.pos);
    }

    protected _getSuitability(creep : Creep) {
        var source = this.getSource();

        if (!source) return 0;
        if (creep.store.getFreeCapacity() === 0) return 0;
        if (creep.getActiveBodyparts(WORK) === 0) return 0;
        if (creep.getActiveBodyparts(CARRY) === 0) return 0;
        if (creep.getActiveBodyparts(MOVE) === 0) return 0;

        return 100000 - PositionUtil.getFlyDistance(this.pos, creep.pos);
    }

    public execute(creep : Creep) {
        if (creep.pos.isEqualTo(this.pos.x, this.pos.y)) {
            var source = this.getSource();
            if (source)
            {
                creep.harvest(source);
            }

            this.grabEnergyFromTombstones(creep);
        }
        else {
            MovementUtil.moveTo(creep, this.pos);
        }

        if (creep.memory.debug) console.log(" creep has suitability " + this.getSuitability(creep));
        if (this.getPriority(creep) <= 0 || this.getSuitability(creep) <= 0) this.unclaim(creep.id);
    }

    public serialize() : string {
        return JSON.stringify(this);
    }

    public static deserialize(deserialized : any) : Harvest {
        var roomPos = new RoomPosition(deserialized.pos.x, deserialized.pos.y, deserialized.pos.roomName);

        return new Harvest(deserialized.id, deserialized.claimedBy, deserialized.numAllowed, deserialized.source, roomPos);
    } 
}