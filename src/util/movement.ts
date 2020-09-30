export class MovementUtil {
    public static moveTo(creep : Creep, pos : RoomPosition | {pos : RoomPosition} , range? : number) : CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND | -1337 {
        var dontMove : boolean = this.isLocked(creep);
        
        if (!dontMove) {
            var result = creep.moveTo(pos, {reusePath: 0, range: range});

            var posAsNumber = creep.pos.x * 100 + creep.pos.y;
            if (!creep.room.memory.logging.heatMap[posAsNumber]) creep.room.memory.logging.heatMap[posAsNumber] = 0;
            creep.room.memory.logging.heatMap[posAsNumber]++;

            if (Memory.debug || creep.memory.debug) console.log("heatMap for position is now " + creep.room.memory.logging.heatMap[posAsNumber])

            return result;
        }

        return -1337;
    }   

    private static isLocked(creep: Creep) : boolean {
        if (!creep.memory.lastPositions) creep.memory.lastPositions = [null, null];
        var lastTwoPositions = creep.memory.lastPositions;

        var lastPos = lastTwoPositions[0];
        var beforeThat = lastTwoPositions[1];

        var blocked : boolean = false;
        if (beforeThat) {
            if (beforeThat.x === creep.pos.x && beforeThat.y === creep.pos.y) {
                if (Math.random() < 0.5) blocked = true;
            }
        }
        creep.memory.lastPositions = [creep.pos, lastPos];

        return blocked;
    }
}