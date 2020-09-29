export class MovementUtil {
    public static moveTo(creep : Creep, pos : RoomPosition | {pos : RoomPosition} , range? : number) {
        creep.moveTo(pos, {reusePath: 0, range: range});

        var posAsNumber = creep.pos.x * 100 + creep.pos.y;
        if (!creep.room.memory.logging.heatMap[posAsNumber]) creep.room.memory.logging.heatMap[posAsNumber] = 0;
        creep.room.memory.logging.heatMap[posAsNumber]++;

        if (Memory.debug || creep.memory.debug) console.log("heatMap for position is now " + creep.room.memory.logging.heatMap[posAsNumber])
    }   
}