interface FlagMemory { [name: string]: any }
interface SpawnMemory 
{  
    noIdlerTicks: number;
    settings : SpawnSettings;
    previousSettings: SpawnSettings;
    debug? : boolean;
    settingLog : SpawnSettings[];
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
    logging : GameLogging
    hm : boolean // toggles heatmap for every room in Memory.rooms
}

interface GameLogging {
    lastSaved : number | null;
}

interface RoomMemory { 
    taskList : string[];
    energySlots? : SavedHarvestPosition[];
    roads : SavedPosition[];
    logging : RoomLogging;
    drawHeatMap? : boolean;
 }

 interface RoomLogging {
    controllerPerTick: number[];
    controllerPerCycle: EnergySums;
    creepsCost? : number[];
    workersCost : number[];
    creepsPerCycle?: EnergySums;
    workersPerCycle: EnergySums;
    sourceStates : SourceState[];
    sourcesPerCycle: SourceStats;
    heatMap : {[pos: number]: number}
 }

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
}

interface SavedTask {
    active : boolean;
    roomName : string;
    taskId : string;
}

interface StructureWithEnergyStore extends Structure<StructureConstant> {
    store: Store<RESOURCE_ENERGY, false>;
}