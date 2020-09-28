import {RoomLogic} from "./roomLogic/roomLogic"

export class GameLogic {
    run() : void {
        // I don't have a global strategy yet, so there's nothing here but room logic

        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            new RoomLogic(room).run();

            if (Memory.logging.lastSaved && room.controller)
            {
                if (Memory.debug) console.log("setting room visuals");

                var lastSum = room.memory.logging.controllerPerCycle[Memory.logging.lastSaved];
                new RoomVisual(room.name).text(lastSum + "⚡ (" + (300 - Game.time % 300) + "...)", room.controller.pos.x, room.controller.pos.y + 1, {font: 0.5});

                var lastStates = room.memory.logging.sourcesPerCycle[Memory.logging.lastSaved];
                if (lastStates) {
                    room.find(FIND_SOURCES).forEach(source => {
                        var lastState = lastStates[source.id];
                        if (lastState) new RoomVisual(room.name).text(lastState.energyHarvested + "⚡ " + lastState.numEmptyTicks + "🚫", source.pos.x, source.pos.y + 1, {font: 0.5});
                    });
                }

                var spawn = "🚧"

                if (Memory.debug) console.log("done with room visuals");
            }
        }
    }
}