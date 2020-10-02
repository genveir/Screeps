import { DecisionDials } from "../spawnLogic/decisionData";

export const MemoryVersion = 2;

export class MemoryUtil {
    public static init() {
        if (!Memory.logging) Memory.logging = { lastSaved: null, cpuLogging: [] }
        if (!Memory.scoutingTargets) Memory.scoutingTargets = [];

        for (var r in Game.rooms) {
            var roomMem = Memory.rooms[r];
            if (!roomMem) roomMem = <any>{};

            if (roomMem.version !== MemoryVersion) {
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
                roomMem.version = MemoryVersion;
            }
        }

        for (var s in Game.spawns) {
            var spawnMem = Memory.spawns[s];

            if (spawnMem.version !== MemoryVersion) {
                if (!spawnMem.settingLog) spawnMem.settingLog = [];
                if (!spawnMem.settings) 
                {
                    spawnMem.settings = new DecisionDials();
                    spawnMem.settings.creepCeiling = 10;
                    spawnMem.settings.maxIdleTicks = 20;
                }
                if (!spawnMem.previousSettings) spawnMem.previousSettings = new DecisionDials();
                spawnMem.version = MemoryVersion;
            }
        }

        for (var c in Game.creeps) {
            var creepMem = Memory.creeps[c];
            if (creepMem.version !== MemoryVersion) {
                if (!creepMem.savedTask) {creepMem.savedTask = {active: false, roomName: "", taskId: ""}};
                creepMem.version = MemoryVersion;
            }
        }
        
        Memory.version = MemoryVersion;
    }

    public static migrate() {

    }
}