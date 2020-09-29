export class Logging {
    public static init() {
        if (!Memory.logging) Memory.logging = { lastSaved: null }

        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (!room.memory.logging) 
            {
                room.memory.logging = { 
                    controllerPerTick: [], 
                    controllerPerCycle: {},
                    creepsCost: [],
                    creepsPerCycle: {},
                    sourceStates: [],
                    sourcesPerCycle: {}
                };
            }
            if (!room.memory.logging.controllerPerTick) room.memory.logging.controllerPerTick = [];
            if (!room.memory.logging.controllerPerCycle) room.memory.logging.controllerPerCycle = {};
            if (!room.memory.logging.creepsCost) room.memory.logging.creepsCost = [];
            if (!room.memory.logging.creepsPerCycle) room.memory.logging.creepsPerCycle = {};
            if (!room.memory.logging.sourceStates) room.memory.logging.sourceStates = [];
            if (!room.memory.logging.sourcesPerCycle) room.memory.logging.sourcesPerCycle = {};
        }
    }

    public static update() {
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];

            this.updateControllerPerTick(room);
            this.updateSourcesPerTick(room);
            
            if (Game.time % 300 === 0) {
                this.updateControllerPerCycle(room);
                this.updateSpawnCost(room);
                this.updateSourceStats(room);

                Memory.logging.lastSaved = Game.time;
            }
        }
    }

    public static logSpawn(spawn : StructureSpawn, cost : number)
    {
        var room = spawn.room;
        room.memory.logging.creepsCost.push(cost);
    }

    private static updateControllerPerTick(room : Room) {
        if (room.controller) room.memory.logging.controllerPerTick.push(room.controller.progress);
    }

    private static updateControllerPerCycle(room : Room) {
        var total = 0;
        if (room.memory.logging.controllerPerTick.length > 0) {
            var last = room.memory.logging.controllerPerTick.slice(-1)[0];
            var first = room.memory.logging.controllerPerTick[0];

            total = last - first;
        }

        room.memory.logging.controllerPerCycle[Game.time] = total;
        room.memory.logging.controllerPerTick = [];
    }

    private static updateSpawnCost(room : Room) {
        var total = 0;
        if (room.memory.logging.creepsCost.length > 0) {
            total = room.memory.logging.creepsCost.reduce((a, b) => a + b);
        }

        room.memory.logging.creepsPerCycle[Game.time] = total;
        room.memory.logging.creepsCost = [];
    }

    private static updateSourcesPerTick(room : Room) {
        room.find(FIND_SOURCES).forEach(s => {
            room.memory.logging.sourceStates.push({id: s.id, energy: s.energy});
        });
    }

    private static updateSourceStats(room : Room) {
        var stats : SourceStat[] = [];

        room.find(FIND_SOURCES).forEach(s => {
            var singleStats = room.memory.logging.sourceStates.filter(ss => ss.id == s.id);
            
            var numEmptyTicks = 0
            var numFullTicks = 0;
            var energyHarvested = 0;
            for (var i = 1; i < singleStats.length; i++)
            {
                if (singleStats[i].energy === 0) numEmptyTicks++;

                if (singleStats[i].energy === 3000)
                {
                    numFullTicks++;
                }
                else (energyHarvested += (singleStats[i-1].energy - singleStats[i].energy));
            }

            stats.push({id: s.id, energyHarvested: energyHarvested, numEmptyTicks: numEmptyTicks, numFullTicks: numFullTicks});
        })

        room.memory.logging.sourcesPerCycle[Game.time] = stats;

        room.memory.logging.sourceStates = [];
    }
}