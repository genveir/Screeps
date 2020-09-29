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
}

interface GameLogging {
    lastSaved : number | null;
}

interface RoomMemory { 
    taskList : string[];
    energySlots : SavedHarvestPosition[];
    roads : { [name: string] : RoadDefinition}
    controllerRoadPath : SavedPosition[];
    logging : RoomLogging;
    drawHeatMap? : boolean;
 }

 interface RoomLogging {
    controllerPerTick: number[];
    controllerPerCycle: EnergySums;
    creepsCost : number[];
    creepsPerCycle: EnergySums;
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

 interface RoadDefinition {
     start : SavedPosition,
     end : SavedPosition,
     route : SavedPosition[]
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