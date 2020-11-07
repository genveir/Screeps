export class RoomUtil {
    public static getAdjacentPositions(pos : SavedPosition) : SavedPosition[] {
        return this.getStarPositions(pos, 1, true, false);
    }

    public static drawEnergySlots(room : Room) {
        var energySlots = room.memory.energySlots;

        energySlots.forEach(es => room.visual.circle(es.pos.x, es.pos.y, { fill: "yellow" }));
    }

    public static getStarPositions(pos: SavedPosition, range : number, onlyTips : boolean, onlyDiagonals : boolean) : SavedPosition[] {
        var result : SavedPosition[] = [];

        for (var xDirection = -1 ; xDirection <= 1; xDirection++) {
            for (var yDirection = -1; yDirection <= 1; yDirection++) {
                if (xDirection == 0 && yDirection == 0) continue;
                if (onlyDiagonals && (xDirection == 0 || yDirection == 0)) continue;

                var curX = pos.x;
                var curY = pos.y;

                for (var r = 0; r < range; r++) {
                    curX += xDirection;
                    curY += yDirection;
                    
                    if (r == range -1 || !onlyTips) {
                        if (curX >= 0 && curX <= 49 && curY >= 0 && curY <= 49) {
                            result.push({x : curX, y : curY, roomName : pos.roomName});
                        }
                    }
                }
            }
        }

        return result;
    }
}