import {RoomLogic} from "./roomLogic/roomLogic"

export class GameLogic {
    run() : void {
        // I don't have a global strategy yet, so there's nothing here but room logic

        for (var roomName in Game.rooms) {
            new RoomLogic( Game.rooms[roomName] ).run();
        }
    }
}