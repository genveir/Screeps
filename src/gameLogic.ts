import { RoomLogic } from "./rooms/roomLogic";

export class GameLogic {
    runGameLogic() {
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
        
            var roomLogic = new RoomLogic(room);
            roomLogic.runRoomLogic();
        }
    }
}