import { School, sequelize, ERR, OK, PH, EM, NAME, PR, initialize, Class } from '../DB_init.js';

async function manage_school(name, location, param, id) {
    switch (param){
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
                await School.update({deleted: 1}, {
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
                await Class.update({deleted: 1}, {where: {
                    id: id
                }});
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

module.exports = {
    get_sch_cls_info, manage_class, manage_school
}