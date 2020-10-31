interface FlagMemory { [name: string]: any }
interface SpawnMemory { [name: string]: any }
interface Memory { [name: string]: any }

interface SavedPosition {
    x : number;
    y : number;
    roomName : string;
}

interface HarvestPosition {
    pos : SavedPosition;
    source : Id<Source>;
}

interface RoomMemory {
    energySlots : HarvestPosition[];

    debug? : boolean;
}

interface CreepMemory {
    role: string;
    slot: HarvestPosition | null;
 }