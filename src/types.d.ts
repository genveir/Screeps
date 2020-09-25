interface FlagMemory { [name: string]: any }
interface SpawnMemory { [name: string]: any }

interface Memory { [name: string]: any }

interface RoomMemory { 
    taskList : string[];
    energySlots : SavedHarvestPosition[];
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
}

interface SavedTask {
    active : boolean;
    roomName : string;
    taskId : string;
}