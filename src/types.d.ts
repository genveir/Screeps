interface FlagMemory { [name: string]: any }
interface SpawnMemory { [name: string]: any }
interface RoomMemory { [name: string]: any }

interface CreepMemory {
    role: string;
    targets : CreepMemoryTargets;
}

interface CreepMemoryTargets {
    energySources : Id<Source>[];
    index: number;
    current: Id<Source>;
}