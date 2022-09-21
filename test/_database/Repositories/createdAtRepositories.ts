import { addRepository, Allow, Entity, IsRequired, ORMOperations } from '../../../src';

@Entity({ name: 'cr1' })
class CR1Entity {
    @Allow()
    @IsRequired()
    name: string;
}

export class CR1Repository extends ORMOperations {
    constructor() {
        const ORM = addRepository(CR1Entity);
        super(ORM);
    }
}

@Entity({ name: 'cr2' })
class CR2Entity {
    @Allow()
    @IsRequired()
    name: string;
}

export class CR2Repository extends ORMOperations {
    constructor() {
        const ORM = addRepository(CR2Entity, {
            autoCreatedAt: true,
            autoUpdatedAt: true,
            debug: true
        });
        super(ORM);
    }
}


@Entity({ name: 'cr3' })
class CR3Entity {
    @Allow()
    @IsRequired()
    name: string;
}

export class CR3Repository extends ORMOperations {
    constructor() {
        const ORM = addRepository(CR3Entity, {
            autoCreatedAt: false,
            autoUpdatedAt: false,
            debug: false
        });
        super(ORM);
    }
}

@Entity({ name: 'cr4' })
class CR4Entity {
    @Allow()
    @IsRequired()
    name: string;
}

export class CR4Repository extends ORMOperations {
    constructor() {
        const ORM = addRepository(CR4Entity, {
            createdAtKey: 'created_at',
            updatedAtKey: 'updated_at'
        });
        super(ORM);
    }
}

@Entity({ name: 'cr5' })
class CR5Entity {
    @Allow()
    @IsRequired()
    name: string;
}

export class CR5Repository extends ORMOperations {
    constructor() {
        const ORM = addRepository(CR5Entity, {
            autoCreatedAt: false,
            autoUpdatedAt: false,
            createdAtKey: 'created_at',
            updatedAtKey: 'updated_at'
        });
        super(ORM);
    }
}
