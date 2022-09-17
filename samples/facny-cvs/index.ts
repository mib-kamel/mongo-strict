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
            country: 'mongolia'
        });
    } catch (e) { }

    let insertedCV;
    if (insertedUser) {
        try {
            insertedCV = await cvRepository.insertOne({
                user: insertedUser.id,
                cvName: 'User CV 1',
                currentPosition: 'Developer !'
            });
        } catch (e) { }
    }

    if (insertedCV && insertedUser) {
        for (let i = 0; i < 6; i++) {
            try {
                await sectionRepository.insertOne({
                    cv: insertedCV.id,
                    sectionTitle: `Section ${i + 1}`
                });
            } catch (e) { }
        }
    }

    const userData = await userRepository.findOne({
        select: ["id", "name", "cv.cvName", "cv.currentPosition", "cv.sections.sectionTitle"]
    })

    await userRepository.deleteMany();
    await cvRepository.deleteMany();
    await sectionRepository.deleteMany();
}

start();
