export default abstract class Worker extends Creep
{
    protected strokeColor: string = '#ffaa00';
    public memory!: WorkerMemory;

    constructor(id: Id<Creep>) {
        super(id);
        // this.memory.charging = false;
    }

    public harvestClosestSource(i: number = 0) {
        let targets = this.room.find(FIND_SOURCES);
        if (targets)
        {
            let harvestError = this.harvest(targets[i]);
            switch(harvestError)
            {
                case OK:
                    break;
                case ERR_NOT_IN_RANGE:
                    this.tryMoveTo(targets[i]);
                    break;
                default:
                    console.log(`Worker ${this.name} cannot harvest because: ${harvestError}`);
                    this.say("❌harvest");
            }
        }
        else {
            console.log(`Worker ${this.name} cannot find sources`);
            this.say("❌find sources");
        }
    }

    public isFull() : boolean {
        return this.store.getFreeCapacity() == 0;
    }

    public tryMoveTo(target: RoomPosition | { pos: RoomPosition }, opts?: MoveToOpts,)
    : CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND
    {
        var result = this.moveTo(target, {visualizePathStyle: {stroke: this.strokeColor}});
        switch (result) {
            case OK:
            case ERR_BUSY:
                break;
            case ERR_NO_PATH:
                // console.log(`Worker ${this.name} cannot move because: No path to the target could be found.`);
                this.say('⛔NoPath');
                break;
            case ERR_TIRED:
                // console.log(`Worker ${this.name} cannot move because: The fatigue indicator of the creep is non-zero.`);
                this.say('🥱Tired');
                break;
            case ERR_INVALID_TARGET:
                console.log(`Worker ${this.name} cannot move because: The target provided is invalid.`);
                this.say('🚫Target');
                break;
            case ERR_NO_BODYPART:
                console.log(`Worker ${this.name} cannot move because: There are no MOVE body parts in this creep’s body.`);
                this.say('🦿MissinMove');
                break;
            default:
                console.log(`Worker ${this.name} cannot move because: ${result as CreepMoveReturnCode}`);
                this.say("❌Move");
        }
        return result;
    }
}

export enum WorkerRole {
    UPGRADER = "upgrader",
    HARVESTER = "harvester",
    UNASSIGNED = ""
}

export class WorkerMemory implements CreepMemory {
    public role: WorkerRole
    public room: string;
    public working: boolean;
    public charging: boolean;

    constructor(role: WorkerRole = WorkerRole.UNASSIGNED) {
        this.role = role;
        this.room = "";
        this.working = false;
        this.charging = false;
    }
}
