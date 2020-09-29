class HeatMapItem {
    pos : RoomPosition;
    heat: number;
}

export class RoadUtil {
    public static setRoads(room : Room) {
        var heatMapData = this.getHeatmap(room);

        var makeRoad = heatMapData.filter(hmd => hmd.heat > 0.4);

        var roads = makeRoad.map(mr => mr.pos);
        room.memory.roads = roads;
    }

    public static drawHeatMap(room : Room) {
        var heatMapData = this.getHeatmap(room);

        var vis = new RoomVisual(room.name);
        heatMapData.forEach(hmd => {
            var value = Math.floor(hmd.heat * 255);
            var color = this.rgbToHex(value, 0, 255 - value);

            vis.circle(hmd.pos, {radius: 0.5, fill: color, opacity: 0.5});
            vis.text(JSON.stringify(Math.floor(hmd.heat * 100)), hmd.pos.x, hmd.pos.y, {font : 0.3});
        });
    }

    private static getHeatmap(room : Room) : HeatMapItem[] {
        var heatmapData = room.memory.logging.heatMap;

        var highest = 0;
        for (var key in heatmapData) {
            if (heatmapData[key] > highest) highest = heatmapData[key];
        }

        var result : HeatMapItem[] = [];
        for (var key in heatmapData) {
            var value = heatmapData[key] / highest;

            var nKey = <number><any>key;
            var pos = new RoomPosition(Math.floor(nKey / 100), nKey % 100, room.name);

            result.push({pos: pos, heat: value});
        }

        return result;
    }

    private static componentToHex(c : number) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }
      
    private static rgbToHex(r : number, g : number, b : number) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }
}