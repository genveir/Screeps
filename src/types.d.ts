interface FlagMemory { [name: string]: any }
interface SpawnMemory 
{  
    noIdlerTicks: number;
    settings : SpawnSettings;
    previousSettings: SpawnSettings;
    debug? : boolean;
    settingLog : SpawnSettings[];
    version : number;
}

interface SpawnSettings {
    maxIdleTicks : number;
    creepCeiling : number;
    fitness : number | undefined;
}

interface Memory 
{ 
    debug : boolean;
    taskId : number;
    logging : GameLogging;
    scoutingTargets : ScoutingTask[]
    me: string
    hm : boolean // toggles heatmap for every room in Memory.rooms
    version : number;
}

interface ScoutingTask {
    roomName : string;
    claimedBy : Id<Creep> | null;
}

interface GameLogging {
    lastSaved : number | null;
    cpuLogging : CpuLogEntry[]
}

interface CpuLogEntry {
    tick : number;
    setupEnd? : number;
    roomLogicEnds? : CpuLogRoomEntry[];
    gameLogicEnd? : number;
    spawnLogicEnds? : CpuLogSpawnEntry[];
    spawnLogicEnd?: number;
    creepLogicEnds? : CpuLogCreepEntry[];
    creepLogicEnd?: number;
}

interface CpuLogRoomEntry {
    roomName : string;
    energySlotEnd? : number;
    ownershipEnd? : number;
    buildEnd? : number;
    scoutingTargetsEnd? : number;
    taskEnd? : number;
    totalEnd? : number;
}

interface CpuLogSpawnEntry {
    spawnName : string;
    cpu : number;
}

interface CpuLogCreepEntry {
    creepName : string;
    cpu : number;
}

interface RoomMemory { 
    name : string
    taskList : string[];
    energySlots? : SavedHarvestPosition[];
    roads : SavedPosition[];
    logging : RoomLogging;
    drawHeatMap? : boolean;
    spawnTasks : SavedSpawnTask[];
    owner : {owner : string; level : number;};
    debug? : boolean;
    version : number;
}

interface SavedSpawnTask {
    id : string;
    type : CreepType;
    priority : number;
}

interface RoomLogging {
    controllerPerTick: number[];
    controllerPerCycle: EnergySums;
    workersCost : number[];
    workersPerCycle: EnergySums;
    sourceStates : SourceState[];
    sourcesPerCycle: SourceStats;
    heatMap : {[pos: number]: number}
}

type CREEPTYPE_WORKER = 0;
type CREEPTYPE_SCOUT = 1;

declare const CREEPTYPE_WORKER: CREEPTYPE_WORKER;
declare const CREEPTYPE_SCOUT: CREEPTYPE_SCOUT;

type CreepType = CREEPTYPE_WORKER | CREEPTYPE_SCOUT

interface EnergySums { [finalTick: number]: number}

interface SourceState {
     id: Id<Source>;
     energy: number;
}

interface SourceStats { [finalTick: number]: SourceStat[] }

interface SourceStat {
    id : string;
    energyHarvested : number;
    numEmptyTicks: number;
    numFullTicks : number;
}

interface SavedHarvestPosition {
     id: Id<Source>,
     pos: SavedPosition
}

interface SavedPosition {
    x: number,
    y: number,
    roomName: string
}

interface CreepMemory {
    savedTask : SavedTask;
    lastPositions : (SavedPosition | null)[]
    debug? : boolean;
    type : CreepType;
    version : number;
}

interface SavedTask {
    active : boolean;
    roomName : string;
    taskId : string;
}

interface StructureWithEnergyStore extends Structure<StructureConstant> {
    store: Store<RESOURCE_ENERGY, false>;
}