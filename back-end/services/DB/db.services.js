// db.services.js
const findOne = async ({ model, filter = {}, projection = {}, options = {} }) => {
    return await model.findOne(filter, projection, options);
}

const findMany = async ({ model, filter = {}, projection = {}, options = {}, sort = {}, limit = 0, skip = 0, select = '' }) => {
    let query = model.find(filter, projection, options);
    
    if (sort && Object.keys(sort).length > 0) {
        query = query.sort(sort);
    }
    
    if (skip > 0) {
        query = query.skip(skip);
    }
    
    if (limit > 0) {
        query = query.limit(limit);
    }
    
    if (select) {
        query = query.select(select);
    }
    
    return await query.exec();
}

const findById = async ({ model, id, projection = {}, options = {} }) => {
    return await model.findById(id, projection, options);
}

const create = async ({ model, data = {}, options = {} }) => {
    const result = await model.create([data], options);
    return result[0];
}

const createMany = async ({ model, data = [], options = {} }) => {
    return await model.create(data, options);
}

// UPDATED: All update operations now automatically increment version
const update = async ({ model, filter = {}, data = {}, options = {} }) => {
    const updateOptions = { 
        new: true, 
        // runValidators: true, 
        ...options 
    };
    
    // Increment version and update timestamps
    const updateData = {
        ...data,
        $inc: { __v: 1 }, // Automatically increment version
        $set: { updatedAt: new Date() }
    };
    
    return await model.findOneAndUpdate(filter, updateData, updateOptions);
}

const updateMany = async ({ model, filter = {}, data = {}, options = {} }) => {
    const updateOptions = { 
        // runValidators: true, 
        ...options 
    };
    
    // Increment version for all updated documents
    const updateData = {
        ...data,
        $inc: { __v: 1 },
        $set: { updatedAt: new Date() }
    };
    
    const result = await model.updateMany(filter, updateData, updateOptions);
    return result;
}

const findByIdAndUpdate = async ({ model, id, data = {}, options = {} }) => {
    const updateOptions = { 
        new: true, 
        // runValidators: true, 
        ...options 
    };
    
    // Increment version
    const updateData = {
        ...data,
        $inc: { __v: 1 },
        $set: { updatedAt: new Date() }
    };
    
    return await model.findByIdAndUpdate(id, updateData, updateOptions);
}

const deleteOne = async ({ model, filter = {}, options = {} }) => {
    return await model.findOneAndDelete(filter, options);
}

const deleteMany = async ({ model, filter = {}, options = {} }) => {
    const result = await model.deleteMany(filter, options);
    return result;
}

const findByIdAndDelete = async ({ model, id, options = {} }) => {
    return await model.findByIdAndDelete(id, options);
}

const countDocuments = async ({ model, filter = {}, options = {} }) => {
    return await model.countDocuments(filter, options);
}

const aggregate = async ({ model, pipeline = [], options = {} }) => {
    return await model.aggregate(pipeline, options);
}

const exists = async ({ model, filter = {}, options = {} }) => {
    return await model.exists(filter, options);
}

const populate = async ({ model, query, path, select = '', options = {} }) => {
    return await query.populate({
        path,
        select,
        ...options
    });
}

// Advanced query operations
const findWithPagination = async ({ 
    model, 
    filter = {}, 
    projection = {}, 
    options = {}, 
    page = 1, 
    limit = 10, 
    sort = { createdAt: -1 },
    select = '' 
}) => {
    const skip = (page - 1) * limit;
    
    let query = model.find(filter, projection, options);
    
    if (sort && Object.keys(sort).length > 0) {
        query = query.sort(sort);
    }
    
    if (skip > 0) {
        query = query.skip(skip);
    }
    
    if (limit > 0) {
        query = query.limit(limit);
    }
    
    if (select) {
        query = query.select(select);
    }
    
    const [data, totalCount] = await Promise.all([
        query.exec(),
        countDocuments({ model, filter })
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return {
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNext,
            hasPrev,
            limit
        }
    };
}

// UPDATED: Soft delete operations with version increment
const softDelete = async ({ model, filter = {}, options = {} }) => {
    return await update({
        model,
        filter,
        data: { 
            isDeleted: true, 
            deletedAt: new Date(),
            $inc: { __v: 1 } // Increment version on soft delete
        },
        options
    });
}

const restoreSoftDelete = async ({ model, filter = {}, options = {} }) => {
    return await update({
        model,
        filter,
        data: { 
            isDeleted: false, 
            deletedAt: null,
            $inc: { __v: 1 } // Increment version on restore
        },
        options
    });
}

const findNonDeleted = async ({ model, filter = {}, projection = {}, options = {} }) => {
    const finalFilter = { ...filter, isDeleted: { $ne: true } };
    return await findOne({ model, filter: finalFilter, projection, options });
}

const findManyNonDeleted = async ({ model, filter = {}, projection = {}, options = {}, sort = {}, limit = 0, skip = 0, select = '' }) => {
    const finalFilter = { ...filter, isDeleted: { $ne: true } };
    return await findMany({ 
        model, 
        filter: finalFilter, 
        projection, 
        options, 
        sort, 
        limit, 
        skip, 
        select 
    });
}

// // NEW: Manual version control
// const incrementVersion = async ({ model, filter = {}, options = {} }) => {
//     const updateOptions = { 
//         new: true, 
//         ...options 
//     };
    
//     return await model.findOneAndUpdate(
//         filter, 
//         { 
//             $inc: { __v: 1 },
//             $set: { updatedAt: new Date() }
//         }, 
//         updateOptions
//     );
// }

module.exports = {
    findOne,
    findMany,
    findById,
    create,
    createMany,
    update,
    updateMany,
    findByIdAndUpdate,
    deleteOne,
    deleteMany,
    findByIdAndDelete,
    countDocuments,
    aggregate,
    exists,
    populate,
    findWithPagination,
    softDelete,
    restoreSoftDelete,
    findNonDeleted,
    findManyNonDeleted
};