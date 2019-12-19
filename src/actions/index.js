import TYPES from './types';

/**
    Authorization actions
 */

export const register = (data) => {
    return {
        type: TYPES.API_REGISTER,
        data: data
    }
}

/**
    Event trigger actions
 */
export const showPopup = (name = {}) => {
    return {
        type: TYPES.SHOW_POPUP,
        name: name
    }
}


/**
    Collection actions
 */
 export const addNewCollection = (title) => {
    return {
        type: TYPES.ADD_NEW_COLLECTION,
        title: title
    }
}

export const deleteCollection = (id) => {
    return {
        type: TYPES.DELETE_COLLECTION,
        id: id
    }
}

export const showRestaurantInCollection = (index) => {
    return {
        type: TYPES.SHOW_RESTAURANT_IN_COLLECTION,
        index: index
    }
}

/**
    Resturants actions
 */
export const addRestaurantToCollection = (restaurant, collectionIndex) => {
    return {
        type: TYPES.ADD_RESTAURANT_TO_COLLECTION,
        restaurant: restaurant,
        collectionIndex: collectionIndex
    }
}

export const apiGetRestaurantLists = (filter = {}) => {
    return {
        type: TYPES.API_GET_RESTAURANT_LISTS
    }
}

/**
    Trigger event
 */
export const resetPopup = () => {
    return {
        type: 'RESET_POPUP'
    }
}