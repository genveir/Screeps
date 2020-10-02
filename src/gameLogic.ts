import { RoadUtil } from './util/road';
import {RoomLogic} from "./roomLogic/roomLogic"

export class GameLogic {
    runGameLogic(cpuLogEntry : CpuLogEntry) : void {
        // I don't have a global strategy yet, so there's nothing here but room logic

        cpuLogEntry.roomLogicEnds = [];
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            new RoomLogic(room).runRoomLogic();

            if (room.memory.owner.owner === Memory.me) {

                if (Memory.debug) console.log("setting room visuals");
                if (room.memory.drawHeatMap) RoadUtil.drawHeatMap(room);

                if (Memory.logging.lastSaved && room.controller)
                {
                    var lastSum = room.memory.logging.controllerPerCycle[Memory.logging.lastSaved];
                    new RoomVisual(room.name).text(lastSum + "⚡ (" + (300 - Game.time % 300) + "...)", room.controller.pos.x, room.controller.pos.y + 1, {font: 0.5});

                    var lastStates = room.memory.logging.sourcesPerCycle[Memory.logging.lastSaved];
                    if (lastStates) {
                        room.find(FIND_SOURCES).forEach(source => {
                            var lastState = lastStates.filter(ls => ls.id === source.id);
                            if (lastState) new RoomVisual(room.name).text(lastState[0].energyHarvested + "⚡ " + lastState[0].numEmptyTicks + "🚫 " + lastState[0].numFullTicks + "☀", source.pos.x, source.pos.y + 1, {font: 0.5});
                        });
                    }

                    var spawn = "🚧"

                    if (Memory.debug) console.log("done with room visuals");
                }
            }
            cpuLogEntry.roomLogicEnds.push({roomName: roomName, cpu: Game.cpu.getUsed()});
        }
    }
}