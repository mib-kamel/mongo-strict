export const repo1Data = {
    validData1: {
        email: 'mib.kamel@gmail.com',
        phone: '01065556565',
        numberKey: 40,
        booleanKey: false,
        jsonKey: { key: 'value' },
        userName: 'Mo1'
    },
    invalidEmail: {
        email: 'mib.kamegmail.com',
        phone: '01065556565',
        numberKey: 40,
        booleanKey: false,
        jsonKey: { key: 'value' },
        userName: 'Mo2'
    },
    requiredFieldNotFound: {
        email: 'mib.kamegmail.com',
        phone: '01065556565',
        numberKey: 40,
        booleanKey: false,
        jsonKey: { key: 'value' }
    },
    validDataWithNoDefaultValues: {
        email: 'mib.kamel2@gmail.com',
        phone: '01065556562',
        booleanKey: false,
        userName: 'Mo3',
        notRequiredUnique: 'I am Not Required but unique'
    },
    validDataWithRepeatedUniqueCaseInsensetive: {
        email: 'mib.kamel3@gmail.com',
        phone: '01065556563',
        numberKey: 40,
        booleanKey: false,
        jsonKey: { key: 'value' },
        userName: 'mo1',
        notRequiredUnique: 'I am Not Required but unique2'
    },
    unRegesteredKey: {
        email: 'mib.kamel4@gmail.com',
        phone: '010655565644',
        numberKey: 40,
        booleanKey: false,
        jsonKey: { key: 'value' },
        userName: 'Mo4',
        newKey: 12,
        notRequiredUnique: 'I am Not Required but unique4'
    },
    userNameWithSepecialChars: {
        email: 'mib.kamel5@gmail.com',
        phone: '010655565645',
        numberKey: 45,
        booleanKey: false,
        jsonKey: { key: 'value' },
        userName: 'Mo (5)',
        notRequiredUnique: 'I am Not Required but unique5'
    },
    sameUserNameWithSepecialChars: {
        email: 'mib.kamel6@gmail.com',
        phone: '0106555656456',
        numberKey: 46,
        booleanKey: false,
        jsonKey: { key: 'value' },
        userName: 'Mo (5)',
        notRequiredUnique: 'I am Not Required but unique6'
    }
}