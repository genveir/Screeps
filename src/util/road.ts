
export class RoadUtil {
    public static getRoadDefinition(room: Room, name : string, start : RoomPosition, end: RoomPosition, range : number) : RoadDefinition | null {        
        if (!room.memory.roads) room.memory.roads = {};

        if (!room.memory.roads[name]) {
            var found = PathFinder.search(start, {pos: end, range: range}, {swampCost: 1});
            if (!found.incomplete) {
                room.memory.roads[name] = {start : start, end: end, route: found.path};
            }
        }
        return room.memory.roads[name];
    }

    public static getSpawnRingRoad(spawn: StructureSpawn) : RoadDefinition {
        var room = spawn.room;

        if (!room.memory.roads) room.memory.roads = {};

        var name = "spawnRing" + spawn.id;

        if (!room.memory.roads[name]) {
            var route = this._getRingRoad(spawn.pos, 1);
            room.memory.roads[name] = {start: spawn.pos, end: spawn.pos, route: route};
        }
        return room.memory.roads[name];
    }

    public static getControllerRingRoad(controller : StructureController) : RoadDefinition {
        var room = controller.room;
        
        if (!room.memory.roads) room.memory.roads = {};
        
        var name = "controllerRing" + controller.id;

        if (!room.memory.roads[name]) {
            var route = this._getRingRoad(controller.pos, 4);
            room.memory.roads[name] = {start : controller.pos, end: controller.pos, route: route};
        }

        return room.memory.roads[name];
    }

    public static getRingRoad(center: SavedPosition, radius: number) : RoadDefinition {
        var route = this._getRingRoad(center, radius);

        return {start : center, end: center, route: route};
    }

    private static _getRingRoad(center : SavedPosition, radius : number) : SavedPosition[] {
        var route : SavedPosition[] = [];
        for (var y = -radius; y <= radius; y++) {
            for (var x = -radius; x <= radius; x++) {
                if (x === -radius || x === radius || y === -radius || y === radius) {
                    if (Game.rooms[center.roomName].getTerrain().get(center.x + x, center.y + y) !== TERRAIN_MASK_WALL) {
                        route.push(new RoomPosition(center.x + x, center.y + y, center.roomName));
                    }
                }
            }
        }
        return route;
    }

    public static drawHeatMap(room : Room) {
        var heatMapData = room.memory.logging.heatMap;

        var highest = 0;
        for (var key in heatMapData) {
            if (heatMapData[key] > highest) highest = heatMapData[key];
        }

        var vis = new RoomVisual(room.name);
        for (var key in heatMapData) {
            var value = Math.floor(heatMapData[key] / highest * 255);
            var color = this.rgbToHex(value, 0, 255 - value);

            var nKey = <number><any>key;
            var pos = new RoomPosition(Math.floor(nKey / 100), nKey % 100, room.name);

            vis.circle(pos, {radius: 0.5, fill: color, opacity: 0.5})
        }
    }

    private static componentToHex(c : number) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }
      
    private static rgbToHex(r : number, g : number, b : number) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }
}