export class MovementUtil {
    public static moveTo(creep : Creep, position : SavedPosition) {
        var rp = new RoomPosition(position.x, position.y, position.roomName);
        
        creep.moveTo(rp, { reusePath: 0, serializeMemory: false })
    }
}