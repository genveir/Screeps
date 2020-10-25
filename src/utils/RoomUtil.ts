export class RoomUtil {
    public static getAdjacentPositions(pos : SavedPosition) : SavedPosition[] {
        var result : SavedPosition[] = [];
        
        for (var x = -1; x <= 1; x++) {
            for (var y = -1; y <= 1; y++) {
                if (x == 0 && y == 0) continue;
                
                var newX = pos.x + x;
                if (newX < 0 || newX > 49) continue;

                var newY = pos.y + y;
                if (newY < 0 || newY > 49) continue;

                result.push({x : newX, y: newY, roomName: pos.roomName});
            }
        }

        return result;
    }
}