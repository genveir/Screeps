export class MovementUtil {
    public static moveTo(creep : Creep, pos : RoomPosition | {pos : RoomPosition} ) {
        var currentPos = creep.pos;

        if (pos instanceof RoomPosition) {
            if (Memory.debug || creep.memory.debug) console.log("moving to " + pos.x + "," + pos.y);
        }
        else {
            if (Memory.debug || creep.memory.debug) {
                console.log("argument passed is not a room position");
                console.log(JSON.stringify(pos));
                console.log("moving to " + pos.pos.x + ", " + pos.pos.y);
            }
        }

        
        var result = creep.moveTo(pos, {reusePath: 20});
        if (Memory.debug || creep.memory.debug) console.log("with result " + result);

        if (result === 0 && creep.pos.isEqualTo(currentPos)) 
        {
            if (Memory.debug || creep.memory.debug) console.log("creep couldn't move from " + currentPos.x + "," + currentPos.y);
            creep.moveTo(pos, {reusePath: 0});
        }
    }
}