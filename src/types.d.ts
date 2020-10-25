interface FlagMemory { [name: string]: any }
interface SpawnMemory { [name: string]: any }
interface CreepMemory { [name: string]: any }
interface Memory { [name: string]: any }

interface SavedPosition {
    x : number;
    y : number;
    roomName : string;
}

interface RoomMemory {
    energySlots : SavedPosition[];

    debug? : boolean;
}