export class PositionUtil {
    public static getEmptySurrounding(pos : RoomPosition) : RoomPosition[]
    {
        var terrain = new Room.Terrain(pos.roomName);

        var toReturn : RoomPosition[] = [];
        
        for (var y = -1; y <= 1; y++)
        {
            for (var x = -1; x <= 1; x++)
            {
                var xPos = pos.x + x;
                var yPos = pos.y + y;

                if (xPos === 0 && yPos === 0) continue;
                if (xPos < 0 || xPos > 49) continue;
                if (yPos < 0 || yPos > 49) continue;

                if (terrain.get(xPos, yPos) === 1) continue;

                toReturn.push(new RoomPosition(xPos, yPos, pos.roomName));
            }
        }

        return toReturn;
    }

    public static compare(a : {x : number, y: number}, b : {x : number, y: number}) : number {
        var aVal = a.x * 100 + a.y;
        var bVal = b.x * 100 + b.y;

        return aVal - bVal;
    }

    public static getManhattanDistance(a : {x : number, y : number}, b : {x : number, y : number}) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
}