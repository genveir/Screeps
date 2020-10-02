import { DecisionDials } from "../spawnLogic/decisionData";

export class MemoryUtil {
    public static init() {
        if (!Memory.logging) Memory.logging = { lastSaved: null, cpuLogging: [] }
        if (!Memory.scoutingTargets) Memory.scoutingTargets = [];

        for (var r in Game.rooms) {
            var roomMem = Memory.rooms[r];
            if (!roomMem) roomMem = <any>{};

            if (!roomMem.logging) 
            {
                roomMem.logging = { 
                    controllerPerTick: [], 
                    controllerPerCycle: {},
                    workersCost: [],
                    workersPerCycle: {},
                    sourceStates: [],
                    sourcesPerCycle: {},
                    heatMap: {}
                };
            }
            if (!roomMem.logging.controllerPerTick) roomMem.logging.controllerPerTick = [];
            if (!roomMem.logging.controllerPerCycle) roomMem.logging.controllerPerCycle = {};
            if (!roomMem.logging.workersCost) roomMem.logging.workersCost = [];
            if (!roomMem.logging.workersPerCycle) roomMem.logging.workersPerCycle = {};
            if (!roomMem.logging.sourceStates) roomMem.logging.sourceStates = [];
            if (!roomMem.logging.sourcesPerCycle) roomMem.logging.sourcesPerCycle = {};
            if (!roomMem.logging.heatMap) roomMem.logging.heatMap = {};
            
            if (!roomMem.spawnTasks) roomMem.spawnTasks = [];
            if (!roomMem.taskList) roomMem.taskList = [];
            if (!roomMem.roads) roomMem.roads = [];
            if (!roomMem.owner) roomMem.owner = {owner: "none", level: 0};
        }

        for (var s in Game.spawns) {
            var spawnMem = Memory.spawns[s];

            if (!spawnMem.settingLog) spawnMem.settingLog = [];
            if (!spawnMem.settings) 
            {
                spawnMem.settings = new DecisionDials();
                spawnMem.settings.creepCeiling = 10;
                spawnMem.settings.maxIdleTicks = 20;
            }
            if (!spawnMem.previousSettings) spawnMem.previousSettings = new DecisionDials();
        }

        for (var c in Game.creeps) {
            var creepMem = Memory.creeps[c];
            if (!creepMem.savedTask) {creepMem.savedTask = {active: false, roomName: "", taskId: ""}};
        }
        
    }

    public static migrate() {
        
    }
}