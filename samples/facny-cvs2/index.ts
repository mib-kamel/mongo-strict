import { createConnection, initDBMap } from 'mongo-strict';
import { SectionRepository } from './section.repository';
import { CVRepository } from './cv.repository';
import { UserRepository } from './user.repository';

const start = async () => {
    await createConnection({
        uri: `mongodb://localhost:27017/fancy-cvs`
    });

    const userRepository = new UserRepository();
    const cvRepository = new CVRepository();
    const sectionRepository = new SectionRepository();

    // Should be called after initializing all the repositories
    initDBMap();

    let insertedUser;
    try {
        insertedUser = await userRepository.insertOne({
            email: 'email@co.co',
            name: 'mongo user',
            country: 'mongolia',
            cvs: []
        });
    } catch (e) { }

    let insertedCV;
    if (insertedUser) {
        try {
            insertedCV = await cvRepository.insertOne({
                cvName: 'User CV 1',
                currentPosition: 'Developer !',
                sections: []
            });
            await userRepository.update(insertedUser.id).setOne({ cvs: [insertedCV.id] });
        } catch (e) { }
    }

    if (insertedCV && insertedUser) {
        const insertedSections: any = [];
        for (let i = 0; i < 6; i++) {
            try {
                const insertSection = await sectionRepository.insertOne({
                    sectionTitle: `Section ${i + 1}`
                });
                insertedSections.push(insertSection);
            } catch (e) { }
        }

        await cvRepository.update(insertedCV.id).setOne({ sections: insertedSections.map((section) => section.id) });
    }

    const userData = await userRepository.findOne({
        select: ["id", "name", "cvs.cvName", "cvs.currentPosition", "cvs.sections.sectionTitle"]
    })

    await userRepository.deleteMany();
    await cvRepository.deleteMany();
    await sectionRepository.deleteMany();
}

start();
