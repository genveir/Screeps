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
}