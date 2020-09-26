
export class RoadUtil {
    public static getRoadDefinition(room: Room, name : string, start : RoomPosition, end: RoomPosition, range : number) : RoadDefinition | null {        
        if (!room.memory.roads) room.memory.roads = {};

        if (!room.memory.roads[name])
        {
            var found = PathFinder.search(start, {pos: end, range: range}, {swampCost: 1});
            if (!found.incomplete)
            {
                room.memory.roads[name] = {start : start, end: end, route: found.path};
            }
        }
        return room.memory.roads[name];
    }

    public static getSpawnRingRoad(spawn: StructureSpawn) : RoadDefinition {
        var room = spawn.room;

        if (!room.memory.roads) room.memory.roads = {};

        var name = "spawnRing" + spawn.id;

        if (!room.memory.roads[name])
        {
            var route : SavedPosition[] = [];
            for (var y = -1; y <= 1; y++) {
                for (var x = -1; x <= 1; x++) {
                    if (x === 0 && y === 0) continue;
                    route.push(new RoomPosition(spawn.pos.x + x, spawn.pos.y + y, room.name));
                }
            }
            room.memory.roads[name] = {start: spawn.pos, end: spawn.pos, route: route};
        }
        return room.memory.roads[name];
    }
}