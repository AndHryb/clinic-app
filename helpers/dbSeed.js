import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function creator(docModel, userModel, specModel) {
    const users = [
        { id: uuidv4(), email: 'asd@asd', name: 'Dima' },
        { id: uuidv4(), email: 'kek@kek', name: 'Kat' },
        { id: uuidv4(), email: 'kat@kat', name: 'Oleg' },
        { id: uuidv4(), email: 'sas@sas', name: 'Joe' },
        { id: uuidv4(), email: 'joe@joe', name: 'Clarc' },
    ];

    const specialities = [
        { id: uuidv4(), name: 'gynecology' },
        { id: uuidv4(), name: 'surgery' },
        { id: uuidv4(), name: 'pediatrician' },
    ];

    const docSpec = [
        { docName: 'Dima', specName: 'surgery' },
        { docName: 'Dima', specName: 'pediatrician' },
        { docName: 'Kat', specName: 'pediatrician' },
        { docName: 'Joe', specName: 'gynecology' },
        { docName: 'Clarc', specName: 'surgery' },
        { docName: 'Kat', specName: 'gynecology' },
    ];

    async function createPair(name, email, userId) {
        await userModel.create({
            id: userId,
            password: bcrypt.hashSync('9876', 10),
            email: email,
        });

        await docModel.create({
            id: uuidv4(),
            name: name,
            email: email,
            userId: userId,
        });
    }

    async function create(docName, specName) {
        const spec = await specModel.findOne({
            where: {
                name: specName
            }
        });
        const doc = await docModel.findOne({
            where: {
                name: docName
            }
        });
        await spec.addDoctor(doc);
    }

    async function seed() {
        docSpec.forEach(async (elem) => {
            create(elem.docName, elem.specName);
        })
    }

    users.forEach(async (elem) => {
        await createPair(elem.name, elem.email, elem.id);
    });

    specialities.forEach(async (elem) => {
        await specModel.create({
            name: elem.name,
            id: elem.id,
        });
    });

    setTimeout(seed, 1000);
}
