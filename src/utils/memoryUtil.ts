export class MemoryUtil {
    public static init() {
        for (var roomName in Memory.rooms) {
            var room = Memory.rooms[roomName];

            if (!room.energySlots) room.energySlots = [];
        }
    }
}