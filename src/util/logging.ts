export class Logging {
    private static initLogging() {
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (!room.memory.logging) 
            {
                room.memory.logging = { 
                    controllerPerTick: [], 
                    controllerPerCycle: [],
                    creepsCost: [],
                    creepsPerCycle: []
                };
            }
            if (!room.memory.logging.controllerPerTick) room.memory.logging.controllerPerTick = [];
            if (!room.memory.logging.controllerPerCycle) room.memory.logging.controllerPerCycle = [];
            if (!room.memory.logging.creepsCost) room.memory.logging.creepsCost = [];
            if (!room.memory.logging.creepsPerCycle) room.memory.logging.creepsPerCycle = [];
        }
    }

    public static monitorControllerPerformance(room : Room) {
        this.initLogging();

        if (room.controller) room.memory.logging.controllerPerTick.push(room.controller.progress);
        if (room.memory.logging.controllerPerTick.length === 300) 
        {
            room.memory.logging.controllerPerCycle.push({finalTick: Game.time, totalProgress: room.memory.logging.controllerPerTick[299] - room.memory.logging.controllerPerTick[0]});
            room.memory.logging.controllerPerTick = [];
        }

        if (room.memory.logging.controllerPerCycle.length > 0 && room.controller)
        {
            var lastSum = room.memory.logging.controllerPerCycle[room.memory.logging.controllerPerCycle.length - 1];
            new RoomVisual(room.name).text(lastSum.totalProgress + "⚡ (" + (300 - room.memory.logging.controllerPerTick.length) + "...)", room.controller.pos.x, room.controller.pos.y + 1, {font: 0.5});
        }
    }

    public static logCreep(spawn : StructureSpawn, cost : number)
    {
        this.initLogging();

        var room = spawn.room;
        room.memory.logging.creepsCost.push(cost);
    }

    public static monitorCreepCost(room : Room) {
        this.initLogging();


    }
}