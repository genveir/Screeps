export class RoomLogic {


    constructor(private room: Room) {

    }

    run() {
        console.log("running logic for room " + this.room.name);

        console.log("tasks: " + this.room.memory.taskList);
    }
}