export class Logging {
    public static update() {
        Memory.logging.cpuLogging = Memory.logging.cpuLogging
            .filter(log => log.tick + 300 > Game.time || log.tick % 1000 === 0);

        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];

            if (room.controller && room.controller.owner && room.controller.owner.username == Memory.me) {
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
    }

    public static logSpawn(spawn : StructureSpawn, cost : number)
    {
        var room = spawn.room;
        room.memory.logging.workersCost.push(cost);
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
        if (room.memory.logging.workersCost.length > 0) {
            total = room.memory.logging.workersCost.reduce((a, b) => a + b);
        }

        room.memory.logging.workersPerCycle[Game.time] = total;
        room.memory.logging.workersCost = [];
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