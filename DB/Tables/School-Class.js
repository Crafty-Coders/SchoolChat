const { School, sequelize, ERR, OK, PH, EM, NAME, PR, initialize, Class } = require('../DB_init.js');
const { data_checker, generate_invite_code } = require('../DB_functions');

async function manage_school(name, location, param, id) {
    switch (param) {
        case "create":
            try {
                const sch = await School.create({
                    name: name,
                    location: location == undefined ? "" : location
                });
                await sch.save();
                return OK;
            } catch {
                return ERR;
            }
        case "delete":
            try {
                await School.update({ deleted: true }, {
                    where: {
                        id: id
                    }
                });
            } catch {
                return ERR;
            }
        case "edit":
            break;
    }
}

async function manage_class(name, sch, desc, param, id) {
    switch (param) {
        case "create":
            try {
                const cls = await Class.create({
                    name: name,
                    school_id: sch,
                    description: desc
                });
                await cls.save();
                return OK;
            } catch {
                return ERR;
            }
        case "delete":
            try {
                await Class.update({ deleted: true }, {
                    where: {
                        id: id
                    }
                });
                return OK;
            } catch {
                return ERR;
            }
    }
}

async function get_sch_cls_info(id, param) {
    switch (param) {
        case "school":
            break;
        case "class":
            break;
    }
}

async function create_class(data) {

    const new_row = await Class.create({
        name: data.name,
        school_id: data.school_id,
        description: data.description,
        invite_code: generate_invite_code()
    })

    await new_row.save()

}

module.exports = {
    get_sch_cls_info, manage_class, manage_school, create_class
}