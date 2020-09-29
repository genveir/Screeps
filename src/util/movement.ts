export class MovementUtil {
    public static moveTo(creep : Creep, pos : RoomPosition | {pos : RoomPosition} , range? : number) : CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND {
        var result = creep.moveTo(pos, {reusePath: 0, range: range});

        var posAsNumber = creep.pos.x * 100 + creep.pos.y;
        if (!creep.room.memory.logging.heatMap[posAsNumber]) creep.room.memory.logging.heatMap[posAsNumber] = 0;
        creep.room.memory.logging.heatMap[posAsNumber]++;

        if (Memory.debug || creep.memory.debug) console.log("heatMap for position is now " + creep.room.memory.logging.heatMap[posAsNumber])

        return result;
    }   
}